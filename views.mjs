import { uiLabel, runCount } from "./data.mjs";
import { glyph } from "./icons.mjs";
import { series, esc } from "./data.mjs";
import { chartSVG } from "./charts.mjs";
export function button(
  text,
  action = "action",
  icon = "",
  tone = "pearl",
  key = "",
) {
  return `<button type="button" class="btn ${tone}" data-do="${esc(action)}">${icon ? glyph(icon, 16) : ""}${esc(text)}${key ? kbd(key) : ""}</button>`;
}

export function linkButton(text, action = "log") {
  return `<button class="link-btn" data-do="${esc(action)}">${esc(text)} ${glyph("arrow", 16)}</button>`;
}

export function kbd(key = "↵") {
  return `<kbd>${esc(key)}</kbd>`;
}

export function badge(n = 3) {
  return `<span class="count">${esc(n)}</span>`;
}

export function idTag(id = "AC-214") {
  return `<span class="idtag">${glyph("tag", 12)}${esc(id)}</span>`;
}

export function statusChip(label = "В норме", kind = "ok") {
  return `<span class="chip ${esc(kind)}"><i></i>${esc(label)}</span>`;
}

export function segment(items, selected, action = "period", icons = false) {
  return `<div class="segments" role="group" aria-label="${action === "mode" ? "Вид графика" : "Отчётный период"}">${items.map((v, i) => `<button type="button" data-do="${action}" data-value="${esc(v)}" aria-pressed="${v === selected}" title="${esc(uiLabel(v))}" aria-label="${esc(uiLabel(v))}">${icons ? glyph(["dots", "waves", "bars"][i], 16) : esc(uiLabel(v))}</button>`).join("")}</div>`;
}

export function navItem(
  text = "Обзор",
  icon = "grid",
  action = "overview",
  count = "",
  selected = false,
) {
  return `<button type="button" class="nav-item ${selected ? "chosen" : ""}" data-do="${esc(action)}"><span class="nav-symbol">${glyph(icon, 20)}</span><span class="nav-name">${esc(text)}</span>${count !== "" ? (action === "queue" ? badge(count) : `<small>${esc(count)}</small>`) : ""}</button>`;
}

export function legend() {
  return `<div class="legend">${["Готово", "По плану", "Сбой", "В очереди"].map((v, i) => `<span><i class="keymark m${i}"></i>${v}</span>`).join("")}</div>`;
}

export function runBars(row = 0) {
  return `<span class="run-bars" role="img" aria-label="24 запуска, ${row === 0 || row === 3 ? "один сбой" : "без сбоев"}">${Array.from({ length: 24 }, (_, i) => `<i class="${(row === 0 && i === 13) || (row === 3 && i === 6) ? "bad" : row === 0 && i > 15 ? "pending" : row === 2 && i === 23 ? "current" : ""}"></i>`).join("")}</span>`;
}

export function workflowRow(row, index = 0) {
  const [name, route, icon, label, kind] = row;
  return `<tr><td><span class="flow-id"><span class="tile">${glyph(icon, 18)}</span><span><button class="flow-name" data-do="workflow-detail" data-value="${esc(name)}">${esc(name)}</button><small>${esc(route)}</small></span></span></td><td>${runBars(index)}</td><td>${statusChip(label, kind)}</td></tr>`;
}

export function approvalCard(entry, active = true) {
  if (!entry)
    return '<p class="empty">Очередь пуста. Все решения сохранены.</p>';
  const [id, age, title, note] = entry;
  return `<article class="approval ${active ? "raised" : "hatched"}"><span class="grip">${glyph("grip", 16)}</span><div class="approval-body"><div class="approval-meta">${idTag(id)}<small>${esc(age)}</small></div><strong>${esc(title)}</strong><p>${esc(note)}</p>${active ? `<div class="actions">${button("Согласовать", "approve", "", "graphite", "↵")}${button("Отклонить", "decline", "", "pearl", "Esc")}</div>` : ""}</div></article>`;
}

export function stats(s) {
  const points = series(s.period),
    total = points.filter((p) => !p.planned).reduce((a, b) => a + b.value, 0),
    future = points.filter((p) => p.planned).reduce((a, b) => a + b.value, 0);
  return `<div class="stat-block"><div class="stat-summary"><div class="number" data-number="${total}">${total}</div><div class="delta"><b>${glyph("rise", 12)}20,4 %</b><span>к прошлому периоду</span></div><p>${s.period === "Today" ? "с полуночи" : "за выбранный период"}. По плану ещё ${runCount(future)}.</p></div><dl>${[
    ["Без ошибок", "99,4 %"],
    ["Медиана", "4,1 с"],
    ["Пик", "09:00"],
  ]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join("")}</dl></div>`;
}

export function insight(s) {
  return `<div class="insight" data-spec="insight"><span class="insight-sheen" aria-hidden="true"></span><span class="signal">${glyph("spark", 16)}</span><p><b>${s.paused ? "Повторы отложены на 15 минут." : "С 09:40 сверка счетов идёт в 3,1 раза дольше."}</b> <span>${s.paused ? "Очередь продолжит работу автоматически." : "41 запуск ждёт ответа реестра."}</span></p><div class="actions">${button(s.paused ? "Возобновить" : "Пауза на 15 мин", "pause", "pause", "graphite")}<button class="btn trace-btn" data-do="trace">Разбор <span>${glyph("arrow", 16)}</span></button></div></div>`;
}

export function rail(s) {
  const icons = [
    ["grid", "overview", "Обзор"],
    ["flow", "workflows", "Процессы"],
    ["shield", "queue", "Согласования"],
    ["clock", "log", "Журнал запусков"],
    ["folder", "folders", "Папки"],
    ["plug", "integrations", "Подключения"],
    ["spark", "trace", "Инцидент"],
  ];
  return `<nav class="rail" aria-label="Инструменты" data-spec="rail"><div class="dark-rail"><button class="brand-icon" data-do="replay" aria-label="Повторить вступление">${glyph("logo", 26)}</button><span class="rail-divider"></span>${icons.map(([i, a, l], n) => `<button class="rail-btn ${!n ? "on" : ""}" data-do="${a}" aria-label="${l}" title="${l}">${!n ? '<span class="rail-tick"></span>' : ""}${glyph(i, 20)}${a === "queue" && (s?.queue?.length ?? 3) > 0 ? '<span class="rail-unread"></span>' : ""}</button>`).join("")}</div><div class="meter"><div class="meter-top"><small>24 Ч</small><div class="meter-bars">${Array.from({ length: 24 }, (_, i) => `<i class="${i === 9 || i === 10 ? "hot" : i > 10 ? "future" : ""}"></i>`).join("")}</div></div><span>СОЛОД / ПУЛЬТ ОПЕРАЦИЙ</span></div><button class="rail-foot" data-do="settings" aria-label="Настройки оформления">${glyph("tune", 20)}</button></nav>`;
}

export function workspaceNav(s) {
  return `<aside class="navigator" data-spec="navigator"><button class="workspace" data-do="workspace"><b class="monogram">С</b><span><strong>Солод</strong><small>Рабочая область</small></span>${glyph("chevron", 16)}</button><label class="search"><span class="nav-symbol">${glyph("search", 20)}</span><span class="sr-only">Поиск по процессам</span><input aria-label="Найти процесс" placeholder="Найти процесс" value="${esc(s.search)}">${kbd("⌘K")}</label><div class="nav-group"><h3>Навигация</h3>${navItem("Обзор", "grid", "overview", "", true)}${navItem("Процессы", "flow", "workflows", s.flows.length)}${navItem("Согласования", "shield", "queue", s.queue.length)}${navItem("Журнал запусков", "clock", "log")}</div><div class="nav-rule"></div><div class="nav-group live"><h3>Сейчас</h3>${[
    ["В работе", "ok", 12],
    ["В очереди", "next", 41],
    ["Сбои за день", "slow", 2],
  ]
    .map(
      ([l, k, n]) =>
        `<button data-do="log"><span class="nav-symbol"><i class="dot ${k}"></i></span><span class="nav-name">${l}</span><small>${n}</small></button>`,
    )
    .join(
      "",
    )}</div><div class="nav-rule"></div><div class="nav-group folders"><h3><span>Папки</span> <button class="tiny" data-do="folders" aria-label="Открыть папки">${glyph("plus", 14)}</button></h3><div class="tree">${[
    ["Финансы", 13],
    ["Закрытие месяца", 6],
    ["Счета", 4],
    ["Поставщики", 3],
    ["Сотрудники", 5],
    ["Права доступа", 6],
  ]
    .map(
      ([l, n], i) =>
        `<button data-do="folder" data-value="${esc(l)}" class="${i > 0 && i < 4 ? "child" : ""} ${s.folder === l || (!s.folder && i === 2) ? "sel" : ""}"><span class="nav-symbol">${glyph("folder", 18)}</span><span class="nav-name">${l}</span>${s.folder === l || (!s.folder && i === 2) ? '<i class="folder-dot"></i>' : ""}<small>${n}</small></button>`,
    )
    .join(
      "",
    )}</div></div><button class="profile" data-do="profile"><b>АС</b><span><strong>Анна Соколова</strong><small>Руководитель отдела</small></span><span class="profile-menu">${glyph("chevron", 16)}</span></button></aside>`;
}

export function topbar(s) {
  return `<header class="topbar" data-spec="header"><div><small class="eyebrow">СОЛОД / РАБОЧАЯ ОБЛАСТЬ</small><h1>Обзор</h1><p>Вторник, 24 ноября · 11:02</p></div><div class="actions">${segment(["Today", "7 days", "30 days"], s.period)}<button class="bell" aria-label="Уведомления" data-do="notifications">${glyph("bell", 20)}<i class="unread"></i></button>${button("Новый процесс", "new", "plus", "graphite")}</div></header>`;
}

export function primary(s) {
  return `<section class="card primary" data-spec="primary"><div class="card-head"><div class="primary-title"><h2>Запуски ${s.period === "Today" ? "сегодня" : "за период"}</h2>${legend()}</div><div class="primary-tools">${segment(["Halftone", "Ridgelines", "Skyline"], s.mode, "mode", true)}${linkButton("Журнал запусков")}</div></div><div class="metric-grid">${stats(s)}<div class="chart-well" data-chart>${chartSVG(s.mode, s.period)}</div></div>${insight(s)}</section>`;
}

export function flowTable(s) {
  const matches = s.flows.filter(
    (r) =>
      r[5] === s.filter &&
      (!s.search ||
        r.slice(0, 2).join(" ").toLowerCase().includes(s.search.toLowerCase())),
  );
  return `<section class="card flow-card" data-spec="workflows"><div class="card-head"><h2>Процессы</h2>${linkButton("Все · " + s.flows.length, "allflows")}</div><div class="tabs" role="group" aria-label="Состояние процессов">${["Active", "Paused", "Drafts"].map((v) => `<button aria-pressed="${s.filter === v}" data-do="filter" data-value="${v}">${uiLabel(v)} <small>${s.flows.filter((r) => r[5] === v).length}</small></button>`).join("")}</div><div class="table-wrap"><table class="flows"><thead><tr><th>Процесс</th><th>24 запуска</th><th>Статус</th></tr></thead><tbody>${(s.search ? matches : matches.slice(0, 5)).map((r) => workflowRow(r, s.flows.indexOf(r))).join("") || '<tr><td colspan="3">Процессы не найдены</td></tr>'}</tbody></table></div></section>`;
}

export function approvals(s) {
  return `<section class="card queue" data-spec="approvals"><div class="card-head"><h2><span>На согласовании</span> ${badge(s.queue.length)}</h2>${linkButton("Вся очередь", "queue-info")}</div><div class="queue-list">${s.queue.length ? s.queue.map((e, i) => approvalCard(e, i === 0)).join("") : approvalCard(null)}</div><small class="queue-note">Ожидание 14 мин · ↵ согласовать · Esc отклонить</small></section>`;
}

export function dashboard(s) {
  return `<div class="dashboard" data-spec="screen">${rail(s)}${workspaceNav(s)}<main class="stage">${topbar(s)}${primary(s)}<div class="lower">${flowTable(s)}${approvals(s)}</div></main></div>`;
}
