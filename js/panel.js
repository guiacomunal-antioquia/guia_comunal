/* Vista de la Dirección (demostración): organismos comunales en proceso y terminados, con su
   historial de versiones (solicitud nueva y subsanaciones) y su período electoral.

   IMPORTANTE: el prototipo NO guarda la información en la Gobernación. Esta vista lee solo los
   registros guardados en este navegador por la herramienta (localStorage "dpcc-avances").
   El registro oficial hoy es el correo radicado en MERCURIO.

   En la versión real (Guía Comunal alojada en el Observatorio de Participación Ciudadana, OPC),
   esta tabla leería una base de datos de la Gobernación con una fila por solicitud y versión
   (código, versión, organismo, tipo, municipio, período, estado y fechas), que se actualiza con
   cada envío. Los períodos anteriores quedan como histórico de solo lectura.
   Ver el comentario "VERSIÓN REAL" en js/formulario.js y el LEEME. */
(function () {
  'use strict';
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const leer = () => { try { return JSON.parse(localStorage.getItem('dpcc-avances') || '{}'); } catch (e) { return {}; } };
  const guardar = (v) => { try { localStorage.setItem('dpcc-avances', JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };
  let pestana = 'proceso';
  const F = { periodo: '', municipio: '', tipo: '', semaforo: '' };

  // Período vigente: el que empezó con la última elección nacional (cada 4 años desde 2022).
  const hoy = new Date();
  const base = hoy.getFullYear() - (((hoy.getFullYear() - 2022) % 4) + 4) % 4 - (hoy < new Date(hoy.getFullYear(), 3, 20) && (hoy.getFullYear() - 2022) % 4 === 0 ? 4 : 0);
  const VIGENTE = `${base}-${base + 4}`;

  /* Registros con los campos completos (los de versiones anteriores del prototipo no traían todos) */
  function registros() {
    return Object.values(leer()).map((r) => Object.assign({ tipo: 'JAC', periodo: '2026-2030', solicitud: 'Nueva', version: 1, raiz: '', anterior: '' }, r, { version: r.version || 1, tipo: r.tipo || 'JAC', periodo: r.periodo || '2026-2030' }));
  }
  /* Un organismo = mismo ID, municipio y período. Su última versión es la más alta (y la más reciente). */
  function organismos(regs) {
    const g = {};
    regs.forEach((r) => { const k = `${r.id}|${norm(r.municipio)}|${r.periodo}`; (g[k] = g[k] || []).push(r); });
    return Object.values(g).map((todas) => {
      todas.sort((a, b) => b.version - a.version || String(b.fecha).localeCompare(String(a.fecha)));
      // Una sola fila por versión (la más reciente), por si quedaron registros de versiones anteriores del prototipo
      const vs = todas.filter((r, i) => i === 0 || r.version !== todas[i - 1].version);
      return { ultima: vs[0], versiones: vs };
    }).sort((a, b) => String(b.ultima.fecha).localeCompare(String(a.ultima.fecha)));
  }
  const pasa = (o) => (!F.periodo || o.ultima.periodo === F.periodo) && (!F.municipio || o.ultima.municipio === F.municipio)
    && (!F.tipo || o.ultima.tipo === F.tipo) && (!F.semaforo || o.ultima.semaforo === F.semaforo);

  function filtros(regs) {
    const caja = document.getElementById('panelFiltros');
    if (!caja) return;
    const unicos = (k, extra = []) => [...new Set(regs.map((r) => r[k]).concat(extra))].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), 'es'));
    const sel = (k, et, ops, todos) => `<label>${et}<select data-filtro="${k}"><option value="">${todos}</option>${ops.map((o) => `<option ${F[k] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
    caja.innerHTML = sel('periodo', 'Período electoral', unicos('periodo', [VIGENTE]).reverse(), 'Todos los períodos')
      + sel('municipio', 'Municipio', unicos('municipio'), 'Todos los municipios')
      + sel('tipo', 'Tipo de organismo', ['JAC', 'JVC', 'Asocomunal'], 'Todos los tipos')
      + sel('semaforo', 'Semáforo', ['Prevalidado', 'Revisar', 'Pendiente'], 'Todos los estados');
  }

  const color = { Prevalidado: '🟢', Revisar: '🟡', Pendiente: '🔴' };
  const fechaCorta = (f) => { const d = new Date(f); return isNaN(d) ? '' : d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }); };
  function historial(o) {
    if (o.versiones.length < 2) return '';
    return `<ul class="panel-historial">${o.versiones.map((v, i) => `<li>v${esc(v.version)} · ${esc(v.solicitud)} · ${esc(v.proceso)}${v.codigo ? ' · ' + esc(v.codigo) : ''} · ${esc(fechaCorta(v.fecha))}${i === 0 ? '<span class="etiqueta-ultima">Última</span>' : ''}</li>`).join('')}</ul>`;
  }

  function pintar() {
    const caja = document.getElementById('panelTabla');
    if (!caja) return;
    const regs = registros();
    filtros(regs);
    const orgs = organismos(regs).filter(pasa);
    const proc = orgs.filter((o) => o.ultima.proceso !== 'Terminado'), term = orgs.filter((o) => o.ultima.proceso === 'Terminado');
    document.getElementById('panelNProceso').textContent = proc.length;
    document.getElementById('panelNTerminado').textContent = term.length;
    document.querySelectorAll('[data-pestana-panel]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.pestanaPanel === pestana)));
    const lista = pestana === 'proceso' ? proc : term;
    caja.innerHTML = lista.length ? `<table><thead><tr><th>ID</th><th>Organismo</th><th>Tipo</th><th>Municipio</th><th>Período</th><th>Versión</th><th>${pestana === 'proceso' ? 'Va en' : 'Código'}</th><th>Semáforo</th><th>Actualizado</th></tr></thead><tbody>${
      lista.map((o) => { const r = o.ultima;
        return `<tr><td>${esc(r.id)}</td><td>${esc(r.junta)}${historial(o)}</td><td>${esc(r.tipo)}</td><td>${esc(r.municipio)}<br><small>${esc(r.subregion)}</small></td>
          <td>${esc(r.periodo)}${r.periodo !== VIGENTE ? '<span class="etiqueta-historico">Histórico</span>' : ''}</td>
          <td>v${esc(r.version)}${r.solicitud === 'Subsanación' ? '<br><small>Subsanación</small>' : ''}${o.versiones.length > 1 ? '<span class="etiqueta-ultima">Última</span>' : ''}</td>
          <td>${pestana === 'proceso' ? `Paso ${esc(r.paso)}: ${esc(r.pasoNombre)}` : esc(r.codigo)}</td><td>${color[r.semaforo] || ''} ${esc(r.semaforo)}</td><td>${esc(fechaCorta(r.fecha))}</td></tr>`; }).join('')}</tbody></table>`
      : `<p class="vacio">${pestana === 'proceso' ? 'No hay solicitudes en proceso' : 'No hay solicitudes terminadas'}${F.periodo || F.municipio || F.tipo || F.semaforo ? ' con estos filtros' : ''}. Toque «Ver datos de ejemplo» para ver cómo funciona.</p>`;
  }

  /* Exportar: todas las versiones de los organismos que pasan los filtros */
  const COLS = [['ID', 'id'], ['Organismo', 'junta'], ['Tipo de organismo', 'tipo'], ['Municipio', 'municipio'], ['Subregión', 'subregion'], ['Período', 'periodo'],
    ['Solicitud', 'solicitud'], ['Versión', 'version'], ['Última versión', 'esUltima'], ['Código', 'codigo'], ['Código anterior', 'anterior'],
    ['Paso', 'paso'], ['Etapa', 'pasoNombre'], ['Semáforo', 'semaforo'], ['Proceso', 'proceso'], ['Fecha', 'fechaTxt']];
  function filasExportar() {
    const out = [];
    organismos(registros()).filter(pasa).forEach((o) => o.versiones.forEach((v, i) => out.push(Object.assign({}, v, { esUltima: i === 0 ? 'Sí' : 'No', fechaTxt: fechaCorta(v.fecha) }))));
    return out;
  }
  const nombreArchivo = (ext) => `seguimiento-elecciones-dpcc${F.periodo ? '-' + F.periodo : ''}.${ext}`;
  function csv() {
    const q = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const filas = [COLS.map((c) => q(c[0])).join(';')].concat(filasExportar().map((r) => COLS.map((c) => q(r[c[1]])).join(';')));
    window.Word.descargarBlob(new Blob(['﻿' + filas.join('\r\n')], { type: 'text/csv;charset=utf-8' }), nombreArchivo('csv'));
  }
  /* Excel (.xlsx) armado con JSZip (el mismo que llena los Word); una hoja con encabezado en negrilla */
  async function xlsx() {
    await window.Word.cargarZip();
    const x = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const col = (n) => { let s = ''; n++; while (n) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
    const celda = (v, c, f, estilo) => (typeof v === 'number' ? `<c r="${col(c)}${f}"${estilo}><v>${v}</v></c>` : `<c r="${col(c)}${f}" t="inlineStr"${estilo}><is><t xml:space="preserve">${x(v)}</t></is></c>`);
    const filas = [COLS.map((c) => c[0])].concat(filasExportar().map((r) => COLS.map((c) => (['version', 'paso'].includes(c[1]) && r[c[1]] !== '' ? Number(r[c[1]]) : r[c[1]]))));
    const hoja = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${COLS.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${[1, 9].includes(i) ? 30 : 16}" customWidth="1"/>`).join('')}</cols><sheetData>${
      filas.map((fila, i) => `<row r="${i + 1}">${fila.map((v, c) => celda(v, c, i + 1, i === 0 ? ' s="1"' : '')).join('')}</row>`).join('')}</sheetData></worksheet>`;
    const zip = new window.JSZip();
    zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>');
    zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
    zip.file('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Seguimiento" sheetId="1" r:id="rId1"/></sheets></workbook>');
    zip.file('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
    zip.file('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>');
    zip.file('xl/worksheets/sheet1.xml', hoja);
    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    window.Word.descargarBlob(blob, nombreArchivo('xlsx'));
  }

  /* Ejemplos ficticios: dos períodos, los tres tipos de organismo y una subsanación (v1 → v2) */
  const EJEMPLOS = [
    // id, organismo, tipo, municipio, subregión, período, solicitud, versión, paso, etapa, semáforo, proceso, días atrás
    ['90001', 'JAC VEREDA EL EJEMPLO', 'JAC', 'Urrao', 'Suroeste', '2026-2030', 'Nueva', 1, 3, 'Tribunal de Garantías', 'Pendiente', 'En proceso', 0],
    ['90002', 'JVC URBANIZACIÓN LA PRUEBA', 'JVC', 'Caucasia', 'Bajo Cauca', '2026-2030', 'Nueva', 1, 5, 'Planchas o listas', 'Revisar', 'En proceso', 1],
    ['90003', 'ASOCOMUNAL DE SONSÓN (FICTICIA)', 'Asocomunal', 'Sonsón', 'Oriente', '2026-2030', 'Nueva', 1, 7, 'Revisar y descargar', 'Prevalidado', 'En proceso', 2],
    ['90004', 'JAC SECTOR DEMOSTRACIÓN', 'JAC', 'Apartadó', 'Urabá', '2026-2030', 'Nueva', 1, 8, 'Enviar a la Dirección', 'Prevalidado', 'Terminado', 12],
    ['90004', 'JAC SECTOR DEMOSTRACIÓN', 'JAC', 'Apartadó', 'Urabá', '2026-2030', 'Subsanación', 2, 8, 'Enviar a la Dirección', 'Prevalidado', 'Terminado', 3],
    ['90005', 'JAC VEREDA FICTICIA', 'JAC', 'Yarumal', 'Norte', '2026-2030', 'Nueva', 1, 8, 'Enviar a la Dirección', 'Prevalidado', 'Terminado', 4],
    ['90005', 'JAC VEREDA FICTICIA', 'JAC', 'Yarumal', 'Norte', '2022-2026', 'Nueva', 1, 8, 'Enviar a la Dirección', 'Prevalidado', 'Terminado', 1290]
  ];
  function cargarEjemplos() {
    const todos = leer();
    Object.keys(todos).filter((k) => k.endsWith('|demo')).forEach((k) => delete todos[k]);  // ejemplos cargados antes
    EJEMPLOS.forEach(([id, junta, tipo, municipio, subregion, periodo, solicitud, version, paso, pasoNombre, semaforo, proceso, atras], k) => {
      const f = new Date(Date.now() - atras * 86400000);
      const raiz = `DPCC-EL-${f.getFullYear()}1020-${1000 + k}`;
      const r0 = solicitud === 'Subsanación' ? `DPCC-EL-${new Date(Date.now() - 12 * 86400000).getFullYear()}1020-${1000 + k - 1}` : raiz;
      todos[`${id}|${norm(municipio)}|${periodo}|v${version}|demo`] = { id, junta, tipo, municipio, subregion, periodo, solicitud, version, paso, pasoNombre, semaforo, proceso,
        raiz: r0, anterior: version > 1 ? r0 : '', codigo: proceso === 'Terminado' ? (version > 1 ? `${r0}-v${version}` : r0) : '', fecha: f.toISOString() };
    });
    guardar(todos);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const sec = document.querySelector('.pantalla[data-ruta="direccion"]');
    if (!sec) return;
    pintar();
    sec.addEventListener('change', (ev) => { const s = ev.target.closest('[data-filtro]'); if (s) { F[s.dataset.filtro] = s.value; pintar(); } });
    sec.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      if (b.dataset.pestanaPanel) { pestana = b.dataset.pestanaPanel; pintar(); }
      if (b.id === 'panelEjemplos') { cargarEjemplos(); pintar(); }
      if (b.id === 'panelCsv') csv();
      if (b.id === 'panelXlsx') { const t = b.textContent; b.disabled = true; b.textContent = 'Preparando…'; xlsx().catch((e) => alert('No se pudo generar el Excel. Revise su conexión.\n(' + e.message + ')')).finally(() => { b.disabled = false; b.textContent = t; }); }
      if (b.id === 'panelBorrar' && confirm('¿Borrar los datos de esta vista en este equipo?')) { localStorage.removeItem('dpcc-avances'); pintar(); }
    });
  });
  window.PanelDireccion = { pintar };
})();
