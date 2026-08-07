/**
 * Alfora - Sistema bilingüe compartido
 *
 * Fuentes de traducción, en este orden:
 * 1. header-<idioma>.json  -> cabecera global + aliases históricos
 * 2. common-<idioma>.json  -> textos comunes del resto de la plataforma
 * 3. <pagina>-<idioma>.json -> textos específicos de la página
 */
(() => {
  "use strict";

  const CONFIG = Object.freeze({
    supportedLanguages: ["es", "en"],
    defaultLanguage: "es",
    storageKey: "creative-lab-language",
    jsonDirectory: "./jsons",
    commonFilePrefix: "common",
    headerFilePrefix: "header",
    languageSelectorId: "language-selector"
  });

  let currentLanguage = CONFIG.defaultLanguage;
  let currentTranslations = {};

  function getNestedValue(object, path) {
    return String(path || "")
      .split(".")
      .reduce((value, key) => {
        if (
          value &&
          typeof value === "object" &&
          Object.prototype.hasOwnProperty.call(value, key)
        ) {
          return value[key];
        }
        return undefined;
      }, object);
  }

  function deepMerge(target, source) {
    const result = { ...(target || {}) };

    Object.entries(source || {}).forEach(([key, value]) => {
      const currentValue = result[key];
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        currentValue &&
        typeof currentValue === "object" &&
        !Array.isArray(currentValue)
      ) {
        result[key] = deepMerge(currentValue, value);
      } else {
        result[key] = value;
      }
    });

    return result;
  }

  function normalizeLanguage(language) {
    if (!language || typeof language !== "string") return null;
    const normalized = language.trim().toLowerCase().split("-")[0];
    return CONFIG.supportedLanguages.includes(normalized) ? normalized : null;
  }

  function detectPreferredLanguage() {
    try {
      const storedLanguage = normalizeLanguage(
        window.localStorage.getItem(CONFIG.storageKey)
      );
      if (storedLanguage) return storedLanguage;
    } catch (error) {
      console.warn("Alfora: no se pudo leer el idioma guardado.", error);
    }

    const browserLanguages = Array.isArray(navigator.languages)
      ? navigator.languages
      : [navigator.language];

    for (const language of browserLanguages) {
      const normalized = normalizeLanguage(language);
      if (normalized) return normalized;
    }

    return CONFIG.defaultLanguage;
  }

  function getPageName() {
    return document.body?.dataset.page?.trim() || "index";
  }

  async function fetchTranslationFile(fileName, required = false) {
    const url = `${CONFIG.jsonDirectory}/${fileName}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-cache"
      });

      if (!response.ok) {
        if (required) {
          throw new Error(`No se pudo cargar ${url}. Código HTTP: ${response.status}`);
        }
        return {};
      }

      const data = await response.json();
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error(`El archivo ${url} no contiene un objeto JSON válido.`);
      }
      return data;
    } catch (error) {
      if (required) throw error;
      console.warn(`Alfora: no se pudo cargar el archivo opcional ${url}.`, error);
      return {};
    }
  }

  /**
   * Convierte el JSON declarativo del header en las claves históricas que aún
   * pueden existir fuera del header (por ejemplo en el footer). De esta forma
   * brand/nav/common siguen resolviéndose sin duplicarlos en cada JSON de página.
   */
  function createHeaderTranslationAliases(headerData) {
    const indexButtons = Array.isArray(headerData?.headers?.index?.buttons)
      ? headerData.headers.index.buttons
      : [];

    const nav = {};
    indexButtons.forEach((button) => {
      if (button?.id && typeof button.label === "string") {
        nav[button.id] = button.label;
      }
    });

    if (headerData?.menu?.open) nav.openMenu = headerData.menu.open;
    if (headerData?.menu?.close) nav.closeMenu = headerData.menu.close;
    if (headerData?.menu?.navigationAriaLabel) {
      nav.navigationAriaLabel = headerData.menu.navigationAriaLabel;
    }

    return {
      brand: {
        name: headerData?.brand?.name || "Alfora",
        logoAlt: headerData?.brand?.logoAlt || "Logo de Alfora",
        homeAriaLabel: headerData?.brand?.homeAriaLabel || "Ir al inicio"
      },
      common: {
        language: headerData?.language?.label || "Idioma"
      },
      nav
    };
  }

  async function loadTranslations(language) {
    const pageName = getPageName();

    const [headerData, commonTranslations, pageTranslations] = await Promise.all([
      fetchTranslationFile(`${CONFIG.headerFilePrefix}-${language}.json`, false),
      fetchTranslationFile(`${CONFIG.commonFilePrefix}-${language}.json`, false),
      fetchTranslationFile(`${pageName}-${language}.json`, true)
    ]);

    const headerAliases = createHeaderTranslationAliases(headerData);
    return deepMerge(deepMerge(headerAliases, commonTranslations), pageTranslations);
  }

  function translateTextContent(translations) {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      const translation = getNestedValue(translations, key);
      if (typeof translation === "string") {
        element.textContent = translation;
      } else {
        console.warn(`Alfora: traducción no encontrada para "${key}".`);
      }
    });
  }

  function translateAttributes(translations) {
    const attributeMap = {
      "data-i18n-aria-label": "aria-label",
      "data-i18n-placeholder": "placeholder",
      "data-i18n-title": "title",
      "data-i18n-alt": "alt",
      "data-i18n-value": "value"
    };

    Object.entries(attributeMap).forEach(([dataAttribute, htmlAttribute]) => {
      document.querySelectorAll(`[${dataAttribute}]`).forEach((element) => {
        const key = element.getAttribute(dataAttribute);
        const translation = getNestedValue(translations, key);
        if (typeof translation === "string") {
          element.setAttribute(htmlAttribute, translation);
        } else {
          console.warn(`Alfora: traducción no encontrada para "${key}".`);
        }
      });
    });
  }

  function translateHtmlContent(translations) {
    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
      const key = element.dataset.i18nHtml;
      const translation = getNestedValue(translations, key);
      if (typeof translation === "string") element.innerHTML = translation;
    });
  }

  function updateSeoMetadata(translations) {
    const seo = translations.seo;
    if (!seo || typeof seo !== "object") return;

    if (typeof seo.title === "string") document.title = seo.title;

    const metadata = {
      description: 'meta[name="description"]',
      ogTitle: 'meta[property="og:title"]',
      ogDescription: 'meta[property="og:description"]',
      twitterTitle: 'meta[name="twitter:title"]',
      twitterDescription: 'meta[name="twitter:description"]'
    };

    Object.entries(metadata).forEach(([translationKey, selector]) => {
      const value = seo[translationKey];
      const element = document.querySelector(selector);
      if (element && typeof value === "string") {
        element.setAttribute("content", value);
      }
    });

    document.documentElement.lang = seo.htmlLang || currentLanguage;

    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      ogLocale.setAttribute("content", currentLanguage === "en" ? "en_US" : "es_ES");
    }
  }

  function updateLanguageSelector(language) {
    const selector = document.getElementById(CONFIG.languageSelectorId);
    if (selector instanceof HTMLSelectElement) selector.value = language;
  }

  function saveLanguagePreference(language) {
    try {
      window.localStorage.setItem(CONFIG.storageKey, language);
    } catch (error) {
      console.warn("Alfora: no se pudo guardar la preferencia de idioma.", error);
    }
  }

  function applyTranslations(translations) {
    currentTranslations = translations;
    translateTextContent(translations);
    translateAttributes(translations);
    translateHtmlContent(translations);
    updateSeoMetadata(translations);
    document.documentElement.lang = currentLanguage;
    document.documentElement.dataset.language = currentLanguage;
  }

  async function setLanguage(language, options = {}) {
    const normalizedLanguage = normalizeLanguage(language) || CONFIG.defaultLanguage;
    const { savePreference = true, dispatchEvent = true } = options;

    document.documentElement.classList.add("is-translating");
    document.documentElement.setAttribute("aria-busy", "true");

    try {
      const translations = await loadTranslations(normalizedLanguage);
      currentLanguage = normalizedLanguage;
      applyTranslations(translations);
      updateLanguageSelector(normalizedLanguage);

      if (savePreference) saveLanguagePreference(normalizedLanguage);

      if (dispatchEvent) {
        document.dispatchEvent(
          new CustomEvent("creativeLab:languageChanged", {
            detail: { language: normalizedLanguage, translations }
          })
        );
      }

      return translations;
    } catch (error) {
      console.error(`Alfora: no fue posible activar el idioma "${normalizedLanguage}".`, error);

      if (normalizedLanguage !== CONFIG.defaultLanguage) {
        return setLanguage(CONFIG.defaultLanguage, {
          savePreference: false,
          dispatchEvent
        });
      }

      document.dispatchEvent(
        new CustomEvent("creativeLab:languageError", {
          detail: { language: normalizedLanguage, error }
        })
      );
      return {};
    } finally {
      document.documentElement.classList.remove("is-translating");
      document.documentElement.removeAttribute("aria-busy");
    }
  }

  function translate(key, fallback = "") {
    const value = getNestedValue(currentTranslations, key);
    return typeof value === "string" ? value : fallback || key;
  }

  function bindLanguageSelector() {
    const selector = document.getElementById(CONFIG.languageSelectorId);
    if (!(selector instanceof HTMLSelectElement)) return;

    // shared.js crea su propio listener. Esta marca evita que dos listeners
    // hagan dos cargas simultáneas cuando ambos scripts coinciden en el mismo select.
    if (selector.dataset.alforaLanguageBound === "true") return;
    selector.dataset.alforaLanguageBound = "true";

    selector.addEventListener("change", async (event) => {
      await setLanguage(event.target.value);
    });
  }

  async function initializeLanguageSystem() {
    bindLanguageSelector();
    const preferredLanguage = detectPreferredLanguage();
    await setLanguage(preferredLanguage, {
      savePreference: false,
      dispatchEvent: true
    });
    document.documentElement.classList.add("language-ready");
  }

  window.CreativeLabLanguage = Object.freeze({
    setLanguage,
    translate,
    getLanguage: () => currentLanguage,
    getTranslations: () => ({ ...currentTranslations }),
    getSupportedLanguages: () => [...CONFIG.supportedLanguages]
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeLanguageSystem, { once: true });
  } else {
    initializeLanguageSystem();
  }
})();
