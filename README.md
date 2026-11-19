# Guía Comunal DPCC

Página de la Dirección de Participación Comunitaria y Ciudadana (DPCC) de la Gobernación de Antioquia para los organismos comunales (JAC, JVC y Asocomunales). Acompaña la elección de dignatarios: prevalida la solicitud con un semáforo según la Ley 2166 de 2021 y el Manual Comunal, llena las actas oficiales en Word, calcula el cociente electoral y reúne mapa de atención, formatos, guías y asistente.

- **Publicada en:** https://guiacomunal-antioquia.github.io/guia_comunal/
- **Ejemplo de demostración** (datos ficticios): https://guiacomunal-antioquia.github.io/guia_comunal/demo.html
- **Manual de actualización y detalle técnico:** [LEEME.md](LEEME.md)

## Tecnología

| Tipo | Tecnología | Uso |
|---|---|---|
| Front-end | HTML5, CSS3 y JavaScript (ES2017+), sin framework ni compilación | Toda la página; navegación por direcciones `#/…` (`js/rutas.js`) |
| Librería | JSZip 3.10.1 (`js/lib/`, verificada con su huella SRI de cdnjs) | Llenar los formatos Word y generar el Excel de la Vista de la Dirección |
| Tipografía | Poppins (Google Fonts) | Manual de Identidad Visual de la Gobernación |
| Videos | YouTube (`youtube-nocookie.com`), solo al tocar ▶ | Videos de Aprenda |
| Back-end y base de datos | No hay | El borrador se guarda en el navegador de quien lo llena (`localStorage`) |
| Publicación | GitHub Pages, rama `main` | Sitio estático |

Se eligió una página estática sin framework porque el público son líderes comunales, muchos con baja conectividad: carga liviana, funciona en el celular y no requiere servidor.

## Estructura

```
index.html        Todas las pantallas (cada <section class="pantalla"> tiene su dirección)
demo.html         Carga una solicitud ficticia para demostraciones (no enlazada)
css/estilos.css   Estilos
js/               Lógica: rutas, formulario (semáforo), calculadora, mapa, asistente, panel, Word
js/lib/           Librerías de terceros (JSZip)
datos/mapa.js     Datos del mapa editables sin programar (profesionales, promotores, cifras)
descargas/        Formatos oficiales en Word, en blanco
guias/            Guías paso a paso (HTML y PDF)
documentos/       Documentos de consulta (PDF)
img/, media/      Imágenes y video
```

## Ejecutar en un computador

Desde esta carpeta:

```
python -m http.server 8767
```

y abrir http://localhost:8767. Tras cambiar un archivo CSS o JS, subir el número `?v=` en `index.html` para que los navegadores no usen la versión guardada.

## Datos personales y seguridad

- La página no envía datos a ningún servidor. La solicitud la envía la persona desde su propio correo a organismoscomunales@antioquia.gov.co, con la autorización de la Ley 1581 de 2012.
- Los documentos de identidad del borrador quedan solo en el navegador de quien llena; el paso 8 ofrece borrarlos en computadores compartidos.
- Lo que escribe la persona se muestra siempre escapado (protección contra XSS). No se usan cookies propias.
- El repositorio no contiene datos personales de afiliados; las pruebas se hacen con datos ficticios.

## Versión con la Gobernación

La propuesta es alojar la Guía en el Observatorio de Participación Ciudadana (OPC) de la Gobernación, con registro de cada solicitud en una base institucional, inicio de sesión para la Vista de la Dirección y los demás requisitos de los lineamientos de TIC. Ver «REGISTRO DE LA INFORMACIÓN» en el [LEEME](LEEME.md).
