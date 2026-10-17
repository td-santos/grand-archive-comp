const els = {
  fx: document.querySelector(".fx"),
  nav: document.getElementById("nav"),
  navPill: document.getElementById("navPill"),
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
  viewProxy: document.getElementById("viewProxy"),
  proxyGrid: document.getElementById("proxyGrid"),
  proxyEmpty: document.getElementById("proxyEmpty"),
  proxyMeta: document.getElementById("proxyMeta"),
  navProxy: document.getElementById("navProxy"),
  navKeywords: document.getElementById("navKeywords"),
  viewKeywords: document.getElementById("viewKeywords"),
  kwList: document.getElementById("kwList"),
  kwSearch: document.getElementById("kwSearch"),
  keywordsMeta: document.getElementById("keywordsMeta"),
  btnAddProxy: document.getElementById("btnAddProxy"),
  btnPrintProxy: document.getElementById("btnPrintProxy"),
  btnClearProxy: document.getElementById("btnClearProxy"),
  btnPrintDeck: document.getElementById("btnPrintDeck"),
  btnCoverDeck: document.getElementById("btnCoverDeck"),
  coverPicker: document.getElementById("coverPicker"),
  coverPickGrid: document.getElementById("coverPickGrid"),
  newDeckOverlay: document.getElementById("newDeckOverlay"),
  createDeckForm: document.getElementById("createDeckForm"),
  createDeckName: document.getElementById("createDeckName"),
  printRoot: document.getElementById("printRoot"),
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
  proxy: loadJSON("ga-proxy", []),
  activeDeckId: null,
};

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

function deckCover(deck) {
  if (deck.cover) return deck.cover;
  return CARD_BACK;
}

function saveCollection() {
  saveJSON("ga-collection", state.collection);
}

function saveDecks() {
  saveJSON("ga-decks", state.decks);
}

function saveProxy() {
  saveJSON("ga-proxy", state.proxy);
}
