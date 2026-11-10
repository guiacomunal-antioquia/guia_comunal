/* Menú, accesibilidad, carrusel, videos, línea de tiempo, formatos, preguntas frecuentes, glosario,
   guías y ventana del asistente. La navegación entre pantallas está en js/rutas.js. */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pref = { leer: (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }, poner: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* nada */ } } };

  /* ---------- Secciones ocultas (window.MOSTRAR en js/datos.js) ----------
     Se quitan del menú y de todos los enlaces; la pantalla pierde su dirección, así que
     #/estatutos lleva al inicio. Basta con poner true para que vuelvan. */
  Object.entries(window.MOSTRAR || {}).forEach(([ruta, ver]) => {
    if (ver) return;
    $$(`a[href="#/${ruta}"], a[href^="#/${ruta}/"]`).forEach((a) => { (a.closest('li') || a).remove(); });
    $$(`.pantalla[data-ruta="${ruta}"], .pantalla[data-ruta^="${ruta}/"]`).forEach((s) => { s.dataset.rutaOculta = s.dataset.ruta; s.removeAttribute('data-ruta'); s.hidden = true; });
  });

  /* ---------- Menú del celular ---------- */
  $('.menu-btn').addEventListener('click', (ev) => { const ab = $('#menu').classList.toggle('abierto'); ev.currentTarget.setAttribute('aria-expanded', String(ab)); });
  // Compatibilidad: el asistente y otros módulos piden ir a una pantalla con window.irA('#…')
  window.irA = (h) => window.Rutas.ir(h);

  /* ---------- Accesibilidad: letra y contraste ---------- */
  const TAM = [14, 16, 18, 20];
  let tam = +pref.leer('dpcc-tamano', 1);
  const aplicarTam = () => document.documentElement.style.setProperty('--base', TAM[tam] + 'px');
  aplicarTam();
  $$('[data-tamano]').forEach((b) => b.addEventListener('click', () => { const d = +b.dataset.tamano; tam = d === 0 ? 1 : Math.min(TAM.length - 1, Math.max(0, tam + d)); aplicarTam(); pref.poner('dpcc-tamano', tam); }));
  const aplicarContraste = (on) => { document.documentElement.classList.toggle('alto-contraste', on); $('#contrasteBtn').setAttribute('aria-pressed', String(on)); };
  aplicarContraste(pref.leer('dpcc-contraste', '0') === '1');
  $('#contrasteBtn').addEventListener('click', () => { const on = !document.documentElement.classList.contains('alto-contraste'); aplicarContraste(on); pref.poner('dpcc-contraste', on ? '1' : '0'); });

  /* ---------- Carrusel ---------- */
  (function carrusel() {
    const items = window.CARRUSEL || [];
    const pista = $('#carruselPista'), puntos = $('#carruselPuntos');
    if (!pista || !items.length) return;
    // Solo se descarga la foto visible y la siguiente (las ocultas tienen loading="lazy").
    const peque = (src) => src.replace(/\.webp$/, '-640.webp');
    // Encuadre propio de cada foto (foco y focoCel en js/datos.js) para que no se corten los rostros
    const foco = (x) => [x.foco ? `--foco:${x.foco}` : '', x.focoCel ? `--foco-cel:${x.focoCel}` : ''].filter(Boolean).join(';');
    pista.innerHTML = items.map((x, i) => `<figure class="carrusel__item" ${i ? 'hidden' : ''} style="${esc(foco(x))}"><img src="${esc(x.img)}" srcset="${esc(peque(x.img))} 640w, ${esc(x.img)} 1280w" sizes="(max-width: 700px) 100vw, 1100px" alt="${esc(x.alt || x.texto || '')}" ${i ? 'loading="lazy"' : ''}>${x.texto ? `<figcaption>${esc(x.texto)}</figcaption>` : ''}</figure>`).join('');
    puntos.innerHTML = `<span aria-live="polite">1 / ${items.length}</span>`;
    let actual = 0, t;
    const ir = (n) => {
      actual = (n + items.length) % items.length;
      const figs = $$('.carrusel__item', pista);
      figs.forEach((f, i) => { f.hidden = i !== actual; });
      const sig = figs[(actual + 1) % items.length].querySelector('img');
      if (sig) sig.loading = 'eager';
      puntos.firstChild.textContent = `${actual + 1} / ${items.length}`;
    };
    const auto = () => { clearInterval(t); if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) t = setInterval(() => ir(actual + 1), 6000); };
    $('#carrusel').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; if (b.dataset.carrusel) ir(actual + +b.dataset.carrusel); if (b.dataset.punto) ir(+b.dataset.punto); auto(); });
    auto();
  })();

  /* ---------- Videos: cada espacio lee js/videos.js ---------- */
  function idYouTube(url) { const m = String(url).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/); return m ? m[1] : ''; }
  /* Un video sin enlace (url vacía en js/videos.js) no se muestra: se oculta su espacio y, si era el
     único de un desplegable "🎬 …", también el desplegable. Aparece solo cuando se llena su url. */
  const tieneVideo = (k) => !!((window.VIDEOS || {})[k] || {}).url;
  function pintarVideo(el) {
    const v = (window.VIDEOS || {})[el.dataset.video];
    const caja = el.closest('details.mas-info');
    if (!v || !v.url) {
      el.hidden = true;
      el.innerHTML = '';
      if (caja && !caja.querySelector('[data-video]:not([hidden])')) caja.hidden = true;
      return;
    }
    el.hidden = false;
    if (caja) caja.hidden = false;
    const yt = idYouTube(v.url);
    // Shorts (verticales): marco 9:16. La miniatura se descarga solo cuando el espacio entra en pantalla
    // y el reproductor de YouTube solo cuando la persona toca ▶.
    const vertical = v.vertical || /\/shorts\//.test(v.url);
    el.classList.toggle('video--vertical', vertical);
    el.innerHTML = `<button type="button" class="video__play">${yt && vertical ? `<img class="video__miniatura" src="https://i.ytimg.com/vi/${yt}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">` : ''}<span class="video__icono" aria-hidden="true">▶</span><span class="video__titulo"><b>${esc(v.titulo)}</b><small>Toque para ver</small></span></button>`;
    el.querySelector('button').addEventListener('click', () => {
      el.innerHTML = yt ? `<iframe src="https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&playsinline=1" title="${esc(v.titulo)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
        : `<video controls autoplay playsinline src="${esc(v.url)}" title="${esc(v.titulo)}"></video>`;
    });
  }
  $$('[data-video]').forEach(pintarVideo);

  /* ---------- Línea de tiempo: quién hace qué (cada etapa tiene su dirección) ---------- */
  const LT = window.LINEA_TIEMPO;
  const PASO_FORM = { 'paso-asamblea': 2, 'paso-tribunal': 3, 'paso-planchas': 5, 'paso-votos': 6, 'paso-enviar': 8 };
  $('#lineaTiempo').innerHTML = LT.map((x, i) => `<li><button type="button" data-etapa="${i}" aria-pressed="${i === 0}"><span class="linea__num">${i + 1}</span><span class="linea__ico" aria-hidden="true">${x.icono}</span><b>${esc(x.titulo)}</b><small>${esc(x.cuando)}</small></button></li>`).join('');
  function detalle(i) {
    const x = LT[i];
    $$('#lineaTiempo button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.etapa === i)));
    $('#lineaDetalle').innerHTML = `<div class="detalle${tieneVideo(x.video) ? '' : ' detalle--sin-video'}">
      <div class="detalle__col"><h3>${x.icono} ${esc(x.titulo)}</h3><p class="detalle__cuando">📅 ${esc(x.cuando)}</p>
        <p class="detalle__tit">👤 Quién</p><div class="chips">${x.quien.map((q) => `<span>${esc(q)}</span>`).join('')}</div>
        <p class="detalle__tit">✅ Qué hace</p><ul class="lista-check">${x.hace.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
        <div class="ojo">⚠️ ${esc(x.ojo)}</div>
        <div class="botones">${x.herramienta ? `<a class="btn" href="#/eleccion/herramienta/paso-${PASO_FORM[x.herramienta]}">✍️ Hacerlo en la herramienta</a>` : ''}<a class="btn btn--texto" href="#/documentos/guias/${x.guia}">¿Cómo se usa?</a></div></div>
      ${tieneVideo(x.video) ? `<div class="video" data-video="${x.video}"></div>` : ''}</div>`;
    const vd = $('#lineaDetalle [data-video]');
    if (vd) pintarVideo(vd);
  }
  $('#lineaTiempo').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-etapa]');
    if (!b) return;
    detalle(+b.dataset.etapa);
    window.Rutas.marcar('eleccion/etapas/' + LT[+b.dataset.etapa].id);
  });
  window.Rutas.al('eleccion/etapas', (param) => { const i = LT.findIndex((x) => x.id === param); detalle(i < 0 ? 0 : i); });

  /* ---------- Formatos en Word ---------- */
  const grupos = {};
  window.FORMATOS.forEach((f) => { (grupos[f.grupo] = grupos[f.grupo] || []).push(f); });
  $('#listaDescargas').innerHTML = Object.entries(grupos).map(([g, fs]) => `<div class="descargas__grupo"><h3>${esc(g)}</h3>${fs.map((f) => `<a class="descarga" href="descargas/${encodeURIComponent(f.archivo)}" download><span class="descarga__ico" aria-hidden="true">${/^listado/i.test(f.id) ? '📋' : '📄'}</span><span>${esc(f.nombre)}<small>Word${/^listado/i.test(f.id) ? ' · <b>imprímalo antes de la reunión</b>' : ''}</small></span><span aria-hidden="true">⬇</span></a>`).join('')}</div>`).join('');

  /* ---------- Preguntas frecuentes y glosario ---------- */
  $('#faqLista').innerHTML = window.FAQ_DEVOLUCIONES.map(([ico, q, a], i) => `<details class="faq__item"><summary><span class="faq__n">${i + 1}</span><span aria-hidden="true">${ico}</span>${esc(q)}</summary><p>✅ ${esc(a)}</p></details>`).join('');
  const glos = () => { const t = ($('#glosarioBuscar').value || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); $('#glosario').innerHTML = window.GLOSARIO.filter(([, p, d]) => !t || (p + ' ' + d).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(t)).map(([i, p, d]) => `<div class="glosario__item"><span aria-hidden="true">${i}</span><div><b>${esc(p)}</b><p>${esc(d)}</p></div></div>`).join('') || '<p class="nota">No encontramos esa palabra. Pregúntele al asistente.</p>'; };
  glos();
  $('#glosarioBuscar').addEventListener('input', glos);

  /* ---------- Guías corregidas y videos cortos ---------- */
  const GUIAS = [
    ['g1', 'Guía 1', 'Antes de empezar y el documento de identidad', '🪪', 'Qué tener a la mano y cómo copiar bien los datos.'],
    ['g2', 'Guía 2', 'Asamblea, Tribunal y asistencia', '⚖️', 'Pasos 1 a 4 de la herramienta.'],
    ['g3', 'Guía 3', 'Planchas, votación y escrutinio', '🗳️', 'Una o varias planchas, cociente y dignatarios elegidos.'],
    ['g4', 'Guía 4', 'Revisar, imprimir y enviar', '📨', 'Semáforo, formatos y envío a la Dirección.']
  ];
  $('#listaGuias').innerHTML = GUIAS.map(([id, n, t, ico, d]) => `<article class="guia" id="${id}"><span class="guia__ico" aria-hidden="true">${ico}</span><p class="ceja">${n}</p><h3>${esc(t)}</h3><p>${esc(d)}</p>
    <div class="botones"><a class="btn" href="guias/${id}.html" target="_blank" rel="noopener">👀 Ver</a><a class="btn btn--claro" href="guias/${id}.pdf" download>⬇ PDF</a></div></article>`).join('');
  $('#videosCortos').innerHTML = Object.keys(window.VIDEOS).filter((k) => window.VIDEOS[k].corto).map((k) => `<div class="video" data-video="${k}"></div>`).join('');
  $$('#videosCortos [data-video]').forEach(pintarVideo);

  /* ---------- Catálogo corto de comisiones (para escribir más rápido) ---------- */
  $('#catalogoComisiones').innerHTML = ['OBRAS', 'SALUD', 'EDUCACIÓN', 'DEPORTES', 'RECREACIÓN Y DEPORTES', 'MEDIO AMBIENTE', 'CULTURA', 'EMPRESARIAL', 'JUVENTUD', 'MUJER Y FAMILIA', 'ADULTO MAYOR', 'CONVIVENCIA', 'GESTIÓN DEL RIESGO', 'VIVIENDA', 'ACUEDUCTO', 'CAMINOS']
    .map((c) => `<option value="C.T. ${c}">`).join('') + '<option value="C.E. EMPRESARIAL">';

  /* ---------- Asistente: botón flotante en todas las pantallas ----------
     En el celular ocupa la pantalla; el botón "atrás" lo cierra. */
  const ventana = $('#chatVentana'), flotante = $('.chat-flotante');
  let enCapa = false;
  function cerrarVentana() { ventana.hidden = true; enCapa = false; document.body.classList.remove('chat-abierto'); flotante.hidden = false; }
  function abrirChat() {
    if (!ventana.hidden) { $('#chatEntrada').focus(); return; }
    ventana.hidden = false;
    flotante.hidden = true;
    document.body.classList.add('chat-abierto');
    // En computador la ventana queda abierta mientras navega; en el celular "atrás" la cierra.
    if (window.innerWidth <= 760) { enCapa = true; window.Rutas.abrirCapa(cerrarVentana); }
    if (window.Chatbot) window.Chatbot.iniciar();
    setTimeout(() => $('#chatEntrada').focus({ preventScroll: true }), 300);
  }
  const cerrarChat = () => { if (ventana.hidden) return; const capa = enCapa; cerrarVentana(); if (capa) window.Rutas.cerrarCapa(); flotante.focus(); };
  document.addEventListener('click', (ev) => { if (ev.target.closest('[data-abrir-chat]')) abrirChat(); });
  $('#chatCerrar').addEventListener('click', cerrarChat);
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && !ventana.hidden) cerrarChat(); });
  window.Asistente = { abrir: abrirChat, cerrar: cerrarChat };

  /* ---------- Aviso al abrir SURCO ----------
     SURCO abre desde la red de la Gobernación, pero puede no responder desde otras redes (probado el
     30 de octubre de 2026). El enlace se abre igual y aparece este aviso con la alternativa. */
  let avisoSurco;
  document.addEventListener('click', (ev) => {
    if (!ev.target.closest('a[href*="surco.antioquia.gov.co"]')) return;
    if (!avisoSurco) {
      avisoSurco = document.createElement('div');
      avisoSurco.className = 'aviso-surco';
      avisoSurco.setAttribute('role', 'status');
      avisoSurco.innerHTML = `<p><b>Si SURCO no abre</b>, puede estar disponible solo desde algunas redes o en mantenimiento. Intente más tarde, o pida la consulta a su profesional de zona o al correo <a href="mailto:${esc(window.ENLACES.correoDireccion)}">${esc(window.ENLACES.correoDireccion)}</a>.</p><button type="button" aria-label="Cerrar el aviso">✕</button>`;
      avisoSurco.querySelector('button').addEventListener('click', () => { avisoSurco.hidden = true; });
      document.body.appendChild(avisoSurco);
    }
    avisoSurco.hidden = false;
    clearTimeout(avisoSurco._t);
    avisoSurco._t = setTimeout(() => { avisoSurco.hidden = true; }, 15000);
  });

  // Último en arrancar: cada módulo ya registró su pantalla en js/rutas.js
  document.addEventListener('DOMContentLoaded', () => window.Rutas.iniciar());
})();
