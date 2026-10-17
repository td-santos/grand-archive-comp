function updateCollectionButton() {
  if (!els.btnAddCollection || !state.currentCard) return;
  const snap = snapshotCard(state.currentCard);
  const owned = inCollection(snap.key);
  els.btnAddCollection.textContent = owned ? "Remover da colecao" : "Adicionar a colecao";
  els.btnAddCollection.classList.toggle("ghost", owned);
  els.btnAddCollection.classList.toggle("btn-main", !owned);
}

function toggleCollection() {
  if (!state.currentCard) return;
  const snap = snapshotCard(state.currentCard);
  if (inCollection(snap.key)) {
    state.collection = state.collection.filter((c) => c.key !== snap.key);
    saveCollection();
    toast("Removida da colecao");
  } else {
    state.collection.unshift(snap);
    saveCollection();
    toast("Adicionada a colecao");
  }
  updateCollectionButton();
  if (state.mode === "mine") renderMine();
}

function renderMine() {
  els.mineGrid.innerHTML = "";
  els.mineMeta.textContent = state.collection.length
    ? state.collection.length + " cartas na sua colecao"
    : "Cartas que voce adicionou ficam salvas neste navegador.";
  els.mineEmpty.hidden = state.collection.length > 0;
  state.collection.forEach((item) => {
    const wrap = document.createElement("div");
    wrap.className = "card-tile";
    wrap.innerHTML =
      (item.image ? '<img alt="' + escapeHtml(item.name) + '" loading="lazy" src="' + item.image + '" />' : "") +
      '<div class="tile-body"><h3>' +
      escapeHtml(item.name) +
      "</h3><p>" +
      escapeHtml((item.types || []).map(typeLabel).join(" / ") || "Carta") +
      '</p><span class="rarity">' +
      escapeHtml(item.rarity != null ? rarityLabel(item.rarity) : "") +
      "</span></div>";
    wrap.addEventListener("click", () => openSavedCard(item));
    els.mineGrid.appendChild(wrap);
  });
}

function openSavedCard(item) {
  if (item.data) {
    openDetail(item.data);
    return;
  }
  const fake = {
    name: item.name,
    slug: item.slug,
    types: item.types,
    subtypes: item.subtypes,
    classes: item.classes,
    elements: item.elements,
    cost: item.cost,
    cost_memory: item.cost_memory,
    cost_reserve: item.cost_reserve,
    level: item.level,
    life: item.life,
    power: item.power,
    durability: item.durability,
    speed: item.speed,
    effect_raw: item.effect_raw,
    flavor: item.flavor,
    editions: [
      {
        slug: item.editionSlug,
        image: null,
        rarity: item.rarity,
        collector_number: item.collector_number,
        illustrator: item.illustrator,
        flavor: item.flavor,
        effect_raw: item.effect_raw,
        set: { name: item.setName, prefix: item.setPrefix },
      },
    ],
  };
  state.currentCard = fake;
  const faces = [{ card: fake, edition: fake.editions[0], image: item.image }];
  state.faces = faces;
  state.faceIndex = 0;
  els.btnFlip.hidden = true;
  renderFace();
  els.overlay.hidden = false;
}
