import { series, ridgeProfiles, esc, uiLabel, runCount } from "./data.mjs";

export function chartSVG(
  mode = "Halftone",
  period = "Today",
  points = series(period),
) {
  const ink = "var(--ink)",
    red = "var(--ember)",
    accent = "var(--accent)";
  const ridge = mode === "Ridgelines",
    sky = mode === "Skyline";
  const left = ridge ? 126 : sky ? 22 : 8,
    right = sky ? 641.2 : 692;
  const floor = ridge ? 303 : sky ? 286 : 304;
  const now = sky ? 318 : ridge ? 386.2 : 322.4;
  const f = (n) => Math.round(n * 100) / 100;
  const attrs = (at = {}) =>
    Object.entries(at)
      .map(([k, v]) => " " + k + '="' + esc(v) + '"')
      .join("");
  const shape = (tag, key, props, body = "") =>
    "<" +
    tag +
    attrs({ "data-part": key, ...props }) +
    ">" +
    body +
    "</" +
    tag +
    ">";
  const group = (key, body, at) => shape("g", key, at, body);
  const stage = (role, delay = 0) => ({
    "data-motion": role,
    "data-delay": Math.round(delay),
  });
  const rect = (key, x, y, w, h, at = {}) =>
    shape("rect", key, { x: f(x), y: f(y), width: f(w), height: f(h), ...at });
  const dot = (key, x, y, r, at = {}) =>
    shape("circle", key, { cx: f(x), cy: f(y), r: f(r), ...at });
  const line = (key, x1, y1, x2, y2, at = {}) =>
    shape("line", key, {
      x1: f(x1),
      y1: f(y1),
      x2: f(x2),
      y2: f(y2),
      stroke: ink,
      ...at,
    });
  const text = (key, x, y, value, at = {}) =>
    shape("text", key, { x: f(x), y: f(y), ...at }, esc(value));
  const polygon = (key, points, at = {}) =>
    shape("polygon", key, {
      points: points.map(([x, y]) => f(x) + "," + f(y)).join(" "),
      ...at,
    });
  const prefix = "ops-" + mode.toLowerCase();
  const fill = (id) => "url(#" + prefix + "-" + id + ")";
  const gradients = [
    ["front", "var(--chart-lit)", "var(--chart-front)"],
    ["side", "var(--chart-side-a)", "var(--chart-side-b)"],
    ["top", "var(--chart-lit)", "var(--chart-top)"],
    ["ridge", "var(--chart-ridge)", "var(--card-top)"],
    ["future", "var(--soft)", "var(--card-top)"],
  ]
    .map(
      ([name, a, b]) =>
        '<linearGradient id="' +
        prefix +
        "-" +
        name +
        '" x2="0%" y2="100%"><stop stop-color="' +
        a +
        '"/><stop offset="1" stop-color="' +
        b +
        '"/></linearGradient>',
    )
    .join("");
  const defs =
    "<defs>" +
    gradients +
    '<pattern id="' +
    prefix +
    '-hatch" patternUnits="userSpaceOnUse" width="5" height="5"><path d="M-1 1l2-2M0 5l5-5m-1 6 2-2" fill="none" stroke="' +
    ink +
    '" stroke-opacity=".22" stroke-width=".75"/></pattern></defs>';
  let picture = "",
    axes = "";
  const baseline = (key, x1, y1, x2, y2) =>
    line(key, x1, y1, x2, y2, { "stroke-opacity": 0.17 });
  if (sky)
    axes += polygon(
      "ground",
      [
        [16, 286],
        [646, 286],
        [668.4, 271.6],
        [38.4, 271.6],
      ],
      { fill: ink, "fill-opacity": 0.035 },
    );
  for (let i = 0; i < 9; i++) {
    const x = left + ((right - left) * i) / 8;
    if (ridge)
      axes += line("grid-" + i, x, 40, x, 300, {
        "stroke-opacity": 0.07,
        "stroke-dasharray": "1 4",
      });
    else if (sky)
      axes += line("grid-" + i, x, floor, x + 22.4, floor - 14.4, {
        "stroke-opacity": 0.18,
        "stroke-dasharray": "1 2.5",
      });
    else axes += baseline("tick-" + i, x, floor, x, floor + 5);
    axes += text(
      "hour-" + i,
      x,
      ridge ? 318 : sky ? 310 : 323,
      String(i * 3).padStart(2, "0"),
      { "text-anchor": !i ? "start" : i === 8 ? "end" : "middle" },
    );
  }
  if (!ridge)
    axes += baseline(
      "baseline",
      sky ? 16 : left,
      floor,
      sky ? 646 : right,
      floor,
    );
  picture += group("axes", axes, stage("axis"));
  const standardValues =
    arguments.length < 3 ? [] : series(period).map((p) => p.value);
  const standard =
    arguments.length < 3 ||
    (points.length === 48 &&
      points.every((p) => p.level !== undefined && !p.tracks) &&
      points.every((p, i) => p.value === standardValues[i]));
  const peak = Math.max(1, ...points.map((p) => p.value));
  const level = (p) =>
    standard ? (p.level ?? p.value) : (46 * p.value) / peak;
  const expected = (p) => (p.queued && p.value > 0 ? p.expected || 0 : 0);
  const hasIncident = points.some((p) => p.value > 0 && (p.failed || p.queued));
  if (!ridge && !sky) {
    const queue =
      rect("queue-hatch", 283.5, 52, 38.9, 248, { fill: fill("hatch") }) +
      rect("queue-outline", 283.5, 52, 38.9, 248, {
        fill: "none",
        stroke: ink,
        "stroke-opacity": 0.23,
        "stroke-dasharray": "2 3",
      });
    if (points.some((p) => expected(p)))
      picture += group("queue-zone", queue, stage("annotation", 850));
    let field = "",
      marks = "";
    points.forEach((p, i) => {
      const steps = (level(p) * 15) / 46,
        limit = Math.min(15, Math.ceil(steps)),
        queuedLimit = Math.ceil((expected(p) * 15) / 46);
      for (let j = 0; j < 15; j++) {
        const x = 8 + ((i + 0.5) * 684) / 48,
          y = 292 - j * 15.2,
          key = "cell-" + i + "-" + j;
        if (j >= limit && j >= queuedLimit) {
          field += dot(key, x, y, 0.85, { fill: ink, "fill-opacity": 0.2 });
          continue;
        }
        const ghost = j >= limit,
          scheduled = p.planned,
          amount = ghost ? (expected(p) * 15) / 46 : steps;
        const full = (5.7 - 0.165 * j) * (scheduled || ghost ? 0.705 : 1);
        // A partial cell uses a smaller terminal dot. The demo scale is calibrated
        // against the visible endpoint at each distinct half-hour load.
        const tips = {
          2: 4.4,
          4: 2.7,
          6: 5.4,
          9: 5.1,
          12: 4.9,
          14: 3.6,
          18: 4.5,
          20: 3.2,
          26: 2.9,
          27: 3.9,
          34: 1.3,
          38: 2.3,
          42: 2.9,
          46: 3.4,
        };
        const futureTips = { 1: 2.5, 5: 2.6, 7: 2.7, 8: 1.3 };
        const tip = ghost
          ? expected(p) === 42
            ? 2
            : 1.4
          : scheduled
            ? futureTips[Math.round(level(p) / 1.6)]
            : tips[level(p)];
        const partial = amount - j < 1;
        const radius =
          standard && partial && tip !== undefined
            ? tip
            : Math.max(
                1.25,
                Math.round(
                  10 *
                    full *
                    Math.pow(Math.min(1, Math.max(0.04, amount - j)), 0.65),
                ) / 10,
              );
        const failed = !ghost && p.failed && j === limit - 1;
        marks += dot(key, x, y, radius, {
          fill: ghost
            ? "none"
            : scheduled
              ? "var(--card-top)"
              : failed
                ? red
                : ink,
          "fill-opacity": scheduled || ghost ? 1 : 0.92,
          stroke: ghost || scheduled ? ink : "none",
          "stroke-opacity": ghost ? 0.5 : 0.45,
          "stroke-dasharray": ghost ? "1.6 1.4" : "none",
          "stroke-width": ghost ? 0.9 : 1,
          ...stage("dot", i * 19 + j * 16),
        });
      }
    });
    picture += group("field", field, stage("axis", 80)) + marks;
  } else if (ridge) {
    const profiles = ridgeProfiles(),
      names = [
        "Прочие процессы",
        "Зарплаты",
        "Договоры",
        "Права доступа",
        "Приём в штат",
        "Сверка счетов",
      ];
    const split = 385.4;
    names.forEach((name, j) => {
      const base = 100 + 39 * j;
      let row = "";
      for (let k = 0; k < 2; k++) {
        const subset = points.filter((p) => Boolean(p.planned) === Boolean(k));
        const raw = subset.map(
          (p) => p.tracks?.[5 - j] ?? (j === 0 ? p.value : 0),
        );
        const vals = standard
          ? profiles[j * 2 + k]
          : raw.length > 1
            ? raw.map((v) => (54 * v) / Math.max(1, ...raw))
            : [0, 0];
        const x0 = k ? split : left,
          x1 = k ? right : split;
        const pts = vals.map((v, i) => [
          x0 + ((x1 - x0) * i) / (vals.length - 1),
          base - v,
        ]);
        let d = "M" + f(pts[0][0]) + "," + f(pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1],
            b = pts[i],
            prev = pts[Math.max(0, i - 2)],
            next = pts[Math.min(pts.length - 1, i + 1)];
          const dx = (b[0] - a[0]) / 3,
            lo = Math.min(a[1], b[1]),
            hi = Math.max(a[1], b[1]);
          const clip = (v) => Math.min(hi, Math.max(lo, v));
          d +=
            "C" +
            [
              a[0] + dx,
              clip(a[1] + (b[1] - prev[1]) / 6),
              b[0] - dx,
              clip(b[1] - (next[1] - a[1]) / 6),
              ...b,
            ]
              .map(f)
              .join(" ");
        }
        const prefix = "lane-" + j + (k ? "-future" : "-actual");
        row += shape("path", prefix + "-area", {
          d: d + "V" + base + "H" + x0 + "Z",
          fill: fill(k ? "future" : "ridge"),
          opacity: k ? 0.26 : 0.7,
        });
        row += shape("path", prefix + "-line", {
          d,
          fill: "none",
          stroke: ink,
          "stroke-width": k ? 1 : 1.35,
          opacity: k ? 0.45 : 1,
          "stroke-dasharray": k ? "2 3" : "none",
        });
      }
      row += baseline("lane-" + j + "-base", left, base, right, base);
      const count = standard
        ? (points[0]?.counts?.[j] ?? 0)
        : points
            .filter((p) => !p.planned)
            .reduce(
              (n, p) => n + (p.tracks?.[5 - j] ?? (j === 0 ? p.value : 0)),
              0,
            );
      row +=
        text("lane-" + j + "-name", 0, base - 5, name, { class: "row-name" }) +
        text("lane-" + j + "-count", 0, base + 10, runCount(count), {
          class: "row-total",
        });
      picture += group("lane-" + j, row, stage("ridge", j * 140));
    });
    const envelope = [
      [350, 243],
      [357, 231],
      [365, 237],
      [373, 250],
      [380, 258],
      [385.4, 266],
      [385.4, 282],
      [378, 281],
      [367, 283],
      [358, 272],
      [350, 257],
    ];
    if (points.some((p) => expected(p)))
      picture += group(
        "queue-zone",
        polygon("queue-hatch", envelope, { fill: fill("hatch") }) +
          shape("polyline", "queue-outline", {
            points: envelope
              .slice(0, 6)
              .map((v) => v.join(","))
              .join(" "),
            fill: "none",
            stroke: ink,
            "stroke-opacity": 0.45,
            "stroke-dasharray": "2 3",
          }),
        stage("annotation", 820),
      );
    if (hasIncident)
      [
        [291, 124],
        [381.5, 163],
        [356.7, 267.5],
      ].forEach(([x, y], i) => {
        const green = i === 1;
        let d = green
          ? dot("event-glow-" + i, x, y, 10, { fill: accent, class: "halo" })
          : "";
        d += dot("event-dot-" + i, x, y, green ? 4.6 : 4.2, {
          fill: green ? accent : red,
          stroke: green ? ink : "var(--card-top)",
          "stroke-width": 1,
        });
        picture += group("event-" + i, d, stage("annotation", 900 + i * 190));
      });
  } else {
    picture += rect("shadow", 42, 256, 285, 34, {
      rx: 12,
      fill: ink,
      opacity: 0.04,
      style: "filter:blur(7px)",
    });
    function tower(i, height, ghost = false) {
      const p = points[i],
        x = 22 + i * 12.9,
        y = floor - height,
        w = 9.2,
        dx = 14,
        dy = -9;
      const key = (ghost ? "expectation-" : "tower-") + i;
      const wire = ghost || p.planned;
      const style = {
        stroke: ink,
        "stroke-opacity": ghost ? 0.55 : wire ? 0.45 : 0.22,
        "stroke-width": 0.7,
        "fill-opacity": p.planned ? 0.35 : 1,
        "stroke-dasharray": ghost ? "2 2" : wire ? "1.6 1.8" : "none",
      };
      const top = [
        [x, y],
        [x + dx, y + dy],
        [x + w + dx, y + dy],
        [x + w, y],
      ];
      let body = polygon(
        key + "-side",
        [
          [x + w, y],
          [x + w + dx, y + dy],
          [x + w + dx, floor + dy],
          [x + w, floor],
        ],
        {
          ...style,
          fill: ghost ? "none" : wire ? "var(--soft)" : fill("side"),
        },
      );
      body += rect(key + "-front", x, y, w, height, {
        ...style,
        fill: ghost ? "none" : wire ? "var(--chart-lit)" : fill("front"),
      });
      body += polygon(key + "-top", top, {
        ...style,
        fill: ghost ? "none" : wire ? "var(--chart-lit)" : fill("top"),
      });
      if (!ghost && p.queued)
        body += rect(key + "-hatch", x, y, w, height, { fill: fill("hatch") });
      if (!ghost && p.failed)
        body += polygon(key + "-error", top, { fill: red, opacity: 0.84 });
      return group(key, body, stage("tower", i * 22.4));
    }
    points.forEach((p, i) => {
      if (expected(p)) picture += tower(i, (expected(p) * 200) / 46, true);
      picture += tower(i, Math.max(2, (level(p) * 200) / 46));
    });
  }
  const halo = (key, x, y, r) =>
    dot(key, x, y, r, { fill: accent, class: "halo" });
  const dash = sky ? { "stroke-dasharray": "3 3" } : {};
  picture += group(
    "now-line",
    line("now-rule", now, 30, now, sky ? 279 : floor, {
      ...dash,
      "stroke-width": 1.15,
    }),
    stage("marker", 350),
  );
  let foot = sky
    ? line("now-glow", 306.7, 286, 329.1, 271.6, {
        stroke: accent,
        "stroke-width": 8,
        class: "halo",
      }) +
      line("now-base", 306.7, 286, 329.1, 271.6, {
        stroke: accent,
        "stroke-width": 3,
      })
    : halo("now-glow", now, floor, 9) +
      dot("now-base", now, floor, 4.5, {
        fill: accent,
        stroke: ink,
        "stroke-width": 1.1,
      });
  picture += group("now-foot", foot, stage("marker", 500));
  const nx = now + 4;
  picture += group(
    "now-tag",
    rect("now-badge", nx, 9, 106, 22, { rx: 11, fill: "#1a1b1e" }) +
      halo("now-lamp-glow", nx + 10, 20, 6) +
      dot("now-lamp", nx + 10, 20, 3.2, { fill: accent }) +
      text("now-text", nx + 16, 23.7, "СЕЙЧАС 11:02", { style: "fill:white" }),
    stage("annotation", 950),
  );
  const cx = ridge ? 402.2 : sky ? 107.8 : 126.2,
    cy = ridge ? 262 : sky ? 49.7 : 27;
  let note = line(
    "incident-leader",
    ridge ? cx : cx + 173,
    cy + 11,
    ridge ? 369.7 : sky ? 271.1 : 283.5,
    ridge ? 280.7 : sky ? 80.7 : 52,
    { opacity: 0.5, "stroke-width": 0.8 },
  );
  if (ridge)
    note += dot("incident-anchor", 369.7, 280.7, 2.6, {
      fill: "var(--card-top)",
      stroke: ink,
    });
  note +=
    rect("incident-badge", cx, cy, 173, 22, {
      rx: 11,
      fill: "var(--card-top)",
      stroke: ink,
      "stroke-opacity": 0.15,
    }) +
    dot("incident-dot", cx + 10, cy + 11, 3.2, { fill: red }) +
    text("incident-text", cx + 16, cy + 14.7, "09:40 · ЗАДЕРЖКА ×3,1", {
      class: "incident-label",
    });
  if (hasIncident)
    picture += group(
      "incident",
      note,
      stage("annotation", ridge || sky ? 1550 : 1350),
    );
  return (
    '<svg class="plot" viewBox="0 0 700 340" role="img" aria-label="' +
    esc(uiLabel(mode) + " · " + uiLabel(period)) +
    '"><title>' +
    esc(uiLabel(mode) + " · " + uiLabel(period)) +
    "</title>" +
    defs +
    picture +
    "</svg>"
  );
}
