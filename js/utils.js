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

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao carregar dados");
  return res.json();
}

function uid() {
  return "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function hiResImage(src) {
  if (!src) return "";
  return src;
}

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    els.toast.hidden = true;
  }, 2600);
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
