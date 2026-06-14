import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const filesBeforeFixes = getFileHashes();

run("pnpm", ["run", "format"]);
run("pnpm", ["run", "lint:fix"]);
stageFixedFiles(filesBeforeFixes, getFileHashes());
run("pnpm", ["run", "format:check"]);
run("pnpm", ["run", "lint"]);

function getFileHashes() {
  const files = getGitFiles();
  const hashes = new Map();

  for (const file of files) {
    hashes.set(file, hashFile(file));
  }

  return hashes;
}

function getGitFiles() {
  const output = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    {
      encoding: "buffer",
    },
  );

  return output
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
}

function hashFile(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function stageFixedFiles(before, after) {
  const fixedFiles = [];

  for (const [file, hash] of after) {
    if (before.get(file) !== hash) {
      fixedFiles.push(file);
    }
  }

  if (fixedFiles.length === 0) {
    return;
  }

  run("git", ["add", "--", ...fixedFiles]);
}

function run(command, args) {
  execFileSync(command, args, {
    stdio: "inherit",
  });
}
