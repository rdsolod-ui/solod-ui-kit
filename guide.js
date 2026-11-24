function dependencyCode(draw, interactive) {
  const sources = kitAssets.sources,
    need = new Set();
  function visit(src) {
    for (const name of Object.keys(sources)) {
      if (need.has(name) || !new RegExp("\\b" + name + "\\b").test(src))
        continue;
      need.add(name);
      visit(sources[name]);
    }
  }
  visit(draw.toString());
  if (interactive) visit("mount");
  return [...need].map((name) => sources[name]).join("\n\n");
}

function sampleParts(spec, state) {
  const stateCopy = structuredClone(state),
    inside = spec.draw(stateCopy);
  const html = `<div class="ops sample" data-theme="${state.theme === "dark" ? "dark" : "light"}" id="sample" data-id="${esc(spec.id)}" style="--accent:${presets()[state.accent] || presets().Pistachio}">${inside}</div>`;
  const active =
    inside.includes("data-copy-value=") ||
    inside.includes("data-do=") ||
    inside.includes('class="search"') ||
    ["intro", "counter", "screen"].includes(spec.id);
  let js = "";
  if (active) {
    const json = JSON.stringify(stateCopy).replace(/</g, "\\u003c");
    js = `const render = ${spec.draw.toString()};\n\n${dependencyCode(spec.draw, true)}\n\nconst root = document.getElementById("sample");\nmount(root, render, ${json}, ${["intro", "counter", "screen"].includes(spec.id)});`;
  }
  const extras = spec.controls.includes("replay")
    ? '<button type="button" class="btn pearl" id="again">Повторить</button>'
    : "";
  if (extras)
    js +=
      '\ndocument.getElementById("again").onclick = () => root.command("replay");';
  return { html: html + extras, js };
}

function portable(spec, state) {
  const { html, js } = sampleParts(spec, state);
  const css = kitAssets.font + "\n" + kitAssets.css;
  return `<!doctype html>\n<html lang="ru" data-theme="${state.theme === "dark" ? "dark" : "light"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(spec.title)} · solod-ui-kit</title><style>${css}</style></head><body>${html}<script>${js.replace(/<\/script/gi, "<\\/script")}<\/script><script type="text/plain" id="font-licenses">${kitAssets.rights.join("\n\n")}<\/script></body></html>`;
}

function relevantCSS(el) {
  if (!el) return "";
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(kitAssets.css);
  function matchRule(rule) {
    if (rule.cssRules) {
      const children = [...rule.cssRules].map(matchRule).filter(Boolean);
      return children.length
        ? rule.cssText.split("{")[0] + "{\n" + children.join("\n") + "\n}"
        : "";
    }
    if (!rule.selectorText) return "";
    if (rule.selectorText.includes(":root")) return "";
    const selectors = rule.selectorText
      .replace(/:(hover|focus-visible|active|disabled)\b/g, "")
      .replace(/::?(before|after)\b/g, "");
    try {
      if (!el.querySelector(selectors) && !el.matches(selectors)) return "";
    } catch {
      return "";
    }
    return rule.cssText
      .replace(/; /g, ";\n  ")
      .replace(" { ", " {\n  ")
      .replace(/ }$/, "\n}");
  }
  return [...sheet.cssRules].map(matchRule).filter(Boolean).join("\n\n");
}
const $ = (id) => document.getElementById(id),
  frame = $("live"),
  wrap = $("frame-wrap");
let spec = null,
  state = null,
  tab = "HTML",
  partCache = null,
  cssCache = "",
  resizeWatch = null,
  ticket = 0;
const groups = [...new Set(specs.map((x) => x.group))];
function navigation() {
  const q = $("find").value.toLowerCase().trim();
  $("entries").innerHTML =
    groups
      .map((group) => {
        const items = specs.filter(
          (v) =>
            v.group === group &&
            [v.title, v.description, group].join(" ").toLowerCase().includes(q),
        );
        return items.length
          ? "<h2>" +
              esc(group) +
              "</h2>" +
              items
                .map(
                  (v) =>
                    '<a href="#' +
                    v.id +
                    '" ' +
                    (v.id === spec?.id ? 'aria-current="page"' : "") +
                    ">" +
                    esc(v.title) +
                    "</a>",
                )
                .join("")
          : "";
      })
      .join("") || "<p>Совпадений нет</p>";
}
function fitFrame() {
  const d = frame.contentDocument;
  if (!d?.querySelector("#sample") || !spec) return;
  if (spec.id === "screen") {
    const scale = Math.min(1, wrap.clientWidth / 1425);
    frame.style.width = "1425px";
    frame.style.height =
      Math.ceil(d.getElementById("sample").offsetHeight + 2) + "px";
    frame.style.transform = "scale(" + scale + ")";
    frame.style.transformOrigin = "0 0";
    wrap.style.height =
      Math.ceil(parseFloat(frame.style.height) * scale + 2) + "px";
  } else {
    frame.style.width = "100%";
    frame.style.transform = "none";
    wrap.style.height = "auto";
    const height = d.body.querySelector("dialog[open]")
      ? 510
      : d.body.getBoundingClientRect().height;
    frame.style.height =
      Math.max(150, Math.min(920, Math.ceil(height + 3))) + "px";
  }
}
function codeText() {
  partCache ??= sampleParts(spec, state);
  if (tab === "HTML") return partCache.html.replace(/></g, ">\n<");
  if (tab === "CSS") {
    const base = new URL("kit.css", location.href).href;
    return (
      '@import url("' +
      new URL("fonts/fonts.css", location.href).href +
      '");\n@import url("' +
      base +
      '");\n\n/* Правила отображаемого состояния */\n' +
      cssCache
    );
  }
  if (tab === "JS") return partCache.js || "// Элемент работает на HTML и CSS.";
  if (tab === "SVG")
    return (
      frame.contentDocument
        ?.querySelector(".plot,svg")
        ?.outerHTML.replace(/></g, ">\n<") || ""
    );
  if (tab === "JSON") return JSON.stringify(series(state.period), null, 2);
  const vars = frame.contentDocument?.documentElement;
  if (!vars) return "";
  const css = getComputedStyle(vars);
  return (
    ":root {\n" +
    [...css]
      .filter((k) => k.startsWith("--") && k !== "--grain")
      .sort()
      .map((k) => "  " + k + ": " + css.getPropertyValue(k).trim() + ";")
      .join("\n") +
    "\n}"
  );
}
function updateCode() {
  const tabs = ["HTML", "CSS", "JS"];
  if (spec.group === "Графики" || spec.id === "primary")
    tabs.push("SVG", "JSON");
  if (spec.group === "Токены") tabs.push("Токены");
  if (!tabs.includes(tab)) tab = "HTML";
  $("code-tabs").innerHTML = tabs
    .map(
      (t) =>
        '<button aria-pressed="' +
        (tab === t) +
        '" data-tab="' +
        t +
        '">' +
        t +
        "</button>",
    )
    .join("");
  $("source").textContent = codeText();
}
function options() {
  const opts = spec.controls.split(",").filter(Boolean);
  const names = {
    period: "Период",
    accent: "Акцент",
    mode: "График",
    filter: "Состояние",
    variant: "Вариант",
  };
  $("options").innerHTML = opts
    .map((o) => {
      if (o === "replay")
        return '<button class="small-btn" id="repeat">Повторить</button>';
      const [k, values] = o.split(":");
      const list =
        values?.split("|") ||
        {
          period: ["Today", "7 days", "30 days"],
          mode: ["Halftone", "Ridgelines", "Skyline"],
          accent: Object.keys(presets()),
          filter: ["Active", "Paused", "Drafts"],
        }[k];
      return (
        "<label>" +
        names[k] +
        ' <select data-field="' +
        k +
        '">' +
        list
          .map(
            (v) =>
              '<option value="' +
              esc(v) +
              '" ' +
              (v === state[k] ? "selected" : "") +
              ">" +
              esc(uiLabel(v)) +
              "</option>",
          )
          .join("") +
        "</select></label>"
      );
    })
    .join("");
}
function loadFrame() {
  const own = ++ticket,
    snapshot = structuredClone(state);
  partCache = null;
  cssCache = "";
  resizeWatch?.disconnect();
  resizeWatch = null;
  frame.onload = () => {
    if (own !== ticket) return;
    const d = frame.contentDocument,
      root = d.getElementById("sample");
    if (!root) return;
    function refresh() {
      state = structuredClone(root.opsState || snapshot);
      partCache = null;
      cssCache = relevantCSS(root);
      for (const sel of $("options").querySelectorAll("select"))
        sel.value = state[sel.dataset.field] ?? sel.value;
      updateCode();
      fitFrame();
    }
    root.addEventListener("opschange", refresh);
    new MutationObserver(fitFrame).observe(d.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    resizeWatch = new ResizeObserver(fitFrame);
    resizeWatch.observe(d.body);
    d.fonts.ready.then(fitFrame);
    refresh();
  };
  frame.srcdoc = portable(spec, state);
  frame.title = spec.title + " — живой пример";
  updateCode();
}
function route() {
  const key = location.hash.slice(1) || "screen";
  spec = specs.find((s) => s.id === key) || specs[0];
  state = seed();
  state.theme = document.documentElement.dataset.theme || "light";
  const variant = spec.controls
    .split(",")
    .find((s) => s.startsWith("variant:"));
  if (variant) state.variant = variant.slice(8).split("|")[0];
  tab = "HTML";
  $("msg").textContent = "";
  $("group").textContent = spec.group;
  $("title").textContent = spec.title;
  $("description").textContent = spec.description;
  document.title = spec.title + " · solod-ui-kit";
  navigation();
  options();
  loadFrame();
  const nav = $("doc-nav");
  nav.classList.remove("open");
  document.querySelector(".nav-toggle").setAttribute("aria-expanded", "false");
  window.scrollTo(0, 0);
}
$("options").onchange = (e) => {
  const k = e.target.dataset.field;
  if (!k) return;
  state[k] = e.target.value;
  if (k === "variant") delete state.segmentValue;
  const root = frame.contentDocument?.getElementById("sample");
  if (k !== "variant" && root?.command) {
    root.command(k, state[k]);
  } else loadFrame();
};
$("options").onclick = (e) => {
  if (e.target.id === "repeat")
    frame.contentDocument?.getElementById("sample")?.command("replay");
};
$("code-tabs").onclick = (e) => {
  if (e.target.dataset.tab) {
    tab = e.target.dataset.tab;
    updateCode();
    $("code-tabs").querySelector('[aria-pressed="true"]').focus();
  }
};
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    $("msg").textContent = "Скопировано";
  } catch {
    const a = document.createElement("textarea");
    a.value = text;
    document.body.append(a);
    a.select();
    const ok = document.execCommand("copy");
    a.remove();
    $("msg").textContent = ok ? "Скопировано" : "Используйте скачивание HTML";
  }
}
$("copy-tab").onclick = () => copy(codeText());
$("copy-full").onclick = () => copy(portable(spec, state));
$("download").onclick = () => {
  const a = document.createElement("a"),
    url = URL.createObjectURL(
      new Blob([portable(spec, state)], { type: "text/html;charset=utf-8" }),
    );
  a.href = url;
  a.download = "ops-" + spec.id + ".html";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
  $("msg").textContent = "HTML подготовлен";
};
$("find").oninput = navigation;
document.querySelector(".nav-toggle").onclick = (e) => {
  const open = $("doc-nav").classList.toggle("open");
  e.target.setAttribute("aria-expanded", open);
  if (open) $("find").focus();
};
window.addEventListener("solodtheme", (e) => {
  if (state && state.theme !== e.detail) {
    state.theme = e.detail;
    loadFrame();
  }
});
window.addEventListener("hashchange", route);
window.addEventListener("resize", fitFrame);
route();
