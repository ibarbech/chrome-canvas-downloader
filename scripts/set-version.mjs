// Sets the "version" field of manifest.json. Usage: node scripts/set-version.mjs [version]
// Without an argument it only validates that manifest.json is readable.
import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../manifest.json", import.meta.url);
const manifest = JSON.parse(readFileSync(file, "utf8"));
const version = process.argv[2];

if (version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`Invalid version "${version}": Chrome requires MAJOR.MINOR.PATCH`);
  }
  manifest.version = version;
  writeFileSync(file, JSON.stringify(manifest, null, 2) + "\n");
}
console.log(`manifest.json version: ${manifest.version}`);
