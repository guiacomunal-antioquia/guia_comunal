/* Calculadora del cociente electoral, independiente de la herramienta de registro.
   Reglas (Ley 2166 de 2021, art. 34; Manual Comunal, p. 49):
   - Votos válidos = votos de las planchas + votos en blanco. Los nulos no cuentan.
   - Cociente = votos válidos ÷ cargos. Cada plancha gana un cargo por cada cociente completo.
   - Los cargos que faltan van, uno a uno, a las planchas con mayor residuo (votos que les sobran).
   - Con una sola plancha no hay cociente: necesita la mitad más uno de los votos.
   - Qué cargo exacto (presidente, vicepresidente…) le toca a cada plancha queda por validar con la
     Dirección: la calculadora muestra un orden tentativo (primero la plancha con más cargos).
   - Nombres (opcional): si la persona escribe los candidatos de cada plancha en su orden, cada cargo
     muestra a quien le toca: el primer cargo que gana una plancha es para su primer nombre, el
     segundo para el segundo, etc. Sin nombres funciona solo con números. */
(function () {
  'use strict';
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const r2 = (x) => String(Math.round(x * 100) / 100).replace('.', ',');
  // Colores del Manual de Identidad Visual para distinguir las planchas
  const COLORES = ['#018D38', '#3561AB', '#F28E18', '#8B4A97', '#B0942B', '#0B5640', '#8FCAF0', '#212529'];
  const QUE = {
    dir: { t: 'Junta Directiva', n: 4, cargos: ['Presidente(a)', 'Vicepresidente(a)', 'Tesorero(a)', 'Secretario(a)'] },
    con: { t: 'Convivencia y Conciliación', n: 3, cargos: ['Conciliador(a)', 'Conciliador(a)', 'Conciliador(a)'] },
    del: { t: 'Delegados a la Asocomunal', n: 3, cargos: ['Delegado(a) y su suplente', 'Delegado(a) y su suplente', 'Delegado(a) y su suplente'] },
    otro: { t: 'Otro número de cargos', n: 0 }
  };
  const S = { que: 'dir', cargos: 4, np: 2, votos: ['', ''], bl: '', nu: '', junta: '', nombres: [], verNombres: false };
  let caja;
  const num = (v) => Math.max(0, parseInt(v, 10) || 0);

  function datos() {
    return `<div class="calc__datos">
      <div class="campo campo--ancho"><span class="etiq">1. ¿Qué cargos va a repartir?</span>
        <div class="opciones opciones--grandes" role="radiogroup" aria-label="Cargos que se reparten">${Object.entries(QUE).map(([k, x]) => `<label class="opcion"><input type="radio" name="cQue" value="${k}" ${S.que === k ? 'checked' : ''}><span>${esc(x.t)}${x.n ? ` <small>(${x.n})</small>` : ''}</span></label>`).join('')}</div></div>
      <div class="fila">
        <div class="campo"><label for="cCargos">2. Cargos que se reparten</label><input type="number" id="cCargos" min="1" max="30" inputmode="numeric" value="${S.cargos}" ${S.que === 'otro' ? '' : 'readonly'}></div>
        <div class="campo"><label for="cNp">3. ¿Cuántas planchas hubo?</label><input type="number" id="cNp" min="1" max="8" inputmode="numeric" value="${S.np}"></div>
      </div>
      <p class="etiq">4. Votos de cada una</p>
      <div class="fila calc__votos" id="cVotos">${votosHTML()}</div>
      <details class="calc__nombres" id="cNombresCaja" ${S.verNombres ? 'open' : ''}><summary>+ Agregar candidatos (opcional)</summary>
        <p class="ayuda">Escriba los nombres de cada plancha <b>en su orden</b>. El resultado mostrará quién queda en cada cargo.</p>
        <div class="calc__nombres-grid" id="cNombres">${nombresHTML()}</div></details>
      <div class="botones"><button type="button" class="btn btn--texto" data-calc-ejemplo>Probar con un ejemplo</button><button type="button" class="btn btn--texto" data-calc-borrar>Borrar los votos</button></div>
    </div>
    <div id="cRes" aria-live="polite"></div>`;
  }
  function votosHTML() {
    return Array.from({ length: S.np }, (_, i) => `<div class="campo calc__plancha" style="--c:${COLORES[i % COLORES.length]}"><label for="cV${i}">Plancha ${i + 1}</label><input type="number" id="cV${i}" data-voto="${i}" min="0" inputmode="numeric" value="${esc(S.votos[i])}" placeholder="0"></div>`).join('') +
      `<div class="campo"><label for="cBl">En blanco</label><input type="number" id="cBl" min="0" inputmode="numeric" value="${esc(S.bl)}" placeholder="0"></div>
       <div class="campo"><label for="cNu">Nulos</label><input type="number" id="cNu" min="0" inputmode="numeric" value="${esc(S.nu)}" placeholder="0"></div>`;
  }

  function nombresHTML() {
    return Array.from({ length: S.np }, (_, i) => `<fieldset style="border-top:4px solid ${COLORES[i % COLORES.length]}"><legend>Plancha ${i + 1}</legend><ol>${
      Array.from({ length: Math.max(1, num(S.cargos)) }, (_, k) => `<li><input data-nombre="${i}:${k}" value="${esc((S.nombres[i] || [])[k])}" placeholder="Nombre ${k + 1}" aria-label="Plancha ${i + 1}, candidato ${k + 1}" autocomplete="off"></li>`).join('')}</ol></fieldset>`).join('');
  }
  // Nombre de quien ocupa el n-ésimo cargo que gana la plancha i (vacío si no lo escribieron)
  const quien = (i, n) => String((S.nombres[i] || [])[n] || '').trim();
  const hayNombres = () => S.nombres.some((xs) => (xs || []).some((x) => String(x || '').trim()));

  function calcular() {
    const votos = Array.from({ length: S.np }, (_, i) => num(S.votos[i]));
    const bl = num(S.bl), nu = num(S.nu), cargos = Math.max(1, num(S.cargos));
    const validos = votos.reduce((a, b) => a + b, 0) + bl;
    if (!validos) return null;
    if (S.np === 1) { const total = validos + nu; return { una: true, votos, bl, nu, cargos, total, minimo: Math.floor(total / 2) + 1 }; }
    const cuo = validos / cargos;
    const por = votos.map((v) => Math.floor(v / cuo));
    const res = votos.map((v, i) => v - por[i] * cuo);
    const extra = votos.map(() => 0);
    let quedan = cargos - por.reduce((a, b) => a + b, 0);
    const orden = votos.map((_, i) => i).filter((i) => votos[i] > 0).sort((a, b) => res[b] - res[a] || votos[b] - votos[a]);
    let empate = false;
    orden.forEach((i, j) => {
      if (quedan <= 0) return;
      const sig = orden[j + 1];
      if (quedan === 1 && sig !== undefined && Math.abs(res[i] - res[sig]) < 1e-9) empate = true;
      extra[i]++; quedan--;
    });
    return { votos, bl, nu, cargos, validos, cuo, por, res, extra, orden, empate, total: votos.map((_, i) => por[i] + extra[i]) };
  }

  const nombre = (i) => `Plancha ${i + 1}`;
  const color = (i) => COLORES[i % COLORES.length];
  function barras(r) {
    const max = Math.max(...r.votos, r.bl, r.nu, 1);
    const fila = (t, v, c, tachado) => `<li class="${tachado ? 'barra-voto--nulo' : ''}"><span>${t}</span><i style="--p:${(v / max) * 100}%;--c:${c}"></i><b>${v}</b></li>`;
    return `<ul class="barras-voto">${r.votos.map((v, i) => fila(nombre(i), v, color(i))).join('')}${fila('En blanco', r.bl, '#6C757D')}${fila('Nulos', r.nu, '#DC3545', true)}</ul>`;
  }

  function resultado() {
    const box = caja.querySelector('#cRes');
    const r = calcular();
    if (!r) { box.innerHTML = '<p class="nota calc__vacio">Escriba los votos y el resultado aparece aquí.</p>'; return; }
    const titulo = `<div class="solo-imprimir"><p class="ceja">Gobernación de Antioquia · Dirección de Participación Comunitaria y Ciudadana</p><h2>Reparto de cargos – ${esc(QUE[S.que].t)}</h2><p>${S.junta ? esc(S.junta) + ' · ' : ''}${new Date().toLocaleDateString('es-CO')}</p></div>`;
    const imprimir = `<div class="botones no-imprimir"><button type="button" class="btn btn--grande" data-calc-imprimir>🖨️ Imprimir o guardar en PDF</button></div>
      <div class="campo no-imprimir calc__junta"><label for="cJunta">Nombre del organismo comunal (opcional, sale en la impresión)</label><input id="cJunta" value="${esc(S.junta)}" autocomplete="off"></div>`;
    if (r.una) {
      const gana = r.votos[0] >= r.minimo;
      box.innerHTML = `<div class="calc__res" id="calcImprimible">${titulo}
        <div class="reparto reparto--una"><div class="reparto__paso"><span class="reparto__n">1</span><h3>Se cuentan los votos</h3>${barras(r)}<p>Total de votos: <b>${r.total}</b></p></div>
        <div class="reparto__paso"><span class="reparto__n">2</span><h3>Una sola plancha: no hay cociente</h3><p>Necesita la <b>mitad más uno</b> de los votos: <b>${r.minimo}</b>.</p>
          <p class="calc__veredicto calc__veredicto--${gana ? 'ok' : 'no'}">${gana ? `✅ Plancha 1 obtuvo ${r.votos[0]}: gana los ${r.cargos} cargos.` : `❌ Plancha 1 obtuvo ${r.votos[0]}: no alcanza. La elección de este bloque no queda en firme.`}</p></div></div>
        ${gana && hayNombres() ? `<h3 class="sub">Así quedan los cargos</h3><ol class="calc__cargos">${Array.from({ length: r.cargos }, (_, k) => `<li><span>${esc((QUE[S.que].cargos || [])[k] || `Cargo ${k + 1}`)}</span><b>${quien(0, k) ? esc(quien(0, k)) + ' · ' : ''}Plancha 1</b></li>`).join('')}</ol>` : ''}
        ${imprimir}</div>`;
      return;
    }
    const sillas = [];
    const ranking = r.votos.map((_, i) => i).sort((a, b) => r.total[b] - r.total[a] || r.votos[b] - r.votos[a]);
    ranking.forEach((i) => { for (let s = 0; s < r.total[i]; s++) sillas.push(i); });
    const nombres = QUE[S.que].cargos || Array.from({ length: r.cargos }, (_, k) => `Cargo ${k + 1}`);
    const faltan = r.cargos - r.por.reduce((a, b) => a + b, 0);
    box.innerHTML = `<div class="calc__res" id="calcImprimible">${titulo}
      <div class="reparto">
        <div class="reparto__paso"><span class="reparto__n">1</span><h3>Se cuentan los votos</h3>${barras(r)}
          <p>Votos válidos = ${r.votos.join(' + ')} + ${r.bl} en blanco = <b>${r.validos}</b><br><small>Los nulos no cuentan.</small></p></div>
        <div class="reparto__paso"><span class="reparto__n">2</span><h3>Se saca el cociente</h3>
          <p class="formula"><b>${r.validos}</b> votos ÷ <b>${r.cargos}</b> cargos = <b class="grande">${r2(r.cuo)}</b></p><p><small>Cada ${r2(r.cuo)} votos = 1 cargo</small></p></div>
        <div class="reparto__paso"><span class="reparto__n">3</span><h3>Cargos por cociente</h3>
          ${r.votos.map((v, i) => `<p><i class="calc__marca" style="--c:${color(i)}"></i>${nombre(i)}: ${v} ÷ ${r2(r.cuo)} = <b>${r.por[i]} cargo${r.por[i] === 1 ? '' : 's'}</b> · sobran <b>${r2(r.res[i])}</b></p>`).join('')}
          <p><small>Van ${r.cargos - faltan} de ${r.cargos} cargos.</small></p></div>
        <div class="reparto__paso"><span class="reparto__n">4</span><h3>Mayor residuo</h3>
          ${faltan ? `<p>${faltan === 1 ? 'El cargo que falta va' : `Los ${faltan} cargos que faltan van, uno a uno,`} a quien le sobraron más votos:</p>
          <ol class="calc__residuos">${r.orden.filter((i) => r.extra[i]).map((i) => `<li><i class="calc__marca" style="--c:${color(i)}"></i>${nombre(i)} (sobran ${r2(r.res[i])}) → <b>+${r.extra[i]}</b></li>`).join('')}</ol>`
          : '<p>No sobran cargos: todos se repartieron por cociente.</p>'}
          ${r.empate ? '<p class="aviso aviso--error">⚠️ Hay <b>empate</b> en los residuos. El último cargo se resuelve como dice el acta de la asamblea preparatoria (por ejemplo, sorteo).</p>' : ''}</div>
      </div>
      <h3 class="sub">Así quedan los cargos</h3>
      <div class="sillas sillas--calc" aria-hidden="true">${sillas.map((i) => `<span class="silla" style="background:${color(i)}">🪑<small>${i + 1}</small></span>`).join('')}</div>
      <div class="tabla-desliza"><table class="tabla-comp"><thead><tr><th>Plancha</th><th>Votos</th><th>Por cociente</th><th>Sobran</th><th>Por residuo</th><th>Total</th></tr></thead>
        <tbody>${r.votos.map((v, i) => `<tr><td><i class="calc__marca" style="--c:${color(i)}"></i>${nombre(i)}</td><td>${v}</td><td>${r.por[i]}</td><td>${r2(r.res[i])}</td><td>${r.extra[i]}</td><td><b>${r.total[i]}</b></td></tr>`).join('')}</tbody></table></div>
      <h3 class="sub">Qué cargos le corresponden a cada plancha</h3>
      <ol class="calc__cargos">${sillas.map((i, k) => { const n = quien(i, sillas.slice(0, k).filter((x) => x === i).length);
        return `<li><span>${esc(nombres[k] || `Cargo ${k + 1}`)}</span><b><i class="calc__marca" style="--c:${color(i)}"></i>${n ? `<span class="calc__quien">${esc(n)}</span> · ` : ''}${nombre(i)}</b></li>`; }).join('')}</ol>
      ${hayNombres() ? '<p class="nota">Cada plancha ocupa sus cargos con sus candidatos en el orden en que los escribió.</p>' : ''}
      <p class="nota">Orden tentativo: primero la plancha con más cargos. Si sus estatutos dicen otra cosa, se aplican los estatutos.</p>
      ${imprimir}</div>`;
  }

  function pintar() { caja.innerHTML = datos(); resultado(); }

  document.addEventListener('DOMContentLoaded', () => {
    caja = document.getElementById('calcApp');
    if (!caja) return;
    pintar();
    caja.addEventListener('toggle', (ev) => { if (ev.target.id === 'cNombresCaja') S.verNombres = ev.target.open; }, true);
    caja.addEventListener('change', (ev) => {
      const el = ev.target;
      if (el.name === 'cQue') { S.que = el.value; if (QUE[S.que].n) S.cargos = QUE[S.que].n; pintar(); if (S.que === 'otro') caja.querySelector('#cCargos').focus(); }
    });
    caja.addEventListener('input', (ev) => {
      const el = ev.target;
      if (el.id === 'cNp') {
        const n = Math.min(8, Math.max(1, parseInt(el.value, 10) || 0));
        if (!el.value) return;
        S.np = n; S.votos.length = n;
        caja.querySelector('#cVotos').innerHTML = votosHTML();
        caja.querySelector('#cNombres').innerHTML = nombresHTML();
      } else if (el.id === 'cCargos') { S.cargos = Math.min(30, Math.max(1, parseInt(el.value, 10) || 1)); caja.querySelector('#cNombres').innerHTML = nombresHTML(); }
      else if (el.dataset.nombre) { const [i, k] = el.dataset.nombre.split(':').map(Number); (S.nombres[i] = S.nombres[i] || [])[k] = el.value; }
      else if (el.dataset.voto) S.votos[+el.dataset.voto] = el.value;
      else if (el.id === 'cBl') S.bl = el.value;
      else if (el.id === 'cNu') S.nu = el.value;
      else if (el.id === 'cJunta') { S.junta = el.value; return; }
      resultado();
    });
    caja.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-calc-ejemplo')) { Object.assign(S, { que: 'dir', cargos: 4, np: 2, votos: ['70', '46'], bl: '12', nu: '4' }); pintar(); }
      if (b.hasAttribute('data-calc-borrar')) { Object.assign(S, { votos: Array(S.np).fill(''), bl: '', nu: '' }); pintar(); }
      if (b.hasAttribute('data-calc-imprimir')) { document.body.classList.add('imprimiendo-calc'); window.print(); setTimeout(() => document.body.classList.remove('imprimiendo-calc'), 500); }
    });
  });
})();
