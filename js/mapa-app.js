/* Mapa interactivo de Antioquia por subregiones y municipios.
   Contornos: DANE, Marco Geoestadístico Nacional 2025 (js/mapa.js). Datos de contacto, fotos y
   cifras: datos/mapa.js (lo que falta no se muestra). */
(function () {
  'use strict';
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clave = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
  // Colores primarios y secundarios del Manual de Identidad Visual; el verde claro #8BC542 lo usa antioquia.gov.co
  const COLORES = {
    'Bajo Cauca': '#3561AB', 'Magdalena Medio': '#F28E18', 'Nordeste': '#8B4A97', 'Norte': '#018D38', 'Occidente': '#B0942B',
    'Oriente': '#0B5640', 'Suroeste': '#8BC542', 'Urabá': '#8FCAF0', 'Valle de Aburrá': '#3AF9A2'
  };
  /* Un dato que falta (vacío o 'Dato' en datos/mapa.js) NO se muestra: ni el campo ni su título.
     Si un campo no tiene dato en ningún municipio, no aparece en ninguno. Aparece solo al llenarlo. */
  const hay = (v) => !(v === undefined || v === null || String(v).trim() === '' || v === 'Dato');

  let municipios = [], seleccionado = null;

  function construir() {
    const M = window.MAPA_ANTIOQUIA;
    if (!M) return;
    const porClave = {};
    Object.entries(window.MUNICIPIOS).forEach(([sub, l]) => l.forEach((m) => { porClave[clave(m)] = { m, sub, propio: false }; }));
    Object.entries(window.MUNICIPIOS_PROPIOS).forEach(([m, x]) => { porClave[clave(m)] = { m, sub: x.sub, propio: true, info: x }; });
    municipios = M.municipios.map((x) => {
      const nombre = M.alias[x.clave] || null;
      const info = porClave[nombre ? clave(nombre) : x.clave] || { m: x.dane, sub: '', propio: false };
      return Object.assign({ cod: x.cod, d: x.d }, info);
    });

    const svg = document.getElementById('mapaSvg');
    svg.setAttribute('viewBox', M.viewBox);
    svg.dataset.vb = M.viewBox;
    svg.innerHTML = municipios.map((x, i) => `<path d="${x.d}" data-i="${i}" class="mun ${x.propio ? 'mun--propio' : ''}" style="${x.propio ? '' : `--c:${COLORES[x.sub] || '#ADB5BD'}`}" tabindex="0" role="button" aria-label="${esc(x.m)}, ${esc(x.sub)}${x.propio ? ', atención municipal propia' : ''}"><title>${esc(x.m)}</title></path>`).join('');

    document.getElementById('mapaLeyenda').innerHTML = Object.entries(COLORES).map(([s, c]) => `<button type="button" class="ley" data-sub="${esc(s)}"><i style="background:${c}"></i>${esc(s)}</button>`).join('') +
      '<span class="ley ley--gris"><i></i>Atención municipal propia</span>';
    document.getElementById('mapaLista').innerHTML = municipios.slice().sort((a, b) => a.m.localeCompare(b.m, 'es')).map((x) => `<option value="${esc(x.m)}">`).join('');

    svg.addEventListener('click', (ev) => { const p = ev.target.closest('path'); if (p) seleccionar(municipios[+p.dataset.i].m); });
    svg.addEventListener('keydown', (ev) => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('path')) { ev.preventDefault(); seleccionar(municipios[+ev.target.dataset.i].m); } });
    document.getElementById('mapaLeyenda').addEventListener('click', (ev) => { const b = ev.target.closest('[data-sub]'); if (b) filtrar(b.dataset.sub); });
    document.getElementById('mapaBuscar').addEventListener('change', (ev) => seleccionar(ev.target.value));
    document.getElementById('mapaTodo').addEventListener('click', () => filtrar(null));
  }

  function encuadrar(paths) {
    const svg = document.getElementById('mapaSvg');
    if (!paths) { svg.setAttribute('viewBox', svg.dataset.vb); return; }
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    paths.forEach((p) => { const b = p.getBBox(); x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height); });
    const m = 30;
    svg.setAttribute('viewBox', `${x0 - m} ${y0 - m} ${x1 - x0 + 2 * m} ${y1 - y0 + 2 * m}`);
  }

  function filtrar(sub) {
    const svg = document.getElementById('mapaSvg');
    svg.querySelectorAll('path').forEach((p) => p.classList.toggle('mun--tenue', !!sub && municipios[+p.dataset.i].sub !== sub));
    document.querySelectorAll('#mapaLeyenda [data-sub]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sub === sub)));
    encuadrar(sub ? [...svg.querySelectorAll('path')].filter((p) => municipios[+p.dataset.i].sub === sub) : null);
    document.getElementById('mapaTodo').hidden = !sub;
  }

  function profesionalDe(m) { return Object.entries(window.PROFESIONALES).find(([, p]) => p.municipios.includes(m)); }
  /* Dirección propia de cada municipio: #/mapa/santa-fe-de-antioquia */
  const slug = (m) => clave(m).toLowerCase().replace(/ /g, '-');
  const marcar = (r) => { if (window.Rutas) window.Rutas.marcar(r); };
  // Sin foto (o con la silueta sin-foto.svg) se muestra solo el nombre, sin imagen de relleno.
  const persona = (foto, alt, rol, nombre, extra) => `<div class="mapa-info__persona${foto ? '' : ' mapa-info__persona--sin-foto'}">${foto ? `<img src="${esc(foto)}" alt="${esc(alt)}" width="96" height="120" loading="lazy">` : ''}
    <div><small>${rol}</small><b>${nombre}</b>${extra || ''}</div></div>`;
  const fotoDe = (carpeta, archivo) => (hay(archivo) && archivo !== 'sin-foto.svg') ? `img/${carpeta}/${archivo}` : '';
  const cifras = (lista) => { const l = lista.filter(([, , v]) => hay(v)); return l.length ? `<ul class="mapa-cifras" aria-label="Organismos comunales del municipio">${l.map(([ico, txt, v]) => `<li><span aria-hidden="true">${ico}</span><b>${esc(v)}</b><small>${txt}</small></li>`).join('')}</ul>` : ''; };
  const fila = (dt, v) => hay(v) ? `<dt>${dt}</dt><dd>${esc(v)}</dd>` : '';

  function cerrar() {
    const caja = document.getElementById('mapaInfo');
    if (!caja || caja.hidden) return;
    caja.hidden = true;
    document.querySelectorAll('#mapaSvg .mun--sel').forEach((p) => p.classList.remove('mun--sel'));
    seleccionado = null;
  }

  function seleccionar(nombre, desdeRuta) {
    const i = municipios.findIndex((x) => clave(x.m) === clave(nombre) || slug(x.m) === nombre);
    if (i < 0) return;
    const x = municipios[i];
    seleccionado = x;
    if (!desdeRuta) marcar('mapa/' + slug(x.m));
    const svg = document.getElementById('mapaSvg');
    svg.querySelectorAll('.mun--sel').forEach((p) => p.classList.remove('mun--sel'));
    const p = svg.querySelector(`path[data-i="${i}"]`);
    p.classList.add('mun--sel');
    p.parentNode.appendChild(p);  // queda encima para que se vea el borde
    const caja = document.getElementById('mapaInfo');
    if (x.propio) {
      const f = x.info;
      caja.innerHTML = `<button type="button" class="mapa-info__cerrar" aria-label="Cerrar">✕</button>
        <p class="ceja">${esc(x.sub)}</p><h3>${esc(x.m)}</h3>
        <div class="aviso aviso--gris">Este municipio <b>no es competencia de la Gobernación</b>. A sus organismos comunales los atiende la alcaldía.</div>
        ${[f.entidad, f.tel, f.correo].some(hay) ? `<dl>${fila('🏛️ Entidad que lo atiende', f.entidad)}${fila('📞 Teléfono', f.tel)}${fila('✉️ Correo', f.correo)}</dl>` : ''}
        ${hay(f.web) ? `<a class="btn btn--claro" href="${esc(f.web)}" target="_blank" rel="noopener">Ir a la página de la alcaldía ↗</a>` : ''}`;
    } else {
      const pr = profesionalDe(x.m);
      const c = (window.CONTACTOS_MUNICIPIO || {})[x.m] || {};
      const correo = pr && (window.CORREOS_PROFESIONALES || {})[pr[0]];
      caja.innerHTML = `<button type="button" class="mapa-info__cerrar" aria-label="Cerrar">✕</button>
        <p class="ceja">${esc(x.sub)}</p><h3>${esc(x.m)}</h3>
        ${pr ? persona(fotoDe('profesionales', (window.FOTOS_PROFESIONALES || {})[pr[0]]), `Foto de ${pr[0]}`, '👤 Profesional de zona', esc(pr[0]),
          `<small>Zona ${esc(pr[1].zona)}</small>${hay(correo) ? `<small>✉️ <a href="mailto:${esc(correo)}">${esc(correo)}</a></small>` : ''}`) : ''}
        ${hay(c.promotor) ? persona(fotoDe('promotores', c.fotoPromotor), `Foto de ${c.promotor}`, '🤝 Promotor del municipio', esc(c.promotor), hay(c.contacto) ? `<small>📞 ${esc(c.contacto)}</small>` : '') : ''}
        ${cifras([['🏘️', 'Juntas registradas', c.registradas], ['✅', 'Activas', c.activas], ['⏳', 'Inactivas', c.inactivas], ['🤝', 'Asocomunales', c.asocomunales]])}
        <div class="botones"><a class="btn btn--peque" href="#/eleccion/herramienta" data-mun="${esc(x.m)}">Hacer la elección con ${esc(x.m)}</a></div>`;
    }
    caja.hidden = false;
    // En el celular el recuadro queda debajo del mapa: se lleva la vista hasta él
    if (window.innerWidth <= 760) requestAnimationFrame(() => caja.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    caja.querySelector('.mapa-info__cerrar').addEventListener('click', () => { cerrar(); marcar('mapa'); });
    const ir = caja.querySelector('[data-mun]');
    if (ir) ir.addEventListener('click', () => window.prellenarMunicipio && window.prellenarMunicipio(ir.dataset.mun));
    document.getElementById('mapaBuscar').value = x.m;
  }

  document.addEventListener('DOMContentLoaded', () => {
    construir();
    // Atrás / adelante del navegador: abre o cierra el recuadro según la dirección
    if (window.Rutas) window.Rutas.al('mapa', (param) => { if (param) seleccionar(param, true); else cerrar(); });
  });
  window.Mapa = { seleccionar, filtrar, cerrar };
})();
