document.getElementById("btnHome").addEventListener("click", showHome);
document.getElementById("btnBack").addEventListener("click", showHome);
els.navHome.addEventListener("click", showHome);
els.navMine.addEventListener("click", showMine);
els.navDecks.addEventListener("click", () => showDecks(false));
els.navProxy.addEventListener("click", showProxy);
els.navKeywords.addEventListener("click", showKeywords);

if (els.kwSearch) {
  els.kwSearch.addEventListener("input", () => renderKeywords());
}

els.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  els.suggestList.hidden = true;
  searchCards(els.searchInput.value);
});
els.searchInput.addEventListener("input", () => {
  clearTimeout(state.suggestTimer);
  state.suggestTimer = setTimeout(() => suggest(els.searchInput.value), 220);
});
els.searchInput.addEventListener("blur", () => {
  setTimeout(() => {
    els.suggestList.hidden = true;
  }, 180);
});
els.btnMore.addEventListener("click", () => {
  if (!state.hasMore || state.loading) return;
  state.page += 1;
  loadCards(false);
});

els.btnFlip.addEventListener("click", () => {
  state.faceIndex = (state.faceIndex + 1) % state.faces.length;
  renderFace();
});
document.getElementById("btnClose").addEventListener("click", () => {
  els.overlay.hidden = true;
});
els.overlay.addEventListener("click", (e) => {
  if (e.target === els.overlay) els.overlay.hidden = true;
});
els.btnAddCollection.addEventListener("click", toggleCollection);
els.btnAddDeck.addEventListener("click", openDeckPicker);

document.getElementById("btnClosePicker").addEventListener("click", () => {
  els.deckPicker.hidden = true;
});
els.deckPicker.addEventListener("click", (e) => {
  if (e.target === els.deckPicker) els.deckPicker.hidden = true;
});
els.newDeckForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = (els.newDeckName.value || "").trim() || "Novo deck";
  const deck = createDeck(name);
  addCardToDeck(deck.id);
  els.deckPicker.hidden = true;
});

document.getElementById("btnNewDeck").addEventListener("click", () => {
  els.createDeckName.value = "";
  els.newDeckOverlay.hidden = false;
  els.createDeckName.focus();
});
document.getElementById("btnCloseNewDeck").addEventListener("click", closeNewDeck);
els.newDeckOverlay.addEventListener("click", (e) => {
  if (e.target === els.newDeckOverlay) closeNewDeck();
});
els.createDeckForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = (els.createDeckName.value || "").trim() || "Novo deck";
  const deck = createDeck(name);
  closeNewDeck();
  openDeck(deck.id);
  renderDeckList();
});
document.getElementById("btnDecksBack").addEventListener("click", () => {
  state.activeDeckId = null;
  els.deckEditor.hidden = true;
  els.deckList.hidden = false;
  document.getElementById("btnNewDeck").hidden = false;
  const listBar = document.getElementById("decksListToolbar");
  if (listBar) listBar.hidden = false;
  els.viewDecks.classList.remove("editing-deck");
  renderDeckList();
});
els.btnCoverDeck.addEventListener("click", openCoverPicker);
document.getElementById("btnCloseCover").addEventListener("click", closeCoverPicker);
els.coverPicker.addEventListener("click", (e) => {
  if (e.target === els.coverPicker) closeCoverPicker();
});

els.btnExportMine.addEventListener("click", () => {
  const text = formatCollectionExport();
  openExport(
    "Exportar colecao",
    state.collection.length + " cartas na colecao",
    text || "Colecao vazia."
  );
});
els.btnExportDeck.addEventListener("click", () => {
  const deck = state.decks.find((d) => d.id === state.activeDeckId);
  if (!deck) {
    toast("Abra um deck para exportar");
    return;
  }
  const total = (deck.cards || []).reduce((n, c) => n + (c.qty || 1), 0);
  openExport("Exportar deck", total + " cartas em " + deck.name, formatDeckExport(deck));
});
els.btnCopyExport.addEventListener("click", copyExport);
document.getElementById("btnCloseExport").addEventListener("click", closeExport);
document.getElementById("btnCloseExport2").addEventListener("click", closeExport);
els.exportOverlay.addEventListener("click", (e) => {
  if (e.target === els.exportOverlay) closeExport();
});

els.btnAddProxy.addEventListener("click", addToProxy);
els.btnPrintProxy.addEventListener("click", () => printCards(state.proxy, "Proxy A4"));
els.btnClearProxy.addEventListener("click", () => {
  if (!state.proxy.length) return;
  state.proxy = [];
  saveProxy();
  renderProxy();
  toast("Proxy limpo");
});
els.btnPrintDeck.addEventListener("click", () => {
  const deck = state.decks.find((d) => d.id === state.activeDeckId);
  if (!deck) {
    toast("Abra um deck para imprimir");
    return;
  }
  printCards(deck.cards || [], deck.name);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!els.exportOverlay.hidden) closeExport();
    else if (!els.deckPicker.hidden) els.deckPicker.hidden = true;
    else els.overlay.hidden = true;
    els.suggestList.hidden = true;
  }
});

const btnTheme = document.getElementById("btnTheme");
if (btnTheme) {
  btnTheme.addEventListener("click", () => {
    applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
  });
}

loadCollections();
moveNavPill(false);
initTopbarCollapse();
window.addEventListener("resize", () => moveNavPill(false));
window.addEventListener("load", () => moveNavPill(false));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveNavPill(false));
