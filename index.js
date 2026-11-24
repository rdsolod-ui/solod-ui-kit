const board = document.getElementById("board"),
  box = document.getElementById("size"),
  wrap = document.getElementById("wrap");
const modes = ["Halftone", "Ridgelines", "Skyline"];
let zoom = false,
  inspect = false;
document.getElementById("modes").innerHTML = modes
  .map((v) => '<button data-mode="' + v + '">' + uiLabel(v) + "</button>")
  .join("");
document.getElementById("accents").innerHTML = Object.entries(presets())
  .map(
    ([v, c]) =>
      '<button class="swatch" data-accent="' +
      v +
      '" aria-label="' +
      uiLabel(v) +
      '" title="' +
      uiLabel(v) +
      '"><i style="--swatch:' +
      c +
      '"></i>' +
      uiLabel(v) +
      "</button>",
  )
  .join("");
function inspectLinks() {
  board.querySelectorAll(".code-link").forEach((e) => e.remove());
  if (!inspect) return;
  board.querySelectorAll("[data-spec]").forEach((el) => {
    const a = document.createElement("a");
    a.className = "code-link";
    a.href = "guide.html#" + el.dataset.spec;
    a.textContent =
      "</> " +
      (specs.find((item) => item.id === el.dataset.spec)?.title || "Код");
    el.append(a);
  });
}
board.addEventListener("opschange", (e) => {
  for (const el of document.querySelectorAll("[data-mode],[data-accent]"))
    el.setAttribute(
      "aria-pressed",
      String(
        el.dataset.mode === e.detail.mode ||
          el.dataset.accent === e.detail.accent,
      ),
    );
  inspectLinks();
});
mount(board, dashboard, seed(), true);
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.mode) board.command("mode", b.dataset.mode);
  if (b.dataset.accent) board.command("accent", b.dataset.accent);
  if (b.id === "replay") board.command("replay");
  if (b.id === "inspect") {
    inspect = !inspect;
    b.setAttribute("aria-pressed", inspect);
    inspectLinks();
  }
  if (b.id === "menu") {
    b.setAttribute(
      "aria-expanded",
      String(board.toggleAttribute("data-menu-open")),
    );
  }
  if (b.id === "zoom") {
    zoom = !zoom;
    b.textContent = zoom ? "Крупнее" : "Весь экран";
    b.setAttribute("aria-pressed", zoom);
    fit();
  }
});
function fit() {
  const outer = wrap.clientWidth,
    narrow = outer <= 800;
  board.toggleAttribute("data-compact", narrow && !zoom);
  const width = narrow && !zoom ? outer : 1425;
  const scale = Math.min(1, outer / width);
  board.style.width = width + "px";
  board.style.transform = "scale(" + scale + ")";
  box.style.width = width * scale + "px";
  box.style.height = Math.ceil(board.offsetHeight * scale) + "px";
  box.style.margin = narrow ? "0 auto" : "0 " + (outer > 1455 ? "auto" : "0");
}
new ResizeObserver(fit).observe(board);
window.addEventListener("resize", fit);
fit();
