/* Formulario de elección de dignatarios, paso a paso.
   Basado en la propuesta "formulario-elecciones-jac" del equipo, con prevalidación (Ley 2166 de 2021,
   Decreto 1501 de 2023 y Manual Comunal), formatos oficiales en Word y envío a la Dirección por correo. */
(function () {
  'use strict';

  /* ======================= Utilidades ======================= */
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
  const dig = (c) => String(c || '').replace(/\D/g, '');
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fecha = (iso) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return null; const [a, m, d] = iso.split('-').map(Number); return new Date(a, m - 1, d); };
  const isoDe = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const hoy = () => isoDe(new Date());
  const dias = (a, b) => Math.round((b - a) / 86400000);
  const masMeses = (f, n) => { const r = new Date(f); r.setMonth(r.getMonth() + n); return r; };
  const fF = (iso) => { const f = fecha(iso); return f ? `${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(2, '0')}/${f.getFullYear()}` : ''; };
  const fCorta = (iso) => { const f = fecha(iso); return f ? `${f.getDate()} de ${MESES[f.getMonth()]}` : ''; };
  const fH = (h) => { if (!/^\d{2}:\d{2}/.test(h || '')) return ''; let [a, b] = h.split(':').map(Number); const s = a >= 12 ? 'p. m.' : 'a. m.'; a = a % 12 || 12; return `${a}:${String(b).padStart(2, '0')} ${s}`; };
  const edad = (n, ref) => { let e = ref.getFullYear() - n.getFullYear(); const m = ref.getMonth() - n.getMonth(); if (m < 0 || (m === 0 && ref.getDate() < n.getDate())) e--; return e; };
  const correoOk = (c) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c || '');
  const subDe = (m) => Object.keys(window.MUNICIPIOS).find((s) => window.MUNICIPIOS[s].includes(m)) || '';
  const MARCA = ' (X)', SIN = '    ';
  const leer = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };
  const ponerRuta = (o, r, v) => { const p = r.split('.'); for (let i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = v; };
  const leerRuta = (o, r) => r.split('.').reduce((x, k) => (x == null ? x : x[k]), o);
  const idDe = (ruta) => 'f-' + ruta.replace(/\./g, '-');

  /* Persona: tipo y número de documento, apellidos y nombres (como en el documento).
     El campo se sigue llamando "ced" para no perder los borradores guardados; "tdoc" es el tipo. */
  const TIPOS_DOC = [['CC', 'Cédula de ciudadanía'], ['TI', 'Tarjeta de identidad'], ['CE', 'Cédula de extranjería'],
    ['PPT', 'PPT (Permiso por Protección Temporal)'], ['PA', 'Pasaporte'], ['OT', 'Otro']];
  const NOM_DOC = { CC: 'la cédula', TI: 'la tarjeta de identidad', CE: 'la cédula de extranjería', PPT: 'el PPT', PA: 'el pasaporte', OT: 'el documento' };
  const tdoc = (p) => (p && TIPOS_DOC.some(([k]) => k === p.tdoc) ? p.tdoc : 'CC');
  // Número normalizado: solo dígitos; el pasaporte y "Otro" pueden llevar letras.
  const numDoc = (p) => { if (!p) return ''; const c = String(p.ced || ''); return ['PA', 'OT'].includes(tdoc(p)) ? c.toUpperCase().replace(/[^A-Z0-9]/g, '') : dig(c); };
  // Así va en los Word oficiales (la casilla dice "Cédula"; si es otro documento, con su sigla delante).
  const docTexto = (p) => { const n = numDoc(p); if (!n) return ''; const t = tdoc(p); return t === 'CC' ? n : `${t === 'PA' ? 'Pasaporte' : t === 'OT' ? 'Doc.' : t} ${n}`; };
  const per = () => ({ tdoc: 'CC', ced: '', ape: '', nom: '' });
  const cand = () => ({ tdoc: 'CC', ced: '', ape: '', nom: '', mujer: false, mayor: false });
  const nombre = (p) => p ? `${(p.nom || '').trim()} ${(p.ape || '').trim()}`.trim() : '';
  const vacia = (p) => !p || !(p.ced || p.ape || p.nom);
  const llena = (p) => p && numDoc(p) && (p.ape || '').trim() && (p.nom || '').trim();

  /* ======================= Estado ======================= */
  const CLAVE = 'dpcc-formulario-v2';
  const planchaNueva = (n) => ({
    numero: String(n), fecha: '', hora: '',
    dir: [cand(), cand(), cand(), cand()], fis: [cand(), cand()], con: [cand(), cand(), cand()],
    com: [Object.assign({ comision: '' }, cand()), Object.assign({ comision: '' }, cand()), Object.assign({ comision: '' }, cand())],
    del: [cand(), cand(), cand(), cand(), cand(), cand()], presentadaPor: [per()], recibidaPor: ['', '', ''], parentesco: false
  });
  const votosBloque = () => ({ p: [], bl: '', nu: '' });
  const nuevo = () => ({
    paso: 0,
    // "junta" guarda los datos del organismo comunal (JAC, JVC o Asocomunal); se conserva el nombre por los borradores.
    junta: { tipo: '', id: '', nombre: '', subregion: '', municipio: '', nit: '', territorio: '', direccion: '', correo: '', celular: '', telefono: '' },
    // Solicitud nueva o subsanación (versión 2, 3…) de una anterior. periodo: '' = se calcula con la fecha de la elección.
    solicitud: { tipo: 'Nueva', anterior: '', version: '' }, periodo: '',
    asamblea: { actaNo: '', lugar: '', fecha: '', hora: '', horaFin: '', totalAfiliados: '', asistentes: '', actaAntNo: '', actaAntFecha: '',
      pres: Object.assign(per(), { tel: '' }), sec: Object.assign(per(), { tel: '' }),
      tipoEleccion: 'Total', cargosProveer: '', sistemaEleccion: '', numMesas: '', jurados: [per(), per(), per()], sistemaPostulacion: '',
      limFecha: '', limHora: '', lugarEleccion: '', elecFecha: '', elecHora: '', empate: '', comisiones: '', observaciones: '' },
    tribunal: { tp: [per(), per(), per()], ts: [per(), per(), per()], dignatarios: '' },
    // Listados de asistencia firmados: solo se guarda el nombre y el peso de cada archivo (la imagen no).
    adjuntos: { prep: [], elec: [] },
    bloques: { dir: true, fis: true, con: true, com: true, del: true },
    planchas: [planchaNueva(1)], activa: 0,
    votacion: { realizada: '', actaNo: '', lugar: '', fecha: '', hora: '', horaFin: '', horaInicio: '', horaCierre: '', lugarPublicacion: '',
      afiliadosHabiles: '', votantes: '', tgPresentes: '', firma1: Object.assign(per(), { tel: '' }), firma2: Object.assign(per(), { tel: '' }),
      votos: { dir: votosBloque(), fis: votosBloque(), con: votosBloque(), del: votosBloque() }, ajustes: {}, coordinadores: [], observaciones: '' },
    confirmadas: {}, autoriza: false, registro: null
  });
  let S = Object.assign(nuevo(), leer(CLAVE) || {});
  /* Borrador: se guarda en este navegador con cada cambio y al cerrar o recargar la página. */
  function guardarS() {
    guardar(CLAVE, S);
    const g = document.getElementById('fGuardado');
    if (g) g.textContent = `✓ Borrador guardado en este equipo · ${new Date().toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}`;
  }
  S.adjuntos = Object.assign({ prep: [], elec: [] }, S.adjuntos);
  S.junta = Object.assign(nuevo().junta, S.junta);
  S.solicitud = Object.assign(nuevo().solicitud, S.solicitud);
  delete S.asistentes;  // borradores de la versión anterior (listado escrito a mano)

  /* ======================= Tipo de organismo =======================
     JAC y JVC (primer grado) eligen igual. La Asocomunal (segundo grado) tiene diferencias en la
     Ley 2166 de 2021: sus afiliados son las juntas y vota la asamblea de delegados (art. 21 y 41);
     sus dignatarios deben ser delegados certificados y los conciliadores, de juntas distintas
     (art. 38); el bloque 4 son secretarías ejecutivas (art. 34) y sus delegados van a la Federación.
     POR CONFIRMAR CON LA DIRECCIÓN: quórum de la Asocomunal (la ley solo lo fija para las JAC),
     si puede elegir en forma directa y qué formatos Word usa. */
  const ORGANISMOS = { JAC: 'Junta de Acción Comunal (JAC)', JVC: 'Junta de Vivienda Comunitaria (JVC)', Asocomunal: 'Asociación de Juntas (Asocomunal)' };
  const aso = () => S.junta.tipo === 'Asocomunal';
  const sigla = () => S.junta.tipo || 'organismo';
  const miembros = () => (aso() ? 'delegados' : 'afiliados');
  const FECHA_ASO_2026 = '2026-07-26';  // último domingo de julio (art. 36, b)

  const BLOQUES = [
    { k: 'dir', titulo: 'Junta Directiva', cargos: ['Presidente(a)', 'Vicepresidente(a)', 'Tesorero(a)', 'Secretario(a)'], mayor: true, icono: '👔' },
    { k: 'fis', titulo: 'Fiscalía', cargos: ['Fiscal', 'Fiscal suplente'], mayor: true, icono: '🔍' },
    { k: 'con', titulo: 'Convivencia y Conciliación', cargos: ['Conciliador(a) 1', 'Conciliador(a) 2', 'Conciliador(a) 3'], mayor: true, icono: '🤝' },
    { k: 'com', get titulo() { return aso() ? 'Secretarías ejecutivas' : 'Coordinadores de comisiones de trabajo'; }, comision: true, icono: '🛠️' },
    { k: 'del', get titulo() { return aso() ? 'Delegados a la Federación' : 'Delegados a la ASOCOMUNAL'; }, cargos: ['Delegado(a) 1', 'Suplente 1', 'Delegado(a) 2', 'Suplente 2', 'Delegado(a) 3', 'Suplente 3'], icono: '📣' }
  ];
  const comNombre = () => (aso() ? 'Secretaría' : 'Comisión');

  /* ======================= Período electoral y versiones =======================
     El período es de 4 años y empieza con la elección nacional (art. 33 y 36): JAC y JVC el último
     domingo de abril; Asocomunales, el de julio. Una elección parcial queda en el período vigente. */
  const PERIODOS = ['2022-2026', '2026-2030', '2030-2034'];
  const ultimoDomingo = (anio, mes) => { const d = new Date(anio, mes + 1, 0); d.setDate(d.getDate() - d.getDay()); return d; };
  function periodoAuto() {
    const f = fecha(S.votacion.fecha) || fecha(S.asamblea.elecFecha) || new Date();
    let base = f.getFullYear() - (((f.getFullYear() - 2022) % 4) + 4) % 4;
    if (f < ultimoDomingo(base, aso() ? 6 : 3)) base -= 4;
    return `${base}-${base + 4}`;
  }
  const periodo = () => S.periodo || periodoAuto();
  // Código de registro: DPCC-EL-AAAAMMDD-NNNN (v1) y DPCC-EL-AAAAMMDD-NNNN-v2, -v3… (subsanaciones)
  const raiz = (c) => String(c || '').trim().toUpperCase().replace(/-V\d+$/, '');
  const versionesDe = (r) => (r ? Object.values(leer('dpcc-avances') || {}).filter((x) => x.codigo && raiz(x.codigo) === r) : []);
  const esSub = () => S.solicitud.tipo === 'Subsanación';
  function version() {
    if (!esSub()) return 1;
    const prev = versionesDe(raiz(S.solicitud.anterior)).filter((x) => !S.registro || x.codigo !== S.registro.codigo);
    if (prev.length) return Math.max(...prev.map((x) => x.version || 1)) + 1;
    return Math.max(2, parseInt(S.solicitud.version, 10) || 2);
  }
  /* Subsanación de la solicitud ya enviada desde este equipo: se conservan los datos, se crea la
     versión siguiente y hay que volver a confirmar los avisos y adjuntar los listados. */
  function subsanar() {
    const ant = S.registro ? S.registro.codigo : S.solicitud.anterior;
    S.solicitud = { tipo: 'Subsanación', anterior: ant, version: '' };
    S.registro = null; S.codigoNuevo = ''; S.confirmadas = {}; S.autoriza = false; S.adjuntos = { prep: [], elec: [] };
    VISTAS.prep = []; VISTAS.elec = [];
  }
  const esListas = () => S.asamblea.sistemaPostulacion === 'Por listas';
  const cargoDe = (b, i) => (b.k === 'dir' && esListas()) ? `Candidato(a) ${i + 1}` : b.cargos[i];
  const nomPl = (i) => `${esListas() ? 'Lista' : 'Plancha'} ${(S.planchas[i] && S.planchas[i].numero) || i + 1}`;
  const directa = () => S.asamblea.sistemaEleccion === 'Elección directa';
  const bloqueActivo = (k) => S.asamblea.tipoEleccion !== 'Parcial' || S.bloques[k];

  const PASOS = [
    { t: 'Antes de empezar', ico: '🧾' }, { t: 'Su organismo comunal', ico: '🏘️' }, { t: 'Asamblea preparatoria', ico: '👥' }, { t: 'Tribunal de Garantías', ico: '⚖️' },
    { t: 'Listado de asistencia', ico: '📋' }, { t: 'Planchas o listas', ico: '📝' }, { t: 'Votación y resultados', ico: '🗳️' }, { t: 'Revisar y descargar', ico: '🚦' }, { t: 'Enviar a la Dirección', ico: '📨' }
  ];

  /* Ayudas cortas de cada paso ("¿Cómo se usa?") */
  const AYUDAS = {
    1: { m: 'senala', t: ['Diga si es una solicitud nueva o una subsanación, y qué tipo de organismo es.', 'Busque el ID del organismo en el certificado de SURCO.', 'El correo sirve para que la Dirección le responda.'], g: 'g1' },
    2: { m: 'lista', t: ['Copie los datos del acta de la asamblea preparatoria.', 'Entre la asamblea y la elección debe haber mínimo 30 días.', 'Escriba cómo se resolverán los empates.'], g: 'g2' },
    3: { m: 'lupa', t: ['Son 6 personas: 3 principales y 3 suplentes.', 'No pueden ser candidatos ni dignatarios actuales.', 'Elija el tipo de documento y copie el número, los apellidos y los nombres tal como están en él.'], g: 'g2' },
    4: { m: 'lista', t: ['Escriba cuántos afiliados (o delegados, si es Asocomunal) hay y cuántos asistieron.', 'Tómele una foto clara al listado firmado, o escanéelo.', 'No tiene que escribir los nombres: la Dirección revisa el listado.'], g: 'g2' },
    5: { m: 'senala', t: ['Registre cada plancha como la entregaron al Tribunal.', 'Nadie puede estar en dos cargos ni en dos planchas.', 'Marque "Mujer" y "Mayor de edad" en cada candidato.'], g: 'g3' },
    6: { m: 'idea', t: ['Escriba los votos de cada bloque como quedaron en el escrutinio.', 'La página calcula el cociente y muestra quiénes quedaron elegidos.', 'Al final, adjunte la foto del listado firmado de la elección.'], g: 'g3' },
    7: { m: 'lupa', t: ['Corrija lo rojo y confirme lo amarillo.', 'Cada documento se descarga cuando sus pasos están en verde.', 'Imprima, recoja las firmas originales y escanee.'], g: 'g4' },
    8: { m: 'celular', t: ['Marque la autorización de datos.', 'Abra el correo: el asunto y el mensaje ya están escritos.', 'Solo adjunte el documento escaneado y pulse Enviar.'], g: 'g4' }
  };
  /* Pestaña de "📖 La norma" (js/norma.js) que abre cada paso */
  const NORMA = { 0: 'linea', 1: 'linea', 2: 'linea', 3: 'trib', 4: 'radica', 5: 'plan', 6: 'votos', 7: 'radica', 8: 'radica' };

  /* ======================= Controles ======================= */
  const R = '<span class="req" aria-hidden="true">*</span>';
  function inp(ruta, etiqueta, op = {}) {
    const v = leerRuta(S, ruta);
    return `<div class="campo ${op.ancho ? 'campo--ancho' : ''}"><label for="${idDe(ruta)}">${etiqueta} ${op.req ? R : ''}</label>
      <input id="${idDe(ruta)}" data-k="${ruta}" type="${op.tipo || 'text'}" value="${esc(v)}" ${op.modo ? `inputmode="${op.modo}"` : ''} ${op.ph ? `placeholder="${esc(op.ph)}"` : ''} ${op.min != null ? `min="${op.min}"` : ''} ${op.may ? 'data-may="1"' : ''}>
      ${op.ayuda ? `<span class="ayuda">${op.ayuda}</span>` : ''}</div>`;
  }
  function area(ruta, etiqueta, op = {}) {
    return `<div class="campo campo--ancho"><label for="${idDe(ruta)}">${etiqueta}</label><textarea id="${idDe(ruta)}" data-k="${ruta}" ${op.ph ? `placeholder="${esc(op.ph)}"` : ''}>${esc(leerRuta(S, ruta))}</textarea></div>`;
  }
  function opciones(ruta, etiqueta, ops, op = {}) {
    const v = leerRuta(S, ruta);
    return `<div class="campo campo--ancho"><span class="etiq">${etiqueta} ${op.req ? R : ''}</span><div class="opciones opciones--grandes" id="${idDe(ruta)}" role="radiogroup">${
      ops.map(([val, txt, ico]) => `<label class="opcion"><input type="radio" name="${idDe(ruta)}" data-k="${ruta}" value="${esc(val)}" ${v === val ? 'checked' : ''}><span>${ico ? `<b aria-hidden="true">${ico}</b>` : ''}${esc(txt)}</span></label>`).join('')}</div></div>`;
  }
  function selMun() {
    const j = S.junta;
    const subs = Object.keys(window.MUNICIPIOS);
    return `<div class="campo"><label for="f-junta-subregion">Subregión ${R}</label><select id="f-junta-subregion" data-k="junta.subregion" data-rehacer="1"><option value="">Elija</option>${subs.map((s) => `<option ${s === j.subregion ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></div>
      <div class="campo"><label for="f-junta-municipio">Municipio ${R}</label><select id="f-junta-municipio" data-k="junta.municipio">${(window.MUNICIPIOS[j.subregion] || []).length
        ? '<option value="">Elija</option>' + window.MUNICIPIOS[j.subregion].map((m) => `<option ${m === j.municipio ? 'selected' : ''}>${esc(m)}</option>`).join('') : '<option value="">Primero la subregión</option>'}</select>
        <span class="ayuda">Solo aparecen los municipios que atiende la Gobernación.</span></div>`;
  }
  /* Fila de persona: tipo de documento | número | apellidos | nombres (+ opcionales) */
  function filaPersona(ruta, rol, op = {}) {
    const p = leerRuta(S, ruta) || per();
    const c = (k, lab, extra) => `<td data-col="${lab}"><input id="${idDe(ruta + '.' + k)}" data-k="${ruta}.${k}" value="${esc(p[k])}" aria-label="${esc(rol)}: ${lab}" ${extra || ''}></td>`;
    const t = tdoc(p), letras = ['PA', 'OT'].includes(t);
    return `<tr><td class="rol">${esc(rol)}</td>
      ${op.comision ? `<td data-col="${comNombre()}" class="ancho"><input id="${idDe(ruta + '.comision')}" data-k="${ruta}.comision" value="${esc(p.comision)}" list="catalogoComisiones" placeholder="Nombre de la ${comNombre().toLowerCase()}" data-may="1" aria-label="${esc(rol)}: ${comNombre().toLowerCase()}"></td>` : ''}
      ${op.org ? `<td data-col="Junta que representa" class="ancho"><input id="${idDe(ruta + '.org')}" data-k="${ruta}.org" value="${esc(p.org)}" placeholder="JAC de la que es delegado(a)" data-may="1" aria-label="${esc(rol)}: junta que representa"></td>` : ''}
      <td data-col="Tipo de documento"><select class="tdoc" id="${idDe(ruta + '.tdoc')}" data-k="${ruta}.tdoc" data-rehacer="1" aria-label="${esc(rol)}: tipo de documento">${TIPOS_DOC.map(([k, n]) => `<option value="${k}" ${k === t ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></td>
      ${c('ced', 'Número de documento', letras ? 'placeholder="Letras y números"' : 'inputmode="numeric" placeholder="Solo números"')}
      ${c('ape', 'Apellidos', 'data-may="1"')}
      ${c('nom', 'Nombres', 'data-may="1"')}
      ${op.tel ? c('tel', 'Teléfono', 'inputmode="tel"') : ''}
      ${op.mujer ? `<td class="mini" data-col="Mujer"><input type="checkbox" data-k="${ruta}.mujer" ${p.mujer ? 'checked' : ''} aria-label="${esc(rol)}: es mujer"></td>` : ''}
      ${op.mayor !== undefined ? `<td class="mini" data-col="Mayor de edad">${op.mayor ? `<input type="checkbox" id="${idDe(ruta + '.mayor')}" data-k="${ruta}.mayor" ${p.mayor ? 'checked' : ''} aria-label="${esc(rol)}: mayor de edad">` : ''}</td>` : ''}
      ${op.quitar ? `<td><button type="button" class="btn-quitar" data-quitar="${op.quitar}" aria-label="Quitar ${esc(rol)}">✕</button></td>` : ''}</tr>`;
  }
  function tablaPersonas(filas, op = {}) {
    return `<div class="tabla-desliza"><table class="personas"><thead><tr><th></th>${op.comision ? `<th>${comNombre()}</th>` : ''}${op.org ? '<th>Junta que representa</th>' : ''}<th>Tipo de documento</th><th>Número de documento</th><th>Apellidos</th><th>Nombres</th>${op.tel ? '<th>Teléfono</th>' : ''}${op.mujer ? '<th>Mujer</th>' : ''}${op.mayor !== undefined ? '<th>Mayor de edad</th>' : ''}${op.quitar ? '<th></th>' : ''}</tr></thead><tbody>${filas}</tbody></table></div>`;
  }
  const verificar = () => `<details class="verificar"><summary>🔎 Verificar un documento de identidad</summary>
    <p class="ayuda">Se abre en otra pestaña. Lo que escribió aquí no se pierde.</p>
    <div class="verificar__grid">
      <a href="${window.ENLACES.surcoAfiliados}" target="_blank" rel="noopener"><b>SURCO</b><span>¿Está afiliada? Evite la doble afiliación</span></a>
      <a href="${window.ENLACES.surcoCertificados}" target="_blank" rel="noopener"><b>SURCO</b><span>Certificado: dignatarios actuales</span></a>
      <a href="${window.ENLACES.adres}" target="_blank" rel="noopener"><b>ADRES</b><span>Nombre completo de la persona</span></a>
      <a href="${window.ENLACES.policia}" target="_blank" rel="noopener"><b>Policía</b><span>Antecedentes judiciales</span></a>
    </div></details>`;

  /* Listado de asistencia: formato en blanco para imprimir ANTES de la reunión */
  const LISTADOS = {
    prep: ['Listado de asistencia - Asamblea preparatoria.docx', 'Listado de asistencia de la asamblea preparatoria'],
    asamblea: ['Listado de asistencia - Asamblea de eleccion.docx', 'Listado de asistencia de la asamblea de elección'],
    mesa: ['Listado de asistencia por mesa - Eleccion directa.docx', 'Listado de asistencia por mesa (elección directa)']
  };
  const imprimirAntes = (claves) => `<div class="imprimir-antes"><span class="imprimir-antes__ico" aria-hidden="true">🖨️</span><div>
    <b>Imprímalo y llévelo a la reunión para que los asistentes firmen.</b>
    <div class="botones">${claves.map((k) => `<a class="btn btn--claro btn--peque" href="descargas/${encodeURIComponent(LISTADOS[k][0])}" download>⬇ ${esc(LISTADOS[k][1])}</a>`).join('')}</div></div></div>`;

  /* Adjuntar el listado firmado (foto o escaneado). La página solo revisa que esté adjunto;
     la Dirección verifica firmas y nombres. Mientras no exista la conexión con la Dirección
     (comentario CONECTAR AQUÍ), el archivo se adjunta en el correo del paso 8. */
  const VISTAS = { prep: [], elec: [] };     // vistas previas de esta sesión (no se guardan)
  const MB = (b) => (b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1).replace('.', ',') + ' MB');
  function adjunto(clave, titulo) {
    const xs = S.adjuntos[clave];
    return `<div class="adjunto ${xs.length ? 'adjunto--ok' : ''}" id="${idDe('adjuntos.' + clave)}">
      <div class="adjunto__cab"><span class="adjunto__ico" aria-hidden="true">📎</span><div><b>${esc(titulo)}</b><small>Foto legible o escaneado (JPG, PNG o PDF). Si tiene varias hojas, elija todas las fotos.</small></div></div>
      ${xs.length ? `<ul class="adjunto__lista">${xs.map((a, i) => { const v = VISTAS[clave][i];
        return `<li>${v && v.img ? `<img src="${v.url}" alt="Vista previa de ${esc(a.nombre)}">` : `<span class="adjunto__doc" aria-hidden="true">📄</span>`}
          <span><b>${esc(a.nombre)}</b><small>${MB(a.tam)}${v ? '' : ' · tenga el archivo a mano para el correo'}</small></span>
          <button type="button" class="btn-quitar" data-quitar-adjunto="${clave}:${i}" aria-label="Quitar ${esc(a.nombre)}">✕</button></li>`; }).join('')}</ul>` : ''}
      <label class="btn ${xs.length ? 'btn--claro' : 'btn--grande'} adjunto__btn">📎 ${xs.length ? 'Agregar otra hoja' : 'Adjuntar listado firmado'}<input type="file" class="oculto" accept="image/*,application/pdf" multiple data-adjunto="${clave}"></label>
      <p class="ayuda">✔ La Dirección verifica las firmas y los nombres. La página solo revisa que esté adjunto.</p></div>`;
  }

  /* ======================= Pantallas ======================= */
  const P = {};
  P[0] = () => `
    <div class="antes">
      <img src="img/mascota/saluda.webp" alt="" class="mascota mascota--grande" width="160" height="244">
      <div>
        <h3>Antes de empezar, tenga a la mano:</h3>
        <ul class="antes__lista">
          <li><span>🪪</span>Los <b>documentos de identidad</b> de todas las personas que va a registrar</li>
          <li><span>📄</span>El <b>acta de la asamblea preparatoria</b></li>
          <li><span>📋</span>La <b>foto del listado de asistencia firmado</b> (o escaneado)</li>
          <li><span>📝</span>Las <b>planchas o listas</b> que recibió el Tribunal</li>
          <li><span>🗳️</span>Los <b>resultados de la votación</b>, si ya votaron</li>
          <li><span>🔢</span>El <b>ID del organismo comunal</b> (está en el certificado de SURCO)</li>
          <li><span>🔁</span>Si es una <b>subsanación</b>: el código de la solicitud anterior</li>
        </ul>
        <div class="aviso aviso--info"><b>Importante:</b> esta herramienta hace una <b>prevalidación</b>. La revisión oficial la hace la Dirección. Un semáforo en verde no significa trámite aprobado.</div>
        <p class="ayuda">🔒 Lo que escriba se guarda solo en este equipo, como borrador, aunque cierre la página. Para acompañarle, la Dirección recibe el ID, el nombre y el municipio del organismo y en qué paso va (sin documentos de identidad).</p>
      </div>
    </div>
    ${S.registro ? `<div class="aviso aviso--info"><b>Ya envió la solicitud ${esc(S.registro.codigo)}.</b> Si la Dirección le pidió corregir algo, haga una subsanación: se conservan los datos y se crea una versión nueva.
      <div class="botones"><button type="button" class="btn btn--peque" data-subsanar>🔁 Hacer una subsanación de esta solicitud</button></div></div>` : ''}
    <h4>¿La reunión todavía no se ha hecho?</h4>
    ${imprimirAntes(directa() ? ['prep', 'mesa'] : S.asamblea.sistemaEleccion ? ['prep', 'asamblea'] : ['prep', 'asamblea', 'mesa'])}
    <div class="ced-ejemplo">
      ${svgCedula()}
      <div><h4>Copie los datos igual que en el documento de identidad:</h4><ol class="ced-ejemplo__lista"><li><b>Tipo de documento</b> (cédula, tarjeta de identidad, PPT…)</li><li><b>Número</b>, sin puntos</li><li><b>Apellidos</b></li><li><b>Nombres</b></li></ol>${verificar()}</div>
    </div>`;

  P[1] = () => {
    const so = S.solicitud, prev = versionesDe(raiz(so.anterior));
    const PH = { JAC: 'JAC VEREDA …', JVC: 'JVC URBANIZACIÓN …', Asocomunal: 'ASOCOMUNAL DE …' };
    return `
    ${opciones('solicitud.tipo', '¿Es una solicitud nueva o una subsanación?', [['Nueva', 'Solicitud nueva', '🆕'], ['Subsanación', 'Subsanación (la Dirección pidió corregir)', '🔁']], { req: 1 })}
    ${so.tipo === 'Subsanación' ? `<div class="fila">${inp('solicitud.anterior', 'Código de la solicitud anterior', { req: 1, may: 1, ph: 'DPCC-EL-20261020-1234', ayuda: 'Está en el comprobante o en el correo que envió.' })}
      ${prev.length ? `<div class="campo"><span class="etiq">Versión</span><p class="dato-fijo"><b>v${version()}</b> <small>(la anterior en este equipo es la v${Math.max(...prev.map((x) => x.version || 1))})</small></p></div>`
        : inp('solicitud.version', 'Número de esta versión', { req: 1, tipo: 'number', min: 2, modo: 'numeric', ph: '2', ayuda: 'La primera solicitud es la v1; la primera subsanación, la v2.' })}</div>
      ${S.registro ? `<p class="ayuda">Esta solicitud ya tiene el código ${esc(S.registro.codigo)}. <button type="button" class="btn btn--texto" data-subsanar>Usarla como solicitud anterior</button></p>` : ''}` : ''}
    ${opciones('junta.tipo', 'Tipo de organismo', [['JAC', 'Junta de Acción Comunal (JAC)', '🏘️'], ['JVC', 'Junta de Vivienda Comunitaria (JVC)', '🏠'], ['Asocomunal', 'Asociación de Juntas (Asocomunal)', '🤝']], { req: 1 })}
    ${aso() ? '<div class="aviso aviso--info"><b>Asocomunal:</b> votan los <b>delegados</b> de las juntas afiliadas y los candidatos deben ser delegados certificados (Ley 2166, art. 38). La herramienta se ajusta sola.</div>' : ''}
    <div class="fila">${inp('junta.id', 'ID del organismo', { req: 1, modo: 'numeric', ph: 'Ej.: 12345' })}${inp('junta.nombre', 'Nombre completo del organismo', { req: 1, may: 1, ph: PH[S.junta.tipo] || 'JAC VEREDA …' })}</div>
    <div class="fila">${selMun()}${inp('junta.nit', 'NIT', { modo: 'numeric' })}</div>
    ${aso() ? '' : opciones('junta.territorio', 'Territorio', [['Rural', 'Rural', '🌄'], ['Urbana', 'Urbana', '🏙️']])}
    <div class="fila">${inp('junta.direccion', 'Dirección, vereda o barrio', { ph: 'Ej.: Vereda La Playa, sede de la JAC' })}${inp('junta.correo', 'Correo del organismo', { req: 1, tipo: 'email', modo: 'email' })}${inp('junta.celular', 'Celular', { tipo: 'tel', modo: 'tel' })}</div>
    <div class="fila"><div class="campo"><label for="f-periodo">Período electoral</label><select id="f-periodo" data-k="periodo">
      <option value="" ${S.periodo ? '' : 'selected'}>Automático: ${esc(periodoAuto())}</option>${PERIODOS.map((x) => `<option ${S.periodo === x ? 'selected' : ''}>${x}</option>`).join('')}</select>
      <span class="ayuda">Sale de la fecha de la elección. Cámbielo solo si la Dirección se lo indica.</span></div></div>`;
  };

  P[2] = () => {
    const a = S.asamblea;
    return `
    <h3 class="sub">📅 La reunión</h3>
    <div class="fila">${inp('asamblea.actaNo', 'N.º del acta', { req: 1, modo: 'numeric' })}${inp('asamblea.lugar', 'Lugar', { req: 1 })}${inp('asamblea.fecha', 'Fecha', { req: 1, tipo: 'date' })}${inp('asamblea.hora', 'Hora de inicio', { req: 1, tipo: 'time' })}</div>
    <div class="fila">${inp('asamblea.horaFin', 'Hora de terminación', { tipo: 'time' })}</div>
    <p class="ayuda">El número de afiliados y de asistentes va en el paso 4, con la foto del listado firmado.</p>
    <h3 class="sub">🧑‍⚖️ Quienes dirigieron la asamblea</h3>
    ${tablaPersonas(filaPersona('asamblea.pres', 'Presidente(a)', { tel: 1 }) + filaPersona('asamblea.sec', 'Secretario(a)', { tel: 1 }), { tel: 1 })}
    <h3 class="sub">✅ Lo que se decidió</h3>
    ${opciones('asamblea.tipoEleccion', 'Tipo de elección', [['Total', 'Total (todos los cargos)', '🔄'], ['Parcial', 'Parcial (algunos cargos)', '➕']], { req: 1 })}
    ${a.tipoEleccion === 'Parcial' ? inp('asamblea.cargosProveer', 'Cargos que se eligen', { req: 1, ph: 'Ej.: Tesorero y fiscal suplente', ancho: 1 }) : ''}
    ${aso() ? opciones('asamblea.sistemaEleccion', 'Cómo se vota', [['En asamblea', 'En asamblea de delegados', '🏛️']], { req: 1 })
      : opciones('asamblea.sistemaEleccion', 'Cómo se vota', [['En asamblea', 'En asamblea', '🏛️'], ['Elección directa', 'Elección directa (urnas)', '🗳️']], { req: 1 })}
    ${directa() ? `<div class="fila">${inp('asamblea.numMesas', 'Número de mesas', { req: 1, tipo: 'number', min: 1, modo: 'numeric' })}</div>
      <p class="ayuda">Jurados de votación (3 por mesa)</p>
      ${tablaPersonas(a.jurados.map((j, i) => filaPersona(`asamblea.jurados.${i}`, `Jurado ${i + 1}`, { quitar: `asamblea.jurados:${i}` })).join(''), { quitar: 1 })}
      <button type="button" class="btn btn--claro btn--peque" data-agregar="asamblea.jurados">+ Jurado</button>` : ''}
    ${opciones('asamblea.sistemaPostulacion', 'Cómo se postulan', [['Por planchas', 'Por planchas (cargo por cargo)', '📝'], ['Por listas', 'Por listas (sin cargo)', '📃']], { req: 1 })}
    <div class="fila">${inp('asamblea.limFecha', 'Fecha límite para entregar planchas', { req: 1, tipo: 'date' })}${inp('asamblea.limHora', 'Hora límite', { req: 1, tipo: 'time' })}</div>
    <div class="fila">${inp('asamblea.lugarEleccion', 'Lugar de la elección', { req: 1 })}${inp('asamblea.elecFecha', 'Fecha de la elección', { req: 1, tipo: 'date' })}${inp('asamblea.elecHora', 'Hora de la elección', { req: 1, tipo: 'time' })}</div>
    ${area('asamblea.empate', 'Si hay empate se resolverá así', { ph: 'Ej.: segunda votación inmediata; si sigue, sorteo con balotas.' })}
    ${area('asamblea.comisiones', aso() ? 'Secretarías ejecutivas que se eligen' : 'Comisiones de trabajo que elegirán coordinador', { ph: 'Como aparecen en los estatutos' })}
    ${area('asamblea.observaciones', 'Observaciones')}`;
  };

  P[3] = () => `
    <div class="consejo"><img src="img/mascota/lupa.webp" alt="" class="mascota" width="70" height="107"><p><b>6 ${miembros()}:</b> 3 principales y 3 suplentes. <b>No</b> pueden ser candidatos <b>ni</b> dignatarios actuales.</p></div>
    ${tablaPersonas([0, 1, 2].map((i) => filaPersona(`tribunal.tp.${i}`, `Principal ${i + 1}`)).join('') + [0, 1, 2].map((i) => filaPersona(`tribunal.ts.${i}`, `Suplente ${i + 1}`)).join(''))}
    ${verificar()}
    <details class="opcional"><summary>Opcional: documentos de los dignatarios actuales</summary>
      <p class="ayuda">Están en el certificado de SURCO. Si alguien del Tribunal es dignatario, el semáforo le avisará.</p>
      ${area('tribunal.dignatarios', 'Un número de documento por línea')}</details>`;

  P[4] = () => `
    <div class="consejo"><img src="img/mascota/lista.webp" alt="" class="mascota" width="70" height="107"><p><b>No tiene que escribir los nombres.</b> Solo diga cuántos son y adjunte la foto del listado que firmaron en la reunión.</p></div>
    <div class="fila">${inp('asamblea.totalAfiliados', aso() ? 'Delegados hábiles inscritos' : 'Afiliados inscritos y activos', { req: 1, tipo: 'number', min: 1, modo: 'numeric' })}${inp('asamblea.asistentes', 'Asistentes que firmaron el listado', { req: 1, tipo: 'number', min: 0, modo: 'numeric' })}</div>
    ${adjunto('prep', 'Listado de asistencia firmado – asamblea preparatoria')}
    <details class="opcional"><summary>¿Todavía no tiene el formato del listado?</summary>${imprimirAntes(['prep'])}</details>`;
  P[5] = () => {
    const a = S.activa, pl = S.planchas[a] || S.planchas[0];
    const tg = S.tribunal.tp.concat(S.tribunal.ts);
    const opTG = (sel) => '<option value="">Elija</option>' + tg.map((p, i) => llena(p) ? `<option value="${i}" ${String(sel) === String(i) ? 'selected' : ''}>${esc(nombre(p))}</option>` : '').join('');
    const bl = BLOQUES.filter((b) => bloqueActivo(b.k)).map((b) => `<div class="bloque-plancha"><h4>${b.icono} ${esc(b.titulo)}</h4>
      ${tablaPersonas(pl[b.k].map((c, i) => filaPersona(`planchas.${a}.${b.k}.${i}`, b.comision ? `${comNombre()} ${i + 1}` : cargoDe(b, i), { comision: b.comision, org: aso() && b.k === 'con', mujer: 1, mayor: !!(b.mayor), quitar: b.comision ? `planchas.${a}.com:${i}` : '' })).join(''),
        { comision: b.comision, org: aso() && b.k === 'con', mujer: 1, mayor: !!b.mayor, quitar: b.comision })}
      ${aso() && b.k === 'con' ? '<p class="ayuda">En la Asocomunal cada conciliador(a) debe ser delegado(a) de una junta distinta (Ley 2166, art. 38).</p>' : ''}
      ${b.comision ? `<button type="button" class="btn btn--claro btn--peque" data-agregar="planchas.${a}.com">+ ${comNombre()}</button>` : ''}</div>`).join('');
    return `
    ${!S.asamblea.sistemaPostulacion ? '<div class="aviso aviso--error">Primero elija en el paso 2 si es por planchas o por listas.</div>' : ''}
    ${S.asamblea.tipoEleccion === 'Parcial' ? `<div class="campo campo--ancho"><span class="etiq">Bloques que se eligen</span><div class="opciones">${BLOQUES.map((b) => `<label class="opcion"><input type="checkbox" data-k="bloques.${b.k}" data-rehacer="1" ${S.bloques[b.k] ? 'checked' : ''}> ${esc(b.titulo)}</label>`).join('')}</div></div>` : ''}
    <div class="pestanas" role="tablist">${S.planchas.map((x, i) => `<button type="button" role="tab" aria-selected="${i === a}" data-pestana="${i}">${esc(nomPl(i))}</button>`).join('')}
      ${S.planchas.length < 12 ? `<button type="button" class="agregar" data-nueva>+ ${esListas() ? 'Lista' : 'Plancha'}</button>` : ''}</div>
    <div class="fila">${inp(`planchas.${a}.numero`, 'Número', { req: 1, modo: 'numeric' })}${inp(`planchas.${a}.fecha`, 'Fecha de entrega', { req: 1, tipo: 'date' })}${inp(`planchas.${a}.hora`, 'Hora de entrega', { req: 1, tipo: 'time' })}</div>
    ${esListas() ? '<p class="ayuda">En las listas el bloque 1 no lleva cargos: se reparten después de la elección.</p>' : ''}
    ${bl}
    <div class="bloque-plancha"><h4>✍️ Presentada por</h4>
      ${tablaPersonas(pl.presentadaPor.map((x, i) => filaPersona(`planchas.${a}.presentadaPor.${i}`, `Persona ${i + 1}`, { quitar: `planchas.${a}.presentadaPor:${i}` })).join(''), { quitar: 1 })}
      ${pl.presentadaPor.length < 3 ? `<button type="button" class="btn btn--claro btn--peque" data-agregar="planchas.${a}.presentadaPor">+ Persona</button>` : ''}</div>
    <div class="bloque-plancha"><h4>📥 Recibida por (Tribunal)</h4>
      <div class="fila">${[0, 1, 2].map((i) => `<div class="campo"><label for="${idDe(`planchas.${a}.recibidaPor.${i}`)}">Integrante ${i + 1}</label><select id="${idDe(`planchas.${a}.recibidaPor.${i}`)}" data-k="planchas.${a}.recibidaPor.${i}">${opTG(pl.recibidaPor[i])}</select></div>`).join('')}</div></div>
    <label class="check check--grande"><input type="checkbox" data-k="planchas.${a}.parentesco" ${pl.parentesco ? 'checked' : ''}> <span>Revisamos que entre directivos, fiscal y conciliadores <b>no hay parentesco</b> (hasta 4.º de consanguinidad, 2.º de afinidad o 1.º civil, ni esposos o compañeros).</span></label>
    ${S.planchas.length > 1 ? `<button type="button" class="btn btn--texto" data-borrar-plancha>Quitar ${esc(nomPl(a))}</button>` : ''}
    ${verificar()}`;
  };

  P[6] = () => {
    const v = S.votacion;
    if (v.realizada !== 'Sí') {
      return `${opciones('votacion.realizada', '¿Ya se realizó la votación?', [['Sí', 'Sí, ya votamos', '✅'], ['No', 'Todavía no', '⏳']], { req: 1 })}
      ${v.realizada === 'No' ? '<div class="aviso aviso--info">Bien. Puede descargar ya el acta del Tribunal y las planchas. Vuelva a este paso después de la elección.</div>' : ''}`;
    }
    const comp = componer();
    const np = S.planchas.length;
    const filaVotos = (b) => `<div class="votos"><h4>${b.icono} ${esc(b.titulo)}</h4><div class="votos__fila">
      ${S.planchas.map((p, i) => `<div class="campo"><label for="${idDe(`votacion.votos.${b.k}.p.${i}`)}">${esc(nomPl(i))}</label><input type="number" min="0" inputmode="numeric" id="${idDe(`votacion.votos.${b.k}.p.${i}`)}" data-k="votacion.votos.${b.k}.p.${i}" value="${esc(v.votos[b.k].p[i])}"></div>`).join('')}
      <div class="campo"><label for="${idDe(`votacion.votos.${b.k}.bl`)}">En blanco</label><input type="number" min="0" inputmode="numeric" id="${idDe(`votacion.votos.${b.k}.bl`)}" data-k="votacion.votos.${b.k}.bl" value="${esc(v.votos[b.k].bl)}"></div>
      <div class="campo"><label for="${idDe(`votacion.votos.${b.k}.nu`)}">Nulos</label><input type="number" min="0" inputmode="numeric" id="${idDe(`votacion.votos.${b.k}.nu`)}" data-k="votacion.votos.${b.k}.nu" value="${esc(v.votos[b.k].nu)}"></div></div></div>`;
    const comisiones = comisionesEleccion();
    return `${opciones('votacion.realizada', '¿Ya se realizó la votación?', [['Sí', 'Sí, ya votamos', '✅'], ['No', 'Todavía no', '⏳']])}
    <h3 class="sub">📅 La jornada</h3>
    <div class="fila">${inp('votacion.actaNo', 'N.º del acta', { req: 1, modo: 'numeric' })}${inp('votacion.lugar', 'Lugar', { req: 1 })}${inp('votacion.fecha', 'Fecha', { req: 1, tipo: 'date' })}${inp('votacion.hora', 'Hora', { req: 1, tipo: 'time' })}</div>
    ${directa() ? `<div class="fila">${inp('votacion.horaInicio', 'Apertura de urnas', { tipo: 'time' })}${inp('votacion.horaCierre', 'Cierre de urnas', { tipo: 'time' })}${inp('votacion.lugarPublicacion', 'Dónde se publicaron las planchas')}</div>` : ''}
    <div class="fila">${inp('votacion.afiliadosHabiles', aso() ? 'Delegados hábiles (inscritos)' : 'Afiliados hábiles (libro cerrado)', { req: 1, tipo: 'number', min: 1, modo: 'numeric' })}${inp('votacion.votantes', directa() ? 'Personas que votaron' : aso() ? 'Delegados presentes' : 'Afiliados presentes', { req: 1, tipo: 'number', min: 0, modo: 'numeric' })}${inp('votacion.tgPresentes', 'Integrantes del Tribunal presentes', { req: 1, tipo: 'number', min: 0, modo: 'numeric' })}${inp('votacion.horaFin', 'Hora de terminación', { tipo: 'time' })}</div>
    <h4>${directa() ? 'Presidente(a) y secretario(a) del organismo comunal que firman' : 'Presidente(a) y secretario(a) de esta asamblea'}</h4>
    ${tablaPersonas(filaPersona('votacion.firma1', 'Presidente(a)', { tel: 1 }) + filaPersona('votacion.firma2', 'Secretario(a)', { tel: 1 }), { tel: 1 })}
    <h3 class="sub">🧮 Votos por bloque</h3>
    <p class="ayuda">Los votos en blanco sí cuentan para el cociente; los nulos no.</p>
    ${BLOQUES.filter((b) => !b.comision && bloqueActivo(b.k)).map(filaVotos).join('')}
    <h3 class="sub">🛠️ ${aso() ? 'Secretarías ejecutivas elegidas' : 'Coordinadores elegidos por cada comisión'}</h3>
    <p class="ayuda">${aso() ? 'Escriba quién quedó en cada secretaría ejecutiva, según la forma de elección de sus estatutos.' : 'Cada comisión elige a su coordinador entre sus integrantes. No depende de la plancha ganadora.'}</p>
    ${tablaPersonas(comisiones.map((c, i) => filaPersona(`votacion.coordinadores.${i}`, c, { })).join(''))}
    <div class="fila">${comisiones.map((c, i) => inp(`votacion.coordinadores.${i}.votos`, `Votos – ${c}`, { tipo: 'number', min: 0, modo: 'numeric' })).join('')}</div>
    <h3 class="sub">🏛️ Así quedan los dignatarios elegidos</h3>
    ${np > 1 ? '<p class="ayuda">Calculado con cociente y mayor residuo. Si sus estatutos ordenan otra cosa, cambie la plancha de un cargo.</p>' : ''}
    <div id="fComp">${htmlComposicion(comp)}</div>
    ${area('votacion.observaciones', 'Observaciones de la jornada')}
    <h3 class="sub">📋 Listado de asistencia de la elección</h3>
    ${adjunto('elec', directa() ? 'Listados de asistencia por mesa, firmados' : 'Listado de asistencia firmado – asamblea de elección')}
    <details class="opcional"><summary>¿Todavía no tiene el formato del listado?</summary>${imprimirAntes([directa() ? 'mesa' : 'asamblea'])}</details>`;
  };

  P[7] = () => {
    const r = validar();
    const docs = documentos(r);
    return `
    <div class="leyenda-semaforo"><span>🟢 <b>Prevalidado</b></span><span>🟡 <b>Revisar</b></span><span>🔴 <b>Pendiente</b></span></div>
    <div id="semaforoGrande">${htmlSemaforo(r, true)}</div>
    <h3 class="sub">📥 Documentos listos para imprimir</h3>
    <div class="docs">${docs.map((d) => `<div class="doc doc--${d.listo ? 'ok' : 'no'}"><span class="doc__ico" aria-hidden="true">${d.listo ? '📄' : '🔒'}</span>
      <div><b>${esc(d.nombre)}</b><small>${d.listo ? 'Listo' : 'Faltan: ' + esc(d.falta)}</small></div>
      <button type="button" class="btn ${d.listo ? '' : 'btn--gris'}" data-doc="${d.id}" ${d.listo ? '' : 'disabled'}>Descargar</button></div>`).join('')}</div>
    ${aso() ? '<div class="aviso aviso--info"><b>Asocomunal:</b> estos formatos oficiales están hechos para las JAC y JVC. Antes de radicar, confirme con la Dirección si su Asocomunal debe usar otros.</div>' : ''}
    <p class="ayuda">Formatos en blanco: <a href="descargas/Solicitud%20de%20inscripcion%20de%20dignatarios%20JAC-JVC.docx" download>solicitud de inscripción</a> · <a href="#/documentos/formatos">todos los formatos</a>.</p>
    <div class="botones"><button type="button" class="btn btn--claro" data-imprimir>🖨️ Imprimir resumen</button></div>
    <div class="aviso aviso--info">Imprima los documentos, recoja las <b>firmas originales</b>, sin tachones ni enmendaduras, y escanéelos en un solo PDF.</div>`;
  };

  P[8] = () => {
    const r = validar();
    const verde = estado(r) === 'verde';
    const reg = S.registro;
    return `
    ${!verde ? `<div class="bloqueo"><img src="img/mascota/preocupado.webp" alt="" class="mascota" width="90" height="137"><div><h3>Aún no se puede enviar</h3><p>El envío a la Dirección se habilita cuando <b>todo</b> el semáforo esté en verde (incluida la votación).</p><button type="button" class="btn" data-ir-paso="7">Ver qué falta</button></div></div>` : `
    <label class="check check--grande autoriza"><input type="checkbox" data-k="autoriza" ${S.autoriza ? 'checked' : ''}> <span><b>Autorizo el tratamiento de mis datos personales</b> y los de este registro, conforme a la Ley 1581 de 2012 y la <a href="${window.ENLACES.politicaDatos}" target="_blank" rel="noopener">Política de Tratamiento de Datos de la Gobernación de Antioquia</a>. ${R}</span></label>
    <div class="envio ${S.autoriza ? '' : 'envio--bloqueado'}">
      <ol class="envio__pasos">
        <li><span class="envio__num">1</span><span class="envio__ico">📨</span><b>Abra su correo</b><small>El asunto y el mensaje ya están escritos</small></li>
        <li><span class="envio__num">2</span><span class="envio__ico">📎</span><b>Adjunte los documentos</b><small>Las actas firmadas, escaneadas, y los listados de asistencia: ${esc(adjuntosTexto())}</small></li>
        <li><span class="envio__num">3</span><span class="envio__ico">✅</span><b>Pulse Enviar</b><small>Llega a ${esc(window.ENLACES.correoDireccion)}</small></li>
      </ol>
      <div class="botones botones--grandes">
        <button type="button" class="btn btn--grande" data-correo="app" ${S.autoriza ? '' : 'disabled'}>📨 Abrir mi correo</button>
        <button type="button" class="btn btn--claro" data-correo="gmail" ${S.autoriza ? '' : 'disabled'}>Abrir en Gmail</button>
        <button type="button" class="btn btn--claro" data-correo="outlook" ${S.autoriza ? '' : 'disabled'}>Abrir en Outlook</button>
        <button type="button" class="btn btn--texto" data-correo="copiar" ${S.autoriza ? '' : 'disabled'}>Copiar texto</button>
      </div>
      <details class="opcional"><summary>Ver el mensaje que se enviará</summary><pre class="correo-vista">${esc(asunto())}\n\n${esc(cuerpo())}</pre></details>
    </div>
    ${reg ? `<div class="comprobante"><h3>✅ Código de registro: ${esc(reg.codigo)}</h3><p>Guárdelo para hacer seguimiento. Generado el ${esc(new Date(reg.fecha).toLocaleString('es-CO'))}.</p>
      <div class="botones"><button type="button" class="btn" data-comprobante>Descargar comprobante</button><button type="button" class="btn btn--claro" data-imprimir>🖨️ Imprimir</button></div></div>` : ''}`}`;
  };

  /* ======================= Cálculos de la elección ======================= */
  function comisionesEleccion() {
    const set = [];
    S.planchas.forEach((p) => p.com.forEach((c) => { const n = (c.comision || '').trim(); if (n && !set.some((x) => norm(x) === norm(n))) set.push(n); }));
    String(S.asamblea.comisiones || '').split(/[;\n,]+/).map((x) => x.trim()).filter(Boolean).forEach((n) => { if (!set.some((x) => norm(x) === norm(n))) set.push(n.toUpperCase()); });
    while (S.votacion.coordinadores.length < set.length) S.votacion.coordinadores.push(per());
    S.votacion.coordinadores.length = Math.max(set.length, 0);
    S.votacion.coordinadores.forEach((c, i) => { c.comision = set[i]; });
    return set;
  }

  /* Reparto de cargos: plancha única = todos; dos o más = cociente (votos válidos ÷ cargos) y mayor residuo.
     Votos válidos = votos de planchas + votos en blanco (Manual Comunal, p. 49). */
  function reparto(k, cargos) {
    const vb = S.votacion.votos[k];
    const votos = S.planchas.map((_, i) => Math.max(0, parseInt(vb.p[i], 10) || 0));
    const bl = Math.max(0, parseInt(vb.bl, 10) || 0);
    const validos = votos.reduce((a, b) => a + b, 0) + bl;
    if (!validos) return null;
    if (S.planchas.length === 1) return { votos, bl, validos, cuo: null, asign: [cargos], empate: false };
    const cuo = validos / cargos;
    const asign = votos.map((v) => Math.floor(v / cuo));
    const res = votos.map((v, i) => v - asign[i] * cuo);
    let quedan = cargos - asign.reduce((a, b) => a + b, 0);
    const orden = votos.map((v, i) => i).sort((a, b) => res[b] - res[a] || votos[b] - votos[a]);
    let empate = false;
    for (let j = 0; j < orden.length && quedan > 0; j++) {
      const i = orden[j];
      if (votos[i] === 0) continue;
      if (j + 1 < orden.length && quedan === 1 && Math.abs(res[i] - res[orden[j + 1]]) < 1e-9 && votos[orden[j + 1]] > 0) empate = true;
      asign[i]++; quedan--;
    }
    return { votos, bl, validos, cuo, asign, res, empate };
  }

  function componer() {
    const out = { cargos: [], detalle: {} };
    const np = S.planchas.length;
    const ranking = (asign, votos) => S.planchas.map((_, i) => i).sort((a, b) => asign[b] - asign[a] || votos[b] - votos[a]);
    const llenar = (k, etiquetas, porAsiento) => {
      const nAsientos = etiquetas.length / porAsiento;
      const r = reparto(k, nAsientos);
      out.detalle[k] = r;
      const fuente = [];
      if (r) {
        if (np === 1) for (let s = 0; s < nAsientos; s++) fuente.push(0);
        else ranking(r.asign, r.votos).forEach((i) => { for (let s = 0; s < r.asign[i]; s++) fuente.push(i); });
      }
      for (let s = 0; s < nAsientos; s++) {
        const aj = (S.votacion.ajustes[k] || {})[s];
        const pi = aj !== undefined && aj !== '' ? +aj : fuente[s];
        for (let q = 0; q < porAsiento; q++) {
          const idx = s * porAsiento + q;
          const pl = pi !== undefined ? S.planchas[pi] : null;
          // Planchas: la persona postulada a ese cargo. Listas: la siguiente persona de la lista.
          let persona = pl ? pl[k][idx] : null;
          if (pl && esListas() && k === 'dir') persona = pl[k][fuente.slice(0, s).filter((x) => x === pi).length] || null;
          out.cargos.push({ k, s, cargo: etiquetas[idx], plancha: pi, persona: persona && llena(persona) ? persona : null });
        }
      }
    };
    if (bloqueActivo('dir')) llenar('dir', ['Presidente(a)', 'Vicepresidente(a)', 'Tesorero(a)', 'Secretario(a)'], 1);
    if (bloqueActivo('fis')) {
      // Fiscal y suplente se eligen juntos: los gana la plancha con más votos en el bloque.
      const r = reparto('fis', 1);
      out.detalle.fis = r;
      let pi = r ? (np === 1 ? 0 : r.votos.indexOf(Math.max(...r.votos))) : undefined;
      const aj = (S.votacion.ajustes.fis || {})[0]; if (aj !== undefined && aj !== '') pi = +aj;
      ['Fiscal', 'Fiscal suplente'].forEach((c, q) => { const p = pi !== undefined ? S.planchas[pi].fis[q] : null; out.cargos.push({ k: 'fis', s: 0, cargo: c, plancha: pi, persona: p && llena(p) ? p : null }); });
    }
    if (bloqueActivo('con')) llenar('con', ['Conciliador(a)', 'Conciliador(a)', 'Conciliador(a)'], 1);
    const dl = aso() ? 'Delegado(a) Federación' : 'Delegado(a) ASOCOMUNAL';
    if (bloqueActivo('del')) llenar('del', [dl, 'Delegado(a) suplente', dl, 'Delegado(a) suplente', dl, 'Delegado(a) suplente'], 2);
    return out;
  }

  function htmlComposicion(comp) {
    const np = S.planchas.length;
    const det = Object.entries(comp.detalle).filter(([, r]) => r && np > 1).map(([k, r]) => {
      const b = BLOQUES.find((x) => x.k === k);
      return `<div class="calculo"><b>${b.icono} ${esc(b.titulo)}</b>: votos válidos ${r.validos} (incluye ${r.bl} en blanco)${r.cuo != null ? ` · cociente ${Math.round(r.cuo * 100) / 100}` : ''} · ${S.planchas.map((p, i) => `${esc(nomPl(i))}: ${r.votos[i]} votos → <b>${r.asign[i]}</b>`).join(' · ')}${r.empate ? ' · <span class="txt-amarillo">empate en residuos</span>' : ''}</div>`;
    }).join('');
    const filas = comp.cargos.map((c, i) => {
      const sel = np > 1 && (c.k !== 'del' || !c.cargo.includes('suplente')) && (c.k !== 'fis' || c.cargo === 'Fiscal')
        ? `<select data-ajuste="${c.k}:${c.s}" aria-label="Plancha para ${esc(c.cargo)}">${S.planchas.map((p, j) => `<option value="${j}" ${c.plancha === j ? 'selected' : ''}>${esc(nomPl(j))}</option>`).join('')}</select>` : (c.plancha !== undefined ? esc(nomPl(c.plancha)) : '');
      return `<tr><td>${esc(c.cargo)}</td><td>${c.persona ? esc(nombre(c.persona)) : '<span class="txt-rojo">Sin persona</span>'}</td><td>${c.persona ? esc(docTexto(c.persona)) : ''}</td><td>${sel}</td></tr>`;
    }).join('');
    const coords = S.votacion.coordinadores.filter((c) => c.comision).map((c) => `<tr><td>${aso() ? 'Secretaría' : 'Coordinador(a)'} ${esc(c.comision)}</td><td>${llena(c) ? esc(nombre(c)) : '<span class="txt-rojo">Sin persona</span>'}</td><td>${esc(docTexto(c))}</td><td>${aso() ? 'Sus estatutos' : 'Su comisión'}</td></tr>`).join('');
    return `${det}<div class="tabla-desliza"><table class="tabla-comp"><thead><tr><th>Cargo</th><th>Persona</th><th>Documento</th><th>Viene de</th></tr></thead><tbody>${filas}${coords}</tbody></table></div>`;
  }

  /* ======================= Prevalidación (semáforo) ======================= */
  function validar() {
    const items = [];
    const rojo = (paso, msg, ruta) => items.push({ n: 'rojo', paso, msg, campo: ruta ? idDe(ruta) : '' });
    const amar = (paso, id, msg, ruta) => items.push({ n: 'amarillo', paso, id, msg, campo: ruta ? idDe(ruta) : '' });
    const j = S.junta, a = S.asamblea;
    const personas = [];
    const reg = (p, donde, ruta, paso) => { if (!vacia(p)) personas.push({ p, donde, ruta, paso }); };
    /* Documento de identidad según su tipo. Rojo solo si está claramente mal; un largo poco común
       va en amarillo para no rechazar documentos válidos. Tarjeta de identidad = menor de edad:
       se admite (afiliados desde los 14 años, art. 20) con un aviso, salvo en los cargos que
       exigen mayoría de edad (cargoMayor), donde va en rojo. */
    const formato = (p, donde, ruta, paso, cargoMayor) => {
      if (vacia(p)) return;
      const t = tdoc(p), n = numDoc(p), crudo = String(p.ced || '').trim(), R = ruta + '.ced', nd = NOM_DOC[t];
      const soloNum = !/[^\d.\s]/.test(crudo);
      const largo = (min, max, id) => { if (n.length < min || n.length > max) amar(paso, `${id}-${n}`, `${donde}: ${nd} ${n} tiene un largo poco común (${n.length} caracteres). Verifique que esté completo.`, R); };
      if (!crudo) rojo(paso, `${donde}: falta el número de documento.`, R);
      else if (t === 'CC') {
        if (!soloNum || n.length > 10) rojo(paso, `${donde}: la cédula "${crudo}" no es válida. Solo números, máximo 10.`, R);
        else if (n.length < 6) amar(paso, 'ced-corta-' + n, `${donde}: la cédula ${n} es corta. Verifique que esté completa (algunas cédulas antiguas son así).`, R);
      } else if (t === 'TI' || t === 'CE' || t === 'PPT') {
        if (!soloNum) rojo(paso, `${donde}: ${nd} "${crudo}" solo lleva números.`, R);
        else if (t === 'TI') largo(10, 11, 'ti');
        else if (t === 'CE') largo(3, 7, 'ce');
        else largo(5, 10, 'ppt');
      } else if (t === 'PA') {
        if (!n) rojo(paso, `${donde}: el pasaporte "${crudo}" no es válido. Use letras y números.`, R);
        else largo(5, 15, 'pa');
      } else amar(paso, 'otro-doc-' + n, `${donde}: documento "Otro" (${n}). La Dirección verificará este documento.`, R);
      if (t === 'TI' && n) {
        if (cargoMayor) rojo(paso, `${donde}: tiene tarjeta de identidad (menor de edad). Presidente, vicepresidente, tesorero, secretario, fiscal y conciliadores deben ser mayores de edad (Ley 2166, art. 38, y Manual Comunal).`, R);
        else amar(paso, 'menor-' + n, `${donde}: tiene tarjeta de identidad. Confirme que tiene más de 14 años (requisito para estar afiliado, art. 20).`, R);
      }
      if (!(p.ape || '').trim()) rojo(paso, `${donde}: faltan los apellidos.`, ruta + '.ape');
      if (!(p.nom || '').trim()) rojo(paso, `${donde}: faltan los nombres.`, ruta + '.nom');
    };

    // Paso 1: Solicitud y organismo comunal
    const so = S.solicitud;
    if (esSub()) {
      if (!so.anterior.trim()) rojo(1, 'Escriba el código de la solicitud anterior.', 'solicitud.anterior');
      else if (!/^DPCC-EL-\d{8}-\d{4}(-V\d+)?$/i.test(so.anterior.trim())) amar(1, 'cod-ant-' + so.anterior.trim().toUpperCase(), `El código "${so.anterior.trim()}" no tiene la forma habitual (DPCC-EL-20261020-1234). Verifíquelo en el comprobante.`, 'solicitud.anterior');
      if (!versionesDe(raiz(so.anterior)).length && !(parseInt(so.version, 10) >= 2)) rojo(1, 'Escriba el número de esta versión (2 o más).', 'solicitud.version');
    }
    if (!j.tipo) rojo(1, 'Elija el tipo de organismo (JAC, JVC o Asocomunal).', 'junta.tipo');
    if (!j.id.trim()) rojo(1, 'Falta el ID del organismo.', 'junta.id'); else if (!/^\d+$/.test(j.id.trim())) amar(1, 'id-num', 'El ID del organismo normalmente es solo números. Verifíquelo en SURCO.', 'junta.id');
    if (!j.nombre.trim()) rojo(1, 'Falta el nombre del organismo.', 'junta.nombre');
    if (!j.subregion) rojo(1, 'Elija la subregión.', 'junta.subregion');
    if (!j.municipio) rojo(1, 'Elija el municipio.', 'junta.municipio');
    else if (subDe(j.municipio) !== j.subregion) rojo(1, `${j.municipio} no es de la subregión ${j.subregion}.`, 'junta.municipio');
    if (!correoOk(j.correo)) rojo(1, j.correo ? 'El correo del organismo no es válido.' : 'Falta el correo del organismo.', 'junta.correo');

    // Paso 2: Asamblea preparatoria
    [['actaNo', 'el número del acta'], ['lugar', 'el lugar'], ['fecha', 'la fecha'], ['hora', 'la hora'],
      ['tipoEleccion', 'el tipo de elección'], ['sistemaEleccion', 'cómo se vota'], ['sistemaPostulacion', 'si es por planchas o listas'], ['limFecha', 'la fecha límite de planchas'], ['limHora', 'la hora límite de planchas'],
      ['lugarEleccion', 'el lugar de la elección'], ['elecFecha', 'la fecha de la elección'], ['elecHora', 'la hora de la elección']]
      .forEach(([k, t]) => { if (!String(a[k] || '').trim()) rojo(2, `Falta ${t}.`, 'asamblea.' + k); });
    if (a.tipoEleccion === 'Parcial' && !a.cargosProveer.trim()) rojo(2, 'Escriba los cargos que se eligen.', 'asamblea.cargosProveer');
    [['pres', 'Presidente(a) de la asamblea'], ['sec', 'Secretario(a) de la asamblea']].forEach(([k, d]) => {
      if (vacia(a[k])) rojo(2, `Falta el ${d.toLowerCase()}.`, `asamblea.${k}.ced`); else formato(a[k], d, `asamblea.${k}`, 2);
      reg(a[k], d, `asamblea.${k}`, 2);
    });
    if (aso() && directa()) rojo(2, 'La Asocomunal elige en asamblea de delegados. Cambie "Cómo se vota".', 'asamblea.sistemaEleccion');
    if (numDoc(a.pres) && numDoc(a.pres) === numDoc(a.sec)) rojo(2, 'El presidente y el secretario de la asamblea deben ser personas distintas.', 'asamblea.sec.ced');
    if (directa()) {
      const m = parseInt(a.numMesas, 10);
      if (!(m >= 1)) rojo(2, 'Indique cuántas mesas habrá.', 'asamblea.numMesas');
      const jur = a.jurados.filter((x) => !vacia(x));
      if (!jur.length) rojo(2, 'Registre los jurados de votación.', 'asamblea.jurados.0.ced');
      a.jurados.forEach((x, i) => { formato(x, `Jurado ${i + 1}`, `asamblea.jurados.${i}`, 2); reg(x, `Jurado ${i + 1}`, `asamblea.jurados.${i}`, 2); });
      if (m >= 1 && jur.length && jur.length < m * 3) amar(2, `jur-${jur.length}-${m}`, `Hay ${jur.length} jurados para ${m} mesa(s). Se recomiendan 3 por mesa.`, 'asamblea.numMesas');
    }
    const fA = fecha(a.fecha), fE = fecha(a.elecFecha), fL = fecha(a.limFecha);
    if (fA && fE) {
      const d = dias(fA, fE);
      if (d < 0) rojo(2, 'La elección no puede ser antes de la asamblea.', 'asamblea.elecFecha');
      else if (d < 30) rojo(2, `Entre la asamblea (${fCorta(a.fecha)}) y la elección (${fCorta(a.elecFecha)}) hay ${d} días. Deben ser mínimo 30 (art. 35). Podría ser desde el ${fCorta(isoDe(new Date(fA.getTime() + 30 * 86400000)))}.`, 'asamblea.elecFecha');
      else if (fE > masMeses(fA, 3)) rojo(2, 'Entre la asamblea y la elección hay más de 3 meses: el Tribunal ya no sería válido.', 'asamblea.elecFecha');
    }
    if (fL && fA && fL < fA) rojo(2, 'La fecha límite de planchas no puede ser antes de la asamblea.', 'asamblea.limFecha');
    if (fL && fE && fL >= fE) rojo(2, 'La fecha límite de planchas debe ser antes del día de la elección.', 'asamblea.limFecha');
    if (fA && a.fecha > hoy()) amar(2, 'fecha-futura-' + a.fecha, 'La fecha de la asamblea es posterior a hoy. Verifíquela.', 'asamblea.fecha');
    const oficial = aso() ? FECHA_ASO_2026 : window.FECHA_OFICIAL_2026;
    if (fE && a.tipoEleccion === 'Total' && a.elecFecha !== oficial) amar(2, 'fecha-oficial-' + a.elecFecha, `La fecha nacional de elección ${aso() ? 'de las Asocomunales fue el 26 de julio' : 'fue el 26 de abril'} de 2026. En otra fecha necesita autorización de la entidad de inspección, vigilancia y control.`, 'asamblea.elecFecha');
    if (!a.empate.trim()) amar(2, 'empate', 'No escribió cómo se resolverán los empates.', 'asamblea.empate');

    // Paso 3: Tribunal
    const tg = [];
    ['tp', 'ts'].forEach((g) => S.tribunal[g].forEach((p, i) => {
      const d = `${g === 'tp' ? 'Principal' : 'Suplente'} ${i + 1} del Tribunal`, ruta = `tribunal.${g}.${i}`;
      if (vacia(p)) rojo(3, `Falta el ${d.toLowerCase()}. Son 3 principales y 3 suplentes.`, ruta + '.ced'); else formato(p, d, ruta, 3);
      if (!vacia(p)) { tg.push({ p, d, ruta }); reg(p, d, ruta, 3); }
    }));
    const cedTG = {};
    tg.forEach((x) => { const c = numDoc(x.p); if (!c) return; if (cedTG[c]) rojo(3, `${nombre(x.p) || c} está dos veces en el Tribunal.`, x.ruta + '.ced'); else cedTG[c] = x; });
    const dign = new Set(String(S.tribunal.dignatarios || '').split(/[\s,;]+/).map((x) => x.toUpperCase().replace(/[^A-Z0-9]/g, '')).filter((c) => c.length >= 3));
    tg.forEach((x) => { if (dign.has(numDoc(x.p))) rojo(3, `${nombre(x.p)} es dignatario actual: no puede estar en el Tribunal.`, x.ruta + '.ced'); });
    a.jurados.forEach((x, i) => { if (directa() && cedTG[numDoc(x)]) amar(3, 'jur-tg-' + numDoc(x), `${nombre(x)} es jurado y también del Tribunal. Mejor que sean personas distintas.`, `asamblea.jurados.${i}.ced`); });

    // Paso 4: Listado de asistencia (cuántos asistieron y el listado firmado adjunto)
    const adj = (paso, msg, clave) => items.push({ n: 'rojo', paso, msg, campo: idDe('adjuntos.' + clave), adj: true });
    if (!String(a.totalAfiliados || '').trim()) rojo(4, `Falta el total de ${miembros()}.`, 'asamblea.totalAfiliados');
    if (!String(a.asistentes || '').trim()) rojo(4, 'Falta cuántos asistieron.', 'asamblea.asistentes');
    const tot = parseInt(a.totalAfiliados, 10), asi = parseInt(a.asistentes, 10);
    if (tot > 0 && asi >= 0) {
      if (asi > tot) rojo(4, `Asistieron ${asi}, pero solo hay ${tot} ${miembros()}.`, 'asamblea.asistentes');
      else if (asi < Math.ceil(tot * 0.2)) rojo(4, `Asistieron ${asi} de ${tot}. Ninguna asamblea puede sesionar con menos del 20 % (mínimo ${Math.ceil(tot * 0.2)}).`, 'asamblea.asistentes');
      else if (asi < Math.floor(tot / 2) + 1) amar(4, `quorum-${asi}-${tot}`, `Asistieron ${asi} de ${tot}, menos de la mitad más uno (${Math.floor(tot / 2) + 1}). Solo vale si se instaló una hora después con el 30 % (${Math.ceil(tot * 0.3)}) o en reunión supletoria con el 20 %. Déjelo en observaciones.`, 'asamblea.asistentes');
    }
    if (!S.adjuntos.prep.length) adj(4, 'Falta adjuntar la foto del listado de asistencia firmado.', 'prep');
    const pesado = (clave, paso) => { const t = S.adjuntos[clave].reduce((s, x) => s + x.tam, 0); if (t > 10 * 1048576) amar(paso, `peso-${clave}-${Math.round(t / 1048576)}`, `Los archivos del listado pesan ${MB(t)}. Muchos correos no aceptan más de 10 MB: si puede, tome las fotos con menos calidad o envíelas en dos correos.`, ''); };
    pesado('prep', 4);
    // Paso 5: Planchas
    const usos = {};
    const fLim = fecha(a.limFecha);
    const nums = {};
    S.planchas.forEach((pl, pi) => {
      const np = nomPl(pi), r = (x) => `planchas.${pi}.${x}`;
      if (!String(pl.numero).trim()) rojo(5, `${np}: falta el número.`, r('numero'));
      else if (nums[pl.numero]) rojo(5, `Hay dos con el número ${pl.numero}.`, r('numero'));
      nums[pl.numero] = 1;
      if (!pl.fecha) rojo(5, `${np}: falta la fecha de entrega.`, r('fecha'));
      if (!pl.hora) rojo(5, `${np}: falta la hora de entrega.`, r('hora'));
      const fP = fecha(pl.fecha);
      if (fP && fLim && (fP > fLim || (pl.fecha === a.limFecha && a.limHora && pl.hora && pl.hora > a.limHora))) rojo(5, `${np} se entregó después de la fecha límite (${fF(a.limFecha)}).`, r('fecha'));
      let total = 0, mujeres = 0;
      const sinMayor = [], orgsCon = {};
      BLOQUES.forEach((b) => {
        if (!bloqueActivo(b.k)) return;
        pl[b.k].forEach((c, i) => {
          const et = b.comision ? (aso() ? `secretaría ${c.comision || i + 1}` : `coordinador(a) ${c.comision || 'de la comisión ' + (i + 1)}`) : cargoDe(b, i);
          const ruta = r(`${b.k}.${i}`);
          if (vacia(c)) { if (!b.comision) rojo(5, `${np}: falta ${et}. Debe estar completa.`, ruta + '.ced'); else if (c.comision) rojo(5, `${np}: la ${comNombre().toLowerCase()} ${c.comision} no tiene persona.`, ruta + '.ced'); return; }
          formato(c, `${np}, ${et}`, ruta, 5, b.mayor);
          if (b.comision && !(c.comision || '').trim()) rojo(5, `${np}: escriba el nombre de la ${comNombre().toLowerCase()}.`, ruta + '.comision');
          if (aso() && b.k === 'con') {
            const o = norm(c.org);
            if (!o) rojo(5, `${np}, ${et}: escriba la junta de la que es delegado(a).`, ruta + '.org');
            else if (orgsCon[o]) rojo(5, `${np}: dos conciliadores son delegados de la misma junta (${c.org}). Deben ser de juntas distintas (art. 38).`, ruta + '.org');
            else orgsCon[o] = 1;
          }
          total++; if (c.mujer) mujeres++;
          if (b.mayor && !c.mayor && tdoc(c) !== 'TI') sinMayor.push({ n: nombre(c) || et, ruta });
          const ced = numDoc(c);
          if (ced && cedTG[ced]) rojo(5, `${nombre(c)} (${np}) es ${cedTG[ced].d.toLowerCase()}: no puede ser candidato.`, ruta + '.ced');
          if (ced) (usos[ced] = usos[ced] || []).push({ n: nombre(c), d: `${np}, ${et}`, ruta });
          reg(c, `${np}, ${et}`, ruta, 5);
        });
        if (b.comision && S.asamblea.tipoEleccion !== 'Parcial' && !aso()) {
          const n = pl.com.filter((c) => llena(c) && c.comision).length;
          if (n < 3) rojo(5, `${np}: mínimo 3 comisiones de trabajo con coordinador (hay ${n}).`, r('com.0.comision'));
        }
      });
      if (sinMayor.length) rojo(5, `${np}: marque "Mayor de edad" (obligatorio en directiva, fiscalía y conciliación): ${sinMayor.map((x) => x.n).join(', ')}.`, sinMayor[0].ruta + '.mayor');
      if (total && mujeres / total < 0.3) amar(5, `mujeres-${pi}-${mujeres}-${total}`, `${np}: ${mujeres} mujer(es) de ${total} candidatos (${Math.round(mujeres / total * 100)} %). La ley pide mínimo 30 % de los cargos para mujeres.`, r('dir.0.ced'));
      if (!pl.parentesco) amar(5, `parentesco-${pi}`, `${np}: confirme que revisaron el parentesco (casilla al final).`, '');
      if (!pl.presentadaPor.some((x) => !vacia(x))) rojo(5, `${np}: falta "Presentada por".`, r('presentadaPor.0.ced'));
      pl.presentadaPor.forEach((x, i) => formato(x, `${np}, presentada por`, r(`presentadaPor.${i}`), 5, false));
      const rec = pl.recibidaPor.filter((x) => x !== '');
      if (!rec.length) rojo(5, `${np}: indique quién del Tribunal la recibió.`, r('recibidaPor.0'));
      else if (new Set(rec).size !== rec.length) rojo(5, `${np}: el mismo integrante del Tribunal está dos veces en "Recibida por".`, r('recibidaPor.1'));
      else if (rec.length < 3) amar(5, `rec-${pi}-${rec.length}`, `${np}: la recibieron ${rec.length} del Tribunal. El formato tiene espacio para 3.`, r(`recibidaPor.${rec.length}`));
    });
    Object.values(usos).forEach((u) => { if (u.length > 1) rojo(5, `${u[0].n} aparece ${u.length} veces (${u.map((x) => x.d).join(' y ')}). Nadie puede estar en dos cargos ni en dos planchas.`, u[1].ruta + '.ced'); });
    amar(5, 'comisiones-estatutos', aso() ? 'Confirme que las secretarías ejecutivas están en los estatutos de la Asocomunal.' : `Confirme que las comisiones de trabajo están en los estatutos de la ${sigla()}.`, '');
    if (aso()) amar(5, 'aso-delegados', 'Confirme que todos los candidatos son delegados debidamente certificados de juntas afiliadas a la Asocomunal (Ley 2166, art. 38).', '');

    // Paso 6: Votación
    const v = S.votacion;
    if (v.realizada !== 'Sí') rojo(6, 'Falta registrar la votación (cuando ya se haya hecho).', 'votacion.realizada');
    else {
      comisionesEleccion();
      [['actaNo', 'el número del acta'], ['lugar', 'el lugar'], ['fecha', 'la fecha'], ['hora', 'la hora'], ['afiliadosHabiles', 'los afiliados hábiles'], ['votantes', 'cuántos votaron'], ['tgPresentes', 'cuántos del Tribunal estuvieron']]
        .forEach(([k, t]) => { if (!String(v[k] || '').trim()) rojo(6, `Votación: falta ${t}.`, 'votacion.' + k); });
      const hab = parseInt(v.afiliadosHabiles, 10), vot = parseInt(v.votantes, 10), tgp = parseInt(v.tgPresentes, 10);
      if (hab > 0 && vot >= 0) {
        if (vot > hab) rojo(6, `Votaron más personas que ${miembros()} hábiles.`, 'votacion.votantes');
        // Asocomunal: la ley fija la mitad más uno solo para las JAC (art. 34). POR CONFIRMAR CON LA DIRECCIÓN.
        else if (aso() && vot < Math.ceil(hab * 0.2)) rojo(6, `Estuvieron ${vot} de ${hab} delegados. Ninguna asamblea puede sesionar con menos del 20 % (mínimo ${Math.ceil(hab * 0.2)}).`, 'votacion.votantes');
        else if (aso() && vot < Math.floor(hab / 2) + 1) amar(6, `quorum-aso-${vot}-${hab}`, `Estuvieron ${vot} de ${hab} delegados, menos de la mitad más uno (${Math.floor(hab / 2) + 1}). Revise el quórum que fijan sus estatutos para elegir.`, 'votacion.votantes');
        else if (aso()) { /* quórum completo */ }
        else if (!directa() && vot < Math.floor(hab / 2) + 1) rojo(6, `En asamblea debe votar la mitad más uno (${Math.floor(hab / 2) + 1} de ${hab}). Votaron ${vot}: la elección no es válida.`, 'votacion.votantes');
        else if (directa() && vot < Math.ceil(hab * 0.3)) rojo(6, `En elección directa debe votar mínimo el 30 % (${Math.ceil(hab * 0.3)} de ${hab}). Votaron ${vot}.`, 'votacion.votantes');
      }
      if (tgp >= 0 && v.tgPresentes !== '' && tgp < 2) rojo(6, 'Deben estar al menos 2 integrantes del Tribunal. Con 1 la elección no se puede hacer.', 'votacion.tgPresentes');
      if (v.fecha && a.elecFecha && v.fecha !== a.elecFecha) amar(6, 'fecha-dif-' + v.fecha, `La votación (${fF(v.fecha)}) no fue en la fecha acordada (${fF(a.elecFecha)}).`, 'votacion.fecha');
      [['firma1', 'Presidente(a) que firma el acta'], ['firma2', 'Secretario(a) que firma el acta']].forEach(([k, d]) => { if (vacia(v[k])) rojo(6, `Falta: ${d.toLowerCase()}.`, `votacion.${k}.ced`); else formato(v[k], d, `votacion.${k}`, 6); });
      BLOQUES.filter((b) => !b.comision && bloqueActivo(b.k)).forEach((b) => {
        const vb = v.votos[b.k];
        const faltan = S.planchas.some((_, i) => vb.p[i] === undefined || vb.p[i] === '');
        if (faltan) { rojo(6, `${b.titulo}: escriba los votos de cada plancha.`, `votacion.votos.${b.k}.p.0`); return; }
        const total = S.planchas.reduce((s, _, i) => s + (parseInt(vb.p[i], 10) || 0), 0) + (parseInt(vb.bl, 10) || 0) + (parseInt(vb.nu, 10) || 0);
        if (vot >= 0 && total > vot) rojo(6, `${b.titulo}: hay ${total} votos y solo votaron ${vot}.`, `votacion.votos.${b.k}.p.0`);
        if (S.planchas.length === 1) {
          const p1 = parseInt(vb.p[0], 10) || 0;
          if (p1 < Math.floor(total / 2) + 1) rojo(6, `${b.titulo}: la plancha única necesita la mitad más uno de los votos (${Math.floor(total / 2) + 1}). Obtuvo ${p1}.`, `votacion.votos.${b.k}.p.0`);
        }
      });
      const comp = componer();
      Object.entries(comp.detalle).forEach(([k, r]) => { if (r && r.empate) amar(6, 'empate-' + k, `${BLOQUES.find((b) => b.k === k).titulo}: hay empate en los residuos. Aplique el criterio acordado y ajuste la plancha del cargo.`, ''); });
      comp.cargos.forEach((c) => { if (!c.persona) rojo(6, `Dignatarios elegidos: falta la persona para ${c.cargo}.`, ''); });
      if (aso()) {
        const vistos = {};
        comp.cargos.filter((c) => c.k === 'con' && c.persona).forEach((c) => { const o = norm(c.persona.org); if (o && vistos[o]) rojo(6, `Los conciliadores elegidos ${nombre(vistos[o])} y ${nombre(c.persona)} son delegados de la misma junta. Deben ser de juntas distintas (art. 38).`, ''); else if (o) vistos[o] = c.persona; });
      }
      v.coordinadores.forEach((c, i) => { if (vacia(c)) rojo(6, aso() ? `Falta la persona elegida para la secretaría ${c.comision}.` : `Falta el coordinador elegido por la comisión ${c.comision}.`, `votacion.coordinadores.${i}.ced`); else formato(c, `${aso() ? 'Secretaría' : 'Coordinador(a)'} ${c.comision}`, `votacion.coordinadores.${i}`, 6); });
      const elegidas = comp.cargos.filter((c) => c.persona);
      const muj = elegidas.filter((c) => c.persona.mujer).length;
      if (elegidas.length && muj / elegidas.length < 0.3) amar(6, `cuota-final-${muj}-${elegidas.length}`, `Entre los dignatarios elegidos hay ${muj} mujeres de ${elegidas.length} cargos. La ley pide mínimo 30 % (art. 34).`, '');
      if (!S.adjuntos.elec.length) adj(6, 'Falta adjuntar la foto del listado de asistencia firmado de la elección.', 'elec');
      pesado('elec', 6);
    }

    // Toda la elección: mismo documento con nombres distintos, o mismo nombre con documentos distintos.
    // Se compara el número (no el tipo): quien cumplió 18 años conserva el número de la tarjeta de identidad en la cédula.
    const porC = {}, porN = {};
    personas.forEach((x) => { const c = numDoc(x.p), n = norm(nombre(x.p)); if (c) (porC[c] = porC[c] || []).push(x); if (n && n.includes(' ')) (porN[n] = porN[n] || []).push(x); });
    Object.entries(porC).forEach(([c, xs]) => { const ns = [...new Set(xs.map((x) => norm(nombre(x.p))).filter(Boolean))]; if (ns.length > 1) rojo(xs[1].paso, `El documento ${c} aparece con nombres distintos: ${xs.map((x) => `${nombre(x.p)} (${x.donde})`).join(' y ')}.`, xs[1].ruta + '.ced'); });
    Object.values(porN).forEach((xs) => { const cs = [...new Set(xs.map((x) => numDoc(x.p)).filter(Boolean))]; if (cs.length > 1) rojo(xs[1].paso, `${nombre(xs[0].p)} aparece con documentos distintos (${cs.join(' y ')}).`, xs[1].ruta + '.ced'); });
    // Tipos distintos para el mismo número: puede ser la misma persona que ya cumplió 18 (TI → CC) o un error.
    Object.entries(porC).forEach(([c, xs]) => { const ts = [...new Set(xs.map((x) => tdoc(x.p)))]; if (ts.length > 1) amar(xs[1].paso, `tipos-${c}-${ts.join('')}`, `El documento ${c} aparece como ${ts.join(' y ')}. Use el documento vigente de la persona en todos los pasos.`, xs[1].ruta + '.tdoc'); });
    return items;
  }
  const pendientes = (items) => items.filter((x) => x.n === 'rojo' || !S.confirmadas[x.id]);
  function estado(items, pasos) {
    const xs = pasos ? items.filter((x) => pasos.includes(x.paso)) : items;
    if (xs.some((x) => x.n === 'rojo')) return 'rojo';
    if (xs.some((x) => x.n === 'amarillo' && !S.confirmadas[x.id])) return 'amarillo';
    return 'verde';
  }
  const TIT = { rojo: '🔴 Pendiente', amarillo: '🟡 Revisar', verde: '🟢 Prevalidado' };

  function htmlSemaforo(items, completo) {
    const est = estado(items);
    const rojos = items.filter((x) => x.n === 'rojo'), amars = items.filter((x) => x.n === 'amarillo');
    const lista = (xs) => xs.map((x) => `<li class="${x.n}${x.n === 'amarillo' && S.confirmadas[x.id] ? ' confirmado' : ''}"><span class="paso-chip">Paso ${x.paso}</span>${x.campo ? `<a href="#" data-ir-campo="${x.campo}" data-paso="${x.paso}">${esc(x.msg)}</a>` : esc(x.msg)}${x.n === 'amarillo' ? `<label class="check"><input type="checkbox" data-confirma="${esc(x.id)}" ${S.confirmadas[x.id] ? 'checked' : ''}> Ya lo verifiqué</label>` : ''}</li>`).join('');
    return `<div class="semaforo semaforo--${est}"><div class="semaforo__cabeza"><div class="luces" aria-hidden="true"><span class="luz luz--rojo"></span><span class="luz luz--amarillo"></span><span class="luz luz--verde"></span></div>
      <div><div class="semaforo__estado">${TIT[est]}</div><p class="semaforo__resumen">${est === 'verde' ? 'Todo listo según la prevalidación. La revisión oficial la hace la Dirección.' : est === 'rojo' ? `${rojos.length} por corregir. Toque cada uno para ir al dato.` : 'Confirme los avisos para continuar.'}</p></div></div>
      ${completo && (rojos.length || amars.length) ? `<ul class="semaforo__lista">${lista(rojos)}${lista(amars)}</ul>` : ''}</div>`;
  }

  /* Documentos y los pasos que deben estar en verde para descargarlos */
  function documentos(items) {
    // Los listados adjuntos (x.adj) no frenan la descarga de las actas: se pueden llenar durante la reunión.
    const falta = (pasos) => { const xs = [...new Set(items.filter((x) => !x.adj && pasos.includes(x.paso) && (x.n === 'rojo' || !S.confirmadas[x.id])).map((x) => x.paso))]; return xs.length ? 'paso ' + xs.join(', ') : ''; };
    const lista = [
      { id: 'acta', nombre: 'Acta de asamblea preparatoria y Tribunal', pasos: [1, 2, 3, 4] }
    ];
    S.planchas.forEach((p, i) => lista.push({ id: 'plancha-' + i, nombre: `Formato de postulación – ${nomPl(i)}`, pasos: [1, 2, 3, 5] }));
    lista.push({ id: 'eleccion', nombre: `Acta de elección (${directa() ? 'elección directa' : 'en asamblea'})`, pasos: [1, 2, 3, 4, 5, 6] });
    return lista.map((d) => { const f = falta(d.pasos); return Object.assign(d, { listo: !f, falta: f }); });
  }

  /* ======================= Datos para los Word ======================= */
  const fl = (p) => nombre(p);
  function wordTribunal() {
    const a = S.asamblea, j = S.junta, fLi = fecha(a.limFecha), fE = fecha(a.elecFecha), fAn = fecha(a.actaAntFecha);
    const d = {
      junta: j.nombre, id: j.id, municipio: j.municipio, subregion: j.subregion, nit: j.nit,
      xRural: j.territorio === 'Rural' ? MARCA : SIN, xUrbana: j.territorio === 'Urbana' ? MARCA : '',
      lugar: a.lugar, fecha: fF(a.fecha), hora: fH(a.hora), celular: j.celular, telefono: j.telefono, correo: j.correo,
      actaNo: a.actaNo, asistentes: a.asistentes, totalAfiliados: a.totalAfiliados,
      presidenteAdhoc: fl(a.pres), secretarioAdhoc: fl(a.sec), presidenteCedula: docTexto(a.pres), secretarioCedula: docTexto(a.sec), presidenteTel: a.pres.tel, secretarioTel: a.sec.tel,
      actaAntNo: a.actaAntNo, actaAntDia: fAn ? fAn.getDate() : '', actaAntMes: fAn ? MESES[fAn.getMonth()] : '', actaAntAnio: fAn ? fAn.getFullYear() : '',
      cargosProveer: a.tipoEleccion === 'Parcial' ? a.cargosProveer : 'No aplica (elección total)',
      xAsamblea: !directa() && a.sistemaEleccion ? MARCA : SIN, xDirecta: directa() ? MARCA : '',
      numMesas: directa() ? a.numMesas : 'No aplica',
      jurados: directa() ? a.jurados.filter((x) => !vacia(x)).map((x) => ({ nombre: fl(x), cedula: docTexto(x) })) : [],
      xPlanchas: a.sistemaPostulacion === 'Por planchas' ? MARCA : SIN, xListas: esListas() ? MARCA : '',
      limDia: fLi ? fLi.getDate() : '', limMes: fLi ? MESES[fLi.getMonth()] : '', limAnio: fLi ? fLi.getFullYear() : '', limHora: fH(a.limHora),
      lugarEleccion: a.lugarEleccion, elecDia: fE ? fE.getDate() : '', elecMes: fE ? MESES[fE.getMonth()] : '', elecAnio: fE ? fE.getFullYear() : '', elecHora: fH(a.elecHora),
      empate: a.empate.replace(/\s+/g, ' '), comisiones: a.comisiones.replace(/\s+/g, ' '), observaciones: a.observaciones.replace(/\s+/g, ' '), horaFin: fH(a.horaFin)
    };
    [0, 1, 2].forEach((i) => { d[`tp${i + 1}Nombre`] = fl(S.tribunal.tp[i]); d[`tp${i + 1}Cedula`] = docTexto(S.tribunal.tp[i]); d[`ts${i + 1}Nombre`] = fl(S.tribunal.ts[i]); d[`ts${i + 1}Cedula`] = docTexto(S.tribunal.ts[i]); });
    return d;
  }
  function wordPlancha(pi) {
    const pl = S.planchas[pi], f = fecha(pl.fecha), tg = S.tribunal.tp.concat(S.tribunal.ts);
    const d = { junta: S.junta.nombre, municipio: S.junta.municipio, numero: pl.numero,
      presDia: f ? String(f.getDate()).padStart(2, '0') : '', presMes: f ? String(f.getMonth() + 1).padStart(2, '0') : '', presAnio: f ? f.getFullYear() : '', presHora: fH(pl.hora),
      comisiones: pl.com.filter((c) => !vacia(c)).map((c) => ({ comision: c.comision, nombre: fl(c), cedula: docTexto(c) })),
      presentadaPor: pl.presentadaPor.filter((x) => !vacia(x)).map((x) => ({ nombre: fl(x), cedula: docTexto(x) })) };
    [['dir', 4], ['fis', 2], ['con', 3], ['del', 6]].forEach(([k, n]) => { for (let i = 0; i < n; i++) { d[`${k}${i + 1}Nombre`] = fl(pl[k][i]); d[`${k}${i + 1}Cedula`] = docTexto(pl[k][i]); } });
    pl.recibidaPor.forEach((x, i) => { const p = x !== '' ? tg[+x] : null; d[`rec${i + 1}Nombre`] = p ? fl(p) : ''; d[`rec${i + 1}Cedula`] = p ? docTexto(p) : ''; });
    return d;
  }
  function wordEleccion() {
    const v = S.votacion, j = S.junta, a = S.asamblea, comp = componer();
    const X = (b) => (b ? 'X' : '__');
    const d = {
      junta: j.nombre, id: j.id, municipio: j.municipio, subregion: j.subregion, nit: j.nit, direccion: j.direccion, celular: j.celular, telefono: j.telefono, correo: j.correo,
      xRural: j.territorio === 'Rural' ? MARCA : SIN, xUrbana: j.territorio === 'Urbana' ? MARCA : '', mRural: X(j.territorio === 'Rural'), mUrbana: X(j.territorio === 'Urbana'),
      lugar: v.lugar, fecha: fF(v.fecha), hora: fH(v.hora), actaNo: v.actaNo,
      objetivo: a.tipoEleccion === 'Parcial' ? a.cargosProveer : aso() ? 'Junta Directiva, Fiscalía, Comisión de Convivencia y Conciliación, secretarías ejecutivas y delegados a la Federación.' : 'Junta Directiva, Fiscalía, Comisión de Convivencia y Conciliación, coordinadores de comisiones de trabajo y delegados a la ASOCOMUNAL.',
      tgPresentes: v.tgPresentes, asistentes: v.votantes, totalAfiliados: v.afiliadosHabiles, observaciones: v.observaciones.replace(/\s+/g, ' '),
      presidenteAdhoc: fl(v.firma1), secretarioAdhoc: fl(v.firma2), mPlanchas: X(!esListas()), mListas: X(esListas()), numPlanchas: S.planchas.length,
      lugarPublicacion: v.lugarPublicacion, horaInicio: fH(v.horaInicio), horaCierre: fH(v.horaCierre), horaFin: fH(v.horaFin),
      firma1N: fl(v.firma1), firma1C: docTexto(v.firma1), firma1T: v.firma1.tel, firma2N: fl(v.firma2), firma2C: docTexto(v.firma2), firma2T: v.firma2.tel
    };
    ['dir', 'fis', 'con', 'del'].forEach((k) => {
      const vb = v.votos[k], n = (i) => parseInt(vb.p[i], 10) || 0;
      if (!bloqueActivo(k)) return;
      d[`v${k}p1`] = n(0);
      d[`v${k}p2`] = S.planchas.length > 2 ? S.planchas.slice(1).map((_, i) => `${nomPl(i + 1)}: ${n(i + 1)}`).join(' · ') : (S.planchas.length > 1 ? n(1) : '—');
      d[`v${k}bl`] = parseInt(vb.bl, 10) || 0; d[`v${k}nu`] = parseInt(vb.nu, 10) || 0;
      d[`v${k}tot`] = S.planchas.reduce((s, _, i) => s + n(i), 0) + d[`v${k}bl`] + d[`v${k}nu`];
    });
    const claves = { 'Presidente(a)': 'pres', 'Vicepresidente(a)': 'vice', 'Tesorero(a)': 'teso', 'Secretario(a)': 'secr', 'Fiscal': 'fis', 'Fiscal suplente': 'fisS' };
    const cont = { con: 0, del: 0, delS: 0 };
    comp.cargos.forEach((c) => {
      let k = claves[c.cargo];
      if (!k) { const g = c.cargo.startsWith('Conciliador') ? 'con' : c.cargo.includes('suplente') ? 'delS' : 'del'; cont[g]++; k = g + cont[g]; }
      d[`c_${k}N`] = c.persona ? fl(c.persona) : ''; d[`c_${k}C`] = c.persona ? docTexto(c.persona) : '';
    });
    d.coordVotos = v.coordinadores.filter((c) => !vacia(c)).map((c, i) => ({ n: i + 1, comision: c.comision, nombre: fl(c), cedula: docTexto(c), votos: c.votos || '' }));
    d.coordFinal = v.coordinadores.filter((c) => !vacia(c)).map((c) => ({ tipo: /^C\.?\s?E/i.test(c.comision) ? 'CE' : 'CT', comision: String(c.comision).replace(/^C\.?\s?[TE]\.?\s*/i, ''), nombre: fl(c), cedula: docTexto(c) }));
    S.tribunal.tp.forEach((p, i) => { d[`tg${i + 1}N`] = fl(p); d[`tg${i + 1}C`] = docTexto(p); d[`tg${i + 1}P`] = 'X'; d[`tg${i + 1}S`] = ''; });
    return d;
  }
  const seguro = (t) => String(t || '').replace(/[\\/:*?"<>|]/g, '').slice(0, 50).trim();
  function descargar(doc) {
    const j = seguro(S.junta.nombre);
    if (doc === 'acta') return window.Word.generarWord('tribunal_acta', wordTribunal(), `Acta Tribunal de Garantías - ${j}.docx`);
    if (doc === 'eleccion') return window.Word.generarWord(directa() ? 'acta_directa' : 'acta_asamblea', wordEleccion(), `Acta de elección - ${j}.docx`);
    const i = +doc.split('-')[1];
    return window.Word.generarWord(esListas() ? 'listas' : 'planchas', wordPlancha(i), `Postulación ${nomPl(i)} - ${j}.docx`);
  }

  /* ======================= Envío a la Dirección ======================= */
  /* Código de registro. Solicitud nueva: DPCC-EL-AAAAMMDD-NNNN. Subsanación: la raíz del código
     anterior con la versión (DPCC-EL-20261020-1234-v2), para que la Dirección las vea vinculadas. */
  function codigo() {
    if (S.registro) return S.registro.codigo;
    if (esSub() && raiz(S.solicitud.anterior)) return `${raiz(S.solicitud.anterior)}-v${version()}`;
    if (!S.codigoNuevo) {
      const d = new Date();
      S.codigoNuevo = `DPCC-EL-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    return S.codigoNuevo;
  }
  const estadoTexto = () => ({ verde: 'Prevalidado', amarillo: 'Revisar', rojo: 'Pendiente' }[estado(validar())]);
  const adjuntosTexto = () => S.adjuntos.prep.concat(S.adjuntos.elec).map((a) => a.nombre).join(', ');
  const verActual = () => (S.registro && S.registro.version) || version();
  const asunto = () => `[ELECCIÓN DIGNATARIOS - ${esSub() ? 'SUBSANACIÓN' : 'NUEVA'} v${verActual()}] ${S.junta.id} - ${S.junta.nombre} - ${S.junta.municipio} - ${estadoTexto()}`;
  function cuerpo() {
    const comp = componer();
    return [
      'Señores Dirección de Participación Comunitaria y Ciudadana:',
      '',
      `Enviamos los documentos de la elección de dignatarios de ${S.junta.nombre} (${ORGANISMOS[S.junta.tipo] || 'organismo comunal'}, ID ${S.junta.id}), municipio de ${S.junta.municipio}, subregión ${S.junta.subregion}.`,
      '',
      `Tipo de solicitud: ${esSub() ? `Subsanación, versión ${verActual()} (solicitud anterior: ${S.solicitud.anterior.trim().toUpperCase()})` : 'Nueva (versión 1)'}`,
      `Código de registro: ${codigo()}`,
      `Período electoral: ${periodo()}`,
      `Fecha de envío: ${new Date().toLocaleDateString('es-CO')}`,
      `Fecha de la elección: ${fF(S.votacion.fecha)} · ${directa() ? 'Elección directa' : aso() ? 'Asamblea de delegados' : 'Elección en asamblea'} · ${S.planchas.length} ${esListas() ? 'lista(s)' : 'plancha(s)'}`,
      `Asamblea preparatoria y Tribunal: ${fF(S.asamblea.fecha)}`,
      `Estado de la prevalidación: ${estadoTexto()}`,
      '',
      'Dignatarios elegidos:',
      ...comp.cargos.map((c) => `- ${c.cargo}: ${c.persona ? fl(c.persona) : ''}`),
      ...S.votacion.coordinadores.filter((c) => !vacia(c)).map((c) => `- ${aso() ? 'Secretaría' : 'Coordinador(a)'} ${c.comision}: ${fl(c)}`),
      '',
      'Adjuntamos las actas escaneadas con las firmas originales y los listados de asistencia firmados:',
      `- Asamblea preparatoria: ${S.adjuntos.prep.map((a) => a.nombre).join(', ')}`,
      `- Elección: ${S.adjuntos.elec.map((a) => a.nombre).join(', ')}`,
      `Contacto: ${S.junta.correo}${S.junta.celular ? ' · ' + S.junta.celular : ''}`
    ].join('\n');
  }
  function abrirCorreo(tipo) {
    // Se puede volver a enviar: el mismo código si es la misma versión; una subsanación crea otra versión.
    if (!S.registro) S.registro = { codigo: codigo(), version: version(), fecha: new Date().toISOString() };
    guardarS();
    registrar('Terminado');
    const para = window.ENLACES.correoDireccion, su = asunto(), bo = cuerpo();
    if (tipo === 'copiar') {
      const t = `Para: ${para}\nAsunto: ${su}\n\n${bo}`;
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => aviso('Texto copiado. Péguelo en un correo nuevo.'), () => { prompt('Copie este texto:', t); });
    } else {
      const url = tipo === 'gmail' ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(para)}&su=${encodeURIComponent(su)}&body=${encodeURIComponent(bo)}`
        : tipo === 'outlook' ? `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(para)}&subject=${encodeURIComponent(su)}&body=${encodeURIComponent(bo)}`
          : `mailto:${para}?subject=${encodeURIComponent(su)}&body=${encodeURIComponent(bo)}`;
      if (tipo === 'app') location.href = url; else window.open(url, '_blank', 'noopener');
    }
    pintar();
  }
  function comprobante() {
    const r = S.registro, comp = componer();
    const fila = (k, v) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`;
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Comprobante ${esc(r.codigo)}</title><style>body{font-family:Poppins,Arial,sans-serif;max-width:720px;margin:30px auto;padding:0 16px;color:#212529}h1{color:#0B5640;font-size:22px}table{border-collapse:collapse;width:100%}td{border:1px solid #DEE2E6;padding:7px}td:first-child{font-weight:600;background:#F8F9FA;width:40%}.n{font-size:12px;color:#6C757D}</style></head><body>
<p style="color:#018D38;font-weight:600">GOBERNACIÓN DE ANTIOQUIA · DIRECCIÓN DE PARTICIPACIÓN COMUNITARIA Y CIUDADANA</p><h1>Comprobante de registro – Elección de dignatarios</h1><table>
${fila('Código de registro', r.codigo)}${fila('Solicitud', esSub() ? `Subsanación v${verActual()} de ${S.solicitud.anterior.trim().toUpperCase()}` : 'Nueva (v1)')}${fila('Período electoral', periodo())}${fila('Fecha', new Date(r.fecha).toLocaleString('es-CO'))}${fila('Organismo comunal', S.junta.nombre)}${fila('Tipo de organismo', ORGANISMOS[S.junta.tipo] || '')}${fila('ID', S.junta.id)}${fila('Municipio', `${S.junta.municipio} (${S.junta.subregion})`)}
${fila('Fecha de la elección', fF(S.votacion.fecha))}${fila('Estado de la prevalidación', estadoTexto())}${fila('Enviado a', window.ENLACES.correoDireccion)}
${comp.cargos.map((c) => fila(c.cargo, c.persona ? fl(c.persona) : '')).join('')}</table>
<p class="n">La prevalidación no es la aprobación del trámite: la revisión oficial la hace la Dirección. Este comprobante no reemplaza el acto administrativo de reconocimiento.</p></body></html>`;
    window.Word.descargarBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), `Comprobante ${r.codigo}.html`);
  }

  /* ======================= Registro de avance para la Dirección =======================
     Para saber qué organismos llevan el proceso sin terminarlo, SIN enviar correos al buzón institucional,
     la página registra el avance (ID, nombre, tipo y municipio del organismo, período, versión, paso y
     estado; nunca documentos de identidad).
     En el prototipo se guarda en este navegador y se ve en "Vista de la Dirección".

     CONECTAR AQUÍ (elija una):
     A) Power Automate (automático): flujo con el desencadenador "Cuando se recibe una solicitud HTTP"
        (requiere licencia Premium para quien crea el flujo) → acción "Crear elemento" en una Lista de
        SharePoint (o "Agregar fila" en un Excel de OneDrive). Pegue la URL del flujo en AVANCE_URL.
     B) Microsoft Forms (gratis): cree un formulario con preguntas ID, Junta, Municipio, Paso y Estado,
        obtenga el "vínculo rellenado previamente" y péguelo en FORMS_URL con los marcadores
        {id} {junta} {municipio} {paso} {estado}. La persona verá el botón "Guardar mi avance en la
        Dirección", que abre el formulario ya lleno; solo pulsa Enviar. Las respuestas quedan en Excel.

     REGISTRO DE TERMINADOS: los correos llegan a organismoscomunales@antioquia.gov.co con el asunto
     "[ELECCIÓN DIGNATARIOS - NUEVA v1] ID - Organismo - Municipio - Estado" o
     "[ELECCIÓN DIGNATARIOS - SUBSANACIÓN v2] …". Un flujo de Power Automate con
     "Cuando llega un correo nuevo (V3)" en el buzón compartido, filtrado por "[ELECCIÓN DIGNATARIOS" (conectores
     estándar de Microsoft 365), puede leer el tipo y la versión entre corchetes, separar el resto con split(' - ') y agregar una fila a la misma
     Lista o Excel, sin trabajo extra para el radicador; el correo sigue su radicación normal en MERCURIO. */
  /* VERSIÓN REAL INTEGRADA CON SURCO (cómo se guardaría la información en la Gobernación):
     una base de datos con UNA FILA POR SOLICITUD Y VERSIÓN, con estas columnas:
       código (DPCC-EL-…-vN), código raíz, versión, tipo de solicitud (nueva/subsanación),
       ID y nombre del organismo, tipo de organismo (JAC/JVC/Asocomunal), municipio, subregión,
       período electoral (2026-2030…), estado del semáforo, estado del trámite (en proceso,
       terminado, devuelto, aprobado), fecha de cada cambio y quién lo hizo.
     - Cada envío AGREGA una fila (nunca borra la anterior); la versión más alta de un código raíz es
       la vigente y las demás quedan como historial de subsanaciones.
     - Al recibir cada envío (correo radicado en MERCURIO o la conexión "CONECTAR AQUÍ") se actualiza
       el estado; cuando la Dirección aprueba, SURCO actualiza los dignatarios del organismo.
     - Al cambiar de período, las filas del período anterior quedan como HISTÓRICO de solo lectura y
       las nuevas solicitudes se guardan con el período nuevo.
     HOY (prototipo): esto solo se guarda en el navegador de quien usa la herramienta ("dpcc-avances");
     la Gobernación no recibe nada automáticamente. El registro oficial es el correo radicado en MERCURIO. */
  const AVANCE_URL = '';
  const FORMS_URL = '';
  function registrar(estadoProceso) {
    const j = S.junta;
    if (!j.id || !j.municipio) return;
    const cod = S.registro ? S.registro.codigo : '', ver = verActual();
    const reg = { id: j.id, junta: j.nombre, tipo: j.tipo || '', municipio: j.municipio, subregion: j.subregion, periodo: periodo(),
      solicitud: esSub() ? 'Subsanación' : 'Nueva', version: ver, raiz: esSub() ? raiz(S.solicitud.anterior) : (cod ? raiz(cod) : ''),
      anterior: esSub() ? S.solicitud.anterior.trim().toUpperCase() : '',
      paso: S.paso, pasoNombre: PASOS[S.paso].t, semaforo: estadoTexto(), proceso: estadoProceso || 'En proceso', codigo: cod, fecha: new Date().toISOString() };
    const todos = leer('dpcc-avances') || {};
    // Una entrada por organismo, período y versión: las subsanaciones no reemplazan la solicitud anterior.
    todos[`${j.id}|${norm(j.municipio)}|${reg.periodo}|v${ver}`] = reg;
    delete todos[j.id + '|' + norm(j.municipio)];  // formato de la versión anterior del prototipo
    guardar('dpcc-avances', todos);
    if (AVANCE_URL) fetch(AVANCE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reg) }).catch(() => { /* se reintenta en el siguiente paso */ });
    if (window.PanelDireccion) window.PanelDireccion.pintar();
  }
  window.FormularioAvance = { formsUrl: () => FORMS_URL };

  /* ======================= Pintado y eventos ======================= */
  let cont, items = [];
  function aviso(t) { const a = $('fAviso'); if (!a) return; a.textContent = t; a.hidden = false; clearTimeout(aviso._t); aviso._t = setTimeout(() => { a.hidden = true; }, 3500); }
  function svgCedula() {
    return `<svg class="ced" viewBox="0 0 360 230" role="img" aria-label="Ejemplo de cédula con número, apellidos y nombres señalados"><rect x="6" y="6" width="348" height="212" rx="14" fill="#eef5f8" stroke="#9DB6C6" stroke-width="1.5"/><path d="M6 20a14 14 0 0 1 14-14h320a14 14 0 0 1 14 14v22H6z" fill="#1B4FA0"/><rect x="18" y="14" width="24" height="16" fill="#F5C400"/><rect x="18" y="22" width="24" height="4" fill="#1B4FA0"/><rect x="18" y="26" width="24" height="4" fill="#C8102E"/><text x="50" y="27" font-size="9.5" font-weight="700" fill="#fff" font-family="Arial">REPÚBLICA DE COLOMBIA</text><text x="206" y="62" font-size="7.5" fill="#4A6676" font-family="Arial">NÚMERO</text><text x="206" y="80" font-size="15" font-weight="700" fill="#13231C" font-family="Courier New,monospace">1.000.000.000</text><rect x="18" y="52" width="92" height="118" rx="4" fill="#c9d6de"/><circle cx="64" cy="98" r="20" fill="#a97b5e"/><path d="M30 168c2-26 18-34 34-34s32 8 34 34z" fill="#2F4A63"/><text x="122" y="104" font-size="7.5" fill="#4A6676" font-family="Arial">APELLIDOS</text><text x="122" y="119" font-size="14" font-weight="700" fill="#13231C" font-family="Arial">PÉREZ GÓMEZ</text><text x="122" y="140" font-size="7.5" fill="#4A6676" font-family="Arial">NOMBRES</text><text x="122" y="155" font-size="14" font-weight="700" fill="#13231C" font-family="Arial">MARÍA FERNANDA</text><g fill="none" stroke="#e1251b" stroke-width="3"><rect x="198" y="48" width="146" height="40" rx="10"/><rect x="116" y="90" width="150" height="34" rx="10"/><rect x="116" y="128" width="170" height="34" rx="10"/></g><g font-family="Arial" font-weight="700" font-size="12" fill="#fff"><circle cx="344" cy="48" r="10" fill="#e1251b"/><text x="340" y="52">1</text><circle cx="266" cy="90" r="10" fill="#e1251b"/><text x="262" y="94">2</text><circle cx="286" cy="128" r="10" fill="#e1251b"/><text x="282" y="132">3</text></g><text x="180" y="212" text-anchor="middle" font-size="8" fill="#5E6B64" font-family="Arial">Ejemplo ilustrativo, no es un documento real</text></svg>`;
  }

  function pintar() {
    if (!cont) return;
    items = validar();
    const p = S.paso;
    const est = estado(items);
    const ayuda = AYUDAS[p];
    const pasoItems = items.filter((x) => x.paso === p);
    const pasoEst = p >= 1 && p <= 6 ? estado(items, [p]) : null;
    cont.innerHTML = `
      <div class="asistente-form">
        <div class="af-cabeza">
          <div class="af-progreso" aria-label="Progreso: paso ${p} de 8">
            <div class="af-barra"><i style="width:${(p / 8) * 100}%"></i></div>
            <ol class="af-pasos">${PASOS.map((x, i) => `<li class="${i === p ? 'actual' : i < p ? 'hecho' : ''}"><button type="button" data-ir-paso="${i}" title="${esc(x.t)}" aria-label="Paso ${i}: ${esc(x.t)}"><span>${i === 0 ? '★' : i}</span></button></li>`).join('')}</ol>
          </div>
          <button type="button" class="af-semaforo af-semaforo--${est}" data-ir-paso="7" title="Ver el semáforo de prevalidación"><span class="af-luz"></span>${TIT[est].slice(3)}</button>
        </div>
        <div class="af-titulo"><span class="af-ico" aria-hidden="true">${PASOS[p].ico}</span><div><small>${p ? `Paso ${p} de 8` : 'Inicio'}</small><h3>${esc(PASOS[p].t)}</h3></div>
          <div class="af-titulo__botones">${ayuda ? `<button type="button" class="btn btn--claro btn--peque" data-ayuda>❓ ¿Cómo se usa?</button>` : ''}
          <button type="button" class="btn btn--claro btn--peque" data-norma="${NORMA[p]}">📖 La norma</button></div></div>
        ${ayuda ? `<div class="af-ayuda" hidden><img src="img/mascota/${ayuda.m}.webp" alt="" class="mascota" width="80" height="122"><ul>${ayuda.t.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><div class="af-ayuda__guia"><a class="btn btn--texto" href="guias/${ayuda.g}.html" target="_blank" rel="noopener">Ver la guía completa ↗</a><small class="ayuda">Se abre en otra pestaña. Lo que lleva escrito no se pierde.</small></div></div>` : ''}
        <form class="formulario af-cuerpo" novalidate autocomplete="off" onsubmit="return false">${P[p]()}</form>
        ${pasoEst ? `<div class="af-estado af-estado--${pasoEst}">${pasoEst === 'verde' ? '✓ Este paso está completo.' : `${pasoEst === 'rojo' ? '🔴' : '🟡'} En este paso: <ul>${pendientes(pasoItems).slice(0, 6).map((x) => `<li>${x.campo ? `<a href="#" data-ir-campo="${x.campo}" data-paso="${x.paso}">${esc(x.msg)}</a>` : esc(x.msg)}${x.n === 'amarillo' ? ` <label class="check check--en-linea"><input type="checkbox" data-confirma="${esc(x.id)}"> Ya lo verifiqué</label>` : ''}</li>`).join('')}</ul>`}</div>` : ''}
        <div class="af-nav">
          ${p > 0 ? '<button type="button" class="btn btn--claro btn--grande" data-atras>← Atrás</button>' : '<span></span>'}
          ${p < 8 ? `<button type="button" class="btn btn--grande" data-siguiente>${p === 0 ? (S.junta.id ? 'Continuar donde quedé →' : 'Empezar →') : 'Siguiente →'}</button>` : ''}
        </div>
        <p class="af-guardado" id="fGuardado" role="status">${S.junta.id || S.paso ? '✓ Borrador guardado en este equipo' : ''}</p>
        ${p === 0 && S.junta.id ? '<button type="button" class="btn btn--texto" data-reiniciar>Empezar uno nuevo (borra lo guardado)</button>' : ''}
        <div class="af-aviso" id="fAviso" role="status" hidden></div>
      </div>
      <div class="imprimible" id="fImprimible">${resumenImprimible()}</div>`;
    marcarErrores();
  }
  function marcarErrores() {
    cont.querySelectorAll('.con-error').forEach((e) => e.classList.remove('con-error'));
    items.filter((x) => x.n === 'rojo' && x.campo).forEach((x) => { const el = document.getElementById(x.campo); if (el && el.matches('input,select,textarea')) el.classList.add('con-error'); });
  }
  function refrescarEstado() {
    // Actualiza semáforo y avisos sin redibujar los campos (para no perder el foco)
    items = validar();
    const p = S.paso;
    const est = estado(items);
    const chip = cont.querySelector('.af-semaforo');
    if (chip) { chip.className = `af-semaforo af-semaforo--${est}`; chip.innerHTML = `<span class="af-luz"></span>${TIT[est].slice(3)}`; }
    const box = cont.querySelector('.af-estado');
    if (box && p >= 1 && p <= 6) {
      const pe = estado(items, [p]);
      box.className = `af-estado af-estado--${pe}`;
      box.innerHTML = pe === 'verde' ? '✓ Este paso está completo.' : `${pe === 'rojo' ? '🔴' : '🟡'} En este paso: <ul>${pendientes(items.filter((x) => x.paso === p)).slice(0, 6).map((x) => `<li>${x.campo ? `<a href="#" data-ir-campo="${x.campo}" data-paso="${x.paso}">${esc(x.msg)}</a>` : esc(x.msg)}${x.n === 'amarillo' ? ` <label class="check check--en-linea"><input type="checkbox" data-confirma="${esc(x.id)}"> Ya lo verifiqué</label>` : ''}</li>`).join('')}</ul>`;
    }
    const fc = $('fComp'); if (fc) fc.innerHTML = htmlComposicion(componer());
    marcarErrores();
    const imp = $('fImprimible'); if (imp) imp.innerHTML = resumenImprimible();
  }
  /* Cada paso tiene su dirección (#/eleccion/herramienta/paso-3): el botón "atrás" del navegador
     o del celular vuelve al paso anterior. desdeRuta = el cambio lo pidió el navegador. */
  function irPaso(n, campo, desdeRuta) {
    S.paso = Math.max(0, Math.min(8, n));
    if (!desdeRuta && window.Rutas) window.Rutas.marcar('eleccion/herramienta/paso-' + S.paso);
    guardarS();
    if ([2, 5, 7].includes(S.paso)) registrar();
    pintar();
    const ancla = $('formulario');
    if (campo) {
      const el = document.getElementById(campo);
      if (el) { const d = el.closest('details'); if (d) d.open = true; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => (el.matches('input,select,textarea') ? el : el.querySelector('input') || el).focus({ preventScroll: true }), 350); return; }
    }
    // Con "atrás" del navegador, rutas.js devuelve la página a la posición donde estaba.
    if (ancla && !desdeRuta) ancla.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function resumenImprimible() {
    const j = S.junta, a = S.asamblea;
    const fila = (k, v) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`;
    const per2 = (p) => `${nombre(p)} – ${tdoc(p) === 'CC' ? 'C.C. ' : ''}${docTexto(p)}`;
    return `<h2>Resumen del registro de elección – ${esc(j.nombre)}</h2><p>Estado de la prevalidación: <b>${esc(estadoTexto())}</b>. La revisión oficial la hace la Dirección.</p>
      <table>${fila('Tipo de organismo', ORGANISMOS[j.tipo] || '')}${fila('Solicitud', esSub() ? `Subsanación v${verActual()} de ${S.solicitud.anterior}` : 'Nueva (v1)')}${fila('Período electoral', periodo())}${fila('ID', j.id)}${fila('Municipio', `${j.municipio} (${j.subregion})`)}${fila('Asamblea preparatoria', `${fF(a.fecha)} · ${a.lugar}`)}${fila('Elección', `${fF(a.elecFecha)} · ${a.sistemaEleccion} · ${a.sistemaPostulacion}`)}</table>
      <h3>Tribunal de Garantías</h3><ul>${S.tribunal.tp.concat(S.tribunal.ts).filter((p) => !vacia(p)).map((p) => `<li>${esc(per2(p))}</li>`).join('')}</ul>
      <h3>${esListas() ? 'Listas' : 'Planchas'}</h3>${S.planchas.map((pl, i) => `<p><b>${esc(nomPl(i))}</b>: ${BLOQUES.flatMap((b) => pl[b.k].filter((c) => !vacia(c)).map((c, k) => `${b.comision ? c.comision : cargoDe(b, k)}: ${nombre(c)}`)).map(esc).join(' · ')}</p>`).join('')}
      ${S.votacion.realizada === 'Sí' ? `<h3>Dignatarios elegidos</h3><ul>${componer().cargos.map((c) => `<li>${esc(c.cargo)}: ${esc(c.persona ? nombre(c.persona) : '')}</li>`).join('')}</ul>` : ''}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    cont = $('formularioApp');
    if (!cont) return;
    pintar();
    if (window.Rutas) window.Rutas.al('eleccion/herramienta', (param, op) => {
      const m = /^paso-(\d)$/.exec(param || '');
      if (m && op.cambia) { S.paso = Math.min(8, +m[1]); guardarS(); pintar(); return; }
      if (m) { if (+m[1] !== S.paso) irPaso(+m[1], null, true); return; }
      // Sin paso en la dirección: sigue donde quedó y deja anotado el paso
      window.Rutas.marcar('eleccion/herramienta/paso-' + S.paso, true);
      if (op.cambia) pintar();
    });

    // Si cierra, recarga o cambia de pestaña, el borrador queda guardado al instante.
    const alSalir = () => guardar(CLAVE, S);
    window.addEventListener('pagehide', alSalir);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') alSalir(); });
    let t;
    cont.addEventListener('input', (ev) => {
      const el = ev.target;
      if (!el.dataset.k || el.type === 'radio' || el.type === 'checkbox' || el.tagName === 'SELECT') return;
      let v = el.value;
      if (/\.ced$/.test(el.dataset.k)) { const limpio = v.replace(/[.\s,]/g, ''); if (limpio !== v) { v = limpio; el.value = v; } }
      ponerRuta(S, el.dataset.k, v);
      clearTimeout(t);
      t = setTimeout(() => { guardarS(); refrescarEstado(); }, 300);
    });
    cont.addEventListener('focusout', (ev) => {
      const el = ev.target;
      if (el.dataset && el.dataset.may && el.value !== el.value.toUpperCase()) { el.value = el.value.toUpperCase(); ponerRuta(S, el.dataset.k, el.value); guardarS(); }
    });
    cont.addEventListener('change', (ev) => {
      const el = ev.target;
      if (el.dataset.confirma) { if (el.checked) S.confirmadas[el.dataset.confirma] = true; else delete S.confirmadas[el.dataset.confirma]; guardarS(); if (S.paso === 7) pintar(); else refrescarEstado(); return; }
      if (el.dataset.adjunto) {
        const k = el.dataset.adjunto;
        const malos = [];
        Array.from(el.files || []).forEach((f) => {
          if (!/^image\//.test(f.type) && f.type !== 'application/pdf') { malos.push(f.name); return; }
          S.adjuntos[k].push({ nombre: f.name, tam: f.size, tipo: f.type });
          VISTAS[k][S.adjuntos[k].length - 1] = { url: URL.createObjectURL(f), img: /^image\//.test(f.type) };
        });
        guardarS(); pintar();
        if (malos.length) aviso(`No se agregó ${malos.join(', ')}: use una foto (JPG o PNG) o un PDF.`);
        return;
      }
      if (el.dataset.ajuste) { const [k, s] = el.dataset.ajuste.split(':'); (S.votacion.ajustes[k] = S.votacion.ajustes[k] || {})[s] = el.value; guardarS(); pintar(); return; }
      if (!el.dataset.k) return;
      ponerRuta(S, el.dataset.k, el.type === 'checkbox' ? el.checked : el.value);
      if (el.dataset.k === 'junta.subregion') S.junta.municipio = '';
      if (el.dataset.k === 'junta.tipo' && aso() && directa()) { S.asamblea.sistemaEleccion = 'En asamblea'; aviso('La Asocomunal elige en asamblea de delegados: se cambió "Cómo se vota".'); }
      guardarS();
      if (el.type === 'radio' || el.dataset.rehacer || el.dataset.k === 'autoriza') pintar(); else refrescarEstado();
    });
    cont.addEventListener('click', (ev) => {
      const b = ev.target.closest('button, a[data-ir-campo]');
      if (!b) return;
      if (b.dataset.irCampo) { ev.preventDefault(); irPaso(+b.dataset.paso, b.dataset.irCampo); return; }
      if (b.dataset.irPaso) { irPaso(+b.dataset.irPaso); return; }
      if (b.hasAttribute('data-siguiente')) { irPaso(S.paso + 1); return; }
      if (b.hasAttribute('data-atras')) { irPaso(S.paso - 1); return; }
      if (b.dataset.norma) { if (window.Norma) window.Norma.abrir(b.dataset.norma); return; }
      if (b.hasAttribute('data-ayuda')) { const a = cont.querySelector('.af-ayuda'); a.hidden = !a.hidden; return; }
      if (b.hasAttribute('data-subsanar')) { subsanar(); guardarS(); if (S.paso !== 1) irPaso(1, 'f-solicitud-anterior'); else pintar(); aviso('Subsanación lista: se conservaron los datos. Corrija lo que pidió la Dirección y vuelva a adjuntar los listados.'); return; }
      if (b.hasAttribute('data-reiniciar')) { if (confirm('¿Borrar todo lo guardado y empezar de nuevo?')) { S = nuevo(); guardarS(); pintar(); } return; }
      if (b.dataset.quitarAdjunto) { const [k, i] = b.dataset.quitarAdjunto.split(':'); S.adjuntos[k].splice(+i, 1); const v = VISTAS[k].splice(+i, 1)[0]; if (v) URL.revokeObjectURL(v.url); guardarS(); pintar(); return; }
      if (b.dataset.agregar) { const l = leerRuta(S, b.dataset.agregar); l.push(b.dataset.agregar.endsWith('.com') ? Object.assign({ comision: '' }, cand()) : per()); guardarS(); pintar(); return; }
      if (b.dataset.quitar) { const [r, i] = b.dataset.quitar.split(':'); const l = leerRuta(S, r); l.splice(+i, 1); guardarS(); pintar(); return; }
      if (b.dataset.pestana) { S.activa = +b.dataset.pestana; pintar(); return; }
      if (b.hasAttribute('data-nueva')) { S.planchas.push(planchaNueva(S.planchas.length + 1)); S.activa = S.planchas.length - 1; guardarS(); pintar(); return; }
      if (b.hasAttribute('data-borrar-plancha')) { if (confirm(`¿Quitar ${nomPl(S.activa)}?`)) { S.planchas.splice(S.activa, 1); S.activa = 0; guardarS(); pintar(); } return; }
      if (b.dataset.doc) {
        const txt = b.textContent; b.disabled = true; b.textContent = 'Preparando…';
        descargar(b.dataset.doc).then(() => { b.textContent = '✓ Descargado'; registrar(); setTimeout(() => { b.textContent = txt; b.disabled = false; }, 2500); })
          .catch((e) => { b.textContent = txt; b.disabled = false; alert('No se pudo generar el documento. Revise su conexión.\n(' + e.message + ')'); });
        return;
      }
      if (b.hasAttribute('data-imprimir')) { document.body.classList.add('imprimiendo-formulario'); window.print(); setTimeout(() => document.body.classList.remove('imprimiendo-formulario'), 500); return; }
      if (b.dataset.correo) { abrirCorreo(b.dataset.correo); return; }
      if (b.hasAttribute('data-comprobante')) { comprobante(); return; }
    });
  });

  window.Formulario = { estado: () => S, validar, componer, cargar: (x) => { S = Object.assign(nuevo(), x); guardarS(); pintar(); }, ir: irPaso,
    prellenarMunicipio: (m) => { const s = subDe(m); if (s && !S.junta.municipio) { S.junta.subregion = s; S.junta.municipio = m; guardarS(); pintar(); } } };
  window.prellenarMunicipio = window.Formulario.prellenarMunicipio;
})();
