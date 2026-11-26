import { esc } from "./data.mjs";

const site = "https://marketing.parkskazka.ru/ops-ui-kit/";
export const pages = {
  index: {
    path: "",
    title: "solod-ui-kit — UI-кит для дашбордов и панелей управления",
    description: "Откройте демо панели управления. Переключайте три вида графиков, светлую и тёмную темы и цветовой акцент. Код компонентов доступен в справочнике.",
    image: "social/dashboard-v1.png",
    alt: "solod-ui-kit — UI-кит для дашбордов. Фрагмент панели с графиком нагрузки.",
  },
  guide: {
    path: "guide.html",
    title: "Компоненты дашборда с кодом — справочник solod-ui-kit",
    description: "",
    image: "social/guide-v1.png",
    alt: "Справочник компонентов solod-ui-kit. Пример типографики рядом с HTML-кодом.",
  },
};

export function head(page, exampleCount) {
  const { title, alt, path, image } = page;
  const description = page.description ||
    `В справочнике ${exampleCount} примеров для панели управления, включая навигацию, карточки, графики, анимацию и токены. Выберите компонент, скопируйте код или скачайте HTML-пример.`;
  const url = new URL(path, site).href;
  const picture = new URL(image, site).href;
  const schema = { "@context": "https://schema.org",
    "@type": page === pages.guide ? "CollectionPage" : "WebPage",
    url, name: title, description, inLanguage: "ru",
    primaryImageOfPage: { "@type": "ImageObject", contentUrl: picture, width: 1200, height: 630 }
  };
  const openGraph = { type: "website", site_name: "solod-ui-kit", locale: "ru_RU",
    title, description, url, image: picture, "image:alt": alt, "image:type": "image/png",
    "image:width": "1200", "image:height": "630" };
  const card = { card: "summary_large_image", title, description, image: picture, "image:alt": alt };
  return [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<meta name="theme-color" content="#202225">',
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    '<meta name="robots" content="max-image-preview:large">',
    `<link rel="canonical" href="${url}">`,
    ...Object.entries(openGraph).map(([k,v]) => `<meta property="og:${k}" content="${esc(v)}">`),
    ...Object.entries(card).map(([k,v]) => `<meta name="twitter:${k}" content="${esc(v)}">`),
    '<link rel="icon" href="favicon.ico" sizes="16x16 32x32 48x48">',
    '<link rel="icon" href="favicon-96.png" type="image/png" sizes="96x96">',
    '<link rel="icon" href="icon.svg" type="image/svg+xml" sizes="any">',
    '<link rel="apple-touch-icon" href="apple-touch-icon.png" sizes="180x180">',
    `<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<","\\u003c")}</script>`,
    '<script src="theme.js"></script>',
    ...["fonts/fonts.css","kit.css","site.css"].map(href => `<link rel="stylesheet" href="${href}">`)
  ].join("\n");
}

export function sitemap() {
  const urls = Object.values(pages).map(page => `  <url><loc>${new URL(page.path, site).href}</loc></url>`);
  return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls, '</urlset>', ''].join("\n");
}
