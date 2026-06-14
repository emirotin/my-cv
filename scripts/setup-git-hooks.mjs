import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

if (existsSync(".git")) {
  try {
    execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
      stdio: "inherit",
    });
  } catch (error) {
    console.warn(`Skipping Git hooks setup: ${error.message}`);
  }
}
