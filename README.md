# Chrome Canvas Downloader

A Chrome extension that lists the `<canvas>` elements of the current tab and saves them as PNG files.

## Install

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the folder that contains `manifest.json`.

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

## Project layout

```
manifest.json   Extension manifest (Manifest V3)
popup.html      Popup layout and styles
popup.js        Finds the canvases, renders the list and starts the downloads
```
