# Chrome Canvas Downloader

A Chrome extension that lists the `<canvas>` elements of the current tab and saves them as PNG files.

## Install

1. Go to the [Releases page](https://github.com/ibarbech/chrome-canvas-downloader/releases/latest) and download the `chrome-canvas-downloader-<version>.zip` file.
2. Unzip it. You get a folder with `manifest.json`, `popup.html` and `popup.js`.
3. Open `chrome://extensions` in Chrome.
4. Turn on **Developer mode** (top right).
5. Click **Load unpacked** and select the unzipped folder.

Updates are not automatic. To update, download the newest zip and load the folder again.

For development, clone the repository and load the repository folder with **Load unpacked** instead.

## Use

1. Open the page that draws on a canvas.
2. Click the extension icon in the toolbar.
3. The popup lists every canvas on the page with its size in pixels and a preview.
4. Click **Download PNG** on one canvas, or **Download all** to save every canvas that can be exported.

Files are saved to your default downloads folder as `canvas_<tab-id>_<index>.png`.

If Chrome asks whether the page may download multiple files, allow it for **Download all** to work.

## Limitations

- **Cross-origin images:** if the canvas draws an image from another domain without CORS headers, the browser blocks the export. The popup shows a message for that canvas instead of a download button.
- **WebGL canvases:** these only export if the drawing buffer is preserved. Otherwise the result can be blank.
- **Dynamic canvases:** the PNG is a snapshot taken when the popup opens. Open the popup again to capture a newer frame.

## Permissions

| Permission | Why it is needed |
|---|---|
| `activeTab` | Access the tab you are looking at when you click the icon. |
| `scripting` | Read the canvas data from the page. |
| `downloads` | Save the PNG files. |

The extension does not send data anywhere. Everything stays in your browser.

## Releases

Releases are created automatically by [semantic-release](https://github.com/semantic-release/semantic-release) when commits reach `main`, using the [Conventional Commits](https://www.conventionalcommits.org) format:

| Commit prefix | Release |
|---|---|
| `fix:` | patch (1.0.0 → 1.0.1) |
| `feat:` | minor (1.0.0 → 1.1.0) |
| `feat!:` or a `BREAKING CHANGE:` footer | major (1.0.0 → 2.0.0) |
| `docs:`, `ci:`, `chore:` | no release |

Each release updates the `version` in `manifest.json`, adds the changes to `CHANGELOG.md`, creates the Git tag and attaches the zip file to the GitHub release. The workflow is defined in `.github/workflows/release.yml`.

To test the packaging locally:

```bash
npm ci
node scripts/package.mjs 1.0.0
# creates dist/chrome-canvas-downloader-1.0.0.zip
```

## Project layout

```
manifest.json   Extension manifest (Manifest V3)
popup.html      Popup layout and styles
popup.js        Finds the canvases, renders the list and starts the downloads
scripts/        Release helpers: set the manifest version and build the zip
.github/        Release workflow
```
