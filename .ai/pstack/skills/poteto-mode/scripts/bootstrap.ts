import { existsSync } from "node:fs";
import { join } from "node:path";

const scriptsDirectory = import.meta.dir;

/** Diagnose optional tools without installing packages or restarting the command. */
export function ensureDependenciesInstalled(): void {
  const commanderPackagePath = join(scriptsDirectory, "node_modules", "commander", "package.json");
  if (existsSync(commanderPackagePath)) return;
  throw new Error(
    "Optional pstack tool dependencies are not installed. No installation was attempted. " +
      "From the Ignite root, first run node scripts/runtime-doctor.mjs --preflight. " +
      "If you intend to use these optional Bun tools, explicitly run " +
      "bun install --frozen-lockfile in .ai/pstack/skills/poteto-mode/scripts, then retry. " +
      "Bun and these dependencies are separate from Ignite's pnpm runtime."
  );
}
