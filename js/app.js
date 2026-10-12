const API = "https://api.gatcg.com";
const IMG = (path) => (path ? API + path : "");

const RARITY = {
  1: { text: "Comum", display: "C" },
  2: { text: "Incomum", display: "U" },
  3: { text: "Rara", display: "R" },
  4: { text: "Super Rara", display: "SR" },
  5: { text: "Ultra Rara", display: "UR" },
  6: { text: "Promo Rara", display: "PR" },
  7: { text: "Collector Super Rara", display: "CSR" },
  8: { text: "Collector Ultra Rara", display: "CUR" },
  9: { text: "Collector Promo Rara", display: "CPR" },
};

const TYPE_PT = {
  CHAMPION: "Campeao",
  ALLY: "Aliado",
  ACTION: "Acao",
  ATTACK: "Ataque",
  ITEM: "Item",
  WEAPON: "Arma",
  REGALIA: "Regalia",
  DOMAIN: "Dominio",
  PHANTASIA: "Fantasia",
};

const COST_PT = {
  memory: "Memoria",
  reserve: "Reserva",
  none: "Nenhum",
};

const SPEED_PT = {
  true: "Rapida",
  false: "Lenta",
};

const els = {
  viewCollections: document.getElementById("viewCollections"),
  viewCards: document.getElementById("viewCards"),
  featuredGrid: document.getElementById("featuredGrid"),
  otherGrid: document.getElementById("otherGrid"),
  featuredCount: document.getElementById("featuredCount"),
  otherCount: document.getElementById("otherCount"),
  cardGrid: document.getElementById("cardGrid"),
  cardsTitle: document.getElementById("cardsTitle"),
  cardsMeta: document.getElementById("cardsMeta"),
  cardsStatus: document.getElementById("cardsStatus"),
  btnMore: document.getElementById("btnMore"),
  setChips: document.getElementById("setChips"),
  searchForm: document.getElementById("searchForm"),
  searchInput: document.getElementById("searchInput"),
  suggestList: document.getElementById("suggestList"),
  overlay: document.getElementById("overlay"),
  detailImage: document.getElementById("detailImage"),
  detailName: document.getElementById("detailName"),
  detailSet: document.getElementById("detailSet"),
  detailTags: document.getElementById("detailTags"),
  detailFacts: document.getElementById("detailFacts"),
  detailEffect: document.getElementById("detailEffect"),
  detailEffectPt: document.getElementById("detailEffectPt"),
  detailFlavor: document.getElementById("detailFlavor"),
  detailFlavorPt: document.getElementById("detailFlavorPt"),
  flavorBlock: document.getElementById("flavorBlock"),
  detailCredit: document.getElementById("detailCredit"),
  btnFlip: document.getElementById("btnFlip"),
  toast: document.getElementById("toast"),
  viewMine: document.getElementById("viewMine"),
  viewDecks: document.getElementById("viewDecks"),
  mineGrid: document.getElementById("mineGrid"),
  mineEmpty: document.getElementById("mineEmpty"),
  mineMeta: document.getElementById("mineMeta"),
  deckList: document.getElementById("deckList"),
  deckEditor: document.getElementById("deckEditor"),
  deckGrid: document.getElementById("deckGrid"),
  deckEmpty: document.getElementById("deckEmpty"),
  deckNameTitle: document.getElementById("deckNameTitle"),
  deckCount: document.getElementById("deckCount"),
  decksTitle: document.getElementById("decksTitle"),
  decksMeta: document.getElementById("decksMeta"),
  btnAddCollection: document.getElementById("btnAddCollection"),
  btnAddDeck: document.getElementById("btnAddDeck"),
  deckPicker: document.getElementById("deckPicker"),
  pickerList: document.getElementById("pickerList"),
  newDeckForm: document.getElementById("newDeckForm"),
  newDeckName: document.getElementById("newDeckName"),
  navHome: document.getElementById("navHome"),
  navMine: document.getElementById("navMine"),
  navDecks: document.getElementById("navDecks"),
  exportOverlay: document.getElementById("exportOverlay"),
  exportTitle: document.getElementById("exportTitle"),
  exportMeta: document.getElementById("exportMeta"),
  exportText: document.getElementById("exportText"),
  btnCopyExport: document.getElementById("btnCopyExport"),
  btnExportMine: document.getElementById("btnExportMine"),
  btnExportDeck: document.getElementById("btnExportDeck"),
};

const state = {
  featured: [],
  allSets: [],
  cards: [],
  page: 1,
  totalPages: 1,
  totalCards: 0,
  hasMore: false,
  mode: "home",
  prefix: "",
  query: "",
  group: null,
  loading: false,
  suggestTimer: null,
  faces: [],
  faceIndex: 0,
  currentCard: null,
  collection: loadJSON("ga-collection", []),
  decks: loadJSON("ga-decks", []),
  activeDeckId: null,
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch (err) {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function cardKey(card, ed) {
  const edition = ed || editionOf(card);
  return (edition && edition.slug) || card.slug || card.uuid || card.name;
}

function snapshotCard(card) {
  const ed = editionOf(card);
  return {
    key: cardKey(card, ed),
    slug: card.slug || "",
    editionSlug: ed && ed.slug,
    name: card.name || "",
    image: imageOf(card),
    types: card.types || [],
    subtypes: card.subtypes || [],
    classes: card.classes || [],
    elements: card.elements || [],
    cost: card.cost || null,
    cost_memory: card.cost_memory,
    cost_reserve: card.cost_reserve,
    level: card.level,
    life: card.life,
    power: card.power,
    durability: card.durability,
    speed: card.speed,
    effect_raw: card.effect_raw || (ed && ed.effect_raw) || card.effect || "",
    flavor: (ed && ed.flavor) || card.flavor || "",
    rarity: ed ? ed.rarity : null,
    collector_number: ed ? ed.collector_number : "",
    illustrator: ed ? ed.illustrator : "",
    setName: ed && ed.set ? ed.set.name : "",
    setPrefix: ed && ed.set ? ed.set.prefix : "",
    data: card,
  };
}

function inCollection(key) {
  return state.collection.some((c) => c.key === key);
}

function saveCollection() {
  saveJSON("ga-collection", state.collection);
}

function saveDecks() {
  saveJSON("ga-decks", state.decks);
}

function hideAllViews() {
  els.viewCollections.hidden = true;
  els.viewCards.hidden = true;
  els.viewMine.hidden = true;
  els.viewDecks.hidden = true;
}

function setNav(id) {
  [els.navHome, els.navMine, els.navDecks].forEach((b) => b && b.classList.remove("active"));
  const btn = document.getElementById(id);
  if (btn) btn.classList.add("active");
}

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    els.toast.hidden = true;
  }, 2600);
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao carregar dados");
  return res.json();
}

function rarityLabel(n) {
  const r = RARITY[n];
  return r ? r.text + " (" + r.display + ")" : String(n ?? "-");
}

function typeLabel(t) {
  return TYPE_PT[t] || t;
}

function costLabel(card) {
  const c = card.cost;
  if (!c || c.type === "none" || c.value == null) return "Nenhum";
  const kind = COST_PT[c.type] || c.type;
  return c.value + " " + kind;
}

function speedLabel(speed) {
  if (speed === true) return "Rapida";
  if (speed === false) return "Lenta";
  return "-";
}

function editionOf(card) {
  return (card.result_editions && card.result_editions[0]) || (card.editions && card.editions[0]) || null;
}

function imageOf(card) {
  const ed = editionOf(card);
  return ed ? IMG(ed.image) : "";
}

function showHome() {
  state.mode = "home";
  hideAllViews();
  els.viewCollections.hidden = false;
  setNav("navHome");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showCards() {
  hideAllViews();
  els.viewCards.hidden = false;
  setNav("navHome");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showMine() {
  state.mode = "mine";
  hideAllViews();
  els.viewMine.hidden = false;
  setNav("navMine");
  renderMine();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showDecks(keepEditor) {
  state.mode = "decks";
  hideAllViews();
  els.viewDecks.hidden = false;
  setNav("navDecks");
  if (!keepEditor) {
    state.activeDeckId = null;
    els.deckEditor.hidden = true;
    els.deckList.hidden = false;
    document.getElementById("btnNewDeck").hidden = false;
    const listBar = document.getElementById("decksListToolbar");
    if (listBar) listBar.hidden = false;
    els.viewDecks.classList.remove("editing-deck");
  }
  renderDeckList();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function skeletonCards(n) {
  els.cardGrid.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const d = document.createElement("div");
    d.className = "skeleton";
    els.cardGrid.appendChild(d);
  }
}

function renderSetCard(set, image, extra) {
  const btn = document.createElement("button");
  btn.className = "set-card";
  btn.type = "button";
  const date = set.release_date ? new Date(set.release_date).toLocaleDateString("pt-BR") : "";
  btn.innerHTML =
    '<div class="set-art">' +
    (image ? '<img alt="" src="' + image + '" />' : "<span>" + (set.prefix || "") + "</span>") +
    "</div>" +
    '<div class="set-body"><h3>' +
    escapeHtml(set.name) +
    "</h3><p>" +
    escapeHtml(set.prefix || "") +
    (date ? " · " + date : "") +
    (extra ? " · " + extra : "") +
    "</p></div>";
  return btn;
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function loadCollections() {
  els.featuredGrid.innerHTML = "";
  els.otherGrid.innerHTML = "";
  try {
    const [featured, options] = await Promise.all([
      getJSON(API + "/featured-sets"),
      getJSON(API + "/option/search?field=set"),
    ]);
    state.featured = featured;
    state.allSets = options.set || [];

    els.featuredCount.textContent = featured.length + " colecoes";
    featured.forEach((group) => {
      const main = group.sets[0] || { name: group.name, prefix: "" };
      const card = renderSetCard(
        { name: group.name, prefix: main.prefix, release_date: main.release_date },
        IMG(group.image),
        group.sets.length + " conjuntos"
      );
      card.addEventListener("click", () => openGroup(group));
      els.featuredGrid.appendChild(card);
    });

    const featuredPrefixes = new Set();
    featured.forEach((g) => g.sets.forEach((s) => featuredPrefixes.add(s.prefix)));
    const others = state.allSets.filter((s) => !featuredPrefixes.has(s.value));
    els.otherCount.textContent = others.length + " conjuntos";
    others.forEach((s) => {
      const card = renderSetCard({ name: s.text, prefix: s.value }, "", "");
      card.addEventListener("click", () => openPrefix(s.value, s.text));
      els.otherGrid.appendChild(card);
    });
  } catch (err) {
    toast("Nao foi possivel carregar as colecoes.");
  }
}

function openGroup(group) {
  state.mode = "set";
  state.group = group;
  state.prefix = (group.sets[0] && group.sets[0].prefix) || "";
  state.query = "";
  els.searchInput.value = "";
  els.cardsTitle.textContent = group.name;
  renderChips(group);
  showCards();
  loadCards(true);
}

function openPrefix(prefix, name) {
  state.mode = "set";
  state.group = null;
  state.prefix = prefix;
  state.query = "";
  els.searchInput.value = "";
  els.cardsTitle.textContent = name || prefix;
  renderChips(null);
  showCards();
  loadCards(true);
}

function renderChips(group) {
  els.setChips.innerHTML = "";
  if (!group) return;
  group.sets.forEach((s, i) => {
    const b = document.createElement("button");
    b.className = "chip" + (i === 0 ? " active" : "");
    b.type = "button";
    b.textContent = s.name + " (" + s.prefix + ")";
    b.addEventListener("click", () => {
      [...els.setChips.children].forEach((c) => c.classList.remove("active"));
      b.classList.add("active");
      state.prefix = s.prefix;
      els.cardsTitle.textContent = s.name;
      loadCards(true);
    });
    els.setChips.appendChild(b);
  });
}

async function loadCards(reset) {
  if (state.loading) return;
  state.loading = true;
  if (reset) {
    state.page = 1;
    state.cards = [];
    skeletonCards(10);
    els.btnMore.hidden = true;
    els.cardsStatus.textContent = "Carregando cartas...";
  }

  const params = new URLSearchParams();
  params.set("page", String(state.page));
  params.set("page_size", "50");
  params.set("sort", state.mode === "search" ? "name" : "collector_number");
  params.set("order", "ASC");
  params.set("separate_editions", "true");
  if (state.mode === "search") params.set("name", state.query);
  if (state.mode === "set" && state.prefix) params.set("prefix", state.prefix);

  try {
    const data = await getJSON(API + "/cards/search?" + params.toString());
    state.hasMore = !!data.has_more;
    state.totalPages = data.total_pages || 1;
    state.totalCards = data.total_cards || 0;
    const items = data.data || [];
    if (reset) state.cards = items;
    else state.cards = state.cards.concat(items);
    renderCards(reset);
    els.cardsMeta.textContent = state.totalCards + " cartas encontradas";
    els.btnMore.hidden = !state.hasMore;
    els.cardsStatus.textContent = state.hasMore
      ? "Pagina " + state.page + " de " + state.totalPages
      : state.cards.length
      ? "Todas as cartas carregadas"
      : "Nenhuma carta encontrada";
  } catch (err) {
    els.cardsStatus.textContent = "Erro ao buscar cartas.";
    toast("Erro ao buscar cartas.");
  } finally {
    state.loading = false;
  }
}

function renderCards(reset) {
  if (reset) els.cardGrid.innerHTML = "";
  const start = reset ? 0 : els.cardGrid.children.length;
  state.cards.slice(start).forEach((card) => {
    const ed = editionOf(card);
    const btn = document.createElement("button");
    btn.className = "card-tile";
    btn.type = "button";
    const img = imageOf(card);
    const rare = ed ? rarityLabel(ed.rarity) : "";
    btn.innerHTML =
      (img ? '<img alt="' + escapeHtml(card.name) + '" loading="lazy" src="' + img + '" />' : "") +
      '<div class="tile-body"><h3>' +
      escapeHtml(card.name) +
      "</h3><p>" +
      escapeHtml((card.types || []).map(typeLabel).join(" / ") || "Carta") +
      (ed && ed.collector_number ? " · #" + ed.collector_number : "") +
      '</p><span class="rarity">' +
      escapeHtml(rare) +
      "</span></div>";
    btn.addEventListener("click", () => openDetail(card));
    els.cardGrid.appendChild(btn);
  });
}

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

const translateCache = new Map();

async function translateText(text) {
  const key = (text || "").trim();
  if (!key) return "";
  if (translateCache.has(key)) return translateCache.get(key);
  try {
    const url =
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(key.slice(0, 500)) +
      "&langpair=en|pt-BR";
    const data = await getJSON(url);
    const out = (data.responseData && data.responseData.translatedText) || key;
    const clean = out.replace(/^\s*MYMEMORY WARNING:.*/i, key).trim() || key;
    translateCache.set(key, clean);
    return clean;
  } catch (err) {
    return key;
  }
}

async function searchCards(name) {
  const q = (name || "").trim();
  if (!q) {
    showHome();
    return;
  }
  state.mode = "search";
  state.query = q;
  state.prefix = "";
  state.group = null;
  els.cardsTitle.textContent = 'Busca: "' + q + '"';
  els.setChips.innerHTML = "";
  showCards();
  loadCards(true);
}

async function suggest(name) {
  const q = name.trim();
  if (q.length < 2) {
    els.suggestList.hidden = true;
    return;
  }
  try {
    const list = await getJSON(API + "/cards/autocomplete?name=" + encodeURIComponent(q));
    els.suggestList.innerHTML = "";
    if (!list.length) {
      els.suggestList.hidden = true;
      return;
    }
    list.forEach((c, i) => {
      const li = document.createElement("li");
      if (i === 0) li.className = "active";
      li.innerHTML = "<span>" + escapeHtml(c.name) + "</span><small>" + escapeHtml((c.types || []).join(", ")) + "</small>";
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        els.searchInput.value = c.name;
        els.suggestList.hidden = true;
        searchCards(c.name);
      });
      els.suggestList.appendChild(li);
    });
    els.suggestList.hidden = false;
  } catch (err) {
    els.suggestList.hidden = true;
  }
}

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

function uid() {
  return "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

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
    card.innerHTML =
      "<h3>" +
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
  if (item.qty === 0) deck.cards = deck.cards.filter((c) => c.key !== key);
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
      const count = (deck.cards || []).reduce((n, c) => n + (c.qty || 1), 0);
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

function formatCollectionExport() {
  const lines = state.collection.map((c) => {
    const set = c.setPrefix ? " [" + c.setPrefix + (c.collector_number ? " #" + c.collector_number : "") + "]" : "";
    return "1x " + (c.name || "Carta") + set;
  });
  return lines.join("\n");
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

document.getElementById("btnHome").addEventListener("click", showHome);
document.getElementById("btnBack").addEventListener("click", showHome);
els.navHome.addEventListener("click", showHome);
els.navMine.addEventListener("click", showMine);
els.navDecks.addEventListener("click", () => showDecks(false));
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
  const name = prompt("Nome do deck");
  if (name == null) return;
  const deck = createDeck(name.trim() || "Novo deck");
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
document.getElementById("btnClose").addEventListener("click", () => {
  els.overlay.hidden = true;
});
els.overlay.addEventListener("click", (e) => {
  if (e.target === els.overlay) els.overlay.hidden = true;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!els.exportOverlay.hidden) closeExport();
    else if (!els.deckPicker.hidden) els.deckPicker.hidden = true;
    else els.overlay.hidden = true;
    els.suggestList.hidden = true;
  }
});
els.btnFlip.addEventListener("click", () => {
  state.faceIndex = (state.faceIndex + 1) % state.faces.length;
  renderFace();
});
els.btnMore.addEventListener("click", () => {
  if (!state.hasMore || state.loading) return;
  state.page += 1;
  loadCards(false);
});
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

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

function applyTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("ga-theme", next);
  const btn = document.getElementById("btnTheme");
  if (btn) btn.setAttribute("aria-label", next === "dark" ? "Ativar modo claro" : "Ativar modo escuro");
}

(function initTheme() {
  const saved = localStorage.getItem("ga-theme");
  if (saved === "dark" || saved === "light") applyTheme(saved);
  else applyTheme("light");
})();

const btnTheme = document.getElementById("btnTheme");
if (btnTheme) {
  btnTheme.addEventListener("click", () => {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  });
}

loadCollections();
