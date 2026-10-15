const path = require("node:path");

const wasmDirectory = path.resolve(process.cwd(), "node_modules", "@next", "swc-wasm-nodejs");
process.env.NEXT_TEST_WASM_DIR ??= wasmDirectory;

const [command = "dev", ...args] = process.argv.slice(2);
if (command === "dev") process.env.BMTECH_NEXT_DIST_DIR ??= ".next/preview";
const nextCli = require.resolve("next/dist/bin/next");
process.argv = [process.argv[0], nextCli, command, ...args];
require(nextCli);
