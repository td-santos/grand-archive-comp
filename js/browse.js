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
      const card = renderSetCard({ name: s.text, prefix: s.value }, CARD_BACK, "");
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
