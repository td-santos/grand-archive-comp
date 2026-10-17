function renderDeckList() {
  els.deckList.innerHTML = "";
  if (!state.decks.length) {
    const empty = document.createElement("p");
    empty.className = "status";
    empty.textContent = "Nenhum deck ainda. Crie um ou adicione uma carta a um deck novo.";
    els.deckList.appendChild(empty);
    return;
  }
  state.decks.forEach((deck) => {
    const count = (deck.cards || []).reduce((n, c) => n + (c.qty || 1), 0);
    const card = document.createElement("div");
    card.className = "deck-card";
    const cover = deckCover(deck);
    card.innerHTML =
      '<div class="deck-cover">' +
      (cover ? '<img alt="" src="' + cover + '" />' : "") +
      "</div><h3>" +
      escapeHtml(deck.name) +
      "</h3><p>" +
      count +
      " cartas</p><div class=\"deck-card-actions\"><button class=\"ghost\" type=\"button\" data-open>Abrir</button><button class=\"ghost\" type=\"button\" data-del>Excluir</button></div>";
    card.querySelector("[data-open]").addEventListener("click", (e) => {
      e.stopPropagation();
      openDeck(deck.id);
    });
    card.querySelector("[data-del]").addEventListener("click", (e) => {
      e.stopPropagation();
      state.decks = state.decks.filter((d) => d.id !== deck.id);
      saveDecks();
      if (state.activeDeckId === deck.id) {
        state.activeDeckId = null;
        els.deckEditor.hidden = true;
        els.deckList.hidden = false;
      }
      renderDeckList();
      toast("Deck excluido");
    });
    card.addEventListener("click", () => openDeck(deck.id));
    els.deckList.appendChild(card);
  });
}

function openDeck(id) {
  const deck = state.decks.find((d) => d.id === id);
  if (!deck) return;
  state.activeDeckId = id;
  els.deckList.hidden = true;
  els.deckEditor.hidden = false;
  document.getElementById("btnNewDeck").hidden = true;
  const listBar = document.getElementById("decksListToolbar");
  if (listBar) listBar.hidden = true;
  els.viewDecks.classList.add("editing-deck");
  els.deckNameTitle.textContent = deck.name;
  renderDeckCards(deck);
}

function renderDeckCards(deck) {
  els.deckGrid.innerHTML = "";
  const cards = deck.cards || [];
  const total = cards.reduce((n, c) => n + (c.qty || 1), 0);
  els.deckCount.textContent = total + " cartas no deck";
  els.deckEmpty.hidden = cards.length > 0;
  cards.forEach((item) => {
    const wrap = document.createElement("div");
    wrap.className = "card-tile";
    wrap.innerHTML =
      (item.image ? '<img alt="' + escapeHtml(item.name) + '" loading="lazy" src="' + item.image + '" />' : "") +
      '<div class="tile-body"><h3>' +
      escapeHtml(item.name) +
      "</h3><p>" +
      escapeHtml((item.types || []).map(typeLabel).join(" / ") || "Carta") +
      "</p></div>" +
      '<div class="qty-row"><button type="button" data-minus>-</button><span>x' +
      (item.qty || 1) +
      '/4</span><button type="button" data-plus' +
      ((item.qty || 1) >= 4 ? " disabled" : "") +
      ">+</button></div>";
    wrap.addEventListener("click", (e) => {
      if (e.target.closest("[data-minus], [data-plus]")) return;
      openSavedCard(item);
    });
    wrap.querySelector("[data-minus]").addEventListener("click", (e) => {
      e.stopPropagation();
      changeQty(deck.id, item.key, -1);
    });
    wrap.querySelector("[data-plus]").addEventListener("click", (e) => {
      e.stopPropagation();
      changeQty(deck.id, item.key, 1);
    });
    els.deckGrid.appendChild(wrap);
  });
}

function changeQty(deckId, key, delta) {
  const deck = state.decks.find((d) => d.id === deckId);
  if (!deck) return;
  const item = (deck.cards || []).find((c) => c.key === key);
  if (!item) return;
  const next = (item.qty || 1) + delta;
  if (next > 4) {
    toast("Maximo de 4 copias da mesma carta");
    return;
  }
  item.qty = Math.max(0, next);
  if (item.qty === 0) {
    deck.cards = deck.cards.filter((c) => c.key !== key);
    if (deck.cover && deck.cover === item.image) deck.cover = "";
  }
  saveDecks();
  renderDeckCards(deck);
}

function createDeck(name) {
  const deck = { id: uid(), name: name || "Novo deck", cards: [] };
  state.decks.unshift(deck);
  saveDecks();
  return deck;
}

function addCardToDeck(deckId) {
  if (!state.currentCard) return;
  const deck = state.decks.find((d) => d.id === deckId);
  if (!deck) return;
  const snap = snapshotCard(state.currentCard);
  const existing = (deck.cards || []).find((c) => c.key === snap.key);
  if (existing) {
    if ((existing.qty || 1) >= 4) {
      toast("Maximo de 4 copias de " + snap.name);
      return;
    }
    existing.qty = (existing.qty || 1) + 1;
  } else {
    snap.qty = 1;
    deck.cards = deck.cards || [];
    deck.cards.push(snap);
  }
  saveDecks();
  toast("Adicionada ao deck " + deck.name);
  if (state.mode === "decks" && state.activeDeckId === deckId) renderDeckCards(deck);
}

function openDeckPicker() {
  if (!state.currentCard) return;
  els.pickerList.innerHTML = "";
  if (!state.decks.length) {
    const p = document.createElement("p");
    p.className = "status";
    p.textContent = "Crie um deck acima para comecar.";
    els.pickerList.appendChild(p);
  } else {
    state.decks.forEach((deck) => {
      const b = document.createElement("button");
      b.className = "picker-item";
      b.type = "button";
      b.textContent = deck.name;
      b.addEventListener("click", () => {
        addCardToDeck(deck.id);
        els.deckPicker.hidden = true;
      });
      els.pickerList.appendChild(b);
    });
  }
  els.newDeckName.value = "";
  els.deckPicker.hidden = false;
}

function closeNewDeck() {
  els.newDeckOverlay.hidden = true;
}

function closeCoverPicker() {
  els.coverPicker.hidden = true;
}

function openCoverPicker() {
  const deck = state.decks.find((d) => d.id === state.activeDeckId);
  if (!deck) {
    toast("Abra um deck para definir a capa");
    return;
  }
  const cards = deck.cards || [];
  els.coverPickGrid.innerHTML = "";
  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "cover-pick" + (!deck.cover ? " active" : "");
  backBtn.innerHTML = '<img alt="" src="' + CARD_BACK + '" /><span>Verso da carta</span>';
  backBtn.addEventListener("click", () => {
    deck.cover = "";
    saveDecks();
    renderDeckList();
    closeCoverPicker();
    toast("Capa do deck atualizada");
  });
  els.coverPickGrid.appendChild(backBtn);
  cards.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cover-pick" + (deck.cover === item.image ? " active" : "");
    btn.innerHTML =
      (item.image ? '<img alt="" src="' + item.image + '" />' : "") +
      "<span>" +
      escapeHtml(item.name) +
      "</span>";
    btn.addEventListener("click", () => {
      deck.cover = item.image || "";
      saveDecks();
      renderDeckList();
      closeCoverPicker();
      toast("Capa do deck atualizada");
    });
    els.coverPickGrid.appendChild(btn);
  });
  els.coverPicker.hidden = false;
}

function formatDeckExport(deck) {
  const cards = (deck.cards || []).slice().sort((a, b) => String(a.name).localeCompare(String(b.name), "pt-BR"));
  const lines = cards.map((c) => {
    const set = c.setPrefix ? " [" + c.setPrefix + (c.collector_number ? " #" + c.collector_number : "") + "]" : "";
    return (c.qty || 1) + "x " + (c.name || "Carta") + set;
  });
  const total = cards.reduce((n, c) => n + (c.qty || 1), 0);
  return deck.name + " (" + total + " cartas)\n\n" + lines.join("\n");
}
