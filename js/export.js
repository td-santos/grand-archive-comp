function formatCollectionExport() {
  const lines = state.collection.map((c) => {
    const set = c.setPrefix ? " [" + c.setPrefix + (c.collector_number ? " #" + c.collector_number : "") + "]" : "";
    return "1x " + (c.name || "Carta") + set;
  });
  return lines.join("\n");
}

function openExport(title, meta, text) {
  els.exportTitle.textContent = title;
  els.exportMeta.textContent = meta;
  els.exportText.value = text || "Lista vazia.";
  els.exportOverlay.hidden = false;
  els.exportText.focus();
  els.exportText.select();
}

function closeExport() {
  els.exportOverlay.hidden = true;
}

async function copyExport() {
  const text = els.exportText.value || "";
  try {
    await navigator.clipboard.writeText(text);
    toast("Lista copiada");
  } catch (err) {
    els.exportText.select();
    document.execCommand("copy");
    toast("Lista copiada");
  }
}
