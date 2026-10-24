const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');
const cache = new Map();
function load(relative) {
  const filename = path.resolve(__dirname, '..', relative + '.ts');
  if (cache.has(filename)) return cache.get(filename).exports;
  const instance = new Module(filename, module); instance.filename = filename; instance.paths = module.paths; cache.set(filename, instance);
  instance.require = name => name.startsWith('@/') ? load(name.slice(2)) : require(name);
  instance._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
  return instance.exports;
}
const { ceoNumber, selectionUrl, selectionMessage, validateSelection } = load('lib/whatsapp-order');
const product = (slug, name, price) => ({ slug, name: { en: name, fr: name }, price, stock: 4 });
test('CEO number is international digits only and missing or local values never invent a recipient', () => {
  assert.equal(ceoNumber('+999 (123) 45678'), '99912345678');
  for (const value of ['', '0788494513', 'abc12345678', '+012345678', '1234567890123456']) assert.equal(ceoNumber(value), '');
});
test('single product WhatsApp message identifies product, quantity, exact price, public URL and manual confirmation', () => {
  const selection = { lines: [{ product: product('audio-amp', 'Audio & amplifier', 17500.25), quantity: 1 }], ceoWhatsapp: '+99912345678' };
  const url = new URL(selectionUrl(selection, 'en', 'https://store.example.invalid'));
  assert.equal(url.hostname, 'wa.me'); assert.equal(url.pathname, '/99912345678');
  const text = url.searchParams.get('text'); assert.match(text, /Product: Audio & amplifier/); assert.match(text, /Quantity: 1/); assert.match(text, /Unit price: 17,500.25 RWF/); assert.match(text, /Product link: https:\/\/store.example.invalid\/en\/products\/audio-amp/); assert.match(text, /Please confirm availability and payment instructions/);
});
test('cart WhatsApp message contains every item, quantities, line totals and exact grand total', () => {
  const lines = [{ product: product('receiver', 'Receiver', 19500.25), quantity: 2 }, { product: product('headphones', 'Headphones', 18500.25), quantity: 1 }];
  const text = selectionMessage(lines, 'fr', 'https://store.example.invalid');
  assert.match(text, /Product: Receiver/); assert.match(text, /Quantity: 2/); assert.match(text, /Line total: 39,000.5 RWF/); assert.match(text, /Product: Headphones/); assert.match(text, /Total: 57,500.75 RWF/); assert.match(text, /\/fr\/products\/headphones/);
  assert.equal(selectionUrl({ lines, ceoWhatsapp: '' }, 'en', 'https://store.example.invalid'), '');
});
test('cart preparation always queries backend and explains price and stock changes', async () => {
  const originalFetch = global.fetch;
  let called = false;
  global.fetch = async (url, init) => {
    called = true; assert.equal(url, '/api/backend/api/v1/cart/validate'); assert.equal(init.cache, 'no-store');
    assert.deepEqual(JSON.parse(init.body), { items: [{ productSlug: 'amp', quantity: 3 }] });
    return new Response(JSON.stringify({ lines: [{ product: { slug: 'amp', nameEn: 'Amplifier', price: 18000.5, stockQuantity: 2 }, quantity: 2 }], changes: ['Quantity reduced to 2.'], ceoWhatsapp: '99912345678' }), { status: 201 });
  };
  try {
    const result = await validateSelection([{ slug: 'amp', quantity: 3, unitPrice: 17500.25 }], []);
    assert.equal(called, true); assert.equal(result.changes.length, 2); assert.match(result.changes[1], /17,500.25 RWF to 18,000.5 RWF/); assert.equal(result.lines[0].quantity, 2);
  } finally { global.fetch = originalFetch; }
});
test('backend validation failure stops preparation', async () => {
  const originalFetch = global.fetch; global.fetch = async () => { throw new Error('offline'); };
  try { await assert.rejects(validateSelection([{ slug: 'amp', quantity: 1 }], []), /Unable to connect/); } finally { global.fetch = originalFetch; }
});

const { shopProducts, equipmentCategories, isPowerEquipment } = load('lib/catalog');
const { publicImageUrl, normalizeProduct } = load('lib/api');
const filters = { search:'', condition:'all', brand:'all', available:false, sort:'latest' };
test('power categories preserve supplied images and exclude Inverters and Undersale', () => {
  const rows = equipmentCategories([{ name:'Generators', images:[], image:'', nameFr:'Generators', summary:'' }, { name:'Electronics', images:[], image:'', nameFr:'Electronics', summary:'' }]);
  assert.deepEqual(rows.map(row=>row.name), ['Generators','Changeover Switches']);
  assert.ok(rows.every(row=>row.images.length));
  assert.equal(isPowerEquipment({ category:'Generators', isUndersale:true }), false);
  assert.equal(isPowerEquipment({ category:'Generators', isUndersale:false }), true);
  assert.equal(isPowerEquipment({ category:'Inverters & Backup' }), false);
});
test('store search, filters and price sorting apply only to classified Undersale records', () => {
  const items = [
    { ...product('a','QA television',50), isUndersale:true, brand:'Brand A', condition:'Used' },
    { ...product('b','QA radio',25), isUndersale:true, brand:'Brand B', condition:'New', stock:0 },
    { ...product('c','QA television stand',10), isUndersale:true, brand:'Brand A', condition:'New' },
    { ...product('d','QA generator',1), isUndersale:false },
  ];
  assert.deepEqual(shopProducts(items,{...filters,sort:'price-low'}).map(p=>p.slug), ['c','b','a']);
  assert.deepEqual(shopProducts(items,{...filters,search:'television',condition:'Used',brand:'Brand A',available:true}).map(p=>p.slug), ['a']);
  assert.equal(shopProducts(items,{...filters,available:true}).length,2);
});
test('legacy upload references resolve on the current frontend without localhost or mixed-content links', () => {
  for (const src of ['/uploads/abc-123.png','http://localhost:3001/uploads/abc-123.png','https://old-api.example.invalid/uploads/abc-123.png']) assert.equal(publicImageUrl(src),'/api/media/abc-123.png');
  assert.equal(publicImageUrl('https://sample.public.blob.vercel-storage.com/products/photo.png'),'https://sample.public.blob.vercel-storage.com/products/photo.png');
  assert.equal(publicImageUrl('/uploads/bad.exe'),'');
  assert.equal(publicImageUrl('javascript:alert(1)'),'');
  const row = normalizeProduct({ slug:'p', images:[{url:'http://localhost:3001/uploads/abc.png'}] });
  assert.equal(row.image,'/api/media/abc.png'); assert.equal(row.images[0].src,row.image);
  assert.equal(normalizeProduct({slug:'missing'}).image,'');
});
test('public media endpoint proxies only validated images and never forwards administrator credentials', async () => {
  const { GET } = load('app/api/media/[file]/route');
  const previousFetch=global.fetch, previousOrigin=process.env.BMTECH_API_BASE_URL;
  process.env.BMTECH_API_BASE_URL='https://api.example.invalid';
  let called=0;
  global.fetch=async (url,init)=>{called++;assert.equal(String(url),'https://api.example.invalid/uploads/abc.png');assert.equal(init.headers,undefined);return new Response(new Uint8Array([137,80,78,71]),{headers:{'Content-Type':'image/png'}});};
  try {
    const response=await GET({}, {params:Promise.resolve({file:'abc.png'})});assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/png');assert.equal((await response.arrayBuffer()).byteLength,4);
    assert.equal((await GET({}, {params:Promise.resolve({file:'../secret'})})).status,404);assert.equal(called,1);
    global.fetch=async()=>new Response('<html>missing</html>',{headers:{'Content-Type':'text/html'}});
    assert.equal((await GET({}, {params:Promise.resolve({file:'abc.png'})})).status,502);
  } finally {global.fetch=previousFetch;if(previousOrigin===undefined)delete process.env.BMTECH_API_BASE_URL;else process.env.BMTECH_API_BASE_URL=previousOrigin;}
});
