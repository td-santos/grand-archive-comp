function expandCards(list) {
  const out = [];
  (list || []).forEach((item) => {
    const n = Math.max(1, item.qty || 1);
    for (let i = 0; i < n; i++) out.push(item);
  });
  return out;
}

function chunk(arr, size) {
  const pages = [];
  for (let i = 0; i < arr.length; i += size) pages.push(arr.slice(i, i + size));
  return pages;
}

function printCards(list, title) {
  const cards = expandCards(list).filter((c) => c && c.image);
  if (!cards.length) {
    toast("Nenhuma carta para imprimir");
    return;
  }
  const pages = chunk(cards, 9);
  els.printRoot.innerHTML = pages
    .map((page) => {
      const cells = page
        .map((c) => '<div class="print-card"><img alt="' + escapeHtml(c.name) + '" src="' + hiResImage(c.image) + '" /></div>')
        .join("");
      return '<section class="print-page">' + cells + "</section>";
    })
    .join("");
  els.printRoot.hidden = false;
  document.title = title || "Proxy A4";
  const imgs = [...els.printRoot.querySelectorAll("img")];
  Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = res;
              img.onerror = res;
            })
    )
  ).then(() => {
    window.print();
    setTimeout(() => {
      els.printRoot.hidden = true;
      els.printRoot.innerHTML = "";
      document.title = "Grand Archive TCG | Home";
    }, 400);
  });
}

function inProxy(key) {
  return state.proxy.some((c) => c.key === key);
}

function addToProxy() {
  if (!state.currentCard) return;
  const snap = snapshotCard(state.currentCard);
  const existing = state.proxy.find((c) => c.key === snap.key);
  if (existing) existing.qty = (existing.qty || 1) + 1;
  else {
    snap.qty = 1;
    state.proxy.push(snap);
  }
  saveProxy();
  toast("Adicionada ao proxy");
  if (state.mode === "proxy") renderProxy();
}

function renderProxy() {
  els.proxyGrid.innerHTML = "";
  const total = state.proxy.reduce((n, c) => n + (c.qty || 1), 0);
  els.proxyMeta.textContent = total
    ? total + " cartas para imprimir (" + Math.ceil(total / 9) + " folhas A4)"
    : "Adicione cartas para imprimir 9 por folha, em alta qualidade.";
  els.proxyEmpty.hidden = state.proxy.length > 0;
  state.proxy.forEach((item) => {
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
      '</span><button type="button" data-plus>+</button></div>';
    wrap.addEventListener("click", (e) => {
      if (e.target.closest("[data-minus], [data-plus]")) return;
      openSavedCard(item);
    });
    wrap.querySelector("[data-minus]").addEventListener("click", (e) => {
      e.stopPropagation();
      item.qty = Math.max(0, (item.qty || 1) - 1);
      if (!item.qty) state.proxy = state.proxy.filter((c) => c.key !== item.key);
      saveProxy();
      renderProxy();
    });
    wrap.querySelector("[data-plus]").addEventListener("click", (e) => {
      e.stopPropagation();
      item.qty = (item.qty || 1) + 1;
      saveProxy();
      renderProxy();
    });
    els.proxyGrid.appendChild(wrap);
  });
}
