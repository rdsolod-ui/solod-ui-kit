import { uiLabel } from "./data.mjs";
import { glyph } from "./icons.mjs";
import { series, esc, presets, seed } from "./data.mjs";
import { chartSVG } from "./charts.mjs";
import {
  button,
  linkButton,
  kbd,
  badge,
  idTag,
  statusChip,
  segment,
  navItem,
  legend,
  runBars,
  workflowRow,
  approvalCard,
  stats,
  insight,
  rail,
  workspaceNav,
  topbar,
  primary,
  flowTable,
  approvals,
  dashboard,
} from "./views.mjs";
export function mat(kind) {
  return `<div class="material-demo ${kind}"><span class="eyebrow">ОБРАЗЕЦ ПОВЕРХНОСТИ</span><strong>${esc(uiLabel(kind))}</strong></div>`;
}
export function palette(theme = "light") {
  const light = {
    Ground: ["#DADDE1", "#CDD1D5"],
    Stage: ["#E3E6E9", "#DCDFE3"],
    Panel: ["#EEF0F2", "#E5E8EB"],
    Card: ["#F8F9FA", "#EEF0F2"],
    Raised: ["#FFFFFF", "#F1F2F4"],
    Well: ["#DEE1E5"],
    Soft: ["#E8EAED"],
    Ink: ["#131416"],
    "Ink 2": ["#4A4F57"],
    "Ink 3": ["#5E646C"],
    Graphite: ["#34363B", "#141517"],
    Ember: ["#E5482A"],
    ...Object.fromEntries(Object.entries(presets()).map(([k, v]) => [k, [v]])),
  };
  const dark = {
    Ground: ["#151B23", "#10151C"],
    Stage: ["#202832", "#1B222B"],
    Panel: ["#29323D", "#202933"],
    Card: ["#303945", "#252E39"],
    Raised: ["#414D5C", "#343E4B"],
    Well: ["#1B232E"],
    Soft: ["#333E4B"],
    Ink: ["#F1F4F8"],
    "Ink 2": ["#CAD2DD"],
    "Ink 3": ["#AEBBCB"],
    Graphite: ["#333D48", "#171D25"],
    Ember: ["#FF826D"],
  };
  const colors = theme === "dark" ? { ...light, ...dark } : light;
  const names = {
    Ground: "Фон",
    Stage: "Рабочая область",
    Panel: "Панель",
    Card: "Карточка",
    Raised: "Рельеф",
    Well: "Углубление",
    Soft: "Подложка",
    Ink: "Основной текст",
    "Ink 2": "Вторичный текст",
    "Ink 3": "Подпись",
    Graphite: "Графит",
    Ember: "Сбой",
  };
  return `<div class="swatches">${Object.entries(colors)
    .map(
      ([k, v]) =>
        `<div><i style="background:${v.length === 1 ? v[0] : `linear-gradient(${v[0]},${v[1]})`}"></i><b>${names[k] || uiLabel(k)}</b><button type="button" class="token-copy" data-copy-value="${esc(v.join(" → "))}" title="Скопировать значение">${v.join(" → ")}</button></div>`,
    )
    .join("")}</div>`;
}
export function typeSheet() {
  return `<div class="type-sheet">${[
    ["Крупное число", "340", "200 104px/1 var(--font-ui)"],
    ["Заголовок экрана", "Обзор", "400 42px/1.14 var(--font-ui)"],
    ["Заголовок карточки", "Запуски сегодня", "500 18px var(--font-ui)"],
    ["Подзаголовок", "Рабочая область", "500 16px var(--font-ui)"],
    ["Основной текст", "Состояние процессов", "400 15px/1.4 var(--font-ui)"],
    ["Интерфейс", "Журнал запусков", "400 14px var(--font-ui)"],
    ["Пояснение", "Обновлено сегодня", "400 13px var(--font-ui)"],
    ["Подпись", "РАБОЧАЯ ОБЛАСТЬ", "400 11px var(--font-mono)"],
    ["Данные", "реестр → банк", "400 12px var(--font-mono)"],
    ["Показатель", "99,4 %", "400 14px var(--font-mono)"],
  ]
    .map(
      ([k, v, f]) =>
        `<div><span style="font:${f};${k === "Подпись" ? "letter-spacing:.055em" : ""}">${v}</span><code>${k} · ${f.replace("var(--font-ui)", "Manrope").replace("var(--font-mono)", "Geist Mono")}</code></div>`,
    )
    .join("")}</div>`;
}
export function dimensions(kind) {
  const radius = kind === "radius",
    list = radius
      ? [6, 8, 10, 12, 14, 20, 28, 32, 999]
      : [4, 8, 12, 16, 20, 24, 28, 36, 40, 44];
  return `<div class="dimensions">${list.map((n) => `<div><i style="${radius ? `border-radius:${n}px` : `height:${n}px`}"></i><button class="token-copy" data-copy-value="${n}px" title="Скопировать значение">${n === 999 ? "капсула" : n + " px"}</button></div>`).join("")}</div>`;
}
export function exampleChart(s, mode) {
  return `<div class="chart-example"><div class="chart-well">${chartSVG(mode, s.period)}</div><div class="actions">${linkButton("Таблица данных", "data")}</div></div>`;
}
export const specs = [
  {
    id: "screen",
    group: "Экран",
    title: "Обзор",
    description:
      "Полное рабочее пространство. Переключайте период, график и акцент.",
    controls: "period,mode,accent",
    draw: (s) => dashboard(s),
  },
  {
    id: "rail",
    group: "Секции",
    title: "Вертикальная панель",
    description: "Навигация и индикатор нагрузки за 24 часа.",
    controls: "",
    draw: (s) => rail(),
  },
  {
    id: "navigator",
    group: "Секции",
    title: "Навигатор",
    description:
      "Поиск, дерево папок, статусы и профиль. На полном экране поиск фильтрует таблицу.",
    controls: "",
    draw: (s) => workspaceNav(s),
  },
  {
    id: "header",
    group: "Секции",
    title: "Шапка",
    description: "Период отчёта, уведомления и создание локального процесса.",
    controls: "period",
    draw: (s) => topbar(s),
  },
  {
    id: "primary",
    group: "Секции",
    title: "Суточный показатель",
    description: "Главное число, график, легенда и причина задержки.",
    controls: "period,mode,accent",
    draw: (s) => primary(s),
  },
  {
    id: "incident",
    group: "Секции",
    title: "Строка инцидента",
    description: "Сообщение, временная пауза и просмотр причины.",
    controls: "accent",
    draw: (s) => insight(s),
  },
  {
    id: "workflows",
    group: "Секции",
    title: "Таблица процессов",
    description: "Строки с историей запусков. Вкладки меняют состояние отбора.",
    controls: "filter",
    draw: (s) => flowTable(s),
  },
  {
    id: "approvals",
    group: "Секции",
    title: "Очередь согласований",
    description:
      "Решение меняет локальную очередь. Можно пройти все три карточки.",
    controls: "accent",
    draw: (s) => approvals(s),
  },
  {
    id: "button",
    group: "Элементы",
    title: "Кнопка",
    description: "Подпись, иконка, материал и обозначение клавиши.",
    controls: "variant:Графит|Светлая|С клавишей|Отключена",
    draw: (s) =>
      s.variant === "Отключена"
        ? '<button class="btn pearl" disabled>Продолжить</button>'
        : button(
            "Продолжить",
            "action",
            "plus",
            s.variant === "Светлая" ? "pearl" : "graphite",
            s.variant === "С клавишей" ? "↵" : "",
          ),
  },
  {
    id: "linkbutton",
    group: "Элементы",
    title: "Кнопка-ссылка",
    description: "Компактная команда со стрелкой и пунктирной кромкой.",
    controls: "",
    draw: (s) => linkButton("Журнал запусков", "log"),
  },
  {
    id: "segments",
    group: "Элементы",
    title: "Переключатель",
    description: "Выбор одного сегмента. Стрелки, Home и End перемещают выбор.",
    controls: "variant:Период|Иконки|Два|Пять",
    draw: (s) =>
      s.variant === "Иконки"
        ? segment(["Halftone", "Ridgelines", "Skyline"], s.mode, "mode", true)
        : s.variant === "Пять"
          ? segment(
              ["Обзор", "Процессы", "Очередь", "Запуски", "Файлы"],
              s.segmentValue || "Обзор",
              "segmentValue",
            )
          : s.variant === "Два"
            ? segment(
                ["День", "Неделя"],
                s.segmentValue || "День",
                "segmentValue",
              )
            : segment(["Today", "7 days", "30 days"], s.period),
  },
  {
    id: "status",
    group: "Элементы",
    title: "Метка состояния",
    description: "Состояние передаётся словом, знаком и цветом.",
    controls: "variant:Норма|Задержка|Ожидание|По расписанию",
    draw: (s) => {
      const v = {
        Задержка: ["Задержка ×3,1", "slow"],
        Ожидание: ["На проверке", "wait"],
        "По расписанию": ["В 11:05", "next"],
      };
      return statusChip(...(v[s.variant] || ["В норме", "ok"]));
    },
  },
  {
    id: "count",
    group: "Элементы",
    title: "Счётчик записей",
    description: "Число на акцентной подложке.",
    controls: "variant:3|0|99+,accent",
    draw: (s) => badge(s.variant || "3"),
  },
  {
    id: "idtag",
    group: "Элементы",
    title: "Метка записи",
    description: "Моноширинный идентификатор записи.",
    controls: "variant:AC-214|FN-089",
    draw: (s) => idTag(s.variant || "AC-214"),
  },
  {
    id: "kbd",
    group: "Элементы",
    title: "Клавиша",
    description: "Обозначение клавиши или сочетания.",
    controls: "variant:↵|Esc|⌘K",
    draw: (s) => kbd(s.variant || "↵"),
  },
  {
    id: "navitem",
    group: "Элементы",
    title: "Пункт меню",
    description: "Иконка, название и необязательный счётчик.",
    controls: "variant:Выбран|Число|Индикатор",
    draw: (s) =>
      s.variant === "Число"
        ? navItem("Процессы", "flow", "allflows", 8)
        : s.variant === "Индикатор"
          ? navItem("Согласования", "shield", "queue", 3)
          : navItem("Обзор", "grid", "workspace", "", true),
  },
  {
    id: "statblock",
    group: "Элементы",
    title: "Блок показателей",
    description: "Число, динамика и три вспомогательные метрики.",
    controls: "period,variant:Обычное|Ноль",
    draw: (s) =>
      s.variant === "Ноль"
        ? stats(s).replace(/data-number="\d+">\d+/, 'data-number="0">0')
        : stats(s),
  },
  {
    id: "insight",
    group: "Элементы",
    title: "Сообщение о задержке",
    description: "Точечный фон и две команды для работы с инцидентом.",
    controls: "accent",
    draw: (s) => insight(s),
  },
  {
    id: "row",
    group: "Элементы",
    title: "Строка процесса",
    description: "Название, интеграция, последние 24 запуска и статус.",
    controls: "variant:Задержка|Норма|Ожидание",
    draw: (s) => {
      const i = s.variant === "Норма" ? 1 : s.variant === "Ожидание" ? 2 : 0;
      return `<table class="flows"><tbody>${workflowRow(s.flows[i], i)}</tbody></table>`;
    },
  },
  {
    id: "bars",
    group: "Элементы",
    title: "Полосы запусков",
    description: "История 24 запусков. Цвет и контур обозначают состояние.",
    controls: "variant:Сбой|Норма|Ожидание",
    draw: (s) =>
      runBars(s.variant === "Норма" ? 1 : s.variant === "Ожидание" ? 2 : 0),
  },
  {
    id: "legend",
    group: "Элементы",
    title: "Легенда графика",
    description:
      "Обозначения завершённых, ожидаемых, ошибочных и отложенных запусков.",
    controls: "",
    draw: (s) => legend(),
  },
  {
    id: "approval",
    group: "Элементы",
    title: "Карточка согласования",
    description:
      "Текущая карточка принимает решение. Ожидающая показывает штриховку.",
    controls: "variant:Активная|Ожидающая",
    draw: (s) => approvalCard(s.queue[0], s.variant !== "Ожидающая"),
  },
  {
    id: "halftone",
    group: "Графики",
    title: "Точечный график",
    description:
      "Объём задаётся полем точек. Контур отмечает запланированные запуски.",
    controls: "period,accent",
    draw: (s) => exampleChart(s, "Halftone"),
  },
  {
    id: "ridges",
    group: "Графики",
    title: "Профили процессов",
    description:
      "Шесть профилей процессов. Прогноз продолжает рельеф пунктиром.",
    controls: "period,accent",
    draw: (s) => exampleChart(s, "Ridgelines"),
  },
  {
    id: "skyline",
    group: "Графики",
    title: "Объёмные столбцы",
    description:
      "Три грани создают объём. Прогноз получает проволочный контур.",
    controls: "period,accent",
    draw: (s) => exampleChart(s, "Skyline"),
  },
  {
    id: "intro",
    group: "Движение",
    title: "Вступление",
    description:
      "Панели поднимаются на 12 px за 1000 мс с последовательной задержкой. Повтор отменяет текущий прогон.",
    controls: "replay",
    draw: (s) =>
      `<div class="motion-stack">${["Рабочая область", "Суточный показатель", "Очередь"].map((v) => `<div class="motion-item">${v}</div>`).join("")}</div>`,
  },
  {
    id: "counter",
    group: "Движение",
    title: "Счётчик",
    description:
      "Пауза 450 мс, затем 1300 мс до итогового числа. При сокращённом движении сразу видно итог.",
    controls: "period,replay",
    draw: (s) => stats(s),
  },
  {
    id: "transition",
    group: "Движение",
    title: "Смена диаграммы",
    description:
      "Точки появляются за 520 мс, профили и грани раскрываются по очереди. Для отдельного образца материала используется переход за 260 мс. Новая команда прерывает предыдущий переход.",
    controls: "mode,accent",
    draw: (s) =>
      `<div class="chart-example">${segment(["Halftone", "Ridgelines", "Skyline"], s.mode, "mode", true)}<div class="chart-well">${chartSVG(s.mode, s.period)}</div></div>`,
  },
  {
    id: "press",
    group: "Движение",
    title: "Нажатие и фокус",
    description:
      "Наведите указатель, нажмите кнопку или перейдите к ней клавишей Tab. Смещение при нажатии — 1 px.",
    controls: "",
    draw: (s) => button("Проверить состояние", "action", "tune", "graphite"),
  },
  {
    id: "frost",
    group: "Материалы",
    title: "Иней",
    description: "Холодный градиент и светлая внутренняя кромка.",
    controls: "",
    draw: (s) => mat("frost"),
  },
  {
    id: "graphite",
    group: "Материалы",
    title: "Графит",
    description: "Тёмная поверхность, мелкое зерно и верхний блик.",
    controls: "",
    draw: (s) => mat("graphite-surface"),
  },
  {
    id: "raised",
    group: "Материалы",
    title: "Рельеф",
    description: "Поднятая поверхность с контактной и рассеянной тенью.",
    controls: "",
    draw: (s) => mat("raised-surface"),
  },
  {
    id: "hatch",
    group: "Материалы",
    title: "Штриховка",
    description:
      "Диагональная штриховка под 135°, цвет текста с прозрачностью 5,5%.",
    controls: "",
    draw: (s) => mat("hatched"),
  },
  {
    id: "dots",
    group: "Материалы",
    title: "Точечная сетка",
    description: "Шаг сетки 10 px, точка цвет текста с прозрачностью 12%.",
    controls: "",
    draw: (s) => mat("dot-grid"),
  },
  {
    id: "glow",
    group: "Материалы",
    title: "Свечение",
    description: "Активный индикатор берёт цвет из текущей темы.",
    controls: "accent",
    draw: (s) => mat("accent-glow"),
  },
  {
    id: "colours",
    group: "Токены",
    title: "Цвет",
    description:
      "Пять уровней поверхности, цвета текста, сигналы и четыре акцента.",
    controls: "",
    draw: (s) => palette(s.theme),
  },
  {
    id: "type",
    group: "Токены",
    title: "Типографика",
    description:
      "Manrope для текста и заголовков. Geist Mono для данных, времени и кодов. Обе гарнитуры включают кириллицу.",
    controls: "",
    draw: (s) => typeSheet(),
  },
  {
    id: "radii",
    group: "Токены",
    title: "Радиусы",
    description:
      "Клавиша 6, тег 8, сегмент 10, строка 20, карточка 28, оболочка 32 px.",
    controls: "",
    draw: (s) => dimensions("radius"),
  },
  {
    id: "spacing",
    group: "Токены",
    title: "Отступы и высоты",
    description: "Сетка от 4 до 28 px. Высоты контролов 36, 40 и 44 px.",
    controls: "",
    draw: (s) => dimensions("space"),
  },
];
