function currentTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

function setTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("ga-theme", next);
  const btn = document.getElementById("btnTheme");
  if (btn) btn.setAttribute("aria-label", next === "dark" ? "Ativar modo claro" : "Ativar modo escuro");
}

function prefersReducedMotion() {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function applyTheme(theme, animate) {
  if (!animate || prefersReducedMotion()) {
    setTheme(theme);
    return;
  }
  const root = document.documentElement;
  if (typeof document.startViewTransition === "function") {
    document.startViewTransition(() => setTheme(theme));
    return;
  }
  root.classList.add("theme-anim");
  setTheme(theme);
  clearTimeout(applyTheme._t);
  applyTheme._t = setTimeout(() => root.classList.remove("theme-anim"), 480);
}

(function initTheme() {
  const saved = localStorage.getItem("ga-theme");
  if (saved === "dark" || saved === "light") setTheme(saved);
  else setTheme("light");
})();
