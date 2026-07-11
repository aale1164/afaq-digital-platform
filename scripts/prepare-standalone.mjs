import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const standalone = resolve(root, ".next/standalone");

if (!existsSync(standalone)) {
  console.error("Standalone output is missing. Ensure next.config.ts contains output: 'standalone'.");
  process.exit(1);
}

const copies = [
  [resolve(root, "public"), resolve(standalone, "public")],
  [resolve(root, ".next/static"), resolve(standalone, ".next/static")],
];

for (const [source, destination] of copies) {
  if (!existsSync(source)) continue;
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true });
}

console.log("Standalone runtime assets prepared.");
