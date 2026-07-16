
(() => {
    "use strict";

    const CONFIG = Object.freeze({
        supportedLanguages: ["es", "en"],
        defaultLanguage: "es",
        storageKey: "creative-lab-language",
        jsonDirectory: "./jsons",
        commonFilePrefix: "common",
        languageSelectorId: "language-selector"
    });

    let currentLanguage = CONFIG.defaultLanguage;
    let currentTranslations = {};

    /**
     * Obtiene un valor anidado usando una ruta como "home.title".
     */
    function getNestedValue(object, path) {
        return path
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

    /**
     * Une objetos de traducción sin eliminar claves anidadas.
     * Las traducciones específicas de página reemplazan las comunes.
     */
    function deepMerge(target, source) {
        const result = { ...target };

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

    /**
     * Normaliza valores como "es-ES" o "en-US" a "es" y "en".
     */
    function normalizeLanguage(language) {
        if (!language || typeof language !== "string") {
            return null;
        }

        const normalized = language.trim().toLowerCase().split("-")[0];

        return CONFIG.supportedLanguages.includes(normalized)
            ? normalized
            : null;
    }

    /**
     * Busca primero una selección guardada y luego el idioma del navegador.
     */
    function detectPreferredLanguage() {
        try {
            const storedLanguage = normalizeLanguage(
                window.localStorage.getItem(CONFIG.storageKey)
            );

            if (storedLanguage) {
                return storedLanguage;
            }
        } catch (error) {
            console.warn(
                "Creative Lab: no se pudo leer el idioma guardado.",
                error
            );
        }

        const browserLanguages = Array.isArray(navigator.languages)
            ? navigator.languages
            : [navigator.language];

        for (const language of browserLanguages) {
            const normalized = normalizeLanguage(language);

            if (normalized) {
                return normalized;
            }
        }

        return CONFIG.defaultLanguage;
    }

    /**
     * Obtiene el identificador de la página desde data-page.
     */
    function getPageName() {
        const pageName = document.body?.dataset.page?.trim();

        return pageName || "index";
    }

    /**
     * Solicita un archivo JSON y devuelve un objeto vacío si no existe.
     */
    async function fetchTranslationFile(fileName, required = false) {
        const url = `${CONFIG.jsonDirectory}/${fileName}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "application/json"
                },
                cache: "no-cache"
            });

            if (!response.ok) {
                if (required) {
                    throw new Error(
                        `No se pudo cargar ${url}. Código HTTP: ${response.status}`
                    );
                }

                console.warn(`Creative Lab: archivo opcional no encontrado: ${url}`);
                return {};
            }

            const data = await response.json();

            if (!data || typeof data !== "object" || Array.isArray(data)) {
                throw new Error(`El archivo ${url} no contiene un objeto JSON válido.`);
            }

            return data;
        } catch (error) {
            if (required) {
                throw error;
            }

            console.warn(
                `Creative Lab: no se pudo cargar el archivo opcional ${url}.`,
                error
            );

            return {};
        }
    }

    /**
     * Carga primero las traducciones comunes y luego las de la página.
     */
    async function loadTranslations(language) {
        const pageName = getPageName();

        const [commonTranslations, pageTranslations] = await Promise.all([
            fetchTranslationFile(
                `${CONFIG.commonFilePrefix}-${language}.json`,
                false
            ),
            fetchTranslationFile(`${pageName}-${language}.json`, true)
        ]);

        return deepMerge(commonTranslations, pageTranslations);
    }

    /**
     * Traduce el contenido de texto.
     */
    function translateTextContent(translations) {
        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const key = element.dataset.i18n;
            const translation = getNestedValue(translations, key);

            if (typeof translation === "string") {
                element.textContent = translation;
            } else {
                console.warn(
                    `Creative Lab: traducción no encontrada para "${key}".`
                );
            }
        });
    }

    /**
     * Traduce atributos HTML comunes.
     */
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
                    console.warn(
                        `Creative Lab: traducción no encontrada para "${key}".`
                    );
                }
            });
        });
    }

    /**
     * Permite traducir contenido HTML controlado desde JSON.
     * Úsese solo con contenido creado por el proyecto.
     */
    function translateHtmlContent(translations) {
        document.querySelectorAll("[data-i18n-html]").forEach((element) => {
            const key = element.dataset.i18nHtml;
            const translation = getNestedValue(translations, key);

            if (typeof translation === "string") {
                element.innerHTML = translation;
            }
        });
    }

    /**
     * Actualiza metadatos SEO cuando el JSON incluye un bloque "seo".
     */
    function updateSeoMetadata(translations) {
        const seo = translations.seo;

        if (!seo || typeof seo !== "object") {
            return;
        }

        if (typeof seo.title === "string") {
            document.title = seo.title;
        }

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

        const htmlLanguage = seo.htmlLang || currentLanguage;
        document.documentElement.lang = htmlLanguage;

        const ogLocale = document.querySelector('meta[property="og:locale"]');

        if (ogLocale) {
            ogLocale.setAttribute(
                "content",
                currentLanguage === "en" ? "en_US" : "es_ES"
            );
        }
    }

    /**
     * Actualiza el selector manual.
     */
    function updateLanguageSelector(language) {
        const selector = document.getElementById(CONFIG.languageSelectorId);

        if (selector instanceof HTMLSelectElement) {
            selector.value = language;
        }
    }

    /**
     * Guarda la selección manual.
     */
    function saveLanguagePreference(language) {
        try {
            window.localStorage.setItem(CONFIG.storageKey, language);
        } catch (error) {
            console.warn(
                "Creative Lab: no se pudo guardar la preferencia de idioma.",
                error
            );
        }
    }

    /**
     * Aplica todas las traducciones.
     */
    function applyTranslations(translations) {
        currentTranslations = translations;

        translateTextContent(translations);
        translateAttributes(translations);
        translateHtmlContent(translations);
        updateSeoMetadata(translations);

        document.documentElement.lang = currentLanguage;
        document.documentElement.dataset.language = currentLanguage;
    }

    /**
     * Cambia el idioma de la página.
     */
    async function setLanguage(language, options = {}) {
        const normalizedLanguage =
            normalizeLanguage(language) || CONFIG.defaultLanguage;

        const {
            savePreference = true,
            dispatchEvent = true
        } = options;

        document.documentElement.classList.add("is-translating");
        document.documentElement.setAttribute("aria-busy", "true");

        try {
            const translations = await loadTranslations(normalizedLanguage);

            currentLanguage = normalizedLanguage;
            applyTranslations(translations);
            updateLanguageSelector(normalizedLanguage);

            if (savePreference) {
                saveLanguagePreference(normalizedLanguage);
            }

            if (dispatchEvent) {
                document.dispatchEvent(
                    new CustomEvent("creativeLab:languageChanged", {
                        detail: {
                            language: normalizedLanguage,
                            translations
                        }
                    })
                );
            }

            return translations;
        } catch (error) {
            console.error(
                `Creative Lab: no fue posible activar el idioma "${normalizedLanguage}".`,
                error
            );

            if (normalizedLanguage !== CONFIG.defaultLanguage) {
                return setLanguage(CONFIG.defaultLanguage, {
                    savePreference: false,
                    dispatchEvent
                });
            }

            document.dispatchEvent(
                new CustomEvent("creativeLab:languageError", {
                    detail: {
                        language: normalizedLanguage,
                        error
                    }
                })
            );

            return {};
        } finally {
            document.documentElement.classList.remove("is-translating");
            document.documentElement.removeAttribute("aria-busy");
        }
    }

    /**
     * Traduce una clave desde otros scripts.
     *
     * Ejemplo:
     * window.CreativeLabLanguage.translate("common.download")
     */
    function translate(key, fallback = "") {
        const value = getNestedValue(currentTranslations, key);

        return typeof value === "string" ? value : fallback || key;
    }

    /**
     * Conecta el selector de idioma.
     */
    function bindLanguageSelector() {
        const selector = document.getElementById(CONFIG.languageSelectorId);

        if (!(selector instanceof HTMLSelectElement)) {
            return;
        }

        selector.addEventListener("change", async (event) => {
            const selectedLanguage = event.target.value;
            await setLanguage(selectedLanguage);
        });
    }

    /**
     * Inicia el sistema.
     */
    async function initializeLanguageSystem() {
        bindLanguageSelector();

        const preferredLanguage = detectPreferredLanguage();

        await setLanguage(preferredLanguage, {
            savePreference: false,
            dispatchEvent: true
        });

        document.documentElement.classList.add("language-ready");
    }

    /**
     * API pública para los scripts específicos de cada producto.
     */
    window.CreativeLabLanguage = Object.freeze({
        setLanguage,
        translate,
        getLanguage: () => currentLanguage,
        getTranslations: () => ({ ...currentTranslations }),
        getSupportedLanguages: () => [...CONFIG.supportedLanguages]
    });

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeLanguageSystem,
            { once: true }
        );
    } else {
        initializeLanguageSystem();
    }
})();
