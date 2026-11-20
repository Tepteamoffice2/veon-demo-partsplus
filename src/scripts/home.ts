// PartsPlus homepage behaviour: VIN-лінійка, mode tabs, header rule, phone bar, menu, FutureLink note edges.
// Everything here is progressive: without scripts the page is complete and every link works.

const VIN_LENGTH = 17;
const VIN_ALLOWED = /[^A-HJ-NPR-Z0-9]/g; // ISO 3779: Latin letters without I, O, Q, and digits

function initVin(root: HTMLElement): void {
  const input = root.querySelector<HTMLInputElement>("[data-vin-input]");
  const cells = Array.from(root.querySelectorAll<HTMLElement>(".vin__cell"));
  const count = root.querySelector<HTMLElement>("[data-vin-count]");
  const status = root.querySelector<HTMLElement>("[data-vin-status]");
  const send = root.querySelector<HTMLAnchorElement>("[data-vin-send]");
  if (!input) return;

  const render = (): void => {
    const value = input.value;
    cells.forEach((cell, i) => {
      const ch = value[i] ?? "";
      const char = cell.querySelector<HTMLElement>(".vin__char");
      if (char && ch) char.textContent = ch;
      cell.classList.toggle("is-filled", Boolean(ch));
      cell.classList.toggle("is-current", i === Math.min(value.length, VIN_LENGTH - 1));
    });
    if (count) count.textContent = `${value.length} / ${VIN_LENGTH}`;
  };

  input.addEventListener("input", () => {
    const clean = input.value.toUpperCase().replace(VIN_ALLOWED, "").slice(0, VIN_LENGTH);
    if (clean !== input.value) input.value = clean;
    if (status) status.textContent = "";
    render();
  });
  input.addEventListener("focus", () => root.classList.add("is-focused"));
  input.addEventListener("blur", () => root.classList.remove("is-focused"));

  // The link always opens the real Telegram chat; a typed VIN is copied first so it can be pasted there.
  send?.addEventListener("click", () => {
    const vin = input.value;
    if (!vin || !navigator.clipboard) return;
    navigator.clipboard.writeText(vin).then(
      () => { if (status) status.textContent = "VIN скопійовано, вставте його в чат"; },
      () => { /* clipboard denied: the chat still opens */ },
    );
  });
  render();
}

function initTabs(root: HTMLElement): void {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const line = root.querySelector<HTMLElement>(".vin__tab-line");
  if (!tabs.length) return;

  const place = (tab: HTMLButtonElement): void => {
    if (!line) return;
    const cs = getComputedStyle(tab);
    const left = tab.offsetLeft + parseFloat(cs.paddingLeft);
    const width = tab.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    line.style.setProperty("--tab-x", `${left}px`);
    line.style.setProperty("--tab-w", String(Math.max(width, 1)));
  };

  const select = (tab: HTMLButtonElement, focus: boolean): void => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls") ?? "");
      panel?.classList.toggle("is-active", on);
      if (panel) panel.inert = !on;
    });
    place(tab);
    if (focus) tab.focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab, false));
    tab.addEventListener("keydown", (e) => {
      let next = -1;
      if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      if (next < 0) return;
      e.preventDefault();
      const target = tabs[next];
      if (target) select(target, true);
    });
  });

  const current = (): HTMLButtonElement => tabs.find((t) => t.getAttribute("aria-selected") === "true") ?? tabs[0]!;
  select(current(), false);
  document.fonts?.ready.then(() => place(current()));
  window.addEventListener("resize", () => place(current()), { passive: true });
}

function initChrome(): void {
  const header = document.querySelector<HTMLElement>("[data-header]");
  const hero = document.getElementById("hero");
  const footer = document.querySelector<HTMLElement>("[data-footer]");
  const bar = document.querySelector<HTMLElement>("[data-mbar]");
  if (!hero || !("IntersectionObserver" in window)) {
    bar?.classList.add("is-shown");
    return;
  }
  let heroVisible = true;
  let footerVisible = false;
  const update = (): void => {
    header?.classList.toggle("is-scrolled", !heroVisible);
    bar?.classList.toggle("is-shown", !heroVisible && !footerVisible);
  };
  new IntersectionObserver(([entry]) => {
    if (entry) heroVisible = entry.isIntersecting;
    update();
  }, { rootMargin: "-80px 0px 0px 0px", threshold: 0 }).observe(hero);
  if (footer) {
    new IntersectionObserver(([entry]) => {
      if (entry) footerVisible = entry.isIntersecting;
      update();
    }).observe(footer);
  }
}

function initMenu(): void {
  const menu = document.querySelector<HTMLDetailsElement>("[data-menu]");
  if (!menu) return;
  menu.addEventListener("toggle", () => document.documentElement.classList.toggle("menu-open", menu.open));
  menu.querySelectorAll("a[href^='#']").forEach((a) => a.addEventListener("click", () => { menu.open = false; }));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.open) {
      menu.open = false;
      menu.querySelector<HTMLElement>("summary")?.focus();
    }
  });
}

// FutureLink note: flip to the left edge when it would leave the screen.
function initNotes(): void {
  const fit = (el: HTMLElement): void => {
    const note = el.querySelector<HTMLElement>(".future-link__note");
    if (!note) return;
    el.classList.remove("is-flipped");
    const r = note.getBoundingClientRect();
    if (r.right > document.documentElement.clientWidth - 8) el.classList.add("future-link--end", "is-flipped");
  };
  document.querySelectorAll<HTMLElement>(".future-link:not(.future-link--end)").forEach((el) => {
    el.addEventListener("pointerenter", () => fit(el));
    el.addEventListener("focus", () => fit(el));
  });
}

document.querySelectorAll<HTMLElement>("[data-vin]").forEach((root) => {
  initVin(root);
  initTabs(root);
});
initChrome();
initMenu();
initNotes();
