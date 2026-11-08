/* Juego de conocimientos: preguntas, verdadero o falso y ordenar las etapas.
   Corto, visual y con la explicación de cada respuesta. */
(function () {
  'use strict';
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mezclar = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  let caja, juego, i, puntos, lista, orden;

  function menu() {
    caja.innerHTML = `<div class="juego-menu">
      <button type="button" class="juego-opcion" data-juego="preguntas"><span>❓</span><b>Preguntas</b><small>${window.JUEGO.preguntas.length} preguntas de selección</small></button>
      <button type="button" class="juego-opcion" data-juego="vf"><span>✅</span><b>¿Verdadero o falso?</b><small>${window.JUEGO.verdaderoFalso.length} afirmaciones</small></button>
      <button type="button" class="juego-opcion" data-juego="ordena"><span>🔢</span><b>Ordena la elección</b><small>Pon las etapas en orden</small></button></div>`;
  }
  function empezar(tipo) {
    juego = tipo; i = 0; puntos = 0;
    if (tipo === 'preguntas') lista = mezclar(window.JUEGO.preguntas);
    if (tipo === 'vf') lista = mezclar(window.JUEGO.verdaderoFalso);
    if (tipo === 'ordena') { lista = mezclar(window.LINEA_TIEMPO); orden = []; }
    pintar();
  }
  const barra = () => `<div class="juego-barra"><i style="width:${(i / lista.length) * 100}%"></i></div><p class="juego-n">${i + 1} de ${lista.length} · ⭐ ${puntos}</p>`;
  function pintar() {
    if (juego === 'ordena') return pintarOrden();
    if (i >= lista.length) return final();
    const x = lista[i];
    if (juego === 'preguntas') {
      caja.innerHTML = `${barra()}<h3 class="juego-q">${esc(x[0])}</h3><div class="juego-resp">${x[1].map((o, k) => `<button type="button" class="juego-btn" data-r="${k}">${esc(o)}</button>`).join('')}</div><div class="juego-fb" aria-live="polite"></div>`;
    } else {
      caja.innerHTML = `${barra()}<h3 class="juego-q">«${esc(x[0])}»</h3><div class="juego-resp juego-resp--dos"><button type="button" class="juego-btn" data-r="1">👍 Verdadero</button><button type="button" class="juego-btn" data-r="0">👎 Falso</button></div><div class="juego-fb" aria-live="polite"></div>`;
    }
  }
  function responder(r) {
    const x = lista[i];
    const ok = juego === 'preguntas' ? r === x[2] : (r === 1) === x[1];
    if (ok) puntos++;
    caja.querySelectorAll('.juego-btn').forEach((b) => {
      b.disabled = true;
      const correcta = juego === 'preguntas' ? +b.dataset.r === x[2] : (+b.dataset.r === 1) === x[1];
      if (correcta) b.classList.add('juego-btn--ok'); else if (+b.dataset.r === r) b.classList.add('juego-btn--mal');
    });
    caja.querySelector('.juego-fb').innerHTML = `<div class="juego-exp juego-exp--${ok ? 'ok' : 'mal'}"><img src="img/mascota/${ok ? 'idea' : 'duda'}.webp" alt="" width="60" height="92"><p><b>${ok ? '¡Correcto!' : 'No es así.'}</b> ${esc(juego === 'preguntas' ? x[3] : x[2])}</p></div>
      <button type="button" class="btn btn--grande" data-sig>${i + 1 < lista.length ? 'Siguiente →' : 'Ver resultado'}</button>`;
  }
  function pintarOrden() {
    const restantes = lista.filter((x) => !orden.includes(x));
    caja.innerHTML = `<p class="juego-n">Toque las etapas en el orden en que ocurren.</p>
      <ol class="orden-elegido">${orden.map((x) => `<li>${x.icono} ${esc(x.titulo)}</li>`).join('') || '<li class="vacio">Toque la primera etapa…</li>'}</ol>
      <div class="juego-resp">${restantes.map((x) => `<button type="button" class="juego-btn" data-et="${x.id}">${x.icono} ${esc(x.titulo)}</button>`).join('')}</div>
      ${orden.length ? '<button type="button" class="btn btn--texto" data-deshacer>↶ Deshacer</button>' : ''}`;
    if (!restantes.length) {
      const bien = orden.filter((x, k) => x.id === window.LINEA_TIEMPO[k].id).length;
      caja.innerHTML += `<div class="juego-exp juego-exp--${bien === orden.length ? 'ok' : 'mal'}"><img src="img/mascota/${bien === orden.length ? 'idea' : 'duda'}.webp" alt="" width="60" height="92">
        <p><b>${bien} de ${orden.length} en su lugar.</b> El orden correcto es: ${window.LINEA_TIEMPO.map((x) => esc(x.titulo)).join(' → ')}.</p></div>
        <div class="botones"><button type="button" class="btn" data-juego="ordena">Intentar de nuevo</button><button type="button" class="btn btn--claro" data-menu>Otros juegos</button></div>`;
    }
  }
  function final() {
    const pct = puntos / lista.length;
    caja.innerHTML = `<div class="juego-final"><img src="img/mascota/${pct >= 0.7 ? 'saluda' : 'lista'}.webp" alt="" width="110" height="168">
      <div><h3>${pct >= 0.7 ? '¡Muy bien!' : '¡Buen intento!'}</h3><p class="juego-puntaje">⭐ ${puntos} de ${lista.length}</p>
      <p>${pct >= 0.7 ? 'Ya conoce las reglas principales de la elección.' : 'Repase la línea de tiempo y las preguntas frecuentes, y vuelva a intentarlo.'}</p>
      <div class="botones"><button type="button" class="btn" data-juego="${juego}">Jugar otra vez</button><button type="button" class="btn btn--claro" data-menu>Otros juegos</button></div></div></div>`;
  }
  /* Cada juego tiene su dirección (#/aprenda/juego/preguntas): "atrás" vuelve al menú de juegos */
  const marcar = (r) => { if (window.Rutas) window.Rutas.marcar(r); };
  document.addEventListener('DOMContentLoaded', () => {
    caja = document.getElementById('juegoApp');
    if (!caja) return;
    menu();
    if (window.Rutas) window.Rutas.al('aprenda/juego', (tipo) => { if (['preguntas', 'vf', 'ordena'].includes(tipo)) { if (juego !== tipo) empezar(tipo); } else { juego = null; menu(); } });
    caja.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      if (b.dataset.juego) { empezar(b.dataset.juego); marcar('aprenda/juego/' + b.dataset.juego); }
      else if (b.hasAttribute('data-menu')) { juego = null; menu(); marcar('aprenda/juego'); }
      else if (b.dataset.r !== undefined) responder(+b.dataset.r);
      else if (b.hasAttribute('data-sig')) { i++; pintar(); }
      else if (b.dataset.et) { orden.push(lista.find((x) => x.id === b.dataset.et)); pintarOrden(); }
      else if (b.hasAttribute('data-deshacer')) { orden.pop(); pintarOrden(); }
    });
  });
})();
