/* Íconos de línea de un solo estilo (trazo redondeado, un color), como la iconografía general del
   Manual de Identidad Visual de la Gobernación (p. 27).
   - En el HTML: <svg class="ico" aria-hidden="true"><use href="#i-casa"></use></svg>
   - En el contenido que generan las herramientas (formulario, asistente, juego…) los emojis se
     cambian solos por el ícono equivalente (tabla EMOJI). Para agregar un emoji nuevo, súmelo a esa
     tabla; los que no estén en ella se quitan para no mezclar estilos.
   - El semáforo (🟢 🟡 🔴) se muestra como un círculo de color. */
(function () {
  'use strict';
  const I = {
    casa: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    urna: '<path d="M4 12h16v9H4z"/><path d="M8 12V4h8v8"/><path d="m10 8 1.5 1.5L14 7"/><path d="M8 16.5h8"/>',
    balanza: '<path d="M12 3v18"/><path d="M8 21h8"/><path d="M5 7h14"/><path d="M5 7 2 14a3 3 0 0 0 6 0z"/><path d="m19 7-3 7a3 3 0 0 0 6 0z"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16 9.5"/>',
    personas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6"/><path d="M18 14.3a6.5 6.5 0 0 1 3.5 5.7"/>',
    persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    calculadora: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 7h8"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M15.5 15h.01M8.5 18h.01M12 18h.01M15.5 18h.01"/>',
    documento: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
    lapiz: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/><path d="m14.5 5.5 3 3"/>',
    union: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a3 3 0 0 0-4.2 0l-.9.9a1 1 0 1 1-3-3l2.8-2.8a5.8 5.8 0 0 1 7.1-.9l.5.3a2 2 0 0 0 1.4.3L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
    correo: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3 7 9 6 9-6"/>',
    ayuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.6 2.6 0 1 1 3.6 2.4c-.7.3-1.1.9-1.1 1.6v.5"/><path d="M12 17h.01"/>',
    libro: '<path d="M4 19V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14v-4"/><path d="M8 7h8"/>',
    herramienta: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
    calendario: '<rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    descargar: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/>',
    buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    silla: '<path d="M7 11V4h10v7"/><path d="M5 11h14v3H5z"/><path d="M6.5 14v6M17.5 14v6"/>',
    ubicacion: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    institucion: '<path d="M3 21h18"/><path d="M5 21V10M9.5 21V10M14.5 21V10M19 21V10"/><path d="M2 10 12 4l10 6z"/>',
    edificio: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01"/><path d="M10 21v-3h4v3"/>',
    grafico: '<path d="M4 4v16h16"/><path d="M8 16v-5M12.5 16V7M17 16v-3"/>',
    megafono: '<path d="M3 10v4a1 1 0 0 0 1 1h3l8 5V4L7 9H4a1 1 0 0 0-1 1z"/><path d="M19 9a4 4 0 0 1 0 6"/>',
    maletin: '<rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M3 13h18"/>',
    semaforo: '<rect x="8" y="2" width="8" height="20" rx="4"/><circle cx="12" cy="7" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="17" r="1.4"/>',
    video: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m10 9 5 3-5 3z"/>',
    alerta: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
    cerrar: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    cedula: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><circle cx="9" cy="11" r="2"/><path d="M6 16a3 3 0 0 1 6 0"/><path d="M14.5 10h4M14.5 14h4"/>',
    candado: '<rect x="5" y="11" width="14" height="10" rx="1.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    brujula: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    carpeta: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    clip: '<path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/>',
    telefono: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    cuadricula: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    imprimir: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="1.5"/><path d="M6 14h12v7H6z"/>',
    estrella: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3l-5.5 2.9 1-6.2L3 9.6l6.2-.9z"/>',
    reloj: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2h4"/>',
    enlace: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    repetir: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    cuadro: '<rect x="4" y="4" width="16" height="16" rx="1.5"/>',
    flechas: '<path d="M3 12h18"/><path d="m7 8-4 4 4 4M17 8l4 4-4 4"/>',
    birrete: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>',
    globo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18"/>',
    diana: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    texto: '<path d="M4 7V5h16v2M12 5v14M9 19h6"/>',
    mapa: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    contraste: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
    externo: '<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    flecha: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8M13 8.5l3.5 3.5-3.5 3.5"/>',
    lista: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    computador: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M2 20h20"/>',
    escudo: '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/>',
    salud: '<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M12 8v8M8 12h8"/>'
  };
  const EMOJI = {
    '🏠': 'casa', '🏘': 'casa', '🗳': 'urna', '⚖': 'balanza', '🧑‍⚖': 'balanza', '✅': 'check', '👍': 'check', '✔': 'check',
    '👥': 'personas', '👪': 'personas', '✋': 'personas', '👤': 'persona', '🙋': 'persona', '👩': 'persona', '🧒': 'persona',
    '🧮': 'calculadora', '➗': 'calculadora', '🔢': 'calculadora', '📄': 'documento', '📃': 'documento', '📑': 'documento',
    '🧾': 'documento', '📋': 'lista', '📜': 'documento', '📝': 'lapiz', '✍': 'lapiz', '🖊': 'lapiz', '✏': 'lapiz',
    '🤝': 'union', '🤲': 'union', '✉': 'correo', '📨': 'correo', '📮': 'correo', '❓': 'ayuda', '📘': 'libro', '📖': 'libro',
    '📚': 'libro', '📒': 'libro', '🛠': 'herramienta', '🏗': 'herramienta', '🧱': 'herramienta', '📅': 'calendario',
    '⏳': 'reloj', '⏱': 'reloj', '📥': 'descargar', '⬇': 'descargar', '🔎': 'buscar', '🔍': 'buscar', '👀': 'buscar',
    '🪑': 'silla', '📍': 'ubicacion', '🏛': 'institucion', '🏙': 'edificio', '🌄': 'casa', '📊': 'grafico', '📣': 'megafono',
    '🗣': 'megafono', '👔': 'maletin', '🚦': 'semaforo', '🎬': 'video', '⚠': 'alerta', '❌': 'cerrar', '🚫': 'cerrar',
    '👎': 'cerrar', '🪪': 'cedula', '🔒': 'candado', '🧭': 'brujula', '🗂': 'carpeta', '📎': 'clip', '📞': 'telefono',
    '🧩': 'cuadricula', '🖨': 'imprimir', '⭐': 'estrella', '🔗': 'enlace', '🔁': 'repetir', '🔄': 'repetir', '➕': 'mas',
    '⬜': 'cuadro', '↔': 'flechas', '🎓': 'birrete', '🌐': 'globo', '🎯': 'diana', '🎮': 'diana', '🔤': 'texto',
    '🗺': 'mapa', '💬': 'chat', '☰': 'menu', '◐': 'contraste', '↗': 'externo', '✏️': 'lapiz', '💻': 'computador', '🛡': 'escudo', '🏥': 'salud'
  };
  const PUNTOS = { '🟢': 'verde', '🟡': 'amarillo', '🔴': 'rojo' };
  // Emojis (con selector de variación y uniones) y flecha ↗
  const RE = /(?:[←-⇿⌀-⏿☀-➿⬀-⯿]|[\uD83C-\uD83E][\uDC00-\uDFFF])️?(?:‍(?:[☀-➿]|[\uD83C-\uD83E][\uDC00-\uDFFF])️?)*/g;
  // Símbolos tipográficos que se dejan como texto
  const TEXTO = new Set(['→', '←', '✕', '✓', '★', '↶', '↓', '↑']);

  function ico(nombre, clase) { return `<svg class="ico${clase ? ' ' + clase : ''}" aria-hidden="true" focusable="false"><use href="#i-${nombre}"></use></svg>`; }

  function sprite() {
    const d = document.createElement('div');
    d.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">${Object.entries(I).map(([n, p]) => `<symbol id="i-${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</symbol>`).join('')}</svg>`;
    document.body.insertBefore(d.firstChild, document.body.firstChild);
  }

  const base = (e) => e.replace(/️/g, '');
  const SALTAR = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'TITLE', 'NOSCRIPT', 'CODE', 'PRE']);

  function cambiarTexto(nodo) {
    const t = nodo.nodeValue;
    RE.lastIndex = 0;
    if (!RE.test(t)) return;
    const padre = nodo.parentNode;
    if (!padre || SALTAR.has(padre.nodeName) || padre.closest('svg')) return;
    if (padre.closest('option, select')) { nodo.nodeValue = t.replace(RE, (m) => (TEXTO.has(m) ? m : '')).replace(/^\s+/, ''); return; }
    const frag = document.createDocumentFragment();
    let ultimo = 0;
    t.replace(RE, (m, i) => {
      if (TEXTO.has(m)) return m;
      frag.appendChild(document.createTextNode(t.slice(ultimo, i)));
      const b = base(m);
      const span = document.createElement('span');
      if (PUNTOS[b]) { span.className = `punto punto--${PUNTOS[b]}`; span.setAttribute('aria-hidden', 'true'); }
      else if (EMOJI[b] || EMOJI[m]) { span.className = 'ico-envoltura'; span.innerHTML = ico(EMOJI[b] || EMOJI[m]); }
      if (span.className) frag.appendChild(span);
      ultimo = i + m.length;
      return m;
    });
    if (!ultimo) return;
    frag.appendChild(document.createTextNode(t.slice(ultimo).replace(/^\s(?=\s)/, '')));
    padre.replaceChild(frag, nodo);
  }
  function limpiarAtributos(el) {
    ['placeholder', 'title', 'aria-label'].forEach((a) => {
      const v = el.getAttribute && el.getAttribute(a);
      RE.lastIndex = 0;
      if (v && RE.test(v)) el.setAttribute(a, v.replace(RE, (m) => (TEXTO.has(m) ? m : '')).trim());
    });
  }
  function recorrer(raiz) {
    if (raiz.nodeType === 3) { cambiarTexto(raiz); return; }
    if (raiz.nodeType !== 1 || SALTAR.has(raiz.nodeName)) return;
    limpiarAtributos(raiz);
    raiz.querySelectorAll('[placeholder],[title],[aria-label]').forEach(limpiarAtributos);
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    const nodos = [];
    while (w.nextNode()) nodos.push(w.currentNode);
    nodos.forEach(cambiarTexto);
  }

  document.addEventListener('DOMContentLoaded', () => {
    sprite();
    recorrer(document.body);
    new MutationObserver((ms) => ms.forEach((m) => {
      if (m.type === 'characterData') cambiarTexto(m.target);
      else m.addedNodes.forEach(recorrer);
    })).observe(document.body, { childList: true, subtree: true, characterData: true });
  });

  window.Iconos = { ico, recorrer };
})();
