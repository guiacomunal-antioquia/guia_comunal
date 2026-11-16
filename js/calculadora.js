/* Calculadora del cociente electoral, independiente de la herramienta de registro.
   Reglas (Ley 2166 de 2021, art. 34; Manual Comunal, p. 49):
   - El cociente se aplica solo cuando hay dos o más planchas y solo en Junta Directiva,
     Convivencia y Conciliación y Delegados (Manual, p. 49).
   - Votos válidos = votos de las planchas + votos en blanco. Los nulos no cuentan.
   - Cociente = votos válidos ÷ cargos. Cada plancha gana un cargo por cada cociente completo.
   - Los cargos que faltan van, uno a uno, a las planchas con mayor residuo (votos que les sobran).
   - FISCALÍA: no se aplica el cociente. El fiscal arrastra a su suplente: la plancha con más
     votos gana los dos cargos (fiscal y fiscal suplente de esa plancha).
   - DELEGADOS: cada delegado va con su suplente (se reparten 3 puestos de delegado + suplente).
   - Con una sola plancha no hay cociente: necesita la mitad más uno de los votos.
   - Quién ocupa cada cargo (misma regla que la herramienta de registro, js/formulario.js): los
     cargos se ordenan empezando por la plancha con más cargos, y cada cargo es para la persona que
     esa plancha postuló A ESE CARGO (como en el formato de postulación por planchas). Por validar
     con la Dirección; si los estatutos dicen otra cosa, mandan los estatutos.
   - Candidatos (opcional): nombres y documento de cada cargo, como en el formato de planchas. Con
     tarjeta de identidad en Directiva, Fiscalía o Conciliación avisa que es menor de edad.
   Nada se guarda: lo escrito se pierde al recargar la página. */
(function () {
  'use strict';
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const r2 = (x) => String(Math.round(x * 100) / 100).replace('.', ',');
  const norm = (t) => String(t || '').replace(/[^0-9a-z]/gi, '').toUpperCase();
  // Colores del Manual de Identidad Visual para distinguir las planchas
  const COLORES = ['#018D38', '#3561AB', '#F28E18', '#8B4A97', '#B0942B', '#0B5640', '#8FCAF0', '#212529'];
  const MAX_PL = 8;
  const DOCS = [['CC', 'CC'], ['TI', 'TI'], ['CE', 'CE'], ['PPT', 'PPT'], ['PA', 'Pasaporte'], ['OT', 'Otro']];
  /* Bloques: filas = cargos que postula cada plancha; par = personas por puesto (delegado + suplente,
     fiscal + suplente); modo 'mayoria' = sin cociente (Fiscalía). mayor = exige mayoría de edad. */
  const QUE = {
    dir: { t: 'Junta Directiva', corto: 'Directiva', filas: ['Presidente(a)', 'Vicepresidente(a)', 'Tesorero(a)', 'Secretario(a)'], par: 1, mayor: true },
    fis: { t: 'Fiscalía', corto: 'Fiscal y suplente', filas: ['Fiscal', 'Fiscal suplente'], par: 2, modo: 'mayoria', mayor: true },
    con: { t: 'Convivencia y Conciliación', corto: '3 conciliadores', filas: ['Conciliador(a) 1', 'Conciliador(a) 2', 'Conciliador(a) 3'], par: 1, mayor: true },
    del: { t: 'Delegados a la Asocomunal', corto: '3 con sus suplentes', filas: ['Delegado(a) 1', 'Suplente del delegado(a) 1', 'Delegado(a) 2', 'Suplente del delegado(a) 2', 'Delegado(a) 3', 'Suplente del delegado(a) 3'], par: 2 },
    otro: { t: 'Otro número de cargos', corto: 'Usted elige cuántos', filas: null, par: 1 }
  };
  const nuevaPlancha = () => ({ v: {}, c: {} });
  const S = { que: 'dir', otros: 2, planchas: [nuevaPlancha(), nuevaPlancha()], bl: {}, nu: {}, junta: '' };
  let caja;
  const num = (v) => Math.max(0, parseInt(v, 10) || 0);
  const B = () => QUE[S.que];
  const filas = () => B().filas || Array.from({ length: Math.max(1, S.otros) }, (_, k) => `Cargo ${k + 1}`);
  const puestos = () => filas().length / B().par;
  const color = (i) => COLORES[i % COLORES.length];
  const nomPl = (i) => `Plancha ${i + 1}`;
  const cand = (i, f) => { const c = (S.planchas[i].c[S.que] = S.planchas[i].c[S.que] || []); return (c[f] = c[f] || { nombre: '', tdoc: 'CC', doc: '' }); };
  const quien = (i, f) => { const c = ((S.planchas[i].c[S.que] || [])[f]) || {}; return { nombre: String(c.nombre || '').trim(), tdoc: c.tdoc || 'CC', doc: String(c.doc || '').trim() }; };
  const docTxt = (p) => p.doc ? `${p.tdoc === 'CC' ? 'CC' : (DOCS.find((d) => d[0] === p.tdoc) || [, p.tdoc])[1]} ${p.doc}` : '';

  /* ---------- Formulario ---------- */
  function datos() {
    return `<div class="calc__datos">
      <div class="campo campo--ancho"><span class="etiq"><span class="calc__n">1</span> ¿Qué cargos va a repartir?</span>
        <div class="opciones opciones--grandes" role="radiogroup" aria-label="Cargos que se reparten">${Object.entries(QUE).map(([k, x]) => `<label class="opcion"><input type="radio" name="cQue" value="${k}" ${S.que === k ? 'checked' : ''}><span>${esc(x.t)} <small>(${esc(x.corto)})</small></span></label>`).join('')}</div>
        ${S.que === 'otro' ? `<div class="campo calc__otros"><label for="cCargos">¿Cuántos cargos se reparten?</label><input type="number" id="cCargos" min="1" max="30" inputmode="numeric" value="${S.otros}"></div>` : ''}
        ${B().modo === 'mayoria' ? '<p class="aviso aviso--info calc__regla"><b>En la Fiscalía no se aplica el cociente.</b> La plancha con más votos gana los dos cargos: su fiscal y su fiscal suplente.</p>' : ''}
        ${S.que === 'del' ? '<p class="ayuda">Cada delegado(a) se elige con su suplente: se reparten 3 puestos.</p>' : ''}</div>
      <div class="campo campo--ancho"><span class="etiq"><span class="calc__n">2</span> Las planchas: votos y candidatos</span>
        <p class="ayuda">Escriba los votos de cada plancha. Los nombres son opcionales: si los escribe como en el formato de la plancha, el resultado dirá quién queda en cada cargo.</p>
        <div class="calc-planchas" id="cPlanchas">${planchasHTML()}</div>
        <div class="botones"><button type="button" class="btn btn--claro" data-calc-agregar ${S.planchas.length >= MAX_PL ? 'disabled' : ''}>+ Agregar otra plancha</button></div></div>
      <div class="campo campo--ancho"><span class="etiq"><span class="calc__n">3</span> Votos en blanco y nulos</span>
        <div class="fila calc__votos">
          <div class="campo"><label for="cBl">En blanco</label><input type="number" id="cBl" min="0" inputmode="numeric" value="${esc(S.bl[S.que] || '')}" placeholder="0"></div>
          <div class="campo"><label for="cNu">Nulos</label><input type="number" id="cNu" min="0" inputmode="numeric" value="${esc(S.nu[S.que] || '')}" placeholder="0"></div>
        </div></div>
      <div class="botones"><button type="button" class="btn btn--texto" data-calc-ejemplo>Probar con un ejemplo</button><button type="button" class="btn btn--texto" data-calc-borrar>Borrar todo</button></div>
    </div>
    <div id="cRes" aria-live="polite"></div>`;
  }

  function planchasHTML() {
    return S.planchas.map((pl, i) => `<section class="calc-pl" style="--c:${color(i)}" aria-label="${nomPl(i)}">
      <div class="calc-pl__cab"><h3><i class="calc__marca" style="--c:${color(i)}"></i>${nomPl(i)}</h3>
        ${S.planchas.length > 1 ? `<button type="button" class="btn btn--texto btn--peque" data-calc-quitar="${i}" aria-label="Quitar la ${nomPl(i)}">Quitar</button>` : ''}</div>
      <div class="campo calc-pl__votos"><label for="cV${i}">Votos de la ${nomPl(i)}</label><input type="number" id="cV${i}" data-voto="${i}" min="0" inputmode="numeric" value="${esc(pl.v[S.que] || '')}" placeholder="0"></div>
      <details class="calc-pl__cand" ${S.planchas[i].abierta ? 'open' : ''} data-cand-caja="${i}"><summary>Candidatos de la ${nomPl(i)} <small>(opcional)</small></summary>
        <div class="calc-cand calc-cand--cab" aria-hidden="true"><span>Cargo</span><span>Nombres y apellidos completos</span><span>Documento</span></div>
        ${filas().map((f, k) => { const c = quien(i, k); return `<div class="calc-cand">
          <span class="calc-cand__cargo">${esc(f)}</span>
          <input data-cand="${i}:${k}:nombre" value="${esc(c.nombre)}" placeholder="Nombres y apellidos" aria-label="${nomPl(i)}, ${esc(f)}: nombres y apellidos" autocomplete="off">
          <span class="calc-cand__doc"><select data-cand="${i}:${k}:tdoc" aria-label="${nomPl(i)}, ${esc(f)}: tipo de documento">${DOCS.map(([v, t]) => `<option value="${v}" ${c.tdoc === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
          <input data-cand="${i}:${k}:doc" value="${esc(c.doc)}" placeholder="Número" inputmode="text" aria-label="${nomPl(i)}, ${esc(f)}: número de documento" autocomplete="off"></span></div>`; }).join('')}
      </details></section>`).join('');
  }

  /* ---------- Cálculo ---------- */
  function calcular() {
    const np = S.planchas.length;
    const votos = S.planchas.map((pl) => num(pl.v[S.que]));
    const bl = num(S.bl[S.que]), nu = num(S.nu[S.que]), n = puestos();
    const validos = votos.reduce((a, b) => a + b, 0) + bl;
    if (!validos) return null;
    if (np === 1) { const total = validos + nu; return { una: true, votos, bl, nu, n, total, minimo: Math.floor(total / 2) + 1, asign: [votos[0] >= Math.floor(total / 2) + 1 ? n : 0] }; }
    if (B().modo === 'mayoria') {
      const max = Math.max(...votos);
      const gan = votos.indexOf(max);
      const empate = max > 0 && votos.filter((v) => v === max).length > 1;
      return { mayoria: true, votos, bl, nu, n, validos, gan: max > 0 ? gan : -1, empate, asign: votos.map((_, i) => (i === gan && max > 0 ? 1 : 0)) };
    }
    const cuo = validos / n;
    const por = votos.map((v) => Math.floor(v / cuo));
    const res = votos.map((v, i) => v - por[i] * cuo);
    const extra = votos.map(() => 0);
    let quedan = n - por.reduce((a, b) => a + b, 0);
    const orden = votos.map((_, i) => i).filter((i) => votos[i] > 0).sort((a, b) => res[b] - res[a] || votos[b] - votos[a]);
    let empate = false;
    orden.forEach((i, j) => {
      if (quedan <= 0) return;
      const sig = orden[j + 1];
      if (quedan === 1 && sig !== undefined && Math.abs(res[i] - res[sig]) < 1e-9) empate = true;
      extra[i]++; quedan--;
    });
    return { votos, bl, nu, n, validos, cuo, por, res, extra, orden, empate, asign: votos.map((_, i) => por[i] + extra[i]) };
  }

  /* Cargos en orden: primero la plancha con más cargos (desempate: más votos). Cada puesto lleva
     las filas de ese cargo (con su suplente si es par) y la persona que esa plancha postuló a él. */
  function cargos(r) {
    const ranking = S.planchas.map((_, i) => i).sort((a, b) => r.asign[b] - r.asign[a] || r.votos[b] - r.votos[a]);
    const fuente = [];
    ranking.forEach((i) => { for (let s = 0; s < r.asign[i]; s++) fuente.push(i); });
    const out = [];
    fuente.forEach((i, s) => { for (let q = 0; q < B().par; q++) { const f = s * B().par + q; out.push({ cargo: filas()[f], plancha: i, p: quien(i, f) }); } });
    return out;
  }

  /* Avisos sobre los candidatos: menores de edad (tarjeta de identidad) y documentos repetidos */
  function avisos() {
    const rojos = [], amarillos = [], usos = {};
    S.planchas.forEach((_, i) => filas().forEach((f, k) => {
      const p = quien(i, k);
      if (!p.doc) return;
      if (p.tdoc === 'TI') {
        if (B().mayor) rojos.push(`<b>${esc(p.nombre || f)}</b> (${nomPl(i)}, ${esc(f)}) tiene tarjeta de identidad: es <b>menor de edad</b>. En ${esc(B().t)} todos deben ser mayores de edad (Ley 2166, art. 38, y Manual Comunal). La plancha debe cambiar a ese candidato; si el documento está mal, corríjalo.`);
        else amarillos.push(`<b>${esc(p.nombre || f)}</b> (${nomPl(i)}, ${esc(f)}) tiene tarjeta de identidad. Confirme que tiene más de 14 años (requisito para estar afiliado, art. 20).`);
      }
      const d = norm(p.doc);
      (usos[d] = usos[d] || []).push(`${nomPl(i)}, ${f}`);
    }));
    Object.entries(usos).forEach(([d, l]) => { if (l.length > 1) amarillos.push(`El documento <b>${esc(d)}</b> aparece en ${l.length} cargos (${esc(l.join('; '))}). Nadie puede estar en dos cargos ni en dos planchas.`); });
    return (rojos.length ? `<div class="aviso aviso--error no-imprimir"><b>🔴 Revise los candidatos</b><ul>${rojos.map((x) => `<li>${x}</li>`).join('')}</ul></div>` : '')
      + (amarillos.length ? `<div class="aviso aviso--clave no-imprimir"><b>🟡 Para revisar</b><ul>${amarillos.map((x) => `<li>${x}</li>`).join('')}</ul></div>` : '');
  }

  function barras(r) {
    const max = Math.max(...r.votos, r.bl, r.nu, 1);
    const fila = (t, v, c, tachado) => `<li class="${tachado ? 'barra-voto--nulo' : ''}"><span>${t}</span><i style="--p:${(v / max) * 100}%;--c:${c}"></i><b>${v}</b></li>`;
    return `<ul class="barras-voto">${r.votos.map((v, i) => fila(nomPl(i), v, color(i))).join('')}${fila('En blanco', r.bl, '#6C757D')}${fila('Nulos', r.nu, '#DC3545', true)}</ul>`;
  }

  // Tabla del resultado: cargo, persona, documento y plancha
  function tablaCargos(lista) {
    return `<div class="tabla-desliza"><table class="tabla-comp calc__tabla"><thead><tr><th>Cargo</th><th>Queda elegido(a)</th><th>Documento</th><th>Plancha</th></tr></thead><tbody>${lista.map((c) => `<tr style="--c:${color(c.plancha)}">
      <td>${esc(c.cargo)}</td>
      <td>${c.p.nombre ? `<b>${esc(c.p.nombre)}</b>` : `<span class="calc__sin-nombre">Candidato(a) a ${esc(c.cargo.toLowerCase())} de la ${nomPl(c.plancha)}</span>`}</td>
      <td>${esc(docTxt(c.p))}</td>
      <td><span class="calc__chip" style="--c:${color(c.plancha)}">${nomPl(c.plancha)}</span></td></tr>`).join('')}</tbody></table></div>`;
  }

  function resultado() {
    const box = caja.querySelector('#cRes');
    const r = calcular();
    const av = avisos();
    if (!r) { box.innerHTML = `${av}<p class="nota calc__vacio">Escriba los votos y el resultado aparece aquí.</p>`; return; }
    const titulo = `<div class="solo-imprimir"><p class="ceja">Gobernación de Antioquia · Dirección de Participación Comunitaria y Ciudadana</p><h2>Reparto de cargos – ${esc(B().t)}</h2><p>${S.junta ? esc(S.junta) + ' · ' : ''}${new Date().toLocaleDateString('es-CO')}</p></div>`;
    const imprimir = `<div class="campo no-imprimir calc__junta"><label for="cJunta">Nombre del organismo comunal (opcional, sale en la impresión)</label><input id="cJunta" value="${esc(S.junta)}" autocomplete="off"></div>
      <div class="botones no-imprimir"><button type="button" class="btn btn--grande" data-calc-imprimir>🖨️ Imprimir o guardar en PDF</button></div>`;
    const nota = '<p class="nota">Cada cargo es para la persona que esa plancha postuló a ese cargo. Orden tentativo: primero la plancha con más cargos. Si sus estatutos dicen otra cosa, se aplican los estatutos.</p>';

    // Una sola plancha: mitad más uno
    if (r.una) {
      const gana = r.asign[0] > 0;
      box.innerHTML = `${av}<div class="calc__res" id="calcImprimible">${titulo}
        <h3 class="calc__res-tit">Resultado</h3>
        <p class="calc__veredicto calc__veredicto--${gana ? 'ok' : 'no'}">${gana ? `✅ La ${nomPl(0)} obtuvo ${r.votos[0]} de ${r.total} votos (necesitaba ${r.minimo}): gana todos los cargos.` : `❌ La ${nomPl(0)} obtuvo ${r.votos[0]} de ${r.total} votos y necesitaba ${r.minimo}: no alcanza. La elección de este bloque no queda en firme.`}</p>
        ${gana ? tablaCargos(cargos(r)) : ''}
        <details class="mas-info calc__como" open><summary>¿Cómo se calculó?</summary>
          <div class="reparto reparto--una"><div class="reparto__paso"><span class="reparto__n">1</span><h3>Se cuentan los votos</h3>${barras(r)}<p>Total de votos: <b>${r.total}</b></p></div>
          <div class="reparto__paso"><span class="reparto__n">2</span><h3>Una sola plancha: no hay cociente</h3><p>Necesita la <b>mitad más uno</b> de los votos: <b>${r.minimo}</b>.</p></div></div></details>
        ${imprimir}</div>`;
      return;
    }

    // Fiscalía: sin cociente, el fiscal arrastra al suplente
    if (r.mayoria) {
      box.innerHTML = `${av}<div class="calc__res" id="calcImprimible">${titulo}
        <h3 class="calc__res-tit">Resultado</h3>
        ${r.empate ? '<p class="aviso aviso--error">⚠️ Hay <b>empate</b> entre las planchas con más votos. Se resuelve como dice el acta de la asamblea preparatoria (por ejemplo, otra votación o sorteo).</p>' : ''}
        ${r.gan >= 0 && !r.empate ? `<p class="calc__veredicto calc__veredicto--ok">✅ La ${nomPl(r.gan)} tiene más votos (${r.votos[r.gan]}): gana el fiscal <b>y su suplente</b>.</p>${tablaCargos(cargos(r))}` : ''}
        <details class="mas-info calc__como" open><summary>¿Cómo se calculó?</summary>
          <div class="reparto reparto--una"><div class="reparto__paso"><span class="reparto__n">1</span><h3>Se cuentan los votos</h3>${barras(r)}<p>Votos válidos: <b>${r.validos}</b> <small>(los nulos no cuentan)</small></p></div>
          <div class="reparto__paso"><span class="reparto__n">2</span><h3>Fiscalía: sin cociente</h3><p>El cociente se aplica solo en Directiva, Conciliación y Delegados (Manual Comunal, p. 49). En la Fiscalía <b>la plancha con más votos gana los dos cargos</b>: el fiscal arrastra a su suplente.</p></div></div></details>
        ${imprimir}</div>`;
      return;
    }

    // Dos o más planchas: cociente y mayor residuo
    const lista = cargos(r);
    const faltan = r.n - r.por.reduce((a, b) => a + b, 0);
    // Delegados: se reparten puestos (cada uno = delegado + suplente)
    const unidad = B().par === 2 ? 'puesto' : 'cargo';
    const unidades = B().par === 2 ? 'puestos' : 'cargos';
    const sillas = [];
    S.planchas.map((_, i) => i).sort((a, b) => r.asign[b] - r.asign[a] || r.votos[b] - r.votos[a]).forEach((i) => { for (let s = 0; s < r.asign[i]; s++) sillas.push(i); });
    box.innerHTML = `${av}<div class="calc__res" id="calcImprimible">${titulo}
      <h3 class="calc__res-tit">Resultado: así quedan los cargos</h3>
      ${r.empate ? '<p class="aviso aviso--error">⚠️ Hay <b>empate</b> en los residuos. El último cargo se resuelve como dice el acta de la asamblea preparatoria (por ejemplo, sorteo).</p>' : ''}
      <p class="calc__resumen">${S.planchas.map((_, i) => `<span class="calc__chip" style="--c:${color(i)}">${nomPl(i)}: ${r.asign[i]} ${r.asign[i] === 1 ? unidad : unidades}</span>`).join(' ')}</p>
      ${tablaCargos(lista)}
      ${nota}
      <details class="mas-info calc__como"><summary>¿Cómo se calculó? (paso a paso)</summary>
        <div class="reparto">
          <div class="reparto__paso"><span class="reparto__n">1</span><h3>Se cuentan los votos</h3>${barras(r)}
            <p>Votos válidos = ${r.votos.join(' + ')} + ${r.bl} en blanco = <b>${r.validos}</b><br><small>Los nulos no cuentan.</small></p></div>
          <div class="reparto__paso"><span class="reparto__n">2</span><h3>Se saca el cociente</h3>
            <p class="formula"><b>${r.validos}</b> votos ÷ <b>${r.n}</b> ${unidades} = <b class="grande">${r2(r.cuo)}</b></p><p><small>Cada ${r2(r.cuo)} votos = 1 ${unidad}</small></p></div>
          <div class="reparto__paso"><span class="reparto__n">3</span><h3>${B().par === 2 ? 'Puestos' : 'Cargos'} por cociente</h3>
            ${r.votos.map((v, i) => `<p><i class="calc__marca" style="--c:${color(i)}"></i>${nomPl(i)}: ${v} ÷ ${r2(r.cuo)} = <b>${r.por[i]}</b> · sobran <b>${r2(r.res[i])}</b></p>`).join('')}
            <p><small>Van ${r.n - faltan} de ${r.n}.</small></p></div>
          <div class="reparto__paso"><span class="reparto__n">4</span><h3>Mayor residuo</h3>
            ${faltan ? `<p>${faltan === 1 ? 'El que falta va' : `Los ${faltan} que faltan van, uno a uno,`} a quien le sobraron más votos:</p>
            <ol class="calc__residuos">${r.orden.filter((i) => r.extra[i]).map((i) => `<li><i class="calc__marca" style="--c:${color(i)}"></i>${nomPl(i)} (sobran ${r2(r.res[i])}) → <b>+${r.extra[i]}</b></li>`).join('')}</ol>`
            : '<p>No sobra ninguno: todos se repartieron por cociente.</p>'}</div>
        </div>
        <div class="sillas sillas--calc" aria-hidden="true">${sillas.map((i) => `<span class="silla" style="background:${color(i)}">🪑<small>${i + 1}</small></span>`).join('')}</div>
        <div class="tabla-desliza"><table class="tabla-comp"><thead><tr><th>Plancha</th><th>Votos</th><th>Por cociente</th><th>Sobran</th><th>Por residuo</th><th>Total</th></tr></thead>
          <tbody>${r.votos.map((v, i) => `<tr><td><i class="calc__marca" style="--c:${color(i)}"></i>${nomPl(i)}</td><td>${v}</td><td>${r.por[i]}</td><td>${r2(r.res[i])}</td><td>${r.extra[i]}</td><td><b>${r.asign[i]}</b></td></tr>`).join('')}</tbody></table></div>
      </details>
      ${imprimir}</div>`;
  }

  function pintar() { caja.innerHTML = datos(); resultado(); }
  function pintarPlanchas() {
    caja.querySelector('#cPlanchas').innerHTML = planchasHTML();
    const ag = caja.querySelector('[data-calc-agregar]'); if (ag) ag.disabled = S.planchas.length >= MAX_PL;
    resultado();
  }

  /* Ejemplo del Manual Comunal (p. 49): 70 y 46 votos, 12 en blanco y 4 nulos, con nombres ficticios */
  function ejemplo() {
    const nombres = [['ANA EJEMPLO UNO', 'BETO EJEMPLO DOS', 'CARLA EJEMPLO TRES', 'DARIO EJEMPLO CUATRO', 'ELENA EJEMPLO CINCO', 'FABIO EJEMPLO SEIS'],
      ['GLORIA MUESTRA UNO', 'HECTOR MUESTRA DOS', 'IRENE MUESTRA TRES', 'JULIO MUESTRA CUATRO', 'KAREN MUESTRA CINCO', 'LUIS MUESTRA SEIS']];
    S.planchas = [nuevaPlancha(), nuevaPlancha()];
    ['dir', 'fis', 'con', 'del'].forEach((k) => {
      S.planchas.forEach((pl, i) => {
        pl.v[k] = ['70', '46'][i];
        pl.c[k] = QUE[k].filas.map((_, f) => ({ nombre: nombres[i][f], tdoc: 'CC', doc: String((i + 1) * 10000000 + f + 1 + (k === 'dir' ? 0 : k === 'fis' ? 10 : k === 'con' ? 20 : 30)) }));
      });
      S.bl[k] = '12'; S.nu[k] = '4';
    });
    S.planchas.forEach((pl) => { pl.abierta = true; });
    if (S.que === 'otro') S.que = 'dir';
  }

  document.addEventListener('DOMContentLoaded', () => {
    caja = document.getElementById('calcApp');
    if (!caja) return;
    pintar();
    caja.addEventListener('toggle', (ev) => { const d = ev.target.closest && ev.target.closest('[data-cand-caja]'); if (d && S.planchas[+d.dataset.candCaja]) S.planchas[+d.dataset.candCaja].abierta = d.open; }, true);
    caja.addEventListener('change', (ev) => {
      const el = ev.target;
      if (el.name === 'cQue') { S.que = el.value; pintar(); if (S.que === 'otro') caja.querySelector('#cCargos').focus(); }
      else if (el.dataset.cand && el.tagName === 'SELECT') { const [i, k, campo] = el.dataset.cand.split(':'); cand(+i, +k)[campo] = el.value; resultado(); }
    });
    caja.addEventListener('input', (ev) => {
      const el = ev.target;
      if (el.id === 'cCargos') { if (!el.value) return; S.otros = Math.min(30, Math.max(1, parseInt(el.value, 10) || 1)); caja.querySelector('#cPlanchas').innerHTML = planchasHTML(); }
      else if (el.dataset.cand) { const [i, k, campo] = el.dataset.cand.split(':'); cand(+i, +k)[campo] = el.value; }
      else if (el.dataset.voto) S.planchas[+el.dataset.voto].v[S.que] = el.value;
      else if (el.id === 'cBl') S.bl[S.que] = el.value;
      else if (el.id === 'cNu') S.nu[S.que] = el.value;
      else if (el.id === 'cJunta') { S.junta = el.value; return; }
      else return;
      resultado();
    });
    caja.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-calc-agregar') && S.planchas.length < MAX_PL) {
        S.planchas.push(nuevaPlancha()); pintarPlanchas();
        const v = caja.querySelector(`#cV${S.planchas.length - 1}`); if (v) v.focus();
      }
      if (b.dataset.calcQuitar !== undefined) {
        const i = +b.dataset.calcQuitar, pl = S.planchas[i];
        const tiene = Object.values(pl.v).some((x) => x) || Object.values(pl.c).some((l) => (l || []).some((c) => c && (c.nombre || c.doc)));
        if (!tiene || confirm(`¿Quitar la ${nomPl(i)} con sus votos y candidatos?`)) { S.planchas.splice(i, 1); pintarPlanchas(); }
      }
      if (b.hasAttribute('data-calc-ejemplo')) { ejemplo(); pintar(); }
      if (b.hasAttribute('data-calc-borrar') && confirm('¿Borrar todas las planchas, votos y candidatos?')) { Object.assign(S, { planchas: [nuevaPlancha(), nuevaPlancha()], bl: {}, nu: {} }); pintar(); }
      if (b.hasAttribute('data-calc-imprimir')) {
        // En la impresión el paso a paso sale abierto
        const d = caja.querySelector('.calc__como'); const abierto = d && d.open; if (d) d.open = true;
        document.body.classList.add('imprimiendo-calc'); window.print();
        setTimeout(() => { document.body.classList.remove('imprimiendo-calc'); if (d) d.open = abierto; }, 500);
      }
    });
  });
})();
