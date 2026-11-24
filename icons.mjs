// Original single-stroke utility icons on a 24-unit grid.
export function glyph(name, size = 18) {
  const paths = {
    grip: '<circle cx="8" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="8" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>',
    tag: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/>',
    rise: '<path d="m3 16 7-7 4 4 7-9m-6 0h6v6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    stack: '<path d="m3 7 9-4 9 4-9 4zM3 12l9 4 9-4M3 17l9 4 9-4"/>',
    flow: '<rect x="3" y="3" width="9" height="9" rx="3"/><rect x="14" y="14" width="7" height="7" rx="2"/><path d="M8 12v3a3 3 0 0 0 3 3h3"/>',
    shield: '<path d="m12 3 8 3v6q0 6-8 9-8-3-8-9V6zM8.5 12l2.5 2.5 4.5-5"/>',
    clock: '<path d="M3 10a9 9 0 1 1 1.4 7M3 5v5h5m4-4v6l4 2"/>',
    folder:
      '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    plug: '<path d="M8 3v5m8-5v5M6 8h12v3a6 6 0 0 1-6 6v4m-6-10a6 6 0 0 0 6 6"/>',
    spark:
      '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z"/>',
    tune: '<path d="M3 7h7m5 0h6M3 17h11m5 0h2"/><circle cx="12.5" cy="7" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/>',
    search: '<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    chevron: '<path d="m9 10 3-3 3 3m-6 4 3 3 3-3"/>',
    bell: '<path d="M5 16h14l-2-4V9a5 5 0 0 0-10 0v3zM10 19q2 3 4 0"/>',
    file: '<path d="M6 3h8l4 4v14H6zm7 0v5h5M9 12h6m-6 4h6"/>',
    people:
      '<circle cx="10" cy="8" r="3"/><path d="M3 20a7 7 0 0 1 14 0m0-14a3 3 0 0 1 0 6m2 3q3 1 3 5"/>',
    key: '<circle cx="15" cy="8" r="5"/><path d="m11 12-8 8h5v-3h3"/>',
    bars: '<path d="M4 19V11m5 8V6m5 13V3m5 16v-9"/>',
    waves: '<path d="m3 9 4-3 5 3 5-3 4 2M3 15l4-3 5 3 5-3 4 2"/>',
    dots: '<circle cx="5" cy="17" r="1.5"/><circle cx="11" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/><circle cx="11" cy="11" r="1.5"/><circle cx="17" cy="11" r="1.5"/><circle cx="17" cy="5" r="1.5"/>',
    replay: '<path d="M3 10a9 9 0 1 1 1 7M3 4v6h6"/>',
    code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-3 18"/>',
    book: '<path d="M3 4h6q3 0 3 3 0-3 3-3h6v15h-6q-3 0-3 2 0-2-3-2H3zm9 3v14"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    down: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
    pause: '<path d="M8 5v14m8-14v14"/>',
    close: '<path d="m5 5 14 14m0-14L5 19"/>',
    logo: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 3v18M3 11h9"/><circle cx="16.5" cy="7.5" r="1" fill="var(--accent)" stroke="none"/>',
  };
  return (
    '<svg aria-hidden="true" width="' +
    size +
    '" height="' +
    size +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round">' +
    (paths[name] || paths.grid) +
    "</svg>"
  );
}
