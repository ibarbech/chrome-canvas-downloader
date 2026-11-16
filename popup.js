const list = document.getElementById("list");
const statusEl = document.getElementById("status");
const btnAll = document.getElementById("all");

// Se ejecuta dentro de la página: recoge los canvas y sus datos PNG.
function collectCanvases() {
  return Array.from(document.querySelectorAll("canvas")).map((c, index) => {
    const r = c.getBoundingClientRect();
    let url = null;
    let error = null;
    try {
      url = c.toDataURL("image/png");
    } catch (e) {
      error = "No se puede exportar (canvas con imágenes de otro dominio o WebGL sin buffer preservado).";
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

function render(items, tabId) {
  list.innerHTML = "";
  const downloadable = items.filter((c) => c.url);
  if (items.length === 0) {
    list.textContent = "No hay ningún canvas en esta página.";
    return;
  }
  for (const c of items) {
    const box = document.createElement("div");
    box.className = "canvas";
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `Canvas ${c.index}: ${c.width}x${c.height} px (en pantalla ${c.shown})`;
    box.appendChild(meta);

    if (c.url) {
      const img = document.createElement("img");
      img.src = c.url;
      img.alt = `Canvas ${c.index}`;
      box.appendChild(img);
      const btn = document.createElement("button");
      btn.textContent = "Descargar PNG";
      btn.addEventListener("click", async () => {
        try {
          await download(c.url, `canvas_${tabId}_${c.index}.png`);
          setStatus(`Descargado canvas ${c.index}.`);
        } catch (e) {
          setStatus(`Error: ${e.message}`);
        }
      });
      box.appendChild(btn);
    } else {
      const err = document.createElement("div");
      err.className = "meta";
      err.textContent = c.error;
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
        setStatus(`Error en canvas ${c.index}: ${e.message}`);
      }
    }
    setStatus(`Descargados ${ok} de ${downloadable.length} canvas.`);
  };
}

async function main() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    list.textContent = "No se encuentra la pestaña activa.";
    return;
  }
  try {
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: collectCanvases,
    });
    render(injection.result, tab.id);
  } catch (e) {
    list.textContent = `No se puede leer esta página: ${e.message}`;
  }
}

main();
