ALFORA
README DE ESTRUCTURA Y CREACIÓN DE NUEVOS SERVICIOS

==================================================
1. DESCRIPCIÓN GENERAL
==================================================

Alfora es una plataforma bilingüe de herramientas creativas desarrollada con:

- HTML
- CSS
- JavaScript
- JSON
- APIs nativas del navegador
- Librerías externas únicamente cuando una herramienta concreta lo requiere

La plataforma está diseñada para ofrecer servicios independientes, rápidos y fáciles de usar desde el navegador.

Cada servicio funciona como una página individual, pero comparte:

- La cabecera
- El sistema visual
- El sistema de idiomas
- Los componentes comunes
- La navegación hacia el portafolio principal
- Los estilos generales


==================================================
2. ESTRUCTURA GENERAL DEL PROYECTO
==================================================

La estructura recomendada del proyecto es:

/
├── index.html
├── nombre-del-servicio.html
├── otro-servicio.html
│
├── styles/
│   └── main.css
│
├── scripts/
│   ├── language.js
│   └── shared.js
│
├── jsons/
│   ├── common-es.json
│   ├── common-en.json
│   ├── nombre-del-servicio-es.json
│   ├── nombre-del-servicio-en.json
│   ├── otro-servicio-es.json
│   └── otro-servicio-en.json
│
├── src/
│   ├── logo.svg
│   ├── favicon.ico
│   ├── imágenes
│   ├── iconos
│   └── portadas
│
├── robots.txt
├── sitemap.xml
└── README.txt


==================================================
3. ARCHIVOS PRINCIPALES
==================================================

index.html

Es la página principal de la plataforma.

Contiene:

- Presentación de Alfora
- Categorías
- Tarjetas de herramientas
- Sección acerca de
- Publicidad
- Footer
- Navegación interna por anclas

Cada nuevo servicio debe aparecer en el index mediante una tarjeta.


styles/main.css

Es el archivo principal de estilos compartidos.

Contiene:

- Variables globales
- Colores
- Tipografías
- Espaciados
- Cabecera
- Botones
- Tarjetas
- Formularios
- Secciones
- Componentes reutilizables
- Responsive
- Accesibilidad
- Estilos específicos de cada producto

Los estilos de cada servicio deben agregarse al final del archivo, dentro de una sección claramente identificada.

Ejemplo:

/* ==========================================================================
   PRODUCTO: NOMBRE DEL SERVICIO
   ========================================================================== */


scripts/language.js

Controla el sistema bilingüe.

Su responsabilidad es:

- Detectar el idioma
- Cargar common-es.json o common-en.json
- Cargar el JSON del producto activo
- Aplicar textos mediante data-i18n
- Aplicar aria-label y alt traducibles
- Guardar el idioma elegido
- Emitir el evento creativeLab:languageChanged


scripts/shared.js

Contiene comportamientos compartidos.

Puede incluir:

- Menú móvil
- Navegación
- Efectos visuales
- Partículas
- Componentes generales
- Utilidades comunes


jsons/common-es.json y common-en.json

Contienen textos compartidos por toda la plataforma.

Ejemplos:

- Nombre de la marca
- Alt del logo
- Saltar al contenido
- Regresar al portafolio
- Idioma
- Publicidad
- Abrir herramienta
- Botones comunes
- Textos del footer


JSON de cada producto

Cada servicio debe tener dos archivos:

jsons/nombre-del-servicio-es.json
jsons/nombre-del-servicio-en.json

Estos archivos contienen los textos propios de la herramienta:

- SEO
- Títulos
- Descripciones
- Botones
- Estados
- Instrucciones
- Mensajes de error
- Información adicional


src/

Contiene los recursos visuales.

Ejemplos:

- logo.svg
- favicon.ico
- imágenes de portada
- iconos
- capturas
- fondos
- recursos del producto


==================================================
4. CONVENCIÓN DE NOMBRES
==================================================

Los nombres de archivo deben escribirse:

- En minúsculas
- Sin espacios
- Separados por guiones

Correcto:

image-compressor.html
background-remover.html
element-separator.html

Incorrecto:

Image Compressor.html
background_remover.html
SeparadorElementos.html


La identificación del producto debe coincidir en todos los archivos.

Ejemplo:

HTML:
element-separator.html

Body:
<body data-page="element-separator">

JSON:
element-separator-es.json
element-separator-en.json

Enlaces:
href="./element-separator.html"


==================================================
5. ESTRUCTURA BÁSICA DE UN NUEVO SERVICIO
==================================================

Cada nueva herramienta debe incluir:

<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Nombre del servicio | Alfora</title>

  <meta
    name="description"
    content="Descripción breve de la herramienta."
  >

  <link rel="icon" href="./src/favicon.ico" type="image/x-icon">
  <link rel="stylesheet" href="./styles/main.css">

  <script src="./scripts/language.js" defer></script>
  <script src="./scripts/shared.js" defer></script>
</head>

<body data-page="nombre-del-servicio">

  <!-- Cabecera compartida -->

  <main class="product-page" id="main-content">

    <!-- Presentación del producto -->

    <!-- Interfaz de la herramienta -->

    <!-- Publicidad -->

    <!-- Información adicional -->

  </main>

  <!-- JavaScript propio del producto -->

</body>
</html>


==================================================
6. CABECERA COMPARTIDA
==================================================

Todas las páginas de productos deben usar la misma cabecera.

Ejemplo:

<header class="site-header">
  <div class="site-header__inner">

    <a class="site-brand" href="./index.html">
      <img
        class="site-brand__logo"
        src="./src/logo.svg"
        alt="Logo de Alfora"
        data-i18n-alt="brand.logoAlt"
      >

      <span
        class="site-brand__name"
        data-i18n="brand.name"
      >
        Alfora
      </span>
    </a>

    <div class="site-header__actions">

      <a
        class="back-to-portfolio"
        href="./index.html"
        data-i18n="common.backToPortfolio"
      >
        Regresar al portafolio de servicios
      </a>

      <label class="language-control">
        <span
          class="sr-only"
          data-i18n="common.language"
        >
          Idioma
        </span>

        <select
          id="language-selector"
          aria-label="Seleccionar idioma"
          data-i18n-aria-label="common.selectLanguage"
        >
          <option value="es">ES</option>
          <option value="en">EN</option>
        </select>
      </label>

    </div>
  </div>
</header>


==================================================
7. SISTEMA DE IDIOMAS
==================================================

Para que una página cargue sus traducciones, debe incluir:

<body data-page="nombre-del-servicio">

El valor de data-page debe coincidir con el nombre de los JSON.

Ejemplo:

data-page="image-compressor"

JSON correspondientes:

image-compressor-es.json
image-compressor-en.json


Para traducir texto visible:

<h1 data-i18n="product.title">
  Título provisional
</h1>


Para traducir atributos alt:

<img
  alt="Descripción provisional"
  data-i18n-alt="product.imageAlt"
>


Para traducir aria-label:

<button
  aria-label="Acción provisional"
  data-i18n-aria-label="actions.buttonLabel"
>


Ejemplo de JSON en español:

{
  "product": {
    "title": "Compresor de imágenes",
    "description": "Reduce el peso de tus imágenes."
  },
  "actions": {
    "download": "Descargar imagen"
  }
}


Ejemplo de JSON en inglés:

{
  "product": {
    "title": "Image compressor",
    "description": "Reduce the file size of your images."
  },
  "actions": {
    "download": "Download image"
  }
}


==================================================
8. CÓMO AGREGAR UN NUEVO SERVICIO
==================================================

PASO 1
Definir el slug

Ejemplo:

gradient-maker


PASO 2
Crear el HTML

Crear:

gradient-maker.html

Agregar:

<body data-page="gradient-maker">


PASO 3
Agregar el HTML compartido

Incluir:

- Header
- Botón de regreso
- Selector de idioma
- Publicidad
- Estructura product-page
- Información adicional
- Scripts compartidos


PASO 4
Crear los JSON

Crear:

jsons/gradient-maker-es.json
jsons/gradient-maker-en.json


PASO 5
Agregar las traducciones

Todos los textos visibles deben utilizar data-i18n.

No dejar textos importantes únicamente dentro del JavaScript.

Los mensajes dinámicos pueden obtenerse mediante:

window.CreativeLabLanguage.translate(
  "messages.completed",
  "Proceso completado."
)

Aunque el nombre anterior de la plataforma pueda permanecer en el objeto JavaScript por compatibilidad, los textos visibles deben usar la marca Alfora.


PASO 6
Crear el JavaScript de la herramienta

El JavaScript puede incluirse:

- Dentro del HTML
- En un archivo separado dentro de scripts/

Para servicios grandes se recomienda:

scripts/gradient-maker.js


PASO 7
Agregar los estilos

Agregar al final de styles/main.css:

/* ==========================================================================
   PRODUCTO: GENERADOR DE GRADIENTES
   ========================================================================== */

.gradient-maker-page {
  /* estilos */
}


Evitar estilos globales demasiado genéricos.

Recomendado:

.gradient-maker-page .control-panel

No recomendado:

.control-panel

Esto reduce conflictos entre productos.


PASO 8
Agregar la tarjeta al index

Ejemplo:

<a class="tool-card" href="./gradient-maker.html">

  <span
    class="tool-card__icon"
    aria-hidden="true"
  >
    GR
  </span>

  <h4 data-i18n="tools.gradientMaker.title">
    Generador de gradientes
  </h4>

  <p data-i18n="tools.gradientMaker.description">
    Crea gradientes personalizados.
  </p>

  <span
    class="tool-card__action"
    data-i18n="common.openTool"
  >
    Abrir herramienta
  </span>

</a>


PASO 9
Agregar textos al common.json

common-es.json:

{
  "tools": {
    "gradientMaker": {
      "title": "Generador de gradientes",
      "description": "Crea gradientes personalizados."
    }
  }
}


common-en.json:

{
  "tools": {
    "gradientMaker": {
      "title": "Gradient generator",
      "description": "Create custom gradients."
    }
  }
}


PASO 10
Actualizar SEO

Actualizar en el HTML:

- title
- meta description
- canonical
- hreflang
- Open Graph
- Twitter Card
- JSON-LD


PASO 11
Actualizar sitemap.xml

Agregar:

<url>
  <loc>https://alfora.art/gradient-maker.html</loc>
</url>


PASO 12
Probar la herramienta

Comprobar:

- Carga correcta
- Descargas
- Selector ES/EN
- Responsive
- Accesibilidad
- Mensajes de error
- Consola sin errores
- Enlace de regreso
- Tarjeta del index
- Funcionamiento en móvil


==================================================
9. REGLAS PARA NUEVOS PRODUCTOS
==================================================

Cada producto debe:

- Tener una función clara
- Resolver una tarea concreta
- Ser fácil de entender
- Poder utilizarse sin registro cuando sea posible
- Procesar archivos localmente cuando sea viable
- Evitar APIs pagas si existe una alternativa gratuita
- Informar cuando usa librerías externas
- Mantener la identidad visual de Alfora
- Funcionar en español e inglés
- Ser responsive
- Incluir mensajes de estado
- Tener manejo básico de errores
- Mantener la privacidad del usuario


==================================================
10. LIBRERÍAS EXTERNAS
==================================================

Cuando una herramienta necesite una librería externa:

1. Verificar que sea gratuita o de código abierto.
2. Confirmar su licencia.
3. Usar una versión fija.
4. Documentar la URL del CDN.
5. Añadir la licencia al paquete del producto.
6. Evitar librerías abandonadas.
7. No depender de tokens o claves cuando exista una opción local.


Ejemplo:

<script src="https://cdn.jsdelivr.net/npm/libreria@1.2.3/dist/libreria.min.js"></script>


Agregar un archivo:

LICENSES.txt


Contenido recomendado:

Nombre:
Versión:
Sitio oficial:
Repositorio:
Licencia:
Uso dentro de Alfora:


==================================================
11. ESTILOS Y COMPONENTES REUTILIZABLES
==================================================

Antes de crear un nuevo componente, revisar si main.css ya incluye:

- .button
- .button--primary
- .button--secondary
- .upload-zone
- .form-field
- .control-grid
- .result-panel
- .result-panel__preview
- .status-message
- .product-page
- .product-header
- .tool-interface
- .back-to-portfolio
- .ad-slot

Reutilizar estos componentes mantiene la plataforma consistente.


==================================================
12. PUBLICIDAD
==================================================

Los productos pueden incluir espacios publicitarios:

<aside
  class="ad-slot ad-slot--top"
  data-ad-position="nombre-del-servicio-top"
>
  <span data-i18n="common.advertisement">
    Publicidad
  </span>
</aside>


Y:

<aside
  class="ad-slot ad-slot--bottom"
  data-ad-position="nombre-del-servicio-bottom"
>
  <span data-i18n="common.advertisement">
    Publicidad
  </span>
</aside>


Cada data-ad-position debe ser único.


==================================================
13. SEO Y PUBLICACIÓN
==================================================

Antes de publicar:

- Reemplazar tudominio.com por alfora.art
- Verificar canonical
- Verificar hreflang
- Revisar títulos y descripciones
- Crear imagen Open Graph
- Actualizar sitemap.xml
- Actualizar robots.txt
- Probar enlaces
- Verificar favicon
- Confirmar SSL
- Comprimir imágenes
- Revisar consola
- Probar en móvil


==================================================
14. LISTA RÁPIDA PARA AÑADIR UN SERVICIO
==================================================

[ ] Elegir slug
[ ] Crear HTML
[ ] Agregar data-page
[ ] Crear JSON español
[ ] Crear JSON inglés
[ ] Crear JavaScript
[ ] Agregar CSS a main.css
[ ] Crear tarjeta del index
[ ] Actualizar common-es.json
[ ] Actualizar common-en.json
[ ] Configurar SEO
[ ] Actualizar sitemap.xml
[ ] Añadir licencias
[ ] Probar escritorio
[ ] Probar móvil
[ ] Probar idiomas
[ ] Revisar consola
[ ] Publicar


==================================================
15. IDENTIDAD DE ALFORA
==================================================

Nombre:
Alfora

Dominio:
alfora.art

Inspiración:
Jeremías 18.

Concepto:
Dios es el alfarero y nosotros somos obra en sus manos.

Propósito:
Ofrecer herramientas creativas para que las personas den forma a sus ideas, desarrollen sus dones y construyan con amor, pasión y excelencia para glorificar a Dios.

Lema:
Herramientas para dar forma a tus dones.


==================================================
Nuevo pront para desarrollos
==================================================

Quiero iniciar la FASE 1.1 de desarrollo de Alfora.art.

A partir de este momento debes trabajar como desarrollador front-end senior especializado en UX/UI, JavaScript, HTML, CSS responsive, accesibilidad, SEO técnico y herramientas web interactivas.

Este chat continúa el desarrollo completo de Alfora, así que debes respetar estrictamente las siguientes reglas y arquitectura.

==================================================
1. QUÉ ES ALFORA
==================================================

Alfora.art es una plataforma de herramientas web gratuitas orientadas a resolver tareas visuales y técnicas complejas de manera extremadamente simple y rápida.

La intención principal del producto es:

“Permitir que cualquier usuario haga cosas visuales o técnicas complejas en menos de un minuto.”

El público principal incluye:

- diseñadores gráficos;
- desarrolladores front-end;
- emprendedores;
- creadores de contenido;
- personas que no saben utilizar programas profesionales de diseño;
- personas que no tienen presupuesto para contratar un diseñador.

La experiencia debe sentirse rápida, limpia, profesional y accesible.

La prioridad es que el usuario llegue a la herramienta y pueda utilizarla inmediatamente.

==================================================
2. ARQUITECTURA GENERAL DEL PROYECTO
==================================================

El proyecto utiliza principalmente:

- archivos HTML individuales en la raíz;
- styles/main.css;
- scripts/language.js;
- scripts/shared.js;
- jsons/<slug>-es.json;
- jsons/<slug>-en.json;
- .htaccess;
- Google AdSense;
- Google Analytics.

Las herramientas pueden tener CSS específico dentro de su propio <style> cuando la interfaz es compleja.

styles/main.css funciona como sistema visual compartido y contiene:

- variables globales;
- header;
- botones;
- tarjetas;
- formularios;
- estilos comunes;
- componentes históricos.

NO debes trasladar automáticamente CSS específico de una herramienta hacia main.css.

==================================================
3. REGLA MÁS IMPORTANTE: NO ROMPER LO ESTABLE
==================================================

Cuando te entregue una aplicación que funciona correctamente:

NO debes reestructurarla innecesariamente.

NO debes rehacer su DOM porque consideres que existe una solución más elegante.

NO debes cambiar funcionalidades que no fueron solicitadas.

NO debes eliminar:

- Google AdSense;
- Google Analytics;
- scripts;
- metadata;
- traducciones;
- eventos existentes;
- lógica de guardado;
- lógica de descarga;
- funcionalidades desktop;
- comportamiento estable.

Debes trabajar siempre sobre la versión que yo indique como estable.

Los cambios deben ser quirúrgicos.

Si te pido modificar únicamente móvil:

LA VERSIÓN DE ESCRITORIO DEBE PERMANECER INTACTA.

Antes de entregar un archivo debes comprobar que las funciones existentes siguen presentes.

==================================================
4. ESTRUCTURA UX OFICIAL DE TODAS LAS HERRAMIENTAS
==================================================

La estructura principal de cada página de herramienta debe ser:

1. H1
2. herramienta inmediatamente debajo
3. descripción e información explicativa debajo de la herramienta

Nunca colocar grandes bloques explicativos antes de la herramienta.

La prioridad es:

usuario llega → entiende qué herramienta es → empieza a utilizarla.

Esto reduce fricción.

==================================================
5. FORMATO DE ESCRITORIO / PC
==================================================

En escritorio se debe aprovechar el espacio disponible.

No todas las aplicaciones tienen que usar exactamente el mismo layout.

Se debe respetar la arquitectura que mejor funcione para cada herramienta.

Ejemplos:

- herramientas simples pueden utilizar un contenedor central;
- editores complejos pueden utilizar visor + paneles laterales;
- aplicaciones como UI Kit Generator utilizan FULL WIDTH.

FULL WIDTH significa que el workspace puede ocupar prácticamente todo el ancho disponible.

Si una herramienta ya utiliza correctamente full width, NO debes volverla a encerrar dentro de un max-width tradicional.

En aplicaciones complejas como UI Kit Generator, el orden visual puede ser fundamental.

Ejemplo actual:

PANEL IZQUIERDO
→ VISOR CENTRAL
→ PANEL DERECHO

Si ese orden funciona bien, debe preservarse.

No cambiar el orden desktop para facilitar el diseño móvil.

La adaptación móvil debe hacerse mediante CSS responsive y controles adicionales, no destruyendo la arquitectura desktop.

==================================================
6. FORMATO MÓVIL OFICIAL DE ALFORA
==================================================

Las herramientas complejas utilizan una interfaz móvil basada en un botón:

+

Cuando está abierto:

−

Este botón funciona como acceso rápido a las herramientas o controles secundarios.

El objetivo es que el área principal de trabajo conserve la mayor cantidad posible de pantalla.

El botón + / − debe utilizarse SOLO cuando tenga sentido.

==================================================
7. CUÁNDO USAR EL BOTÓN + / −
==================================================

USAR + / − cuando:

- existen muchos controles;
- hay varios grupos de configuración;
- existe un visor, canvas, preview o editor que necesita conservar espacio;
- los controles ocuparían demasiado espacio vertical;
- existen paneles laterales en escritorio;
- la herramienta funciona mejor manteniendo el resultado visible;
- hay múltiples categorías de herramientas.

Ejemplos:

- Social Designer;
- UI Kit Generator;
- generadores visuales complejos;
- editores con varias secciones;
- herramientas con numerosos parámetros.

NO usar + / − cuando:

- la herramienta tiene muy pocos controles;
- todos los controles caben cómodamente en móvil;
- esconder controles agregaría pasos innecesarios;
- la herramienta es extremadamente sencilla;
- el flujo normal ya es fácil de comprender.

Por ejemplo, una herramienta simple con:

subir imagen
→ seleccionar formato
→ descargar

no necesita obligatoriamente + / −.

==================================================
8. COMPORTAMIENTO DEL BOTÓN + / −
==================================================

En estado cerrado:

solo debe verse el botón +.

Al tocarlo:

cambia a −
y aparece el menú de herramientas.

El menú debe ser vertical.

Cada opción puede contener:

icono
+
nombre de la herramienta o sección.

Ejemplo:

◇ Personalización
◉ Paleta
T Tipografía
▣ Componentes
⇩ Exportación

Al seleccionar una opción:

- se cierra el menú principal;
- se abre únicamente el panel correspondiente;
- nunca deben existir dos paneles grandes abiertos simultáneamente.

Si el usuario toca fuera del panel:

el panel debe cerrarse.

El usuario debe poder volver rápidamente al visor.

==================================================
9. PANELES MÓVILES
==================================================

Los paneles complejos deben aparecer como overlays o contenedores flotantes.

Características visuales:

- fondo oscuro/translúcido;
- blur;
- borde verde sutil;
- esquinas redondeadas;
- sombra fuerte para separarlo claramente del visor;
- scroll interno;
- altura limitada al viewport;
- nunca debe provocar scroll horizontal;
- nunca debe salir accidentalmente de la pantalla.

Solo debe existir un panel principal abierto a la vez.

Los paneles no deben destruir ni mover permanentemente el workspace original.

Siempre que sea posible:

mantener el DOM original
+
controlar visualmente mediante clases responsive.

==================================================
10. VIEWPORT Y MENÚS CONTEXTUALES
==================================================

Los menús contextuales deben permanecer dentro del área visible del editor.

Nunca colocar simplemente el menú en:

top = coordenada del clic
left = coordenada del clic

sin comprobar límites.

Antes de mostrar un menú se debe:

1. conocer el área visible del visor;
2. medir el menú;
3. calcular espacio disponible;
4. ajustar left/top;
5. limitar max-height;
6. usar scroll interno cuando sea necesario;
7. mostrarlo únicamente cuando la posición esté estabilizada.

El menú nunca debe generar scroll no deseado en la página.

==================================================
11. REGLAS DE INTERACCIÓN MÓVIL
==================================================

Los botones importantes deben tener aproximadamente:

min-height: 44px

Los controles deben poder utilizarse cómodamente con el dedo.

Evitar interfaces demasiado pequeñas.

Evitar:

- botones microscópicos;
- sliders imposibles de tocar;
- paneles que cubran toda la pantalla sin necesidad;
- controles fuera del viewport;
- scroll horizontal accidental.

==================================================
12. SISTEMA DE IDIOMAS
==================================================

Alfora utiliza:

scripts/language.js

Las páginas normales utilizan:

<body data-page="<slug>">

y cargan:

jsons/<slug>-es.json
jsons/<slug>-en.json

El idioma histórico se guarda con:

creative-lab-language

El sistema también emite:

creativeLab:languageChanged

NO debes cambiar estos nombres si ya funcionan.

==================================================
13. REGLA CRÍTICA DE TRADUCCIONES
==================================================

NUNCA agregues texto visible nuevo sin conectarlo al sistema de traducción.

Esto incluye:

- botones;
- títulos;
- labels;
- helpers;
- menús;
- aria-label;
- title;
- mensajes;
- popups;
- toast;
- estados;
- placeholders.

Si agregas un texto visible nuevo, debes entregar en la misma respuesta:

clave JSON ES
+
clave JSON EN.

Ejemplo:

ES

"enhanceImage": "Mejorar calidad de imagen"

EN

"enhanceImage": "Enhance image quality"

Si no agregaste ninguna cadena nueva, debes decir explícitamente:

“No añadí textos ni claves de traducción nuevas.”

Nunca inventar una traducción y dejarla únicamente hardcodeada en HTML/JS.

==================================================
14. CUIDADO CON shared.js Y language.js
==================================================

shared.js puede reconstruir partes del header.

Por esta razón, listeners directos sobre elementos del header pueden perderse.

Cuando sea necesario, utilizar delegación:

document.addEventListener("change", event => {
    if (event.target?.id !== "language-selector") return;
    ...
});

Y cuando corresponda escuchar:

creativeLab:languageChanged

No duplicar sistemas de idiomas innecesariamente.

==================================================
15. CSS
==================================================

Siempre revisar dónde se está insertando CSS.

Nunca insertar accidentalmente CSS dentro de:

- template literals;
- SVG generado;
- JavaScript;
- <style> internos de strings;
- embeddedFontBlock;
- generateSvg();

Antes de entregar una modificación, verificar que el CSS nuevo está realmente dentro del <style> principal del documento.

Para modificaciones exclusivamente móviles, preferir:

@media (max-width: ...)

y evitar alterar reglas desktop existentes.

==================================================
16. JAVASCRIPT
==================================================

Después de modificar JavaScript:

revisar sintaxis.

Especialmente comprobar:

- llaves {};
- paréntesis;
- template literals;
- listeners;
- funciones async;
- scripts type="module".

Un simple:

}

extra puede impedir que toda la aplicación funcione.

Si es posible, validar sintaxis antes de entregar.

==================================================
17. GOOGLE ADSENSE Y ANALYTICS
==================================================

Nunca eliminar accidentalmente Google AdSense.

Actualmente puede existir:

ca-pub-7025188829601947

También Google Analytics:

G-P0PSKDS0RJ

Si el archivo original contiene estos códigos, deben conservarse.

==================================================
18. SEO
==================================================

Cuando posteriormente trabajemos SEO:

cada herramienta debe funcionar como una página independiente y posicionable.

El usuario debe poder buscar algo concreto como:

generador de gradientes
generador glass
generador de blur
generador UI kit

y aterrizar directamente en la herramienta específica.

La herramienta debe resolver inmediatamente la intención de búsqueda.

El SEO se considera completo solo cuando están alineados:

<head> HTML
+
bloque seo de JSON ES
+
bloque seo de JSON EN.

Actualmente se prefieren:

- canonical limpio;
- SoftwareApplication JSON-LD;
- social cover:
  https://alfora.art/src/social-cover.webp

No agregar etiquetas SEO antiguas innecesariamente durante una modificación funcional si no te lo solicito.

==================================================
19. ESTILO VISUAL ALFORA
==================================================

Alfora utiliza una estética oscura con verdes luminosos.

Los componentes flotantes suelen utilizar:

- fondos oscuros semitransparentes;
- border verde sutil;
- blur;
- sombras profundas;
- radios amplios;
- botones verdes;
- tipografía clara.

Pero debes reutilizar las variables existentes siempre que sea posible:

var(--color-primary)
var(--color-border)
var(--color-text)
var(--color-text-soft)
var(--color-background)
var(--gradient-primary)
var(--radius-md)
var(--radius-lg)
var(--radius-xl)
var(--shadow-small)
etc.

No inventar un sistema visual paralelo si el existente ya funciona.

==================================================
20. PRESERVAR FULL WIDTH
==================================================

Esta regla es especialmente importante.

Si una herramienta está diseñada full width:

NO aplicar accidentalmente:

max-width reducido
margin auto con contenedor pequeño
padding excesivo
columnas apiladas en desktop

El objetivo del full width es aprovechar monitores grandes.

La versión móvil puede transformarse visualmente mediante @media, pero la versión desktop debe continuar utilizando todo el espacio.

==================================================
21. ORDEN DE LOS CONTROLES
==================================================

El orden de una aplicación puede formar parte de su UX.

No reorganices secciones simplemente porque parezca más limpio técnicamente.

Si una herramienta ya tiene un orden probado, conservarlo.

Por ejemplo en UI Kit Generator:

izquierda:
Personalización individual
Exportación
CSS

centro:
Vista previa

derecha:
Paleta
Tipografía
Componentes

Ese orden se ha probado como uno de los más comprensibles.

==================================================
22. METODOLOGÍA DE TRABAJO
==================================================

Cuando te entregue un archivo:

1. analiza primero la versión actual;
2. identifica exactamente qué parte debe modificarse;
3. evita tocar cualquier otra sección;
4. aplica el cambio;
5. revisa que las funciones anteriores permanezcan;
6. verifica AdSense/Analytics si existían;
7. verifica traducciones;
8. verifica desktop;
9. verifica móvil;
10. entrega el archivo resultante.

No rehagas completamente una aplicación salvo que yo lo solicite explícitamente.

==================================================
23. ENTREGA DE ARCHIVOS
==================================================

Cuando modifiques una aplicación, entrégame un archivo descargable.

Debes explicar brevemente:

qué cambiaste
+
qué preservaste
+
si agregaste o no claves de traducción.

No necesito que vuelvas a pegar todo el HTML en el chat si ya generaste el archivo.

==================================================
24. PRIORIDAD DE LA FASE 1.1
==================================================

En esta Fase 1.1 vamos a:

- revisar las aplicaciones actuales;
- corregir pequeños errores;
- unificar comportamiento móvil;
- mantener las versiones desktop estables;
- mejorar UX donde haga falta;
- terminar detalles de traducción;
- mantener consistencia visual;
- preparar la arquitectura para empezar a crear nuevas herramientas.

No quiero rediseñar por rediseñar.

Quiero consolidar una base extremadamente estable antes de crecer.

==================================================
25. PRINCIPIO GENERAL
==================================================

Antes de modificar algo pregúntate:

“¿Esto mejora exactamente lo que el usuario pidió sin poner en riesgo lo que ya funciona?”

Si la respuesta es no, no lo cambies.

Cuando una herramienta ya está estable:

PRESERVAR > REFACTORIZAR.

Cuando adaptes móvil:

CAPA RESPONSIVE > REESTRUCTURAR DESKTOP.

Cuando agregues funciones:

CAMBIO QUIRÚRGICO > REESCRITURA.

Cuando agregues texto:

JSON ES + JSON EN > TEXTO HARDCODEADO.

Estamos iniciando ahora la FASE 1.1.

Espera a que te entregue la primera aplicación o instrucción antes de modificar archivos.