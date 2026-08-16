/**
 * Alfora.art
 * Detector compartido de publicidad no disponible
 *
 * Archivo:
 * scripts/detectordebloqueoanuncios.js
 *
 * Requiere que language.js ya esté cargado.
 *
 * Usa:
 * CreativeLabLanguage.translate(...)
 * creativeLab:languageChanged
 */

(() => {
    "use strict";

    const CONFIG = {
        checkDelayMs: 9000,
        baitDelayMs: 250,
        showOncePerSession: true,
        sessionKey: "alfora_ad_support_seen",
        donationsUrl: "./donations.html"
    };

    let popupElement = null;

    const FALLBACKS = {
        es: {
            title: "¿Alfora te está ayudando?",
            message:
                "No pudimos mostrar publicidad en esta visita. Alfora es gratuita y los anuncios nos ayudan a mantener y seguir mejorando las herramientas. Si puedes, permite anuncios para alfora.art.",
            allowAds: "Cómo permitir anuncios",
            continue: "Seguir usando Alfora",
            supportAnotherWay: "Apoyar de otra forma",
            instructionsTitle: "Permite anuncios para alfora.art",
            instructions:
                "Abre la configuración de tu bloqueador o protección del navegador y añade alfora.art a la lista de sitios permitidos. Después recarga esta página.",
            networkNote:
                "Si el bloqueo proviene de una universidad, empresa o red administrada, quizá no puedas cambiarlo desde este dispositivo.",
            closeAria: "Cerrar mensaje"
        },

        en: {
            title: "Is Alfora helping you?",
            message:
                "We could not show advertising during this visit. Alfora is free, and ads help us maintain and keep improving the tools. If you can, please allow ads for alfora.art.",
            allowAds: "How to allow ads",
            continue: "Keep using Alfora",
            supportAnotherWay: "Support another way",
            instructionsTitle: "Allow ads for alfora.art",
            instructions:
                "Open your ad blocker or browser protection settings and add alfora.art to the allowed-sites list. Then reload this page.",
            networkNote:
                "If ads are blocked by a university, company or managed network, you may not be able to change it from this device.",
            closeAria: "Close message"
        }
    };

    function getLanguage() {
        const current =
            window.CreativeLabLanguage?.getLanguage?.();

        if (current === "es" || current === "en") {
            return current;
        }

        const htmlLang = String(
            document.documentElement.lang || "es"
        )
            .toLowerCase()
            .split("-")[0];

        return htmlLang === "en" ? "en" : "es";
    }

    function t(key) {
        const lang = getLanguage();
        const fallback =
            FALLBACKS[lang]?.[key] || "";

        if (window.CreativeLabLanguage?.translate) {
            return window.CreativeLabLanguage.translate(
                `adSupport.${key}`,
                fallback
            );
        }

        return fallback;
    }

    function alreadyShown() {
        if (!CONFIG.showOncePerSession) {
            return false;
        }

        try {
            return (
                sessionStorage.getItem(
                    CONFIG.sessionKey
                ) === "1"
            );
        } catch {
            return false;
        }
    }

    function markShown() {
        if (!CONFIG.showOncePerSession) {
            return;
        }

        try {
            sessionStorage.setItem(
                CONFIG.sessionKey,
                "1"
            );
        } catch { }
    }

    function pageUsesAdsense() {
        return Boolean(
            document.querySelector(
                [
                    'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
                    'script[src*="adsbygoogle.js"]',
                    "ins.adsbygoogle"
                ].join(",")
            )
        );
    }

    function adsenseLibraryAvailable() {
        return (
            typeof window.adsbygoogle !==
            "undefined"
        );
    }

    function createBait() {
        const bait =
            document.createElement("div");

        bait.id =
            "alfora-ad-detection-bait";

        bait.className =
            "adsbox ad-banner ad-unit advertisement ad-placement sponsored-ad";

        bait.setAttribute(
            "aria-hidden",
            "true"
        );

        bait.style.cssText = `
      position:absolute;
      left:-10000px;
      top:-10000px;
      width:10px;
      height:10px;
      pointer-events:none;
      opacity:.01;
    `;

        document.body.appendChild(bait);

        return bait;
    }

    function baitWasBlocked(bait) {
        if (
            !bait ||
            !document.documentElement.contains(
                bait
            )
        ) {
            return true;
        }

        const style =
            getComputedStyle(bait);

        const rect =
            bait.getBoundingClientRect();

        return (
            style.display === "none" ||
            style.visibility === "hidden" ||
            rect.width === 0 ||
            rect.height === 0 ||
            bait.offsetHeight === 0 ||
            bait.offsetWidth === 0
        );
    }

    function hasFilledAd() {
        const filled =
            document.querySelector(
                'ins.adsbygoogle[data-ad-status="filled"]'
            );

        if (filled) {
            return true;
        }

        const iframes =
            document.querySelectorAll(
                [
                    'iframe[id^="google_ads_iframe"]',
                    'iframe[name^="google_ads_iframe"]',
                    'iframe[src*="googleads"]',
                    'iframe[src*="googlesyndication"]'
                ].join(",")
            );

        return Array.from(
            iframes
        ).some((iframe) => {
            const rect =
                iframe.getBoundingClientRect();

            const style =
                getComputedStyle(iframe);

            return (
                rect.width > 1 &&
                rect.height > 1 &&
                style.display !== "none" &&
                style.visibility !== "hidden"
            );
        });
    }

    function hasUnfilledAd() {
        return Boolean(
            document.querySelector(
                'ins.adsbygoogle[data-ad-status="unfilled"]'
            )
        );
    }

    function classifyState(
        baitBlocked
    ) {
        if (hasFilledAd()) {
            return {
                unavailable: false,
                reason: "filled"
            };
        }

        if (baitBlocked) {
            return {
                unavailable: true,
                reason: "blocking-detected"
            };
        }

        if (
            pageUsesAdsense() &&
            !adsenseLibraryAvailable()
        ) {
            return {
                unavailable: true,
                reason:
                    "adsense-script-unavailable"
            };
        }

        if (hasUnfilledAd()) {
            return {
                unavailable: true,
                reason: "unfilled"
            };
        }

        if (
            pageUsesAdsense() &&
            adsenseLibraryAvailable() &&
            !hasFilledAd()
        ) {
            return {
                unavailable: true,
                reason: "no-rendered-ad"
            };
        }

        return {
            unavailable: false,
            reason: "not-applicable"
        };
    }

    function injectStyles() {
        if (
            document.getElementById(
                "alfora-ad-support-styles"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "alfora-ad-support-styles";

        style.textContent = `
      #alfora-ad-support-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483646;

        display: grid;
        place-items: center;

        padding: 1.5rem;

        background:
          radial-gradient(
            circle at 50% 35%,
            rgba(102, 255, 143, .13),
            transparent 45%
          ),
          rgba(0, 7, 4, .88);

        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);

        animation:
          alforaAdOverlayIn
          .2s ease;
      }

      #alfora-ad-support-dialog {
        position: relative;

        width: min(
          540px,
          100%
        );

        padding: 2rem;

        border:
          1px solid
          rgba(
            102,
            255,
            143,
            .3
          );

        border-radius: 24px;

        color:
          var(
            --color-text,
            #f4fff7
          );

        background:
          linear-gradient(
            180deg,
            rgba(
              102,
              255,
              143,
              .06
            ),
            rgba(
              255,
              255,
              255,
              .015
            )
          ),
          var(
            --color-surface-strong,
            #0c2115
          );

        box-shadow:
          0 30px 90px
          rgba(0,0,0,.55),
          0 0 45px
          rgba(
            102,
            255,
            143,
            .08
          );

        font-family:
          var(
            --font-primary,
            inherit
          );

        animation:
          alforaAdDialogIn
          .25s ease;
      }

      #alfora-ad-support-dialog * {
        box-sizing: border-box;
      }

      #alfora-ad-support-close {
        position: absolute;

        top: 1rem;
        right: 1rem;

        width: 40px;
        height: 40px;

        display: grid;
        place-items: center;

        border:
          1px solid
          rgba(
            102,
            255,
            143,
            .18
          );

        border-radius: 999px;

        color: #c9ded0;

        background:
          rgba(
            255,
            255,
            255,
            .04
          );

        font-size: 1.35rem;

        cursor: pointer;
      }

      #alfora-ad-support-close:hover {
        color: #66ff8f;

        border-color:
          rgba(
            102,
            255,
            143,
            .45
          );
      }

      .alfora-ad-support-icon {
        width: 52px;
        height: 52px;

        display: grid;
        place-items: center;

        margin-bottom: 1.25rem;

        border:
          1px solid
          rgba(
            102,
            255,
            143,
            .4
          );

        border-radius: 16px;

        color:
          var(
            --color-primary,
            #66ff8f
          );

        background:
          rgba(
            102,
            255,
            143,
            .08
          );

        box-shadow:
          0 0 28px
          rgba(
            102,
            255,
            143,
            .18
          );

        font-size: 1.5rem;
      }

      #alfora-ad-support-title {
        margin:
          0 45px
          .75rem
          0;

        color:
          var(
            --color-text,
            #f4fff7
          );

        font-size: 1.65rem;
      }

      #alfora-ad-support-message {
        margin: 0;

        color:
          var(
            --color-text-soft,
            #c9ded0
          );

        line-height: 1.65;
      }

      #alfora-ad-support-actions {
        display: flex;
        flex-wrap: wrap;

        gap: .75rem;

        margin-top: 1.5rem;
      }

      .alfora-ad-support-btn {
        min-height: 46px;

        padding:
          .75rem
          1rem;

        border:
          1px solid
          transparent;

        border-radius: 12px;

        font: inherit;
        font-weight: 700;

        cursor: pointer;

        transition:
          transform .16s ease,
          border-color .16s ease,
          opacity .16s ease;
      }

      .alfora-ad-support-btn:hover {
        transform:
          translateY(-1px);
      }

      #alfora-ad-support-allow {
        color: #06130a;

        background:
          linear-gradient(
            135deg,
            #66ff8f,
            #9aff4f
          );

        box-shadow:
          0 0 26px
          rgba(
            102,
            255,
            143,
            .2
          );
      }

      #alfora-ad-support-continue,
      #alfora-ad-support-donate {
        color: #f4fff7;

        border-color:
          rgba(
            102,
            255,
            143,
            .18
          );

        background:
          rgba(
            255,
            255,
            255,
            .04
          );
      }

      #alfora-ad-support-instructions-box {
        display: none;

        margin-top: 1.25rem;

        padding: 1.25rem;

        border:
          1px solid
          rgba(
            102,
            255,
            143,
            .18
          );

        border-radius: 16px;

        background:
          rgba(
            24,
            58,
            37,
            .55
          );
      }

      #alfora-ad-support-instructions-box.is-visible {
        display: block;
      }

      #alfora-ad-support-instructions-title {
        margin:
          0 0
          .5rem;

        color: #f4fff7;

        font-size: 1.05rem;
      }

      #alfora-ad-support-instructions,
      #alfora-ad-support-network-note {
        margin: 0;

        color: #c9ded0;

        font-size: .9rem;

        line-height: 1.55;
      }

      #alfora-ad-support-network-note {
        margin-top: .75rem;

        opacity: .75;
      }

      #alfora-ad-support-donate {
        margin-top: 1rem;
      }

      @keyframes
      alforaAdOverlayIn {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }

      @keyframes
      alforaAdDialogIn {
        from {
          opacity: 0;

          transform:
            translateY(10px)
            scale(.985);
        }

        to {
          opacity: 1;

          transform:
            translateY(0)
            scale(1);
        }
      }

      @media (
        max-width: 560px
      ) {
        #alfora-ad-support-overlay {
          padding: 1rem;
        }

        #alfora-ad-support-dialog {
          padding: 1.5rem;

          border-radius: 18px;
        }

        #alfora-ad-support-actions {
          flex-direction: column;
        }

        .alfora-ad-support-btn {
          width: 100%;
        }
      }

      @media (
        prefers-reduced-motion:
        reduce
      ) {
        #alfora-ad-support-overlay,
        #alfora-ad-support-dialog {
          animation: none;
        }
      }
    `;

        document.head.appendChild(
            style
        );
    }

    function updatePopupLanguage() {
        if (!popupElement) {
            return;
        }

        const translations = {
            "alfora-ad-support-title":
                t("title"),

            "alfora-ad-support-message":
                t("message"),

            "alfora-ad-support-allow":
                t("allowAds"),

            "alfora-ad-support-continue":
                t("continue"),

            "alfora-ad-support-donate":
                t("supportAnotherWay"),

            "alfora-ad-support-instructions-title":
                t("instructionsTitle"),

            "alfora-ad-support-instructions":
                t("instructions"),

            "alfora-ad-support-network-note":
                t("networkNote")
        };

        Object.entries(
            translations
        ).forEach(
            ([id, value]) => {
                const element =
                    document.getElementById(
                        id
                    );

                if (element) {
                    element.textContent =
                        value;
                }
            }
        );

        const close =
            document.getElementById(
                "alfora-ad-support-close"
            );

        if (close) {
            close.setAttribute(
                "aria-label",
                t("closeAria")
            );
        }
    }

    function closePopup() {
        if (!popupElement) {
            return;
        }

        popupElement.remove();
        popupElement = null;
    }

    function showPopup(reason) {
        if (
            alreadyShown() ||
            popupElement
        ) {
            return;
        }

        markShown();
        injectStyles();

        const overlay =
            document.createElement("div");

        overlay.id =
            "alfora-ad-support-overlay";

        const dialog =
            document.createElement("section");

        dialog.id =
            "alfora-ad-support-dialog";

        dialog.setAttribute(
            "role",
            "dialog"
        );

        dialog.setAttribute(
            "aria-modal",
            "true"
        );

        dialog.setAttribute(
            "aria-labelledby",
            "alfora-ad-support-title"
        );

        dialog.innerHTML = `
      <button
        type="button"
        id="alfora-ad-support-close"
        aria-label=""
      >
        ×
      </button>

      <div
        class="alfora-ad-support-icon"
        aria-hidden="true"
      >
        ♡
      </div>

      <h2
        id="alfora-ad-support-title"
      ></h2>

      <p
        id="alfora-ad-support-message"
      ></p>

      <div
        id="alfora-ad-support-actions"
      >
        <button
          type="button"
          class="alfora-ad-support-btn"
          id="alfora-ad-support-allow"
        ></button>

        <button
          type="button"
          class="alfora-ad-support-btn"
          id="alfora-ad-support-continue"
        ></button>
      </div>

      <div
        id="alfora-ad-support-instructions-box"
      >
        <h3
          id="alfora-ad-support-instructions-title"
        ></h3>

        <p
          id="alfora-ad-support-instructions"
        ></p>

        <p
          id="alfora-ad-support-network-note"
        ></p>

        <button
          type="button"
          class="alfora-ad-support-btn"
          id="alfora-ad-support-donate"
        ></button>
      </div>
    `;

        overlay.appendChild(
            dialog
        );

        document.body.appendChild(
            overlay
        );

        popupElement = overlay;

        updatePopupLanguage();

        const instructionsBox =
            document.getElementById(
                "alfora-ad-support-instructions-box"
            );

        document
            .getElementById(
                "alfora-ad-support-allow"
            )
            ?.addEventListener(
                "click",
                () => {
                    instructionsBox
                        ?.classList
                        .toggle(
                            "is-visible"
                        );
                }
            );

        document
            .getElementById(
                "alfora-ad-support-continue"
            )
            ?.addEventListener(
                "click",
                closePopup
            );

        document
            .getElementById(
                "alfora-ad-support-close"
            )
            ?.addEventListener(
                "click",
                closePopup
            );

        document
            .getElementById(
                "alfora-ad-support-donate"
            )
            ?.addEventListener(
                "click",
                () => {
                    window.location.href =
                        CONFIG.donationsUrl;
                }
            );

        const escapeHandler =
            (event) => {
                if (
                    event.key ===
                    "Escape"
                ) {
                    closePopup();

                    document
                        .removeEventListener(
                            "keydown",
                            escapeHandler
                        );
                }
            };

        document.addEventListener(
            "keydown",
            escapeHandler
        );

        window.dispatchEvent(
            new CustomEvent(
                "alfora:ad-support-shown",
                {
                    detail: {
                        reason,
                        language:
                            getLanguage()
                    }
                }
            )
        );
    }

    async function runDetection() {
        if (
            !document.body ||
            alreadyShown()
        ) {
            return;
        }

        /*
         * Si esta página no utiliza AdSense,
         * el detector no hace nada.
         */
        if (!pageUsesAdsense()) {
            return;
        }

        const bait =
            createBait();

        await new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    CONFIG.baitDelayMs
                )
        );

        const blocked =
            baitWasBlocked(bait);

        bait?.remove();

        /*
         * Señal fuerte de bloqueo:
         * el elemento cebo fue ocultado
         * o eliminado.
         */
        if (blocked) {
            showPopup(
                "blocking-detected"
            );

            return;
        }

        /*
         * Esperamos a que Auto Ads
         * tenga tiempo para cargar.
         */
        await new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    CONFIG.checkDelayMs
                )
        );

        const state =
            classifyState(false);

        if (state.unavailable) {
            showPopup(
                state.reason
            );
        }
    }

    /*
     * Si el usuario cambia ES ↔ EN
     * mientras el popup está abierto,
     * el contenido se actualiza.
     */
    document.addEventListener(
        "creativeLab:languageChanged",
        () => {
            updatePopupLanguage();
        }
    );

    function init() {
        if (
            document.readyState ===
            "complete"
        ) {
            runDetection();
        } else {
            window.addEventListener(
                "load",
                runDetection,
                {
                    once: true
                }
            );
        }
    }

    init();

    /*
     * API opcional para probar
     * desde la consola del navegador.
     *
     * AlforaAdSupport.test()
     */
    window.AlforaAdSupport = {
        test() {
            showPopup(
                "manual-test"
            );
        },

        detect() {
            runDetection();
        },

        close() {
            closePopup();
        }
    };
})();