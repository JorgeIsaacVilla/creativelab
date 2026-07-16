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
