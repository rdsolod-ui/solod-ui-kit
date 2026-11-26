import { readFile, writeFile, cp, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { head, pages, sitemap } from "./seo.mjs";
import { specs } from "./specs.mjs";
import * as views from "./views.mjs";
import * as icons from "./icons.mjs";
import * as data from "./data.mjs";
import * as charts from "./charts.mjs";
import * as runtime from "./runtime.mjs";
import * as recipes from "./specs.mjs";
const base = path.dirname(fileURLToPath(import.meta.url)),
  out = path.resolve(process.argv[2] || path.join(base, "dist"));
await mkdir(out, { recursive: true });
const read = (n) => readFile(path.join(base, n), "utf8");
const write = (n, v) => writeFile(path.join(out, n), v);
const functions = Object.fromEntries(
  Object.entries({
    ...views,
    ...icons,
    ...data,
    ...charts,
    ...runtime,
    ...recipes,
  }).filter(([, v]) => typeof v === "function"),
);
const js = Object.values(functions)
  .map((f) => f.toString())
  .join("\n\n");
const library =
  "const specs = [\n" +
  specs
    .map((s) => "{..." + JSON.stringify(s) + ",draw:" + s.draw.toString() + "}")
    .join(",\n") +
  "\n];";
const css =
  (await read("kit.css")) +
  "\n" +
  (await read("specimen.css")) +
  "\n" +
  (await read("theme.css"));
let font = await read("fonts/fonts.css");
for (const name of [...font.matchAll(/url\(\.\/([\w.-]+)\)/g)].map(
  (m) => m[1],
)) {
  const b64 = (await readFile(path.join(base, "fonts", name))).toString(
    "base64",
  );
  font = font.replace("./" + name, "data:font/woff2;base64," + b64);
}
const rights = await Promise.all(
  ["geistmono", "manrope"].map((n) => read("fonts/" + n + "-OFL.txt")),
);
const sources = Object.fromEntries(
  Object.entries(functions).map(([k, v]) => [k, v.toString()]),
);
await write(
  "assets.js",
  "const kitAssets=" + JSON.stringify({ css, font, rights, sources }) + ";",
);
await write("kit.js", js + "\n" + library);
function contents(items) {
  const groups = [...new Set(items.map(item => item.group))];
  return groups.map(group => {
    const links = items.filter(item => item.group === group).map(item =>
      `<a id="${data.esc(item.id)}" href="#${data.esc(item.id)}"><span>${data.esc(item.title)}</span><small>${data.esc(item.description)}</small></a>`
    );
    return `<section><h2>${data.esc(group)}</h2>\n${links.join("\n")}</section>`;
  }).join("\n");
}

for (const [page, meta] of Object.entries(pages)) {
  const isGuide = page === "guide";
  const shell = await read(page + ".body.html");
  const content = isGuide
    ? shell.replace("<!--COUNT-->", String(specs.length)).replace("<!--ENTRIES-->", contents(specs))
    : shell.replace("<!--BOARD-->", views.dashboard(data.seed()));
  const scripts = isGuide ? ["kit.js", "assets.js", "guide.js"] : ["kit.js", "index.js"];
  await write(page + ".html", `<!doctype html>
<html lang="ru"><head>
${head(meta, specs.length)}
</head><body class="${isGuide ? "doc-page" : "preview-page"}">
${content}
${scripts.map(src => `<script src="${src}"></script>`).join("\n")}
</body></html>\n`);
}
await write("sitemap.xml", sitemap());
await cp(path.join(base, "social"), path.join(out, "social"), { recursive: true });
await write("kit.css", css);
for (const name of [
  "site.css",
  "index.js",
  "guide.js",
  "icon.svg",
  "favicon.ico",
  "favicon-96.png",
  "apple-touch-icon.png",
  "theme.js",
  "element-map.csv",
])
  await cp(path.join(base, name), path.join(out, name));
await cp(path.join(base, "fonts"), path.join(out, "fonts"), {
  recursive: true,
});
console.log(out, specs.length + " examples");
