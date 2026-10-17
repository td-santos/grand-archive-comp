function fact(dt, dd) {
  if (dd == null || dd === "" || dd === "-") return "";
  return "<dt>" + dt + "</dt><dd>" + escapeHtml(String(dd)) + "</dd>";
}

function openDetail(card) {
  state.currentCard = card.data ? card.data : card;
  const source = state.currentCard;
  const ed = editionOf(source);
  const faces = [{ card: source, edition: ed, image: (card.image && !source.editions) ? card.image : IMG(ed && ed.image) }];
  if (ed && ed.other_orientations && ed.other_orientations.length) {
    ed.other_orientations.forEach((o) => {
      faces.push({
        card: Object.assign({}, source, o),
        edition: o.edition || ed,
        image: IMG((o.edition && o.edition.image) || (ed && ed.image)),
      });
    });
  }
  state.faces = faces;
  state.faceIndex = 0;
  els.btnFlip.hidden = faces.length < 2;
  renderFace();
  els.overlay.hidden = false;
}

function renderFace() {
  const face = state.faces[state.faceIndex];
  const card = face.card;
  const ed = face.edition;
  els.detailImage.src = face.image || "";
  els.detailImage.alt = card.name || "";
  els.detailName.textContent = card.name || "";
  els.detailSet.textContent = ed && ed.set ? ed.set.name + " · " + ed.set.prefix + " #" + (ed.collector_number || "") : "";

  const tags = []
    .concat(card.types || [])
    .concat(card.subtypes || [])
    .concat(card.classes || [])
    .concat(card.elements || []);
  els.detailTags.innerHTML = tags
    .filter(Boolean)
    .map((t) => '<span class="tag">' + escapeHtml(typeLabel(t)) + "</span>")
    .join("");

  els.detailFacts.innerHTML =
    fact("Custo", costLabel(card)) +
    fact("Tipo", (card.types || []).map(typeLabel).join(", ")) +
    fact("Subtipo", (card.subtypes || []).join(", ")) +
    fact("Classe", (card.classes || []).join(", ")) +
    fact("Elemento", (card.elements || []).join(", ")) +
    fact("Raridade", ed ? rarityLabel(ed.rarity) : "") +
    fact("Nivel", card.level) +
    fact("Vida", card.life) +
    fact("Poder", card.power) +
    fact("Durabilidade", card.durability) +
    fact("Velocidade", speedLabel(card.speed));

  const effect = card.effect_raw || (ed && ed.effect_raw) || card.effect || "Sem texto de efeito.";
  const flavor = (ed && ed.flavor) || card.flavor || "";
  els.detailEffect.textContent = effect;
  els.detailEffectPt.textContent = "Traduzindo...";
  els.flavorBlock.hidden = !flavor;
  els.detailFlavor.textContent = flavor;
  els.detailFlavorPt.textContent = flavor ? "Traduzindo..." : "";
  els.detailCredit.textContent = ed && ed.illustrator ? "Ilustracao: " + ed.illustrator : "";
  updateCollectionButton();

  translateText(effect).then((t) => {
    els.detailEffectPt.textContent = t;
  });
  if (flavor) {
    translateText(flavor).then((t) => {
      els.detailFlavorPt.textContent = t;
    });
  }
}
