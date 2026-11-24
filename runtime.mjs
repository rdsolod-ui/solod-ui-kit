import { uiLabel } from "./data.mjs";
import { esc, series, presets, seed } from "./data.mjs";
import { chartSVG } from "./charts.mjs";
export function runMotion(root, type = "intro") {
  root.stopMotion?.();
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  if (preference.matches) return;
  const running = new Set(),
    numbers = [...root.querySelectorAll("[data-number]")];
  let frame = 0,
    end = 0;
  function finish() {
    clearTimeout(end);
    cancelAnimationFrame(frame);
    for (const effect of running) effect.cancel();
    numbers.forEach((n) => (n.textContent = n.dataset.number));
    preference.removeEventListener("change", finish);
    root.stopMotion = null;
  }
  root.stopMotion = finish;
  preference.addEventListener("change", finish, { once: true });
  function animate(el, frames, duration, delay = 0) {
    const effect = el.animate(frames, {
      duration,
      delay,
      fill: "backwards",
      easing: "cubic-bezier(.22,.68,.17,1)",
    });
    running.add(effect);
    effect.onfinish = () => running.delete(effect);
  }
  const rise = [
    { opacity: 0, transform: "translateY(12px)" },
    { opacity: 1, transform: "none" },
  ];
  const fade = [{ opacity: 0 }, { opacity: 1 }];
  const intro = type !== "switch",
    offset = intro ? 650 : 0;
  if (intro) {
    root
      .querySelectorAll(
        ".rail,.navigator,.topbar,.primary,.flow-card,.queue,.material-demo,.motion-item",
      )
      .forEach((el, i) =>
        animate(el, rise, 1000, [0, 50, 150, 200, 400, 500][Math.min(i, 5)]),
      );
    root
      .querySelectorAll(".rail-btn")
      .forEach((el, i) => animate(el, rise, 650, 250 + i * 42));
    root
      .querySelectorAll(".approval")
      .forEach((el, i) => animate(el, rise, 650, 900 + i * 100));
    root
      .querySelectorAll(".run-bars")
      .forEach((el, i) =>
        animate(
          el,
          [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0)" }],
          1000,
          1150 + i * 100,
        ),
      );
    root
      .querySelectorAll(".stat-block dl div,.insight,.flow-id,.queue-note")
      .forEach((el, i) => animate(el, rise, 700, 600 + i * 75));
    root
      .querySelectorAll(".chip")
      .forEach((el, i) => animate(el, fade, 560, 1500 + i * 110));
    const start = performance.now();
    function tick(time) {
      const t = Math.max(0, Math.min(1, (time - start - 450) / 1300));
      numbers.forEach(
        (n) =>
          (n.textContent = String(
            Math.round(Number(n.dataset.number) * (1 - (1 - t) ** 3)),
          )),
      );
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    if (numbers.length) tick(start);
  } else
    root
      .querySelectorAll(".material-demo")
      .forEach((el) => animate(el, rise, 260));
  for (const el of root.querySelectorAll(".plot [data-motion]")) {
    const kind = el.dataset.motion,
      delay = offset + Number(el.dataset.delay);
    if (kind === "dot")
      animate(
        el,
        [
          { opacity: 0, transform: "scale(.2)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        520,
        delay,
      );
    else if (kind === "ridge") {
      for (const mark of el.children) {
        const key = mark.dataset.part || "";
        if (key.endsWith("-name") || key.endsWith("-count"))
          animate(mark, fade, 650, delay + 100);
        else if (key.endsWith("-base")) animate(mark, fade, 700, delay + 250);
        else
          animate(
            mark,
            [
              { clipPath: "inset(-100% 100% -100% 0)" },
              { clipPath: "inset(-100% 0 -100% 0)" },
            ],
            key.includes("future") ? 700 : 1000,
            delay + (key.includes("future") ? 550 : 0),
          );
      }
    } else if (kind === "tower")
      animate(
        el,
        [
          { opacity: 0, transform: "scaleY(.04)" },
          { opacity: 1, transform: "scaleY(1)" },
        ],
        1000,
        delay,
      );
    else
      animate(
        el,
        fade,
        kind === "annotation" ? 560 : kind === "marker" ? 800 : 700,
        delay,
      );
  }
  end = setTimeout(finish, 3300);
}

export function mount(root, render, initial = seed(), intro = false) {
  if (root.dispose) root.dispose();
  const state = structuredClone(initial),
    abort = new AbortController(),
    opts = { signal: abort.signal };
  let dialog = null,
    notice = null,
    timer = 0,
    retryTimer = 0;
  function sync() {
    root.style.setProperty(
      "--accent",
      presets()[state.accent] || presets().Pistachio,
    );
    root.dispatchEvent(
      new CustomEvent("opschange", { detail: state, bubbles: true }),
    );
  }
  function paint() {
    if (root.stopMotion) root.stopMotion();
    const old = root.contains(document.activeElement)
      ? document.activeElement
      : null;
    const action = old?.dataset.do,
      value = old?.dataset.value,
      search = old?.matches(".search input"),
      pos = search ? old.selectionStart : null;
    root.innerHTML = render(state);
    sync();
    if (search) {
      const inp = root.querySelector(".search input");
      inp?.focus({ preventScroll: true });
      inp?.setSelectionRange(pos, pos);
    } else if (action) {
      const match = [...root.querySelectorAll("[data-do]")].find(
        (e) => e.dataset.do === action && e.dataset.value === value,
      );
      match?.focus({ preventScroll: true });
    }
  }
  function tell(msg) {
    notice?.remove();
    clearTimeout(timer);
    notice = document.createElement("div");
    notice.className = "toast";
    notice.setAttribute("role", "status");
    notice.textContent = msg;
    document.body.append(notice);
    timer = setTimeout(() => notice?.remove(), 2400);
  }
  function show(title, content) {
    dialog?.close();
    dialog = document.createElement("dialog");
    dialog.className = "ops ops-dialog";
    dialog.style.setProperty("--accent", presets()[state.accent]);
    dialog.setAttribute("aria-label", title);
    dialog.innerHTML = `<div class="dialog-head"><h2>${esc(title)}</h2><button class="tiny" aria-label="Закрыть" data-close>×</button></div><div class="dialog-body">${content}</div>`;
    document.body.append(dialog);
    const current = dialog;
    current.querySelector("[data-close]").onclick = () => current.close();
    current.addEventListener(
      "close",
      () => {
        current.remove();
        if (dialog === current) dialog = null;
      },
      { once: true },
    );
    current.showModal();
    return current;
  }
  function decide(accepted) {
    const item = state.queue.shift();
    if (!item) return;
    state.history.unshift(
      `${item[0]} · ${accepted ? "Согласовано" : "Отклонено"}`,
    );
    paint();
    (
      root.querySelector('[data-do="approve"]') ||
      root.querySelector('[data-do="queue-info"]')
    )?.focus({
      preventScroll: true,
    });
    tell(state.history[0]);
  }
  function table() {
    return `<div class="data-list"><table><thead><tr><th>Время</th><th>Запуски</th><th>Состояние</th></tr></thead><tbody>${series(
      state.period,
    )
      .map(
        (p) =>
          `<tr><td>${String(Math.floor(p.hour)).padStart(2, "0")}:${p.hour % 1 ? "30" : "00"}</td><td>${p.value}</td><td>${p.planned ? "По плану" : p.failed ? "Сбой" : p.queued ? "Очередь" : "Выполнено"}</td></tr>`,
      )
      .join("")}</tbody></table></div>`;
  }
  function go(action, value) {
    if (action === "segmentValue") {
      state.segmentValue = value;
      paint();
      return;
    }
    if (["period", "mode", "filter", "accent"].includes(action)) {
      const allowed = {
        period: ["Today", "7 days", "30 days"],
        mode: ["Halftone", "Ridgelines", "Skyline"],
        filter: ["Active", "Paused", "Drafts"],
        accent: Object.keys(presets()),
      };
      if (!allowed[action].includes(value)) return;
      if (state[action] === value) return;
      state[action] = value;
      if (action === "mode" && root.querySelector(".dashboard .chart-well")) {
        root.stopMotion?.();
        root.querySelector(".chart-well").innerHTML = chartSVG(
          value,
          state.period,
        );
        root
          .querySelectorAll('[data-do="mode"]')
          .forEach((b) =>
            b.setAttribute("aria-pressed", String(b.dataset.value === value)),
          );
        sync();
      } else paint();
      if (action === "mode") runMotion(root, "switch");
      return;
    }
    if (action === "approve" || action === "decline") {
      decide(action === "approve");
      return;
    }
    if (action === "replay") {
      runMotion(root);
      return;
    }
    if (action === "pause") {
      state.paused = !state.paused;
      clearTimeout(retryTimer);
      if (state.paused)
        retryTimer = setTimeout(() => {
          state.paused = false;
          paint();
        }, 900000);
      paint();
      tell(state.paused ? "Повторы приостановлены" : "Повторы возобновлены");
      return;
    }
    if (action === "workflow-detail") {
      const row = state.flows.find((r) => r[0] === value);
      if (row) show(row[0], `<p>${esc(row[1])}</p><p>${esc(row[3])}</p>`);
      return;
    }
    if (action === "new") {
      const d = show(
        "Новый процесс",
        '<form><label>Название процесса<input name="name" required maxlength="64" autocomplete="off"></label><label>Подключение<input name="route" required maxlength="85" value="вручную → проверка"></label><button class="btn graphite">Создать процесс</button></form>',
      );
      d.querySelector("form").onsubmit = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget),
          name = data.get("name").trim(),
          route = data.get("route").trim();
        if (!name || !route) return;
        state.flows.unshift([name, route, "flow", "В норме", "ok", "Active"]);
        state.filter = "Active";
        state.search = "";
        d.close();
        paint();
        tell("Процесс создан");
      };
      return;
    }
    if (action === "allflows" || action === "folder" || action === "folders") {
      const list =
        action === "folder"
          ? state.flows.filter(
              (_, i) =>
                i % 3 ===
                [
                  "Финансы",
                  "Закрытие месяца",
                  "Счета",
                  "Поставщики",
                  "Сотрудники",
                  "Права доступа",
                ].indexOf(value) %
                  3,
            )
          : state.flows;
      if (action === "folder") {
        state.folder = value;
        paint();
      }
      show(
        value || "Каталог процессов",
        `<ul>${list.map((r) => `<li>${esc(r[0])} · ${esc(r[1])}</li>`).join("")}</ul>`,
      );
      return;
    }
    if (["overview", "workflows", "queue"].includes(action)) {
      const selector = {
        overview: ".stage",
        workflows: ".flow-card",
        queue: ".queue",
      }[action];
      const target = root.querySelector(selector);
      if (target) {
        target.scrollIntoView({ block: "center" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      } else go(action === "queue" ? "queue-info" : "allflows");
      return;
    }
    if (action === "log" || action === "data") {
      show(
        action === "data" ? "Данные графика" : "Журнал запусков",
        (state.history.length
          ? `<ul>${state.history.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
          : "") + table(),
      );
      return;
    }
    if (action === "queue-info") {
      show(
        "Очередь согласований",
        state.queue.length
          ? `<ul>${state.queue.map((q) => `<li>${esc(q[0])} · ${esc(q[2])}</li>`).join("")}</ul>`
          : "<p>Все решения сохранены.</p>",
      );
      return;
    }
    if (action === "settings") {
      const d = show(
        "Настройки оформления",
        `<p>Акцент</p><div class="actions">${Object.keys(presets())
          .map(
            (v) =>
              `<button class="btn" data-pick="${v}">${uiLabel(v)}</button>`,
          )
          .join("")}</div>`,
      );
      d.onclick = (e) => {
        const b = e.target.closest("[data-pick]");
        if (b) {
          go("accent", b.dataset.pick);
          d.close();
        }
      };
      return;
    }
    const info = {
      trace: [
        "Разбор инцидента",
        "В 09:40 сервис реестра начал повторять запросы. В очереди 41 запуск.",
      ],
      workspace: [
        "Рабочая область «Солод»",
        "Демонстрационная рабочая область.",
      ],
      profile: [
        "Анна Соколова",
        "Руководитель отдела · демонстрационный профиль",
      ],
      integrations: [
        "Подключённые сервисы",
        "Реестр · Права доступа · Почта · Хранилище",
      ],
      notifications: [
        "Уведомления",
        "С 09:40 сверка счетов занимает больше времени, чем обычно.",
      ],
      action: ["Действие", "Команда выполнена."],
    };
    const item = info[action];
    if (item) show(item[0], `<p>${item[1]}</p>`);
  }
  root.addEventListener(
    "click",
    (e) => {
      const token = e.target.closest("[data-copy-value]");
      if (token) {
        const value = token.dataset.copyValue;
        const fallback = () => {
          const t = document.createElement("textarea");
          t.value = value;
          document.body.append(t);
          t.select();
          const ok = document.execCommand("copy");
          t.remove();
          tell(ok ? "Скопировано" : "Выделите значение для копирования");
          token.focus();
        };
        if (navigator.clipboard?.writeText)
          navigator.clipboard
            .writeText(value)
            .then(() => tell("Скопировано"), fallback);
        else fallback();
        return;
      }
      const b = e.target.closest("[data-do]");
      if (b && root.contains(b)) go(b.dataset.do, b.dataset.value);
    },
    opts,
  );
  root.addEventListener(
    "input",
    (e) => {
      if (e.target.matches(".search input")) {
        state.search = e.target.value;
        paint();
      }
    },
    opts,
  );
  root.addEventListener(
    "keydown",
    (e) => {
      const b = e.target.closest(".segments button,.tabs button");
      if (b && ["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
        e.preventDefault();
        const all = [...b.parentElement.querySelectorAll("button")],
          i = all.indexOf(b),
          n = all.length;
        const dest =
          all[
            e.key === "Home"
              ? 0
              : e.key === "End"
                ? n - 1
                : (i + (e.key === "ArrowRight" ? 1 : -1) + n) % n
          ];
        go(dest.dataset.do, dest.dataset.value);
        root
          .querySelector(
            `[data-do="${dest.dataset.do}"][data-value="${dest.dataset.value}"]`,
          )
          ?.focus();
      }
    },
    opts,
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (
        dialog ||
        document.querySelector("dialog[open]") ||
        e.repeat ||
        e.defaultPrevented
      )
        return;
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "k" &&
        root.querySelector(".search input")
      ) {
        e.preventDefault();
        root.querySelector(".search input").focus();
        return;
      }
      const a = document.activeElement;
      if (a?.closest("input,textarea,select,button,a,[contenteditable]"))
        return;
      if (a !== document.body && !root.contains(a)) return;
      if (
        root.querySelector('[data-do="approve"]') &&
        ["Enter", "Escape"].includes(e.key)
      ) {
        e.preventDefault();
        decide(e.key === "Enter");
      }
    },
    opts,
  );
  root.dispose = () => {
    abort.abort();
    root.stopMotion?.();
    clearTimeout(timer);
    clearTimeout(retryTimer);
    notice?.remove();
    dialog?.close();
  };
  root.command = go;
  root.opsState = state;
  paint();
  if (intro) runMotion(root);
  return root;
}
