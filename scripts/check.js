    (function () {
      const DEFAULTS = {
        bgColor: '#f4f4f6',
        textColor: '#101115',
        gray10: '#ffffff',
        gray20: '#f5f5f7',
        gray30: '#ededed',
        accentColor: '#18cf88',
        primaryColor: '#4b2ca3',
        hoverColor: '#371982',
        pressedColor: '#2b1368',
        gradientColor: '#32c5ff',
        fontFamily: 'Inter, Arial, sans-serif',
        fontScale: 100,
        radius: 12,
        slant: 0,
        borderWidth: 1.5,
        shadow: 22,
        glassOpacity: 18,
        blur: 14,
        overrides: {},
        uploadedFontName: '',
        uploadedFontDataUrl: ''
      };

      const state = JSON.parse(JSON.stringify(DEFAULTS));

      const preview = document.getElementById('ui-preview');
      const previewShell = document.getElementById('ui-preview-shell');
      const magnifier = document.getElementById('ui-preview-magnifier');
      const magnifierContent = document.getElementById('ui-preview-magnifier-content');
      const fontUploadStatus = document.getElementById('font-upload-status');
      const overrideNote = document.getElementById('override-note');
      const rootCssOutput = document.getElementById('root-css-output');
      const copyCssStatus = document.getElementById('copy-css-status');
      const projectInput = document.getElementById('load-alfora-ui');
      const projectLoadStatus = document.getElementById('project-load-status');
      const ALFORA_PROJECT_FORMAT = 'alfora-ui-kit';
      const ALFORA_PROJECT_VERSION = 1;

      const fields = {
        bgColor: document.getElementById('bg-color'),
        textColor: document.getElementById('text-color'),
        gray10: document.getElementById('gray10'),
        gray20: document.getElementById('gray20'),
        gray30: document.getElementById('gray30'),
        accentColor: document.getElementById('accent-color'),
        primaryColor: document.getElementById('primary-color'),
        hoverColor: document.getElementById('hover-color'),
        pressedColor: document.getElementById('pressed-color'),
        gradientColor: document.getElementById('gradient-color'),
        fontFamily: document.getElementById('font-family'),
        fontScale: document.getElementById('font-scale'),
        radius: document.getElementById('radius'),
        slant: document.getElementById('slant'),
        borderWidth: document.getElementById('border-width'),
        shadow: document.getElementById('shadow'),
        glassOpacity: document.getElementById('glass-opacity'),
        blur: document.getElementById('blur'),
        targetSelect: document.getElementById('target-select'),
        overrideFill: document.getElementById('override-fill'),
        overrideText: document.getElementById('override-text'),
        overrideStroke: document.getElementById('override-stroke'),
        overrideRadius: document.getElementById('override-radius'),
        overrideOpacity: document.getElementById('override-opacity'),
        fontUpload: document.getElementById('font-upload')
      };

      const readoutIds = {
        fontScale: 'font-scale-value',
        radius: 'radius-value',
        slant: 'slant-value',
        borderWidth: 'border-width-value',
        shadow: 'shadow-value',
        glassOpacity: 'glass-opacity-value',
        blur: 'blur-value',
        overrideRadius: 'override-radius-value',
        overrideOpacity: 'override-opacity-value'
      };

      function setReadout(id, value) {
        const node = document.getElementById(readoutIds[id]);
        if (node) node.textContent = value;
      }

      function updateReadouts() {
        setReadout('fontScale', state.fontScale + '%');
        setReadout('radius', state.radius + ' px');
        setReadout('slant', state.slant + '°');
        setReadout('borderWidth', state.borderWidth + ' px');
        setReadout('shadow', state.shadow + '%');
        setReadout('glassOpacity', state.glassOpacity + '%');
        setReadout('blur', state.blur + ' px');
        setReadout('overrideRadius', fields.overrideRadius.value + ' px');
        setReadout('overrideOpacity', fields.overrideOpacity.value + '%');
      }

      function bindField(key, parser = (value) => value) {
        const field = fields[key];
        if (!field) return;
        field.addEventListener('input', () => {
          state[key] = parser(field.value);
          if (key === 'fontFamily') {
            state.uploadedFontName = '';
            state.uploadedFontDataUrl = '';
            fontUploadStatus.hidden = true;
          }
          updateReadouts();
          render();
        });
      }

      bindField('bgColor');
      bindField('textColor');
      bindField('gray10');
      bindField('gray20');
      bindField('gray30');
      bindField('accentColor');
      bindField('primaryColor');
      bindField('hoverColor');
      bindField('pressedColor');
      bindField('gradientColor');
      bindField('fontFamily');
      bindField('fontScale', (value) => Number(value));
      bindField('radius', (value) => Number(value));
      bindField('slant', (value) => Number(value));
      bindField('borderWidth', (value) => Number(value));
      bindField('shadow', (value) => Number(value));
      bindField('glassOpacity', (value) => Number(value));
      bindField('blur', (value) => Number(value));

      fields.fontUpload.addEventListener('change', async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result;
          const familyName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'CustomFont';
          try {
            const fontFace = new FontFace(familyName, `url(${dataUrl})`);
            await fontFace.load();
            document.fonts.add(fontFace);
            state.fontFamily = `'${familyName}', Inter, Arial, sans-serif`;
            state.uploadedFontName = familyName;
            state.uploadedFontDataUrl = dataUrl;
            const exists = Array.from(fields.fontFamily.options).some((option) => option.value === state.fontFamily);
            if (!exists) {
              const option = document.createElement('option');
              option.value = state.fontFamily;
              option.textContent = familyName + ' (custom)';
              fields.fontFamily.appendChild(option);
            }
            fields.fontFamily.value = state.fontFamily;
            fontUploadStatus.hidden = false;
            fontUploadStatus.textContent = `Fuente cargada: ${familyName}`;
            render();
          } catch (error) {
            console.error(error);
            fontUploadStatus.hidden = false;
            fontUploadStatus.textContent = 'No se pudo cargar esta fuente.';
          }
        };
        reader.readAsDataURL(file);
      });

      document.getElementById('apply-override').addEventListener('click', () => {
        const target = fields.targetSelect.value;
        state.overrides[target] = {
          fill: fields.overrideFill.value,
          text: fields.overrideText.value,
          stroke: fields.overrideStroke.value,
          radius: Number(fields.overrideRadius.value),
          opacity: Number(fields.overrideOpacity.value) / 100
        };
        overrideNote.textContent = `Variación aplicada a ${fields.targetSelect.options[fields.targetSelect.selectedIndex].text}.`;
        render();
      });

      document.getElementById('remove-override').addEventListener('click', () => {
        const target = fields.targetSelect.value;
        delete state.overrides[target];
        overrideNote.textContent = `Se eliminó la variación de ${fields.targetSelect.options[fields.targetSelect.selectedIndex].text}.`;
        render();
      });

      function escapeXmlText(value) {
        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }

      function createProjectData() {
        return {
          generator: 'Alfora UI Kit',
          website: 'https://alfora.art',
          format: ALFORA_PROJECT_FORMAT,
          version: ALFORA_PROJECT_VERSION,
          savedAt: new Date().toISOString(),
          state: JSON.parse(JSON.stringify(state))
        };
      }

      function createProjectMetadata() {
        return `<metadata id="alfora-ui-kit-project">${escapeXmlText(JSON.stringify(createProjectData()))}</metadata>`;
      }

      function setProjectStatus(message, type = '') {
        projectLoadStatus.textContent = message;
        projectLoadStatus.classList.remove('is-success', 'is-error');
        if (type) projectLoadStatus.classList.add(`is-${type}`);
      }

      async function restoreUploadedFont() {
        if (!state.uploadedFontName || !state.uploadedFontDataUrl) {
          fontUploadStatus.hidden = true;
          return;
        }

        try {
          const fontFace = new FontFace(state.uploadedFontName, `url(${state.uploadedFontDataUrl})`);
          await fontFace.load();
          document.fonts.add(fontFace);
          const fontValue = `'${state.uploadedFontName}', Inter, Arial, sans-serif`;
          state.fontFamily = fontValue;
          const exists = Array.from(fields.fontFamily.options).some((option) => option.value === fontValue);
          if (!exists) {
            const option = document.createElement('option');
            option.value = fontValue;
            option.textContent = state.uploadedFontName + ' (custom)';
            fields.fontFamily.appendChild(option);
          }
          fontUploadStatus.hidden = false;
          fontUploadStatus.textContent = `Fuente recuperada: ${state.uploadedFontName}`;
        } catch (error) {
          console.warn('Alfora UI Kit: no se pudo restaurar la fuente incluida.', error);
          fontUploadStatus.hidden = false;
          fontUploadStatus.textContent = 'El proyecto se restauró, pero la fuente personalizada no pudo cargarse.';
        }
      }

      async function syncStateToControls() {
        const stateKeys = [
          'bgColor', 'textColor', 'gray10', 'gray20', 'gray30',
          'accentColor', 'primaryColor', 'hoverColor', 'pressedColor',
          'gradientColor', 'fontFamily', 'fontScale', 'radius', 'slant',
          'borderWidth', 'shadow', 'glassOpacity', 'blur'
        ];

        await restoreUploadedFont();

        stateKeys.forEach((key) => {
          if (fields[key] && state[key] !== undefined && state[key] !== null) {
            fields[key].value = state[key];
          }
        });

        fields.fontUpload.value = '';
        updateReadouts();
        render();
      }

      function normalizeLoadedState(loadedState) {
        const next = JSON.parse(JSON.stringify(DEFAULTS));
        if (!loadedState || typeof loadedState !== 'object') return next;

        Object.keys(next).forEach((key) => {
          if (loadedState[key] !== undefined) next[key] = loadedState[key];
        });

        if (!next.overrides || typeof next.overrides !== 'object' || Array.isArray(next.overrides)) {
          next.overrides = {};
        }
        return next;
      }

      projectInput.addEventListener('change', async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        setProjectStatus('Leyendo UI Kit de Alfora…');

        try {
          const svgText = await file.text();
          const parser = new DOMParser();
          const svgDocument = parser.parseFromString(svgText, 'image/svg+xml');
          const parseError = svgDocument.querySelector('parsererror');
          if (parseError) throw new Error('invalid-svg');

          const metadata = svgDocument.getElementById('alfora-ui-kit-project');
          if (!metadata) throw new Error('not-alfora');

          const projectData = JSON.parse(metadata.textContent || '');
          if (projectData.format !== ALFORA_PROJECT_FORMAT || !projectData.state) {
            throw new Error('not-alfora');
          }

          if (Number(projectData.version) > ALFORA_PROJECT_VERSION) {
            throw new Error('future-version');
          }

          const restored = normalizeLoadedState(projectData.state);
          Object.keys(state).forEach((key) => delete state[key]);
          Object.assign(state, restored);
          await syncStateToControls();
          overrideNote.textContent = '';
          setProjectStatus('UI Kit de Alfora cargado. La configuración y root.css fueron restaurados.', 'success');
        } catch (error) {
          console.warn('Alfora UI Kit: no se pudo abrir el proyecto.', error);
          if (error.message === 'future-version') {
            setProjectStatus('Este UI Kit fue creado con una versión más nueva del formato de Alfora.', 'error');
          } else if (error.message === 'not-alfora') {
            setProjectStatus('Este SVG no contiene una configuración compatible con Alfora UI Kit.', 'error');
          } else {
            setProjectStatus('No fue posible leer este archivo SVG. Selecciona un UI Kit exportado desde Alfora.', 'error');
          }
        } finally {
          event.target.value = '';
        }
      });

      function downloadTextFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }

      document.getElementById('download-ui').addEventListener('click', () => {
        downloadTextFile(generateSvg(), 'alfora-ui-kit.svg', 'image/svg+xml;charset=utf-8');
        window.setTimeout(() => {
          downloadTextFile(generateRootCss(), 'root.css', 'text/css;charset=utf-8');
        }, 180);
      });

      document.getElementById('download-root-css').addEventListener('click', () => {
        downloadTextFile(generateRootCss(), 'root.css', 'text/css;charset=utf-8');
      });

      document.getElementById('copy-root-css').addEventListener('click', async () => {
        const css = generateRootCss();
        try {
          await navigator.clipboard.writeText(css);
          copyCssStatus.textContent = 'CSS copiado al portapapeles.';
        } catch (error) {
          const textarea = document.createElement('textarea');
          textarea.value = css;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          textarea.remove();
          copyCssStatus.textContent = 'CSS copiado al portapapeles.';
        }
        window.setTimeout(() => { copyCssStatus.textContent = ''; }, 2500);
      });

      document.getElementById('reset-ui').addEventListener('click', () => {
        Object.assign(state, JSON.parse(JSON.stringify(DEFAULTS)));
        Object.entries(fields).forEach(([key, field]) => {
          if (!field) return;
          if (field.type === 'file') {
            field.value = '';
          } else if (DEFAULTS[key] !== undefined) {
            field.value = DEFAULTS[key];
          }
        });
        fontUploadStatus.hidden = true;
        overrideNote.textContent = '';
        setProjectStatus('');
        fields.overrideFill.value = '#4b2ca3';
        fields.overrideText.value = '#ffffff';
        fields.overrideStroke.value = '#4b2ca3';
        fields.overrideRadius.value = '12';
        fields.overrideOpacity.value = '100';
        updateReadouts();
        render();
      });

      function colorWithAlpha(hex, alpha) {
        const value = hex.replace('#', '');
        const bigint = parseInt(value, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }

      function getStyle(target, base) {
        const override = state.overrides[target] || {};
        return {
          fill: override.fill || base.fill,
          text: override.text || base.text,
          stroke: override.stroke || base.stroke,
          radius: override.radius != null ? override.radius : base.radius,
          opacity: override.opacity != null ? override.opacity : (base.opacity != null ? base.opacity : 1)
        };
      }

      function lineHeight(multiplier) {
        return Math.round(multiplier * (state.fontScale / 100));
      }

      function buttonMarkup({ x, y, w, h, label, target, mode = 'filled', arrow = false, iconOnly = false, disabled = false }) {
        const base = {
          fill: state.primaryColor,
          text: '#ffffff',
          stroke: state.primaryColor,
          radius: state.radius,
          opacity: 1
        };
        const style = getStyle(target, base);
        let fill = style.fill;
        let stroke = style.stroke;
        let text = style.text;
        let opacity = disabled ? 0.35 : style.opacity;
        let filter = '';
        let bgOpacity = opacity;

        if (mode === 'gradient') {
          fill = 'url(#alforaGradient)';
          stroke = style.stroke;
          text = style.text;
        } else if (mode === 'outline') {
          fill = state.gray10;
          stroke = style.stroke;
          text = style.stroke;
        } else if (mode === 'soft') {
          fill = colorWithAlpha(style.fill, 0.12);
          stroke = colorWithAlpha(style.fill, 0.32);
          text = style.stroke;
        } else if (mode === 'glass') {
          fill = colorWithAlpha(style.fill, state.glassOpacity / 100);
          stroke = colorWithAlpha(style.stroke, 0.35);
          text = style.stroke;
          filter = ' filter="url(#glassShadow)"';
          bgOpacity = disabled ? 0.25 : style.opacity;
        } else if (mode === 'disabled') {
          fill = state.gray30;
          stroke = state.gray30;
          text = '#9f9fa8';
          opacity = 1;
        }

        const icon = arrow ? '&#8594;' : '';
        const labelX = iconOnly ? w / 2 : 18;
        const textAnchor = iconOnly ? 'middle' : 'start';
        const yText = h / 2 + 6;

        const textNode = iconOnly
          ? `<text x="${labelX}" y="${yText}" font-size="18" font-weight="700" fill="${text}" text-anchor="${textAnchor}">${icon || '&#8594;'}</text>`
          : `<text x="${labelX}" y="${yText}" font-size="16" font-weight="700" fill="${text}" text-anchor="${textAnchor}">${label}</text>${arrow ? `<text x="${w - 22}" y="${yText}" font-size="18" font-weight="700" fill="${text}" text-anchor="middle">&#8594;</text>` : ''}`;

        return `
          <g transform="translate(${x} ${y}) skewX(${state.slant})" opacity="${opacity}">
            <rect x="0" y="0" width="${w}" height="${h}" rx="${style.radius}" fill="${fill}" fill-opacity="${bgOpacity}" stroke="${stroke}" stroke-width="${state.borderWidth}"${filter}></rect>
            ${textNode}
          </g>
        `;
      }

      function checkboxMarkup(x, y, checked, radio = false, target = 'checkbox', label = 'Label', muted = false) {
        const base = {
          fill: checked ? state.primaryColor : state.gray10,
          text: muted ? '#b9b9c0' : '#42424a',
          stroke: checked ? state.primaryColor : '#c7c7cf',
          radius: radio ? 999 : Math.max(4, state.radius - 4),
          opacity: 1
        };
        const style = getStyle(target, base);
        const shape = radio
          ? `<circle cx="12" cy="12" r="8" fill="${checked ? style.fill : state.gray10}" stroke="${style.stroke}" stroke-width="1.8"></circle>${checked ? `<circle cx="12" cy="12" r="4" fill="${style.text === '#ffffff' ? '#ffffff' : style.fill}"></circle>` : ''}`
          : `<rect x="4" y="4" width="16" height="16" rx="${style.radius}" fill="${checked ? style.fill : state.gray10}" stroke="${style.stroke}" stroke-width="1.8"></rect>${checked ? `<path d="M8 12.5l3 3 6-7" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>` : ''}`;
        return `<g transform="translate(${x} ${y})">${shape}<text x="34" y="17" font-size="14" fill="${style.text}" font-weight="500">${label}</text></g>`;
      }

      function smallCheckboxList() {
        return `
          <g>
            <text x="1110" y="590" font-size="18" font-weight="700" fill="#555560">Checklist</text>
            <rect x="1090" y="610" width="190" height="190" rx="18" fill="${state.gray10}" stroke="${state.gray30}" stroke-width="1.3"></rect>
            ${checkboxMarkup(1112, 630, false, false, 'checkbox', 'Select')}
            ${checkboxMarkup(1112, 664, false, false, 'checkbox', 'Select')}
            <rect x="1102" y="690" width="166" height="26" rx="8" fill="${colorWithAlpha(state.primaryColor, 0.10)}"></rect>
            ${checkboxMarkup(1112, 693, true, false, 'checkbox', 'Selected')}
            ${checkboxMarkup(1112, 730, false, false, 'checkbox', 'Select')}
            <rect x="1102" y="756" width="166" height="26" rx="8" fill="${colorWithAlpha(state.primaryColor, 0.10)}"></rect>
            ${checkboxMarkup(1112, 759, true, false, 'checkbox', 'Selected')}
          </g>
        `;
      }

      function inputMarkup(x, y, label, placeholder, error = false) {
        const style = getStyle('input', {
          fill: state.gray10,
          text: '#81818b',
          stroke: error ? '#ff6b6b' : '#d7d7de',
          radius: Math.max(10, state.radius),
          opacity: 1
        });
        return `
          <g transform="translate(${x} ${y})">
            <text x="0" y="0" font-size="16" font-weight="700" fill="#555560">${label}</text>
            <rect x="0" y="12" width="250" height="42" rx="${style.radius}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${state.borderWidth}"></rect>
            <text x="14" y="39" font-size="14" fill="${style.text}">${placeholder}</text>
            ${error ? `<text x="228" y="40" font-size="16" fill="#ff6b6b">&#9888;</text><text x="0" y="70" font-size="12" fill="#ff6b6b">helper_text_input</text>` : `<text x="0" y="70" font-size="12" fill="#b3b3bb">helper_text_input</text>`}
          </g>
        `;
      }

      function accordionMarkup() {
        const style = getStyle('accordion', {
          fill: state.primaryColor,
          text: '#ffffff',
          stroke: state.primaryColor,
          radius: Math.max(14, state.radius + 4),
          opacity: 1
        });
        const softFill = colorWithAlpha(style.fill, 0.10);
        const disabledFill = colorWithAlpha('#d9d9de', 0.55);
        return `
          <g>
            <text x="735" y="430" font-size="18" font-weight="700" fill="#555560">Accordion menu</text>
            <rect x="720" y="450" width="330" height="470" rx="20" fill="${state.gray10}" stroke="${state.gray30}" stroke-width="1.4"></rect>
            <g transform="translate(745 480)">
              <text x="0" y="0" font-size="16" fill="#565662">&#9992;</text><text x="24" y="0" font-size="16" fill="#42424a">Airplan</text><text x="190" y="0" font-size="16" fill="#787884">&#709;</text>
              <text x="0" y="42" font-size="16" fill="#565662">&#9201;</text><text x="24" y="42" font-size="16" fill="#42424a">Clock</text>
              <text x="0" y="84" font-size="16" fill="#565662">&#9634;</text><text x="24" y="84" font-size="16" fill="#42424a">Archive</text><text x="190" y="84" font-size="16" fill="#787884">&#709;</text>
            </g>
            <g transform="translate(740 588)">
              <rect x="0" y="0" width="242" height="40" rx="${style.radius}" fill="${style.fill}" fill-opacity="${style.opacity}" stroke="${style.stroke}" stroke-width="${state.borderWidth}"></rect>
              <text x="18" y="25" font-size="15" fill="${style.text}">&#9776;  Menu item</text>
              <text x="218" y="25" font-size="16" fill="${style.text}">&#708;</text>
            </g>
            <g transform="translate(790 650)">
              <text x="0" y="0" font-size="16" fill="#4d4d56">Menu item</text>
              <text x="0" y="40" font-size="16" fill="#4d4d56">Menu item</text>
              <text x="0" y="80" font-size="16" fill="#4d4d56">Menu item</text>
              <rect x="-26" y="106" width="220" height="32" rx="10" fill="${disabledFill}"></rect>
              <text x="0" y="127" font-size="16" fill="#a2a2aa">Menu item</text>
              <text x="-26" y="170" font-size="16" fill="#4d4d56">&#9963;  Bank</text>
            </g>
            <g transform="translate(740 846)">
              <rect x="0" y="0" width="242" height="40" rx="${Math.max(10, state.radius)}" fill="${softFill}" stroke="${colorWithAlpha(style.stroke, 0.25)}" stroke-width="${state.borderWidth}"></rect>
              <text x="18" y="25" font-size="15" fill="#8d8d95">&#9998;  Note</text>
              <text x="218" y="25" font-size="16" fill="#8d8d95">&#709;</text>
            </g>
          </g>
        `;
      }

      function alforaBrand() {
        const fontSize = Math.round(76 * (state.fontScale / 100));
        const subSize = Math.round(18 * (state.fontScale / 100));
        return `
          <g transform="translate(80 72)">
            <image href="https://alfora.art/src/logo.svg" x="0" y="0" width="76" height="76" preserveAspectRatio="xMidYMid meet"></image>
            <text x="0" y="164" font-size="${fontSize}" font-weight="800" fill="${state.textColor}">UI Kit Alfora</text>
            <text x="0" y="198" font-size="${subSize}" font-weight="600" fill="#70707a">www.alfora.art</text>
            ${checkboxMarkup(4, 242, true, false, 'checkbox', 'style')}
            ${checkboxMarkup(4, 286, true, false, 'checkbox', 'component')}
            ${checkboxMarkup(4, 330, true, false, 'checkbox', 'variant')}
            ${checkboxMarkup(4, 374, true, false, 'checkbox', 'auto layout')}
          </g>
        `;
      }

      function buttonsBlock() {
        const startX = 660;
        const startY = 70;
        const colGap = 132;
        const rowGap = 48;
        const modes = [
          { target: 'primaryFilled', mode: 'filled' },
          { target: 'gradientFilled', mode: 'gradient' },
          { target: 'outline', mode: 'outline' },
          { target: 'glassFilled', mode: 'glass' },
          { target: 'primaryFilled', mode: 'disabled' }
        ];
        let markup = '<text x="660" y="44" font-size="18" font-weight="700" fill="#555560">Button variants</text>';
        modes.forEach((item, index) => {
          const x = startX + index * colGap;
          markup += buttonMarkup({ x, y: startY, w: 82, h: 36, label: 'Button', target: item.target, mode: item.mode });
          markup += buttonMarkup({ x, y: startY + rowGap, w: 112, h: 36, label: 'Button', target: item.target, mode: item.mode, arrow: true });
          markup += buttonMarkup({ x, y: startY + rowGap * 2, w: 36, h: 36, label: '', target: item.target, mode: item.mode, arrow: true, iconOnly: true });
          const secondaryMode = index === 0 ? 'soft' : item.mode === 'disabled' ? 'disabled' : 'outline';
          markup += buttonMarkup({ x, y: startY + rowGap * 3 + 16, w: 82, h: 36, label: 'Button', target: item.target, mode: secondaryMode });
          markup += buttonMarkup({ x, y: startY + rowGap * 4 + 16, w: 112, h: 36, label: 'Button', target: item.target, mode: secondaryMode, arrow: true });
          markup += buttonMarkup({ x, y: startY + rowGap * 5 + 16, w: 36, h: 36, label: '', target: item.target, mode: secondaryMode, arrow: true, iconOnly: true });
        });
        return markup;
      }

      function colorStylesBlock() {
        return `
          <g transform="translate(1640 62)">
            <text x="0" y="0" font-size="28" font-weight="700" fill="#3f3f46">Color Style</text>
            <text x="0" y="50" font-size="18" font-weight="700" fill="#4f4f56">Gray</text>
            ${swatch(0, 64, state.gray10, 'Gray / 10', state.gray10)}
            ${swatch(72, 64, state.gray20, 'Gray / 20', state.gray20)}
            ${swatch(144, 64, state.gray30, 'Gray / 30', state.gray30)}
            <text x="0" y="180" font-size="18" font-weight="700" fill="#4f4f56">Primary</text>
            ${swatch(0, 194, state.primaryColor, 'Primary Main', state.primaryColor)}
            ${swatch(72, 194, state.hoverColor, 'Primary Hover', state.hoverColor)}
            ${swatch(144, 194, state.pressedColor, 'Primary Pressed', state.pressedColor)}
            <text x="0" y="310" font-size="18" font-weight="700" fill="#4f4f56">Extra</text>
            ${swatch(0, 324, state.gradientColor, 'Gradient B', state.gradientColor)}
            ${swatch(72, 324, state.accentColor, 'Accent', state.accentColor)}
            ${swatch(144, 324, state.textColor, 'Text', state.textColor)}
          </g>
        `;
      }

      function swatch(x, y, color, label, code) {
        return `
          <g transform="translate(${x} ${y})">
            <rect x="0" y="0" width="44" height="44" rx="8" fill="${color}" stroke="${color === state.gray10 ? '#e5e5ea' : 'transparent'}"></rect>
            <text x="0" y="63" font-size="11" fill="#5c5c66">${label}</text>
            <text x="0" y="78" font-size="10" fill="#8a8a94">${code.toUpperCase()}</text>
          </g>
        `;
      }

      function togglesBlock() {
        return `
          <g>
            <text x="1090" y="432" font-size="18" font-weight="700" fill="#555560">Selections</text>
            ${checkboxMarkup(1090, 455, false, true, 'checkbox', 'Label')}
            ${checkboxMarkup(1180, 455, true, true, 'checkbox', 'Label')}
            ${checkboxMarkup(1270, 455, false, true, 'checkbox', 'Label', true)}
            ${checkboxMarkup(1360, 455, true, true, 'checkbox', 'Label')}
            ${checkboxMarkup(1450, 455, false, false, 'checkbox', 'Label')}
            ${checkboxMarkup(1545, 455, true, false, 'checkbox', 'Label')}
          </g>
        `;
      }

      function stylesTable() {
        const scale = state.fontScale / 100;
        return `
          <g transform="translate(1370 565)">
            <text x="0" y="0" font-size="32" font-weight="700" fill="#3f3f46">Styles</text>
            <text x="0" y="52" font-size="18" font-weight="700" fill="#4f4f56">Body Large</text>
            <rect x="0" y="68" width="330" height="126" rx="12" fill="${state.gray20}" stroke="#e5e5ea"></rect>
            <rect x="0" y="68" width="330" height="32" rx="12" fill="${state.gray30}"></rect>
            <text x="12" y="90" font-size="13" fill="#5c5c66">Style Name</text>
            <text x="252" y="90" font-size="13" fill="#5c5c66">Font Size</text>
            <text x="12" y="134" font-size="16" fill="#555560">Body Regular</text>
            <text x="274" y="134" font-size="16" fill="#555560">${Math.round(16 * scale)}</text>
            <line x1="0" y1="148" x2="330" y2="148" stroke="#dfdfe5"></line>
            <text x="12" y="176" font-size="16" fill="#555560">Body Medium</text>
            <text x="274" y="176" font-size="16" fill="#555560">${Math.round(16 * scale)}</text>
          </g>

          <g transform="translate(1450 825)">
            <rect x="0" y="0" width="390" height="220" rx="18" fill="${state.gray10}" stroke="${state.gray30}" filter="url(#softShadow)"></rect>
            <path d="M28 28L36 42H20Z" fill="#f5b423"></path>
            <text x="52" y="39" font-size="17" font-weight="700" fill="#222228">Modal Window</text>
            <text x="24" y="82" font-size="13" fill="#60606a">When you do something noble and beautiful and nobody</text>
            <text x="24" y="104" font-size="13" fill="#60606a">noticed, do not be sad. For the sun every morning is a</text>
            <text x="24" y="126" font-size="13" fill="#60606a">beautiful spectacle and yet most of the audience still</text>
            <text x="24" y="148" font-size="13" fill="#60606a">sleeps.</text>
            ${buttonMarkup({ x: 286, y: 170, w: 78, h: 32, label: 'Okay', target: 'primaryFilled', mode: 'filled' })}
          </g>
        `;
      }

      function tableBlock() {
        const tagStyle = getStyle('tag', {
          fill: colorWithAlpha(state.primaryColor, 0.08),
          text: state.primaryColor,
          stroke: colorWithAlpha(state.primaryColor, 0.35),
          radius: 999,
          opacity: 1
        });
        return `
          <g transform="translate(80 555)">
            <text x="0" y="0" font-size="18" font-weight="700" fill="#555560">Data table</text>
            <rect x="0" y="22" width="610" height="244" rx="18" fill="transparent"></rect>
            <rect x="0" y="22" width="610" height="50" rx="14" fill="${state.gray10}" stroke="${state.gray30}"></rect>
            <text x="20" y="53" font-size="16" fill="#4d4d56">&#9723;</text>
            <text x="58" y="53" font-size="14" font-weight="700" fill="#4d4d56">Name</text>
            <text x="433" y="53" font-size="14" font-weight="700" fill="#4d4d56">y/n</text>
            <text x="520" y="53" font-size="14" font-weight="700" fill="#4d4d56">Social</text>
            ${tableRow(0, 78, 'Wade Warren', 'fb', false, tagStyle)}
            ${tableRow(0, 125, 'Darrell Steward', 'in', false, { ...tagStyle, fill: colorWithAlpha('#ff6b6b', 0.08), stroke: colorWithAlpha('#ff6b6b', 0.35), text: '#ff4d4d' })}
            ${tableRow(0, 172, 'Devon Lane', 'fb', false, tagStyle)}
            <rect x="0" y="219" width="610" height="47" rx="14" fill="${colorWithAlpha(state.primaryColor, 0.12)}"></rect>
            ${tableRow(0, 219, 'Dianne Russell', 'fb', true, tagStyle)}
          </g>
        `;
      }

      function tableRow(x, y, name, social, checked, tagStyle) {
        return `
          <g transform="translate(${x} ${y})">
            ${checkboxMarkup(14, 6, checked, false, 'checkbox', '')}
            <text x="58" y="24" font-size="14" fill="#5a5a64">${name}</text>
            <rect x="423" y="7" width="42" height="22" rx="${Math.max(10, tagStyle.radius)}" fill="${tagStyle.fill}" stroke="${tagStyle.stroke}"></rect>
            <text x="444" y="22" text-anchor="middle" font-size="12" fill="${tagStyle.text}">Tag</text>
            <text x="532" y="24" font-size="16" fill="${state.primaryColor}">${social}</text>
          </g>
        `;
      }

      function svgStyleBlock() {
        return `
          <style>
            text { font-family: ${state.fontFamily}; dominant-baseline: alphabetic; }
          </style>
        `;
      }

      function embeddedFontBlock() {
        if (!state.uploadedFontName || !state.uploadedFontDataUrl) return '';
        return `<style>@font-face { font-family: '${state.uploadedFontName}'; src: url('${state.uploadedFontDataUrl}'); }</style>`;
      }

      function cssVariableName(target) {
        return String(target)
          .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
          .replace(/[^a-zA-Z0-9-]/g, '-')
          .toLowerCase();
      }

      function generateRootCss() {
        const fontFamily = state.uploadedFontName
          ? `'${state.uploadedFontName}', Inter, Arial, sans-serif`
          : state.fontFamily;
        const shadowOpacity = Math.max(0, Math.min(1, state.shadow / 100));
        const glassOpacity = Math.max(0, Math.min(1, state.glassOpacity / 100));

        const lines = [
          '/* Alfora UI Kit · Design Tokens */',
          '/* Generado en https://alfora.art */',
          '',
          ':root {',
          '  /* Colors */',
          `  --ui-background: ${state.bgColor};`,
          `  --ui-text: ${state.textColor};`,
          `  --ui-gray-10: ${state.gray10};`,
          `  --ui-gray-20: ${state.gray20};`,
          `  --ui-gray-30: ${state.gray30};`,
          `  --ui-primary: ${state.primaryColor};`,
          `  --ui-primary-hover: ${state.hoverColor};`,
          `  --ui-primary-pressed: ${state.pressedColor};`,
          `  --ui-accent: ${state.accentColor};`,
          `  --ui-gradient-secondary: ${state.gradientColor};`,
          '',
          '  /* Typography */',
          `  --ui-font-family: ${fontFamily};`,
          `  --ui-font-scale: ${Number(state.fontScale / 100).toFixed(2)};`,
          '',
          '  /* Shape & borders */',
          `  --ui-radius: ${state.radius}px;`,
          `  --ui-border-width: ${state.borderWidth}px;`,
          `  --ui-slant-angle: ${state.slant}deg;`,
          '',
          '  /* Effects */',
          `  --ui-shadow-opacity: ${shadowOpacity.toFixed(2)};`,
          `  --ui-shadow: 0 12px 32px rgba(0, 0, 0, ${shadowOpacity.toFixed(2)});`,
          `  --ui-glass-opacity: ${glassOpacity.toFixed(2)};`,
          `  --ui-backdrop-blur: ${state.blur}px;`,
          `  --ui-glass-background: color-mix(in srgb, var(--ui-primary) ${state.glassOpacity}%, transparent);`
        ];

        const entries = Object.entries(state.overrides || {});
        if (entries.length) {
          lines.push('', '  /* Individual component overrides */');
          entries.forEach(([target, override]) => {
            const name = cssVariableName(target);
            if (override.fill) lines.push(`  --ui-${name}-fill: ${override.fill};`);
            if (override.text) lines.push(`  --ui-${name}-text: ${override.text};`);
            if (override.stroke) lines.push(`  --ui-${name}-border: ${override.stroke};`);
            if (override.radius != null) lines.push(`  --ui-${name}-radius: ${override.radius}px;`);
            if (override.opacity != null) lines.push(`  --ui-${name}-opacity: ${Number(override.opacity).toFixed(2)};`);
          });
        }

        lines.push('}', '');
        return lines.join('\n');
      }

      function generateSvg() {
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" fill="none">
            ${createProjectMetadata()}
            <defs>
              <linearGradient id="alforaGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="${state.primaryColor}"></stop>
                <stop offset="100%" stop-color="${state.gradientColor}"></stop>
              </linearGradient>
              <filter id="glassShadow" x="-30%" y="-40%" width="160%" height="190%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="${Math.max(0, state.blur / 4)}"></feGaussianBlur>
                <feOffset dx="0" dy="${Math.max(1, state.shadow / 18)}" result="offsetblur"></feOffset>
                <feFlood flood-color="${colorWithAlpha('#000000', Math.max(0.08, state.shadow / 180))}"></feFlood>
                <feComposite in2="offsetblur" operator="in"></feComposite>
                <feMerge>
                  <feMergeNode></feMergeNode>
                  <feMergeNode in="SourceGraphic"></feMergeNode>
                </feMerge>
              </filter>
              <filter id="softShadow" x="-20%" y="-20%" width="140%" height="160%">
                <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="${colorWithAlpha('#000000', Math.max(0.05, state.shadow / 200))}"></feDropShadow>
              </filter>
            </defs>
            ${svgStyleBlock()}
            ${embeddedFontBlock()}
            <rect x="0" y="0" width="1920" height="1080" fill="${state.bgColor}"></rect>
            
            ${alforaBrand()}
            ${buttonsBlock()}
            ${colorStylesBlock()}
            ${togglesBlock()}
            ${accordionMarkup()}
            ${smallCheckboxList()}
            ${stylesTable()}
            ${tableBlock()}
            ${inputMarkup(1090, 850, 'Input_label', 'Placeholder_input', false)}
            ${inputMarkup(1090, 945, 'Input_label', 'Placeholder_input', true)}
          </svg>
        `.trim();
      }

      const magnifierZoom = 2.35;

      function syncMagnifier() {
        if (!magnifierContent) return;
        magnifierContent.innerHTML = generateSvg();
      }

      function hideMagnifier() {
        magnifier?.classList.remove('is-visible');
      }

      function updateMagnifier(event) {
        if (!previewShell || !magnifier || !magnifierContent) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 981px)').matches) {
          hideMagnifier();
          return;
        }

        const svg = preview.querySelector('svg');
        const lensSvg = magnifierContent.querySelector('svg');
        if (!svg || !lensSvg) return;

        const svgRect = svg.getBoundingClientRect();
        const shellRect = previewShell.getBoundingClientRect();

        const inside =
          event.clientX >= svgRect.left &&
          event.clientX <= svgRect.right &&
          event.clientY >= svgRect.top &&
          event.clientY <= svgRect.bottom;

        if (!inside) {
          hideMagnifier();
          return;
        }

        const localX = event.clientX - svgRect.left;
        const localY = event.clientY - svgRect.top;
        const shellX = event.clientX - shellRect.left + previewShell.scrollLeft;
        const shellY = event.clientY - shellRect.top + previewShell.scrollTop;

        magnifier.style.left = `${shellX}px`;
        magnifier.style.top = `${shellY}px`;

        const renderedWidth = svgRect.width;
        const renderedHeight = svgRect.height;
        lensSvg.style.width = `${renderedWidth}px`;
        lensSvg.style.height = `${renderedHeight}px`;

        const lensRadius = magnifier.offsetWidth / 2;
        const translateX = lensRadius - localX * magnifierZoom;
        const translateY = lensRadius - localY * magnifierZoom;

        magnifierContent.style.width = `${renderedWidth}px`;
        magnifierContent.style.height = `${renderedHeight}px`;
        magnifierContent.style.transform =
          `translate(${translateX}px, ${translateY}px) scale(${magnifierZoom})`;

        magnifier.classList.add('is-visible');
      }

      previewShell?.addEventListener('pointermove', updateMagnifier);
      previewShell?.addEventListener('pointerleave', hideMagnifier);
      previewShell?.addEventListener('scroll', hideMagnifier, { passive: true });
      window.addEventListener('resize', hideMagnifier, { passive: true });

      function render() {
        preview.innerHTML = generateSvg();
        if (rootCssOutput) {
          rootCssOutput.textContent = generateRootCss();
        }
        syncMagnifier();
        hideMagnifier();
      }

      updateReadouts();
      render();
    })();