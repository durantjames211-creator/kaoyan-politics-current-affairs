#!/usr/bin/env node
/** Launcher: runs scripts/sync.ts via tsx (reuses src/lib/sync.ts). */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tsxBin = path.join(root, "node_modules", ".bin", "tsx");
const script = path.join(root, "scripts", "sync.ts");
const cmd = existsSync(tsxBin) ? tsxBin : "npx";
const args = existsSync(tsxBin) ? [script] : ["tsx", script];
const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", env: process.env, shell: process.platform === "win32" });
process.exitCode = r.status === null ? 1 : r.status;
