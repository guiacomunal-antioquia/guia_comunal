# Guía Comunal DPCC — prototipo (versión 20)

Sitio estático (HTML, CSS y JavaScript, sin programas que instalar). Se publica en **GitHub Pages** desde esta carpeta (`guia_comunal`, conectada al repositorio). Para verlo en el computador, abra `index.html` o sírvala con `python -m http.server 8767`. El `index.html` solo no basta: necesita las carpetas que lo acompañan.

No se publican (están en `.gitignore`): `CLAUDE.md` y `_mantenimiento/` (scripts de trabajo).

---

## CÓMO ACTUALIZAR LOS CONTENIDOS (sin programar)

Para editar un archivo `.js` o `.md` use el **Bloc de notas** (clic derecho → Abrir con → Bloc de notas). Cambie solo el texto entre comillas `'así'` y guarde. Si algo deja de verse, revise que no se haya borrado una comilla o una coma.

Después de reemplazar un archivo, recargue la página con **Ctrl + F5** para ver el cambio.

### 1. Datos del mapa → `datos/mapa.js`
Es el único archivo que hay que tocar para el mapa. Tiene 5 partes, en este orden:

| Parte | Qué contiene | Qué hacer |
|---|---|---|
| 1. `PROFESIONALES` | Cada profesional de zona y sus municipios | Mover un municipio de una lista a otra si cambia el profesional |
| 2. `CORREOS_PROFESIONALES` | Correo de cada profesional | Cambiar `'Dato'` por el correo |
| 3. `FOTOS_PROFESIONALES` | Nombre del archivo de la foto | Ver "Fotos" más abajo |
| 4. `MUNICIPIOS_PROPIOS` | Los 8 municipios que atiende su alcaldía: entidad, teléfono, correo y página | Cambiar `'Dato'` por el dato |
| 5. `CONTACTOS_MUNICIPIO` | Los 117 municipios: promotor, foto del promotor, contacto, juntas registradas, activas, inactivas y Asocomunales | Buscar el municipio (Ctrl + B en el Bloc de notas) y cambiar cada `'Dato'` |

Ejemplo de una línea llena:
```
'Urrao': { promotor: 'Nombre Apellido', fotoPromotor: 'urrao.webp', contacto: '300 000 0000', registradas: 120, activas: 98, inactivas: 22, asocomunales: 1 },
```
Lo que quede como `'Dato'` se ve en la página como *En actualización* (o «—» en las cifras) mientras `MOSTRAR.camposMapaVacios` sea `true` en `js/datos.js`; con `false` ese campo se oculta y aparece solo cuando se escribe el dato. Solo información pública: nunca cédulas ni datos de afiliados.
**En el futuro** estos datos vendrían directamente de **SURCO**; el archivo lo explica al comienzo.

### 2. Fotos
| Fotos de… | Carpeta | Dónde se nombran |
|---|---|---|
| Profesionales de zona | `img/profesionales/` | `FOTOS_PROFESIONALES` en `datos/mapa.js` |
| Promotores | `img/promotores/` | `fotoPromotor` de cada municipio en `datos/mapa.js` |

Formato: rectangular 4:5 (por ejemplo 320 × 400 px), de la cabeza a la cintura, en `.webp` o `.jpg`. Sin foto (`'sin-foto.svg'`) se ve una silueta (o solo el nombre, si `MOSTRAR.camposMapaVacios` es `false`).
Faltan fotos de: David Ramírez, Ana Machado, Sandra Arias, Mónica Caro y todos los promotores.

### 3. Formatos en Word (para descargar en blanco) → carpeta `descargas/`
- **Reemplazar un formato:** copie el Word nuevo en `descargas/` con **el mismo nombre** del que reemplaza. Listo.
- **Agregar un formato:** cópielo en `descargas/` y agregue una línea en `FORMATOS` (archivo `js/datos.js`) copiando una de las que ya existen: `grupo` (título del grupo), `nombre` (lo que se lee en la página) y `archivo` (nombre exacto del Word). Si el `id` empieza por `listado`, la página le pone el aviso "imprímalo antes de la reunión".
- **Bloques de firma (versión 18):** en las actas del Tribunal y de elección, los datos de quien firma (nombre, documento y teléfono) quedaban flotando arriba de su línea. Las celdas del dato ahora están alineadas abajo, como sus etiquetas. `build_templates.py` lo hace solo al regenerar (`alinear_abajo`). Las plantillas cargan con el mismo `?v=` de la página.
- **Ojo:** los Word que la herramienta **llena sola** (actas del Tribunal y de la elección, planchas y listas) salen de una copia con marcadores, no de `descargas/`. Si cambia el formato oficial de una de esas actas, hay que regenerar esa copia (ver "Regenerar" al final). Mientras tanto la herramienta sigue llenando la versión anterior.

### 4. Guías → carpeta `guias/`
- **Reemplazar una guía:** guarde el nuevo PDF en `guias/` con el mismo nombre (`g1.pdf`, `g2.pdf`, `g3.pdf`, `g4.pdf` o `uso.pdf`). El botón "Ver" abre `g1.html`…; si solo tiene el PDF, puede reemplazar también el `.html` o pedir que el botón "Ver" abra el PDF.
- **Cambiar títulos o descripciones** de las tarjetas: lista `GUIAS` en `js/app.js`.
- Las guías actuales se generan con un script (ver "Regenerar"); así se actualizan solas las capturas cuando cambia la herramienta.

### 5. Documentos de consulta → carpeta `documentos/`
Cartilla, afiche y circular. Para reemplazar uno, use el mismo nombre de archivo. Para agregar uno, cópielo en la carpeta y copie una de las líneas de la pantalla "Consultas oficiales" en `index.html` (busque `documentos/`).

### 6. Otros contenidos
| Qué | Dónde |
|---|---|
| **Videos** | `js/videos.js`: llenar `url` con el enlace de YouTube (también Shorts) o `media/archivo.mp4`. Sin `url` el espacio está oculto. Los Shorts se ven en un marco vertical 9:16 y el reproductor carga solo al tocar ▶ |
| **Fotos del carrusel** | `CARRUSEL` en `js/datos.js` (orden, descripción, frase y `foco`). Si en una foto se cortan rostros, cambie su `foco` (por ejemplo `'center 10%'` sube el encuadre; `focoCel` cambia solo el del celular). Fotos nuevas: `python _mantenimiento/build_imagenes.py "<carpeta Propuesta de Mejora>"` |
| **Secciones ocultas** | `MOSTRAR` al comienzo de `js/datos.js` (ver "Elementos ocultos") |
| **Etapas de la elección** | `LINEA_TIEMPO` en `js/datos.js` |
| **Causas de devolución y glosario** | `js/contenido.js` (el orden de las devoluciones se puede ajustar con los datos de frecuencia de la Dirección) |
| **Preguntas del juego** | `JUEGO` en `js/contenido.js` |
| **"La norma" de la herramienta** | `js/norma.js` |
| **Después de la elección** (pasos cortos) | `index.html`, busque `Después de la elección` |
| **Respuestas del asistente** | Se generan desde el Excel del chatbot (ver "Regenerar") |

---

## Cómo está organizada la página

| Menú | Pantallas | Dirección para compartir |
|---|---|---|
| Inicio | Carrusel y 6 accesos | `index.html#/inicio` |
| Elecciones | Etapas · Registrar la elección (herramienta para JAC, JVC y Asocomunales) · Calculadora del cociente (planchas en tarjetas, candidatos opcionales y resultado con nombres) · Causas de devolución · Después de la elección | `#/eleccion`, `#/eleccion/etapas`, `#/eleccion/herramienta`, `#/eleccion/calculadora`, `#/eleccion/devoluciones`, `#/eleccion/despues` |
| Mapa | Un solo mapa; cada municipio tiene su dirección | `#/mapa`, `#/mapa/urrao` |
| Formatos y guías | Formatos en Word · Guías · Consultas oficiales | `#/documentos/formatos`, `#/documentos/guias`, `#/documentos/consulta` |
| Aprenda | La acción comunal · Preguntas de repaso · Glosario | `#/aprenda/accion-comunal`, `#/aprenda/juego`, `#/aprenda/glosario` |
| Estatutos | Reforma de estatutos: requisitos básicos y «Próximamente» (muestra los trámites que vienen) | `#/estatutos` |
| (pie) | Vista de la Dirección, con datos de ejemplo | `#/direccion` |

- El **asistente** es el botón redondo de abajo a la derecha, en todas las pantallas.
- El botón **atrás** del navegador o del celular vuelve a la pantalla anterior **y a la misma posición de la página**, también entre los pasos de la herramienta, el juego, el mapa y al volver de una guía. Cada pantalla interna tiene el botón **Volver** (sube un nivel) y la ruta (Inicio › …).
- Desde la herramienta, las **guías se abren en otra pestaña** y tienen el botón "Cerrar la guía y volver a la solicitud". Lo que la persona lleva escrito se guarda solo como borrador en su navegador (también al cerrar o recargar).
- Los enlaces de la versión anterior (`#eleccion:formulario`, `#guias`…) se redirigen solos.

## Elementos ocultos (sin terminar)
Nada se borró: cada elemento se vuelve a mostrar cambiando un ajuste o agregando el dato que falta. Los textos visibles están dirigidos al público; las notas técnicas quedan solo en los comentarios del código y en este LEEME.

| Qué es | Dónde estaba | Qué le falta | Cómo se vuelve a activar |
|---|---|---|---|
| Video «¿En qué municipios está presente el acompañamiento?» (`v4`) | Mapa, debajo de la leyenda de subregiones | El video | Llenar su `url` en `js/videos.js` |
| Video «¿Dónde consultar información oficial?» (`v5`) y su desplegable | Formatos y guías › Consultas oficiales | El video | Llenar su `url` en `js/videos.js` |
| 7 videos cortos por proceso (`proc-libro`, `proc-asamblea`, `proc-tribunal`, `proc-planchas`, `proc-votacion`, `proc-escrutinio`, `proc-registro`) | Guías (desplegable «Videos cortos por etapa») y el detalle de cada etapa en Elecciones › Etapas | Los videos | Llenar la `url` de cada uno en `js/videos.js`; el desplegable aparece con el primero que tenga enlace |
| Nota «Orden pendiente» | Elecciones › Causas de devolución | Datos de frecuencia de la Dirección | Se quitó el texto; si se reordena, basta con cambiar el orden en `js/contenido.js` |
| Etiqueta «Por validar con la Dirección» | Calculadora, orden de cargos | Validación de la Dirección | Se quitó la etiqueta; el texto dice que mandan los estatutos |
| Nota «Prototipo presentado como propuesta de mejora» | Franja inferior del pie de página | — | Se quitó (era para los evaluadores, no para el público) |

**Sección Estatutos (visible otra vez desde la versión 14).** Se volvió a mostrar porque los jurados califican qué otros trámites se le pueden implementar a la Guía. Tiene los requisitos básicos de la reforma y el aviso «Próximamente»; le faltan la guía, los formatos y la herramienta. Para ocultarla: `MOSTRAR.estatutos = false` en `js/datos.js` (se quita del menú y `#/estatutos` lleva al inicio).

**Promotores (versión 15).** Se cargaron 24 promotores con su correo institucional (archivo "Promotores_correo_institucional", nov. 2026): Remedios, Segovia, Yalí, Campamento, Abriaquí, Anzá, Armenia, Cañasgordas, Ebéjico, Giraldo, Olaya, Peque, Sabanalarga, Abejorral, Concepción, Granada, Guarne, Nariño, San Luis, San Rafael, Jardín, Jericó, Titiribí y Támesis. En `contacto` va el correo; si lleva @ el mapa lo muestra con ✉️ y como enlace, si no con 📞. El de Cañasgordas se corrigió en el Excel y ya está cargado (v16). El de Anzá también se corrigió (sin tilde) y está cargado (v17). El de Campamento se corrigió a "desarrollocomunitario" (v19).

**Campos del mapa sin dato (se muestran para la presentación ante los jurados).** El correo del profesional, la silueta de quien no tiene foto, el promotor (foto, nombre y contacto), las cifras de organismos y el correo de Medellín **se ven** aunque falte el dato, con el aviso *En actualización* (las cifras muestran «—» y la nota «Cifras en actualización»). Así se ve todo lo que llevará el recuadro. Se controla con `MOSTRAR.camposMapaVacios` en `js/datos.js`: `true` = se muestran (actual); `false` = solo se ve lo que tiene dato. Cada dato que se llene en `datos/mapa.js` reemplaza el aviso.

**Video del proceso de elección** (`media/video-proceso-eleccion.mp4`): debe estar en **H.264 (MP4)**. El original venía en HEVC/H.265 y en Chrome y Edge se oía pero se veía en negro; se convirtió a H.264 (720 × 1280, vertical) y el original quedó fuera del repositorio, en la carpeta `Videos originales`. Si se reemplaza, use H.264 y suba el `?v=` de su `url` en `js/videos.js`.

## Registro de demostración (`demo.html`)
Para presentar la Guía (por ejemplo, ante un jurado) desde **cualquier computador o celular con internet**: abra `…/demo.html`. Pone en ese navegador una solicitud de ejemplo con **datos ficticios** (JAC VEREDA LA PRUEBA (EJEMPLO), Urrao) y abre la herramienta en el paso 7.
- Trae **un error a propósito**: la vicepresidenta de la Plancha 1 (CARLA PRUEBA TRES, CC 10000003) es también del Tribunal. Corrección en vivo: en el paso 5 cambiarla por CC 20000099 · PRUEBA NUEVA · BEATRIZ; el semáforo queda en verde y se habilitan las descargas.
- No está enlazada desde la Guía y no cambia nada de ella. Si en ese navegador ya hay un borrador, pide confirmación antes de reemplazarlo. Se puede abrir cuantas veces quiera para volver a empezar.
- No funciona en ventana de incógnito o privada (ahí no se guarda el borrador).
- Desde la versión 13, una pestaña de la herramienta solo guarda al cerrarse si tiene cambios propios, y toma el borrador que se guarde en otra pestaña: así una pestaña vieja no borra el ejemplo.

## Calculadora del cociente (`js/calculadora.js`)
- **Bloques:** Directiva (4), Fiscalía (fiscal y suplente), Conciliación (3), Delegados (3 con sus suplentes) y Otro número.
- **Planchas en tarjetas:** cada una con sus votos y, opcionalmente, sus candidatos como en el formato de postulación por planchas (cargo, nombres y apellidos, tipo y número de documento). «+ Agregar otra plancha» (hasta 8) y «Quitar». Votos y candidatos se guardan por bloque mientras la página esté abierta (no se guardan en el equipo).
- **Resultado primero:** tabla Cargo · Queda elegido(a) · Documento · Plancha; sin nombres dice «Candidato(a) a … de la Plancha N». El paso a paso queda en «¿Cómo se calculó?». En el celular cada cargo es una tarjeta.
- **Reglas:** cociente y mayor residuo solo en Directiva, Conciliación y Delegados (Manual Comunal, p. 49). **Fiscalía sin cociente: el fiscal arrastra a su suplente** (la plancha con más votos gana los dos). Delegados: cada puesto es delegado + suplente. Plancha única: mitad más uno.
- **Quién ocupa cada cargo** (igual que la herramienta de registro): primero la plancha con más cargos, y cada cargo es para la persona que esa plancha postuló a ese cargo. **Por confirmar con la Dirección.**
- **Avisos:** tarjeta de identidad en Directiva, Fiscalía o Conciliación (menor de edad, rojo); documento repetido; empate.

## Solicitudes, subsanaciones y períodos electorales
- **Tipo de organismo** (paso 1): JAC, JVC o Asocomunal. Con Asocomunal la herramienta pide delegados en vez de afiliados, solo asamblea de delegados, secretarías ejecutivas, delegados a la Federación y conciliadores de juntas distintas (Ley 2166, art. 21, 34, 38 y 41). **Por confirmar con la Dirección:** el quórum de la Asocomunal y qué formatos Word usa.
- **Documento de identidad:** cada persona lleva tipo (cédula, tarjeta de identidad, cédula de extranjería, PPT, pasaporte u otro) y número. Con tarjeta de identidad no puede ocupar presidencia, vicepresidencia, tesorería, secretaría, fiscalía ni conciliación (art. 38 y Manual Comunal). Los formatos Word oficiales no cambian: en la casilla "Cédula" va el número, con la sigla si no es cédula (por ejemplo `TI 1012345678`).
- **Nueva o subsanación** (paso 1): una subsanación pide el código anterior y crea la versión siguiente, vinculada por el código: `DPCC-EL-20261020-1234` (v1), `DPCC-EL-20261020-1234-v2`, `-v3`… Nada impide enviar de nuevo.
- **Período electoral:** cada registro lleva su período (2022-2026, 2026-2030…), calculado con la fecha de la elección; se puede cambiar en el paso 1.
- **Vista de la Dirección** (`#/direccion`): filtros por período, municipio, tipo de organismo y semáforo; historial de versiones de cada organismo con la marca "Última"; descarga en Excel (.xlsx) o CSV de lo filtrado.

## REGISTRO DE LA INFORMACIÓN: hoy y en la versión alojada en el OPC
**Hoy (prototipo) la información NO se guarda en la Gobernación.** La herramienta guarda el borrador y el avance solo en el navegador de quien la usa, y la Vista de la Dirección muestra únicamente lo registrado en ese navegador (o los datos de ejemplo). **El registro oficial es el correo radicado en MERCURIO.**

**Cómo funcionaría:** la propuesta final plantea alojar la Guía Comunal en el **Observatorio de Participación Ciudadana (OPC)** de la Gobernación (https://opc-spcc-gobantioquia.hub.arcgis.com/). Allí cada envío se guardaría en una base de datos de la Gobernación (por ejemplo, una tabla de ArcGIS Online alimentada por la herramienta o por Power Automate). SURCO sigue siendo el sistema de registro de la Dirección: la página solo lo consulta (enlaces públicos de afiliados y certificados). Detalle en `js/formulario.js`, comentario "VERSIÓN REAL":
1. Una **base de datos** con **una fila por solicitud y versión**: código, código raíz, versión, nueva o subsanación, ID, nombre y tipo del organismo, municipio, subregión, **período electoral**, estado del semáforo, estado del trámite (en proceso, terminado, devuelto, aprobado), fecha de cada cambio y quién lo hizo.
2. **Cada envío agrega una fila** (no borra la anterior). La versión más alta de un código raíz es la vigente; las demás quedan como historial de subsanaciones.
3. La base **se actualiza al recibir cada envío** (el correo radicado o la conexión "CONECTAR AQUÍ" de `js/formulario.js`). Cuando la Dirección aprueba, los dignatarios se inscriben en SURCO como hoy.
4. **Al cambiar de período**, las filas del período anterior quedan como **histórico** de solo lectura y las solicitudes nuevas se guardan con el período nuevo. Así la Gobernación puede consultar quién quedó prevalidado y terminado en cada período.
5. La Vista de la Dirección leería esa base (con los mismos filtros y la exportación a Excel), en vez del navegador.

## Lineamientos de TIC aplicados (versión 19)
- **JSZip dentro de la página** (`js/lib/jszip-3.10.1.min.js`), copiado de cdnjs y verificado con su huella SRI oficial. Si no cargara, `js/word.js` usa cdnjs como respaldo con esa misma huella (`integrity`). Para actualizarlo, descargue la versión nueva, verifique su huella y cambie el nombre en `word.js`.
- **Aviso de computador compartido** en el paso 8, con el botón «Borrar lo guardado en este equipo».
- **Política de referencia** (`<meta name="referrer" content="strict-origin-when-cross-origin">`): a otros sitios solo se les envía el dominio.
- **`README.md`** para el repositorio (propósito, tecnología, estructura, cómo ejecutar, datos y seguridad).
- **Mensajes de commit** con el formato `tipo(alcance): descripción` (por ejemplo `feat(mapa): …`, `fix(formatos): …`, `docs: …`).
- Pendiente para la versión con servidor (TIC): CAPTCHA y límite de solicitudes por dirección en el envío al servidor, inicio de sesión y roles para la Vista de la Dirección, base de datos, ambientes de QA, pruebas automatizadas y repositorio en Azure DevOps.

## Identidad visual
- Tipografía: solo **Poppins**. Colores del Manual de Identidad Visual y grises de antioquia.gov.co (variables al inicio de `css/estilos.css`).
- Íconos de línea de un solo estilo (`js/iconos.js`); los emojis del contenido se cambian solos por el ícono equivalente.
- Logo oficial: `img/logo-gobernacion.webp`.
- Cada vez que se cambie un archivo CSS o JS, suba el número `?v=` en `index.html` (va en `v=19`) para que los navegadores no usen la versión vieja guardada.

## Conexión con la Dirección (Microsoft institucional)
- **Terminados:** la herramienta abre el correo a organismoscomunales@antioquia.gov.co con el asunto `[ELECCIÓN DIGNATARIOS - NUEVA v1] ID - Organismo - Municipio - Estado` o `[ELECCIÓN DIGNATARIOS - SUBSANACIÓN v2] …`. Un flujo de Power Automate ("Cuando llega un correo nuevo" en el buzón, filtrado por ese asunto) puede llevarlo a una Lista de SharePoint o a un Excel.
- **En proceso (sin correos):** reporte automático del avance. Pegue la URL del flujo en `AVANCE_URL` o un enlace prellenado de Microsoft Forms en `FORMS_URL` (`js/formulario.js`, comentario **CONECTAR AQUÍ**).
- **Listados firmados:** hoy la persona los adjunta en el correo (la página es estática y no puede enviar archivos). Con la conexión anterior, la foto podría ir directo a la Dirección.

## Archivos
| Archivo | Contenido |
|---|---|
| `datos/mapa.js` | ✏️ Datos del mapa (para editar) |
| `js/datos.js` | Municipios, enlaces, formatos, etapas y carrusel |
| `js/rutas.js` | Navegación: direcciones, botón atrás, Volver y ruta |
| `js/formulario.js` | Herramienta de registro, semáforo de prevalidación, Word, correo y registro |
| `js/calculadora.js` | Calculadora del cociente electoral |
| `js/norma.js` | Ventana "📖 La norma, explicada fácil" |
| `js/mapa.js` / `js/mapa-app.js` | Contornos DANE MGN 2025 (generado) / mapa interactivo |
| `js/chatbot.js` + `js/kb.js` | Asistente y su base (generada desde el Excel del chatbot) |
| `js/word.js` + `js/plantillas.js` | Llenado de los formatos oficiales (copias con marcadores) |
| `descargas/` | Formatos oficiales en Word, en blanco |
| `documentos/` | Cartilla ABC, afiche y circular |
| `guias/` | Guías corregidas (HTML y PDF) y sus capturas |
| `_mantenimiento/` | Scripts para regenerar base del chatbot, plantillas, mapa, capturas y guías |

## Regenerar (requiere Python con openpyxl, python-docx, pymupdf, pillow)
```
python _mantenimiento/build_kb.py "../Chatbot/Base_Conocimiento_Chatbot_Participacion_Comunitaria_ACTUALIZADA.xlsx" js/kb.js
python _mantenimiento/build_templates.py "../Formatos proceso de elección" .
python _mantenimiento/build_guias.py guias      (y luego _mantenimiento/capturas.ps1 y guias_pdf.ps1, con la página servida en el puerto 8767)
```

### Guía de uso de la página («Cómo usar la Guía Comunal», versión 20)
`guias/uso.html` y `guias/uso.pdf`: explica cada sección de la página con capturas y números naranjas, más preguntas frecuentes. Es la primera tarjeta de *Formatos y guías › Guías* («Para empezar») y tiene enlace en «¿Necesita ayuda?» del inicio y en el pie. No se numera como guía 5 para no cambiar las guías 1 a 4. Si la página cambia, se rehace así (página servida en el puerto 8767):
```
1. Editar _mantenimiento/guia-uso/contenido.json   (textos, pantallas y partes señaladas)
2. _mantenimiento/guia-uso/capturas.ps1             (imágenes guias/img/uso-*.png; -Solo id para una)
3. python _mantenimiento/guia-uso/build_guia_uso.py (escribe guias/uso.html y reduce el peso de las imágenes)
4. _mantenimiento/guias_pdf.ps1 -Solo uso           (guias/uso.pdf y copia en Guías/Corregidas)
```
`guias/uso.html` se genera: no se edita a mano. `_mantenimiento/guia-uso/captura.html` muestra en el título de la pestaña «FALTAN: …» si una parte señalada ya no existe en la página. Las capturas usan solo datos ficticios.

### Documento de presentación ("Cómo funciona la página", PDF y Word)
Está en la carpeta `Presentación`, junto a esta. Si la página cambia, se puede rehacer con capturas nuevas:
```
_mantenimiento/presentacion/capturas.ps1            (con la página abierta en el puerto 8765; el documento se hizo con la versión 7 y está pendiente de actualizar)
python _mantenimiento/presentacion/build_presentacion.py
```
Los textos y los marcadores numerados de cada captura están en `_mantenimiento/presentacion/contenido.json`. Todas las capturas usan datos ficticios.
