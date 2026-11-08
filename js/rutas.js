/* Navegación por pantallas con dirección propia.
   - Cada pantalla es un <section class="pantalla" data-ruta="aprenda/glosario" data-titulo="Glosario">.
     Su dirección es index.html#/aprenda/glosario y se puede compartir.
   - El botón "atrás" del navegador o del celular vuelve a la pantalla anterior, también dentro de
     las herramientas (pasos del formulario, juego, municipio del mapa, etapa de la elección).
   - Arriba de cada pantalla interna se dibujan solos el botón "Volver" (sube un nivel) y la ruta
     de navegación (Inicio › Aprenda › Glosario), tomados de data-titulo.
   - Las ventanas (asistente, "La norma") se cierran con "atrás" antes de cambiar de pantalla.
   - Las direcciones de la versión anterior (#eleccion:formulario, #guias…) se redirigen solas. */
(function () {
  'use strict';
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ANTES = {
    'inicio': 'inicio', 'inicio:contacto': 'inicio/ayuda', 'inicio:asistente': 'inicio', 'asistente': 'inicio', 'contacto': 'inicio/ayuda',
    'eleccion': 'eleccion', 'eleccion:linea': 'eleccion/etapas', 'eleccion:formulario': 'eleccion/herramienta', 'eleccion:reparto': 'eleccion/calculadora',
    'eleccion:descargas': 'documentos/formatos', 'eleccion:faq': 'eleccion/devoluciones', 'eleccion:despues': 'eleccion/despues',
    'mapa': 'mapa', 'guias': 'documentos/guias', 'aprende': 'aprenda', 'aprende:glosario-sec': 'aprenda/glosario', 'estatutos': 'estatutos', 'direccion': 'direccion'
  };
  const manejadores = {};
  let actual = null;      // ruta completa mostrada
  let pantalla = null;    // elemento <section> visible
  let capa = null;        // función que cierra la ventana abierta
  let atrasPendiente = null, ignorarPop = false;

  /* "#/aprenda/glosario" → "aprenda/glosario"; direcciones antiguas → nuevas */
  function normalizar(hash) {
    let h = String(hash || '').replace(/^#/, '');
    if (h.startsWith('/')) h = h.slice(1);
    else if (ANTES[h]) h = ANTES[h];
    else if (/^guias:g\d$/.test(h)) h = 'documentos/guias/' + h.split(':')[1];
    else if (h && !document.querySelector(`.pantalla[data-ruta="${h.split('/')[0]}"]`)) h = '';
    return h.replace(/\/+$/, '') || 'inicio';
  }
  /* La pantalla de la ruta más larga que exista; lo que sobra es el parámetro */
  function buscar(ruta) {
    const partes = ruta.split('/');
    for (let n = partes.length; n > 0; n--) {
      const r = partes.slice(0, n).join('/');
      const el = document.querySelector(`.pantalla[data-ruta="${r}"]`);
      if (el) return { el, r, param: partes.slice(n).join('/') };
    }
    return { el: document.querySelector('.pantalla[data-ruta="inicio"]'), r: 'inicio', param: '' };
  }
  const tituloDe = (r) => { const el = document.querySelector(`.pantalla[data-ruta="${r}"]`); return el ? el.dataset.titulo : ''; };

  function migas(r) {
    const partes = r.split('/');
    const niveles = partes.map((_, i) => partes.slice(0, i + 1).join('/')).filter((x) => tituloDe(x));
    const padre = niveles.length > 1 ? niveles[niveles.length - 2] : 'inicio';
    return `<a class="volver" href="#/${padre}"><span aria-hidden="true">←</span> Volver</a>
      <ol><li><a href="#/inicio">Inicio</a></li>${niveles.map((x, i) => i === niveles.length - 1
      ? `<li aria-current="page">${esc(tituloDe(x))}</li>` : `<li><a href="#/${x}">${esc(tituloDe(x))}</a></li>`).join('')}</ol>`;
  }

  // Al cambiar de pantalla se empieza arriba, sin la animación de desplazamiento
  function arriba() {
    const h = document.documentElement;
    h.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    h.style.scrollBehavior = '';
  }

  function mostrar(ruta, op = {}) {
    const { el, r, param } = buscar(ruta);
    const cambia = el !== pantalla;
    actual = param ? `${r}/${param}` : r;
    if (cambia) {
      document.querySelectorAll('.pantalla').forEach((s) => { s.hidden = s !== el; });
      pantalla = el;
      const m = el.querySelector('[data-migas]');
      if (m) m.innerHTML = migas(r);
      const sec = r.split('/')[0];
      document.querySelectorAll('.menu a').forEach((a) => { if (a.dataset.seccion === sec) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      document.title = r === 'inicio' ? 'Guía Comunal DPCC' : `${el.dataset.titulo} · Guía Comunal DPCC`;
      const menu = document.getElementById('menu');
      if (menu) { menu.classList.remove('abierto'); const b = document.querySelector('.menu-btn'); if (b) b.setAttribute('aria-expanded', 'false'); }
    }
    if (cambia && !op.sinScroll) arriba();
    // El manejador de la pantalla (si tiene) recibe el parámetro: paso, municipio, juego…
    const fn = manejadores[r];
    if (fn) fn(param, { cambia });
    const ancla = param && !fn ? document.getElementById(param.split('/').pop()) : null;
    if (ancla && el.contains(ancla)) requestAnimationFrame(() => ancla.scrollIntoView({ behavior: op.inicial ? 'auto' : 'smooth', block: 'start' }));
    if (cambia && !op.inicial) { const h = el.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
  }

  function escribir(ruta, reemplazar) {
    const url = '#/' + ruta;
    if (atrasPendiente) { clearTimeout(atrasPendiente); atrasPendiente = null; reemplazar = true; }
    if (capa) { const f = capa; capa = null; f(); reemplazar = true; }
    if (reemplazar) history.replaceState(null, '', url); else history.pushState(null, '', url);
  }
  /* Ir a una pantalla (como tocar un enlace) */
  function ir(hash, reemplazar) {
    const ruta = normalizar(hash);
    if (ruta !== actual || capa) escribir(ruta, reemplazar);
    mostrar(ruta);
  }
  /* Anotar en el historial un cambio que la herramienta ya hizo (paso, municipio…) sin redibujar */
  function marcar(ruta, reemplazar) {
    if (ruta === actual) return;
    escribir(ruta, reemplazar);
    actual = ruta;
  }
  /* Ventanas: "atrás" las cierra primero */
  function abrirCapa(cerrar) {
    if (capa) return;
    if (atrasPendiente) { clearTimeout(atrasPendiente); atrasPendiente = null; } else history.pushState({ capa: 1 }, '', location.href);
    capa = cerrar;
  }
  function cerrarCapa() {
    if (!capa) return;
    capa = null;
    atrasPendiente = setTimeout(() => { atrasPendiente = null; ignorarPop = true; history.back(); }, 0);
  }

  window.addEventListener('popstate', () => {
    if (ignorarPop) { ignorarPop = false; return; }
    if (capa) { const f = capa; capa = null; f(); return; }
    mostrar(normalizar(location.hash), { sinScroll: false });
  });
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-ir-campo') || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
    const h = a.getAttribute('href');
    if (h.length < 2 || h === '#contenido') return;
    const plano = h.slice(1);
    if (!plano.startsWith('/') && !ANTES[plano] && !/^guias:g\d$/.test(plano)) return;
    ev.preventDefault();
    ir(h);
  });

  function iniciar() {
    const ruta = normalizar(location.hash);
    if (location.hash !== '#/' + ruta && location.hash) history.replaceState(null, '', '#/' + ruta);
    mostrar(ruta, { inicial: true });
  }

  window.Rutas = { ir, marcar, al: (r, fn) => { manejadores[r] = fn; }, abrirCapa, cerrarCapa, actual: () => actual, iniciar, normalizar };
})();
