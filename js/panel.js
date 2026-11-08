/* Vista de la Dirección (demostración): juntas en proceso y terminadas.
   En el prototipo lee los registros guardados en este navegador por el formulario (localStorage "dpcc-avances").
   En producción, esta tabla sería la Lista de SharePoint o el Excel que alimenta Power Automate
   (ver los comentarios "CONECTAR AQUÍ" en js/formulario.js). */
(function () {
  'use strict';
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const leer = () => { try { return JSON.parse(localStorage.getItem('dpcc-avances') || '{}'); } catch (e) { return {}; } };
  let pestana = 'proceso';

  const EJEMPLOS = [
    ['90001', 'JAC VEREDA EL EJEMPLO', 'Urrao', 'Suroeste', 3, 'Tribunal de Garantías', 'Pendiente', 'En proceso'],
    ['90002', 'JAC BARRIO LA PRUEBA', 'Caucasia', 'Bajo Cauca', 5, 'Planchas o listas', 'Revisar', 'En proceso'],
    ['90003', 'JAC VEREDA MODELO', 'Sonsón', 'Oriente', 7, 'Revisar y descargar', 'Prevalidado', 'En proceso'],
    ['90004', 'JAC SECTOR DEMOSTRACIÓN', 'Apartadó', 'Urabá', 8, 'Enviar a la Dirección', 'Prevalidado', 'Terminado'],
    ['90005', 'JAC VEREDA FICTICIA', 'Yarumal', 'Norte', 8, 'Enviar a la Dirección', 'Prevalidado', 'Terminado']
  ];

  function pintar() {
    const caja = document.getElementById('panelTabla');
    if (!caja) return;
    const regs = Object.values(leer()).sort((a, b) => b.fecha.localeCompare(a.fecha));
    const proc = regs.filter((r) => r.proceso !== 'Terminado'), term = regs.filter((r) => r.proceso === 'Terminado');
    document.getElementById('panelNProceso').textContent = proc.length;
    document.getElementById('panelNTerminado').textContent = term.length;
    document.querySelectorAll('[data-pestana-panel]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.pestanaPanel === pestana)));
    const lista = pestana === 'proceso' ? proc : term;
    const color = { Prevalidado: '🟢', Revisar: '🟡', Pendiente: '🔴' };
    caja.innerHTML = lista.length ? `<table><thead><tr><th>ID</th><th>Junta</th><th>Municipio</th><th>Subregión</th><th>${pestana === 'proceso' ? 'Va en' : 'Código'}</th><th>Semáforo</th><th>Actualizado</th></tr></thead><tbody>${
      lista.map((r) => `<tr><td>${esc(r.id)}</td><td>${esc(r.junta)}</td><td>${esc(r.municipio)}</td><td>${esc(r.subregion)}</td><td>${pestana === 'proceso' ? `Paso ${esc(r.paso)}: ${esc(r.pasoNombre)}` : esc(r.codigo)}</td><td>${color[r.semaforo] || ''} ${esc(r.semaforo)}</td><td>${esc(new Date(r.fecha).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }))}</td></tr>`).join('')}</tbody></table>`
      : `<p class="vacio">${pestana === 'proceso' ? 'No hay juntas con el proceso abierto en este equipo.' : 'Todavía no hay procesos terminados.'} Use "Cargar ejemplos" para ver cómo se vería.</p>`;
  }

  function csv() {
    const regs = Object.values(leer());
    const q = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const filas = [['ID', 'Junta', 'Municipio', 'Subregión', 'Paso', 'Etapa', 'Semáforo', 'Proceso', 'Código', 'Fecha'].map(q).join(';')]
      .concat(regs.map((r) => [r.id, r.junta, r.municipio, r.subregion, r.paso, r.pasoNombre, r.semaforo, r.proceso, r.codigo, r.fecha].map(q).join(';')));
    window.Word.descargarBlob(new Blob(['﻿' + filas.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'seguimiento-elecciones-dpcc.csv');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const sec = document.querySelector('.pantalla[data-ruta="direccion"]');
    if (!sec) return;
    pintar();
    sec.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      if (b.dataset.pestanaPanel) { pestana = b.dataset.pestanaPanel; pintar(); }
      if (b.id === 'panelEjemplos') {
        const todos = leer();
        EJEMPLOS.forEach(([id, junta, municipio, subregion, paso, pasoNombre, semaforo, proceso], k) => {
          todos[id + '|demo'] = { id, junta, municipio, subregion, paso, pasoNombre, semaforo, proceso, codigo: proceso === 'Terminado' ? `DPCC-EL-20261020-${1000 + k}` : '', fecha: new Date(Date.now() - k * 86400000).toISOString() };
        });
        localStorage.setItem('dpcc-avances', JSON.stringify(todos)); pintar();
      }
      if (b.id === 'panelCsv') csv();
      if (b.id === 'panelBorrar' && confirm('¿Borrar los registros de prueba de este equipo?')) { localStorage.removeItem('dpcc-avances'); pintar(); }
    });
  });
  window.PanelDireccion = { pintar };
})();
