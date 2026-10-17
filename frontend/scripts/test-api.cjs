// Offline regression checks: no credentials, database, or production writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { test, afterEach } = require('node:test');

function loadTypeScript(relative) {
  const filename = path.resolve(__dirname, '..', relative);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  loaded._compile(compiled, filename);
  return loaded.exports;
}

const api = loadTypeScript('lib/api.ts');
const proxy = loadTypeScript('app/api/backend/[...path]/route.ts');
const middleware = loadTypeScript('middleware.ts').middleware;
const { NextRequest } = require('next/server');
const originalFetch = global.fetch;
const originalBase = process.env.BMTECH_API_BASE_URL;
const originalNodeEnv = process.env.NODE_ENV;
const originalError = console.error;
afterEach(() => {
  global.fetch = originalFetch;
  if (originalBase === undefined) delete process.env.BMTECH_API_BASE_URL;
  else process.env.BMTECH_API_BASE_URL = originalBase;
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
  console.error = originalError;
});

function request(endpoint, options = {}) {
  process.env.BMTECH_API_BASE_URL = 'https://api.example.test';
  const url = new URL(`/api/backend/${endpoint}`, 'https://store.example.test');
  return [new NextRequest(url, options), {
    params: Promise.resolve({ path: url.pathname.slice('/api/backend/'.length).split('/') }),
  }];
}

test('client calls same-origin login and preserves successful response', async () => {
  global.fetch = async (url, init) => {
    assert.equal(url, '/api/backend/api/v1/admin/auth/login');
    assert.equal(init.credentials, 'include');
    assert.equal(init.method, 'POST');
    return Response.json({ admin: { name: 'Test administrator' } });
  };
  assert.deepEqual(await api.apiRequest(api.apiPaths.login, { method: 'POST', body: '{}' }), {
    admin: { name: 'Test administrator' },
  });
});

test('HTTP errors retain status and get the required login messages', async () => {
  for (const [status, message] of [
    [401, 'Incorrect email or password.'], [403, 'Incorrect email or password.'],
    [502, 'The server is temporarily unavailable. Please try again.'],
    [503, 'The server is temporarily unavailable. Please try again.'],
    [504, 'The server is temporarily unavailable. Please try again.'],
    [400, 'An unexpected server error occurred.'],
    [404, 'An unexpected server error occurred.'],
    [405, 'An unexpected server error occurred.'],
    [500, 'An unexpected server error occurred.'],
  ]) {
    global.fetch = async () => new Response('<html>upstream error</html>', { status });
    await assert.rejects(api.apiRequest(api.apiPaths.login), (error) => {
      assert.equal(error.status, status);
      assert.equal(api.loginErrorMessage(error), message);
      return true;
    });
  }
  assert.equal(api.loginErrorMessage(new Error('private diagnostic')), 'An unexpected server error occurred.');
});

test('network failures during fetch or body reading get the network message', async () => {
  for (const fetch of [
    async () => { throw new TypeError('fetch failed'); },
    async () => new Response(new ReadableStream({ start(controller) { controller.error(new Error('connection lost')); } })),
  ]) {
    global.fetch = fetch;
    await assert.rejects(api.apiRequest(api.apiPaths.login), (error) => {
      assert.equal(error.status, 0);
      assert.equal(api.loginErrorMessage(error), 'Unable to connect to the server.');
      return true;
    });
  }
});

test('proxy forwards exact path, query, and product/image payload unchanged', async () => {
  const payload = [{ slug: 'existing-product', images: [{ url: 'https://images.example.test/existing.jpg' }] }];
  global.fetch = async (url, init) => {
    assert.equal(url.href, 'https://api.example.test/api/v1/products?status=published');
    assert.equal(init.method, 'GET');
    return Response.json(payload);
  };
  const response = await proxy.GET(...request('api/v1/products?status=published'));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), payload);
});

test('successful login keeps bearer token in secure HttpOnly cookie and forwards it for admin calls', async () => {
  process.env.NODE_ENV = 'production';
  global.fetch = async (url, init) => {
    assert.equal(url.href, 'https://api.example.test/api/v1/admin/auth/login');
    assert.deepEqual(JSON.parse(Buffer.from(init.body).toString()), { email: 'test@example.invalid', password: 'test-only' });
    return Response.json({ accessToken: 'test-token', admin: { name: 'Test administrator' } }, { status: 201 });
  };
  const response = await proxy.POST(...request(api.apiPaths.login, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.invalid', password: 'test-only' }),
  }));
  assert.equal(response.status, 201);
  const cookies = response.headers.get('set-cookie');
  assert.match(cookies, /bmtech_admin_session=1/);
  assert.match(cookies, /bmtech_admin_token=test-token/);
  assert.match(cookies, /HttpOnly; SameSite=Lax; Secure/);
  assert.deepEqual(await response.json(), { admin: { name: 'Test administrator' } });
  global.fetch = async (url, init) => {
    assert.equal(init.headers.get('authorization'), 'Bearer test-token');
    assert.equal(init.headers.get('cookie'), null);
    return Response.json({ protected: true });
  };
  assert.equal((await proxy.GET(...request(api.apiPaths.dashboard, {
    headers: { cookie: 'bmtech_admin_session=1; bmtech_admin_token=test-token' },
  }))).status, 200);
});

test('invalid credentials remain 401 and never set an active session', async () => {
  global.fetch = async () => Response.json({ message: 'Email or password is incorrect.' }, { status: 401 });
  const response = await proxy.POST(...request(api.apiPaths.login, { method: 'POST', body: '{}' }));
  assert.equal(response.status, 401);
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
});

test('HTML or empty successful login response never establishes a session', async () => {
  console.error = () => {};
  for (const body of ['<html>Wrong upstream</html>', '{}']) {
    global.fetch = async () => new Response(body);
    const response = await proxy.POST(...request(api.apiPaths.login, { method: 'POST', body: '{}' }));
    assert.equal(response.status, 502);
    assert.equal(response.headers.get('set-cookie'), null);
  }
});

test('missing or invalid origin fails without sending a request', async () => {
  console.error = () => {};
  global.fetch = async () => assert.fail('must not call upstream');
  for (const base of ['', 'https://api.example.test/api/v1', 'https://user:secret@api.example.test', 'https://api.example.test/?secret=value']) {
    const args = request(api.apiPaths.login, { method: 'POST' });
    process.env.BMTECH_API_BASE_URL = base;
    assert.equal((await proxy.POST(...args)).status, 503);
  }
});

test('transport failure returns 502 and logs only safe diagnostic fields', async () => {
  const logged = [];
  console.error = (...args) => logged.push(args);
  global.fetch = async () => { throw new TypeError('private details', { cause: { code: 'ECONNREFUSED', password: 'private' } }); };
  const response = await proxy.GET(...request('api/v1/products'));
  assert.equal(response.status, 502);
  assert.deepEqual(logged[0][1], { host: 'api.example.test', code: 'ECONNREFUSED' });
  assert.doesNotMatch(JSON.stringify(logged), /private/);
});

test('dashboard and admin API remain protected without a session', async () => {
  global.fetch = async () => assert.fail('unauthenticated admin must not reach upstream');
  assert.equal((await proxy.GET(...request(api.apiPaths.dashboard))).status, 401);
  const response = middleware(new NextRequest('https://store.example.test/en/admin/dashboard'));
  assert.equal(response.status, 307);
  assert.match(response.headers.get('location'), /\/en\/admin\/login\?next=/);
});
