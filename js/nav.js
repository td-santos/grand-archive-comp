function hideAllViews() {
  els.viewCollections.hidden = true;
  els.viewCards.hidden = true;
  els.viewMine.hidden = true;
  els.viewDecks.hidden = true;
  if (els.viewProxy) els.viewProxy.hidden = true;
  if (els.viewKeywords) els.viewKeywords.hidden = true;
}

function moveNavPill(animate) {
  const pill = els.navPill;
  const active = document.querySelector(".nav-btn.active");
  if (!pill || !active) return;
  if (animate === false) pill.style.transition = "none";
  pill.style.width = active.offsetWidth + "px";
  pill.style.height = active.offsetHeight + "px";
  pill.style.transform = "translate(" + active.offsetLeft + "px, " + active.offsetTop + "px)";
  pill.style.opacity = "1";
  if (animate === false) {
    void pill.offsetWidth;
    pill.style.transition = "";
  }
}

function setNav(id) {
  [els.navHome, els.navMine, els.navDecks, els.navProxy, els.navKeywords].forEach((b) => b && b.classList.remove("active"));
  const btn = document.getElementById(id);
  if (btn) btn.classList.add("active");
  moveNavPill();
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

function showProxy() {
  state.mode = "proxy";
  hideAllViews();
  els.viewProxy.hidden = false;
  setNav("navProxy");
  renderProxy();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showKeywords() {
  state.mode = "keywords";
  hideAllViews();
  els.viewKeywords.hidden = false;
  setNav("navKeywords");
  renderKeywords();
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

const TOPBAR_MOBILE = 820;

function initTopbarCollapse() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;
  let lastY = window.scrollY;
  let collapsed = false;

  function isMobile() {
    return window.innerWidth <= TOPBAR_MOBILE;
  }

  function setCollapsed(next) {
    if (next === collapsed) return;
    collapsed = next;
    topbar.classList.toggle("is-collapsed", collapsed);
    if (!collapsed) moveNavPill(false);
  }

  function update() {
    if (!isMobile()) {
      setCollapsed(false);
      lastY = window.scrollY;
      return;
    }
    const y = window.scrollY;
    if (y <= 8) setCollapsed(false);
    else if (y > lastY + 4) setCollapsed(true);
    lastY = y;
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}
