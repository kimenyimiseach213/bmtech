const { spawn } = require("node:child_process");
const path = require("node:path");

const frontend = path.resolve(__dirname, "..");
const backend = path.resolve(frontend, "..", "bmtech-backend");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [
  spawn(npm, ["run", "dev"], { cwd: backend, stdio: "inherit", shell: process.platform === "win32" }),
  spawn(npm, ["run", "dev"], { cwd: frontend, stdio: "inherit", shell: process.platform === "win32" }),
];

let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill("SIGINT");
  setTimeout(() => process.exit(code), 250);
}

for (const child of children) child.once("exit", (code) => stop(code ?? 1));
process.once("SIGINT", () => stop(0));
process.once("SIGTERM", () => stop(0));
