#!/usr/bin/env node
import { existsSync } from "node:fs";
import { rename, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiSrc = path.join(root, "src/app/api");
const apiStash = path.join(root, ".api-stash");

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, STATIC_EXPORT: "1" },
      shell: process.platform === "win32",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(cmd + " exited " + code));
    });
  });
}

async function main() {
  let moved = false;
  if (existsSync(apiSrc)) {
    if (existsSync(apiStash)) {
      await rename(apiStash, path.join(root, ".api-stash-bak-" + Date.now()));
    }
    await rename(apiSrc, apiStash);
    moved = true;
    console.log("[static-build] stashed src/app/api");
  }
  try {
    const nextBin = path.join(root, "node_modules", ".bin", "next");
    const cmd = existsSync(nextBin) ? nextBin : "npx";
    const args = existsSync(nextBin) ? ["build"] : ["next", "build"];
    await run(cmd, args);
    console.log("[static-build] success -> out/");
  } finally {
    if (moved && existsSync(apiStash)) {
      await mkdir(path.dirname(apiSrc), { recursive: true });
      await rename(apiStash, apiSrc);
      console.log("[static-build] restored src/app/api");
    }
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
