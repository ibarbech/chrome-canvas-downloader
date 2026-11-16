const list = document.getElementById("list");
const statusEl = document.getElementById("status");
const btnAll = document.getElementById("all");

// Texto traducido según el idioma de Chrome (_locales/<idioma>/messages.json).
const t = (key, subs) => chrome.i18n.getMessage(key, subs) || key;

// Se ejecuta dentro de la página: recoge los canvas y sus datos PNG.
// Devuelve códigos de error (no texto) para que el popup los traduzca.
function collectCanvases() {
  return Array.from(document.querySelectorAll("canvas")).map((c, index) => {
    const r = c.getBoundingClientRect();
    let url = null;
    let error = null;
    try {
      url = c.toDataURL("image/png");
    } catch (e) {
      error = "export";
    }
    return {
      index,
      width: c.width,
      height: c.height,
      shown: `${Math.round(r.width)}x${Math.round(r.height)}`,
      url,
      error,
    };
  });
}

function setStatus(text) {
  statusEl.textContent = text;
}

function download(url, filename) {
  return new Promise((resolve, reject) => {
    chrome.downloads.download({ url, filename, saveAs: false }, (id) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve(id);
    });
  });
}

// Muestra un mensaje claro (título y explicación) en lugar de texto técnico.
function showMessage(title, detail) {
  list.innerHTML = "";
  const h = document.createElement("strong");
  h.textContent = title;
  const d = document.createElement("p");
  d.className = "meta";
  d.textContent = detail;
  list.append(h, d);
  btnAll.disabled = true;
}

function render(items, tabId) {
  list.innerHTML = "";
  if (items.length === 0) {
    showMessage(t("noCanvasTitle"), t("noCanvasDetail"));
    return;
  }
  const downloadable = items.filter((c) => c.url);

  for (const c of items) {
    const box = document.createElement("div");
    box.className = "canvas";
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = t("canvasInfo", [String(c.index), String(c.width), String(c.height), c.shown]);
    box.appendChild(meta);

    if (c.url) {
      const img = document.createElement("img");
      img.src = c.url;
      img.alt = `Canvas ${c.index}`;
      box.appendChild(img);
      const btn = document.createElement("button");
      btn.textContent = t("downloadOne");
      btn.addEventListener("click", async () => {
        try {
          await download(c.url, `canvas_${tabId}_${c.index}.png`);
          setStatus(t("downloadedOne", [String(c.index)]));
        } catch (e) {
          setStatus(t("downloadError", [e.message]));
        }
      });
      box.appendChild(btn);
    } else {
      const err = document.createElement("div");
      err.className = "meta";
      err.textContent = t("exportError");
      box.appendChild(err);
    }
    list.appendChild(box);
  }

  btnAll.disabled = downloadable.length === 0;
  btnAll.onclick = async () => {
    let ok = 0;
    for (const c of downloadable) {
      try {
        await download(c.url, `canvas_${tabId}_${c.index}.png`);
        ok++;
      } catch (e) {
        setStatus(t("downloadErrorCanvas", [String(c.index), e.message]));
      }
    }
    setStatus(t("downloadedAll", [String(ok), String(downloadable.length)]));
  };
}

// Páginas internas o protegidas de Chrome: las extensiones no pueden leerlas.
const RESTRICTED = /^(chrome|chrome-extension|edge|about|devtools|view-source|chrome-search|https:\/\/chrome\.google\.com\/webstore)/i;

async function main() {
  // Rellena los textos fijos de la página con el idioma de Chrome.
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    showMessage(t("noActiveTab"), t("noActiveTabDetail"));
    return;
  }
  const url = tab.url || "";
  if (RESTRICTED.test(url)) {
    showMessage(t("restrictedTitle"), t("restrictedDetail"));
    return;
  }
  if (url.startsWith("file:")) {
    showMessage(t("fileTitle"), t("fileDetail"));
    return;
  }
  try {
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: collectCanvases,
    });
    render(injection.result, tab.id);
  } catch (e) {
    showMessage(t("readErrorTitle"), t("readErrorDetail"));
  }
}

main();
