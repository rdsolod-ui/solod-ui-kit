import { readFile, writeFile, cp, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
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
const pages = {
  index: ["solod-ui-kit — Рабочий экран", "ru", "preview-page"],
  guide: ["solod-ui-kit — Справочник", "ru", "doc-page"],
};
for (const [page, [title, lang, cls]] of Object.entries(pages)) {
  const shell = await read(page + ".body.html");
  const content =
    page === "index"
      ? shell.replace("<!--BOARD-->", views.dashboard(data.seed()))
      : shell;
  await write(
    page + ".html",
    '<!doctype html>\n<html lang="' +
      lang +
      '"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#202225"><title>' +
      title +
      '</title><script src="theme.js"></script><link rel="icon" href="icon.svg"><link rel="stylesheet" href="fonts/fonts.css"><link rel="stylesheet" href="kit.css"><link rel="stylesheet" href="site.css"><body class="' +
      cls +
      '">' +
      content +
      '<script src="kit.js"></script>' +
      (page === "guide" ? '<script src="assets.js"></script>' : "") +
      '<script src="' +
      page +
      '.js"></script></body></html>',
  );
}
await write("kit.css", css);
for (const name of [
  "site.css",
  "index.js",
  "guide.js",
  "icon.svg",
  "theme.js",
  "element-map.csv",
])
  await cp(path.join(base, name), path.join(out, name));
await cp(path.join(base, "fonts"), path.join(out, "fonts"), {
  recursive: true,
});
console.log(out, specs.length + " examples");
