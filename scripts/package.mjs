// Builds dist/chrome-canvas-downloader-<version>.zip with the extension files.
// Usage: node scripts/package.mjs [version]   (defaults to the version in manifest.json)
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("manifest.json", root), "utf8"));
const version = process.argv[2] || manifest.version;
const name = `chrome-canvas-downloader-${version}.zip`;
// Everything the extension needs at runtime: the manifest, the popup, the icons and the translations.
const files = ["manifest.json", "popup.html", "popup.js", "icons", "_locales"];

mkdirSync(new URL("dist/", root), { recursive: true });
rmSync(new URL(`dist/${name}`, root), { force: true });
execFileSync("zip", ["-q", "-r", "-X", `dist/${name}`, ...files], { cwd: root.pathname, stdio: "inherit" });
console.log(`Created dist/${name}`);
