(() => {
  "use strict";

  const HEADER_CONFIG = Object.freeze({
    jsonDirectory: "./jsons",
    filePrefix: "header",
    supportedLanguages: ["es", "en"],
    defaultLanguage: "es",
    storageKey: "creative-lab-language",
    indexPageName: "index"
  });

  const headerCache = new Map();
  let activeLanguage = HEADER_CONFIG.defaultLanguage;
  let currentHeaderData = null;
  let drawerOpen = false;
  let lastDrawerTrigger = null;
  let overlayHideTimer = 0;

  function normalizeLanguage(value) {
    if (typeof value !== "string") return null;
    const normalized = value.trim().toLowerCase().split("-")[0];
    return HEADER_CONFIG.supportedLanguages.includes(normalized)
      ? normalized
      : null;
  }

  function detectLanguage() {
    const fromApi = normalizeLanguage(
      window.CreativeLabLanguage?.getLanguage?.()
    );
    if (fromApi) return fromApi;

    try {
      const stored = normalizeLanguage(
        window.localStorage.getItem(HEADER_CONFIG.storageKey)
      );
      if (stored) return stored;
    } catch (_) {}

    const htmlLanguage = normalizeLanguage(document.documentElement.lang);
    if (htmlLanguage) return htmlLanguage;

    const browserLanguage = normalizeLanguage(navigator.language);
    return browserLanguage || HEADER_CONFIG.defaultLanguage;
  }

  function getHeaderType() {
    const page = String(document.body?.dataset?.page || "").trim().toLowerCase();
    const pathname = window.location.pathname.split("/").pop() || "index.html";
    const isIndex =
      page === HEADER_CONFIG.indexPageName ||
      pathname === "" ||
      pathname === "index" ||
      pathname === "index.html";

    return isIndex ? "index" : "tools";
  }

  function getHeaderElement() {
    let header = document.querySelector(".site-header");
    if (header) return header;

    header = document.createElement("header");
    header.className = "site-header";
    header.id = "site-header";

    const shell = document.querySelector(".site-shell");
    const main = document.querySelector("main");

    if (shell) {
      shell.prepend(header);
    } else if (main?.parentNode) {
      main.parentNode.insertBefore(header, main);
    } else {
      document.body.prepend(header);
    }

    return header;
  }

  async function loadHeaderData(language) {
    const lang = normalizeLanguage(language) || HEADER_CONFIG.defaultLanguage;
    if (headerCache.has(lang)) return headerCache.get(lang);

    const response = await fetch(
      `${HEADER_CONFIG.jsonDirectory}/${HEADER_CONFIG.filePrefix}-${lang}.json`,
      { cache: "no-cache", headers: { Accept: "application/json" } }
    );

    if (!response.ok) {
      throw new Error(`No se pudo cargar header-${lang}.json (${response.status}).`);
    }

    const data = await response.json();
    headerCache.set(lang, data);
    return data;
  }

  function safeButtons(value) {
    if (!Array.isArray(value)) return [];
    return value.filter((button) => {
      return button && typeof button.label === "string" && typeof button.href === "string";
    });
  }

  function createLink(button, className = "") {
    const link = document.createElement("a");
    link.href = button.href;
    link.textContent = button.label;
    if (button.id) link.dataset.headerButton = button.id;
    if (className) link.className = className;
    if (button.className) link.classList.add(...String(button.className).split(/\s+/).filter(Boolean));
    if (button.target) link.target = button.target;
    if (button.rel) link.rel = button.rel;
    if (button.ariaLabel) link.setAttribute("aria-label", button.ariaLabel);
    return link;
  }

  function createLanguageControl(data, language) {
    const label = document.createElement("label");
    label.className = "language-control header-language-control";
    label.htmlFor = "language-selector";

    const srText = document.createElement("span");
    srText.className = "sr-only";
    srText.textContent = data.language?.label || "Idioma";

    const select = document.createElement("select");
    select.id = "language-selector";
    select.name = "language";
    select.dataset.alforaLanguageBound = "true";
    select.setAttribute(
      "aria-label",
      data.language?.selectAriaLabel || "Seleccionar idioma"
    );

    [
      ["es", "ES"],
      ["en", "EN"]
    ].forEach(([value, text]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      select.appendChild(option);
    });

    select.value = normalizeLanguage(language) || HEADER_CONFIG.defaultLanguage;

    select.addEventListener("change", async (event) => {
      const nextLanguage = normalizeLanguage(event.target.value);
      if (!nextLanguage) return;

      try {
        if (window.CreativeLabLanguage?.setLanguage) {
          await window.CreativeLabLanguage.setLanguage(nextLanguage);
        } else {
          window.localStorage.setItem(HEADER_CONFIG.storageKey, nextLanguage);
          activeLanguage = nextLanguage;
          await renderHeader(nextLanguage);
        }
      } catch (error) {
        console.error("Alfora Header: no se pudo cambiar el idioma.", error);
      }
    });

    label.append(srText, select);
    return label;
  }

  function createMenuToggle(data, shouldExist) {
    const button = document.createElement("button");
    button.className = "header-menu-toggle";
    button.id = "header-menu-toggle";
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "header-drawer");
    button.setAttribute("aria-label", data.menu?.open || "Abrir menú");
    button.hidden = !shouldExist;

    for (let index = 0; index < 3; index += 1) {
      button.appendChild(document.createElement("span"));
    }

    button.addEventListener("click", () => {
      setDrawerOpen(!drawerOpen);
    });

    return button;
  }

  function createDrawer(data, buttons, shouldExist) {
    const overlay = document.createElement("div");
    overlay.className = "header-drawer-overlay";
    overlay.id = "header-drawer-overlay";
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    overlay.addEventListener("click", () => setDrawerOpen(false));

    const drawer = document.createElement("aside");
    drawer.className = "header-drawer";
    drawer.id = "header-drawer";
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("aria-label", data.menu?.navigationAriaLabel || "Navegación");
    drawer.hidden = !shouldExist;

    const drawerTop = document.createElement("div");
    drawerTop.className = "header-drawer__top";

    const title = document.createElement("span");
    title.className = "header-drawer__brand";
    title.textContent = data.brand?.name || "Alfora";

    const close = document.createElement("button");
    close.className = "header-drawer__close";
    close.type = "button";
    close.setAttribute("aria-label", data.menu?.close || "Cerrar menú");
    close.innerHTML = "&times;";
    close.addEventListener("click", () => setDrawerOpen(false));

    drawerTop.append(title, close);

    const nav = document.createElement("nav");
    nav.className = "header-drawer__nav";
    nav.setAttribute("aria-label", data.menu?.navigationAriaLabel || "Navegación");

    buttons.forEach((button) => {
      const link = createLink(button, "header-drawer__link");
      link.addEventListener("click", () => setDrawerOpen(false, { restoreFocus: false }));
      nav.appendChild(link);
    });

    drawer.append(drawerTop, nav);
    return { overlay, drawer };
  }

  function cleanupDrawerPortals() {
    window.clearTimeout(overlayHideTimer);
    overlayHideTimer = 0;
    document.getElementById("header-drawer-overlay")?.remove();
    document.getElementById("header-drawer")?.remove();
    document.documentElement.classList.remove("header-drawer-open");
    drawerOpen = false;
  }

  function setDrawerOpen(open, options = {}) {
    const { restoreFocus = true } = options;
    const toggle = document.getElementById("header-menu-toggle");
    const drawer = document.getElementById("header-drawer");
    const overlay = document.getElementById("header-drawer-overlay");

    if (!drawer || drawer.hidden || !toggle || toggle.hidden) {
      drawerOpen = false;
      document.documentElement.classList.remove("header-drawer-open");
      return;
    }

    const nextOpen = Boolean(open);
    if (nextOpen === drawerOpen) return;

    window.clearTimeout(overlayHideTimer);
    overlayHideTimer = 0;

    if (nextOpen) {
      lastDrawerTrigger = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : toggle;

      drawer.hidden = false;
      if (overlay) {
        overlay.hidden = false;
        overlay.setAttribute("aria-hidden", "false");
      }

      // Dos frames garantizan que el navegador pinte el estado inicial antes
      // de comenzar la transición. Evita saltos y bloqueos de composición.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          drawer.classList.add("is-open");
          overlay?.classList.add("is-open");
        });
      });
    } else {
      drawer.classList.remove("is-open");
      overlay?.classList.remove("is-open");
      overlay?.setAttribute("aria-hidden", "true");

      overlayHideTimer = window.setTimeout(() => {
        if (!drawerOpen && overlay) overlay.hidden = true;
      }, 220);

      if (restoreFocus && lastDrawerTrigger?.isConnected) {
        window.setTimeout(() => lastDrawerTrigger?.focus({ preventScroll: true }), 0);
      }
    }

    drawerOpen = nextOpen;
    document.documentElement.classList.toggle("header-drawer-open", drawerOpen);
    toggle.classList.toggle("is-open", drawerOpen);
    toggle.setAttribute("aria-expanded", drawerOpen ? "true" : "false");
    toggle.setAttribute(
      "aria-label",
      drawerOpen
        ? currentHeaderData?.menu?.close || "Cerrar menú"
        : currentHeaderData?.menu?.open || "Abrir menú"
    );
    drawer.setAttribute("aria-hidden", drawerOpen ? "false" : "true");
  }

  function buildHeader(header, data, type, language) {
    const headerData = data.headers?.[type] || {};
    const buttons = safeButtons(headerData.buttons);

    /*
      INDEX:
      - Todos los botones se muestran en navegación de escritorio.
      - Los mismos botones se copian automáticamente al drawer hamburguesa.

      HERRAMIENTAS:
      - El primer botón queda visible en el header (por defecto: Servicios).
      - Todo botón adicional pasa automáticamente al drawer.
      - Si no hay botones adicionales, la hamburguesa no existe visualmente.
    */
    const desktopButtons = type === "index" ? buttons : buttons.slice(0, 1);
    const drawerButtons = type === "index" ? buttons : buttons.slice(1);
    const drawerShouldExist = type === "index" ? buttons.length > 0 : drawerButtons.length > 0;

    header.className = `site-header site-header--${type}`;
    header.id = "site-header";
    header.replaceChildren();

    const inner = document.createElement("div");
    inner.className = "site-header__inner";

    const brand = document.createElement("a");
    brand.className = "site-brand";
    brand.href = "./index.html";
    brand.setAttribute("aria-label", data.brand?.homeAriaLabel || "Ir al inicio");

    const logo = document.createElement("img");
    logo.className = "site-brand__logo";
    logo.src = "./src/logo.svg";
    logo.alt = data.brand?.logoAlt || "Logo de Alfora";
    logo.width = 48;
    logo.height = 48;

    const brandName = document.createElement("span");
    brandName.className = "site-brand__name";
    brandName.textContent = data.brand?.name || "Alfora";
    brand.append(logo, brandName);

    if (type === "index") {
      const nav = document.createElement("nav");
      nav.className = "site-nav header-desktop-nav";
      nav.setAttribute("aria-label", data.menu?.navigationAriaLabel || "Navegación");
      desktopButtons.forEach((button) => nav.appendChild(createLink(button)));
      inner.append(brand, nav);
    } else {
      inner.appendChild(brand);
    }

    const actions = document.createElement("div");
    actions.className = "site-header__actions";

    if (type === "tools" && desktopButtons[0]) {
      actions.appendChild(createLink(desktopButtons[0], "back-to-portfolio"));
    }

    actions.appendChild(createLanguageControl(data, language));
    actions.appendChild(createMenuToggle(data, drawerShouldExist));
    inner.appendChild(actions);

    const { overlay, drawer } = createDrawer(
      data,
      drawerButtons,
      drawerShouldExist
    );

    // El drawer NO vive dentro del header sticky. Un elemento fixed dentro de
    // un ancestro con backdrop-filter puede crear una capa de composición
    // costosa y comportarse como si estuviera contenido por el header.
    // Mantenerlo como portal directo de <body> evita que el header desaparezca
    // y reduce mucho el trabajo gráfico al abrir/cerrar el menú.
    cleanupDrawerPortals();
    header.appendChild(inner);
    document.body.append(overlay, drawer);
  }

  async function renderHeader(language = detectLanguage()) {
    const lang = normalizeLanguage(language) || HEADER_CONFIG.defaultLanguage;
    const type = getHeaderType();

    try {
      const data = await loadHeaderData(lang);
      activeLanguage = lang;
      currentHeaderData = data;
      buildHeader(getHeaderElement(), data, type, lang);
    } catch (error) {
      console.error("Alfora Header: no se pudo construir la cabecera.", error);
    }
  }

  function bindGlobalHeaderEvents() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && drawerOpen) setDrawerOpen(false);
    });

    document.addEventListener("creativeLab:languageChanged", (event) => {
      const language = normalizeLanguage(event.detail?.language);
      if (language) renderHeader(language);
    });

    window.addEventListener("resize", () => {
      if (drawerOpen && window.innerWidth > 820 && getHeaderType() === "index") {
        setDrawerOpen(false);
      }
    }, { passive: true });
  }

  function initialize() {
    bindGlobalHeaderEvents();
    renderHeader(detectLanguage());
  }

  // shared.js se carga con defer en Alfora. En ese momento el <body> ya existe,
  // así que construimos el header inmediatamente. Esto permite que language.js,
  // al llegar DOMContentLoaded, encuentre #language-selector ya creado.
  if (document.body) {
    initialize();
  } else {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  }
})();
