(() => {
  const key = "solod-ui-kit.theme";
  const system = matchMedia("(prefers-color-scheme: dark)");
  function stored() {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  function apply(preference) {
    const theme = ["light", "dark"].includes(preference)
      ? preference
      : system.matches
        ? "dark"
        : "light";
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#10151c" : "#e6e9ed");
    for (const button of document.querySelectorAll("[data-theme-toggle]")) {
      button.setAttribute("aria-pressed", String(theme === "dark"));
      button.title =
        theme === "dark"
          ? "Переключить на светлую тему"
          : "Переключить на тёмную тему";
    }
    window.dispatchEvent(new CustomEvent("solodtheme", { detail: theme }));
  }
  apply(stored());
  document.addEventListener("DOMContentLoaded", () => apply(stored()), {
    once: true,
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-theme-toggle]")) return;
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(key, next);
    } catch {}
    apply(next);
  });
  system.addEventListener("change", () => {
    if (!stored()) apply(null);
  });
  window.addEventListener("storage", (e) => {
    if (e.key === key || e.key === null) apply(stored());
  });
})();
