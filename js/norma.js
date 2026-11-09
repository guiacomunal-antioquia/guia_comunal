/* "📖 La norma": ventana con la norma explicada fácil, por pestañas.
   Tomado del formulario-elecciones-jac (1).html del equipo y corregido frente al Manual Comunal
   de la Gobernación (páginas citadas) y la Ley 2166 de 2021.
   Pendiente de confirmar con la Dirección antes de agregarlo: plazo de radicación (el archivo del
   equipo dice 20 días calendario, Decreto 1501 art. 2.3.2.1.5.1), plan de trabajo con cada plancha
   y relación de afiliados. El Manual no los menciona. */
(function () {
  'use strict';
  const fuente = (t) => `<span class="nm-fuente">${t}</span>`;
  const caja = (titulo, texto) => `<div class="nm-caja"><b>${titulo}</b>${texto}</div>`;
  const grande = (n, t) => `<span class="nm-grande">${n}</span>${t}`;

  const TABS = [
    ['linea', '⏱ Línea de tiempo'], ['trib', '⚖️ Tribunal'], ['plan', '📝 Planchas'], ['com', '🧩 Comisiones'],
    ['votos', '🧮 Votos y cociente'], ['radica', '📨 Radicación'], ['faq', '❓ Preguntas'], ['src', '🔗 Fuentes']
  ];

  const C = {
    linea: () => `<h3>El camino de una elección</h3>
      <ol class="nm-linea">
        <li><b>Libro de afiliados:</b> se revisa y se cierra <b>15 días calendario antes</b> de la elección. ${fuente('Manual, p. 43')}</li>
        <li><b>Asamblea preparatoria:</b> se convoca con <b>8 a 15 días</b> de anticipación y designa el Tribunal. ${fuente('Manual, p. 33-34')}</li>
        <li><b>Tribunal de Garantías:</b> mínimo <b>30 días</b> antes de la elección y máximo <b>3 meses</b>. ${fuente('Ley 2166, art. 35 · Manual, p. 35')}</li>
        <li><b>Planchas o listas:</b> se entregan <b>al Tribunal</b> dentro del plazo. ${fuente('Manual, p. 44')}</li>
        <li><b>Día de la elección:</b> mínimo 2 del Tribunal presentes. Quórum: <b>mitad más uno</b> en asamblea; <b>30 %</b> en elección directa. ${fuente('Manual, p. 46-47')}</li>
        <li><b>Escrutinio:</b> con varias planchas, cociente y mayor residuo. ${fuente('Ley 2166, art. 34 · Manual, p. 49')}</li>
        <li><b>Radicación:</b> los documentos firmados se envían a la Gobernación. ${fuente('Manual, p. 50')}</li>
      </ol>`,
    trib: () => `<h3>Tribunal de Garantías</h3><p>Es el grupo de afiliados que cuida que la elección sea legal, transparente y justa.</p>
      <div class="nm-cajas">
        ${caja(grande(6, 'afiliados'), '3 titulares y 3 suplentes. ' + fuente('Manual, p. 35'))}
        ${caja(grande(30, 'días antes'), 'Como mínimo. Y vale máximo 3 meses. ' + fuente('Ley 2166, art. 35'))}
        ${caja('🚫 No pueden', 'Ser candidatos ni dignatarios actuales.')}
        ${caja('✅ Qué hace', 'Recibe y revisa las planchas, certifica y custodia el libro cerrado y acompaña la elección.')}
      </div>
      <p class="nm-tip">Los suplentes reemplazan a los titulares si faltan. El día de la elección deben estar <b>mínimo 2</b> integrantes. ${fuente('Manual, p. 46')}</p>`,
    plan: () => `<h3>Planchas o listas</h3><p>Una plancha es el grupo de personas que se postulan juntas a los cargos.</p>
      <ul>
        <li>Se entregan <b>al Tribunal de Garantías</b>, que las revisa con el secretario y el fiscal. ${fuente('Manual, p. 44')}</li>
        <li>Deben estar <b>completas</b>, con todos los cargos; si no, se rechazan.</li>
        <li>Cada candidato es afiliado hábil, firma su aceptación y aspira a <b>un solo cargo</b>. ${fuente('Manual, p. 38')}</li>
        <li>Se numeran por orden de entrega y se pueden corregir solo antes del cierre. ${fuente('Manual, p. 45')}</li>
        <li>Los delegados se postulan con su suplente.</li>
      </ul>
      <p class="nm-tip">👩 Al menos el <b>30 % de los cargos</b> deben quedar en manos de mujeres. Por eso conviene incluir mujeres en todas las planchas. ${fuente('Ley 2166, art. 34 · Manual, p. 17')}</p>`,
    com: () => `<h3>Comisiones de trabajo</h3><p>Son los grupos que trabajan los temas de la junta: deporte, salud, medio ambiente…</p>
      <div class="nm-cajas">
        ${caja(grande(3, 'mínimo'), 'Toda junta tiene al menos tres comisiones. ' + fuente('Ley 2166, art. 45'))}
        ${caja('Coordinador', 'Lo elige <b>cada comisión</b> entre sus integrantes. No depende de la plancha ganadora. ' + fuente('Manual, p. 48'))}
        ${caja('Quórum', 'Asamblea: la mitad más uno de la comisión. Directa: mínimo el 30 %.')}
      </div>`,
    votos: () => `<h3>Votos, cociente y residuo</h3>
      <ol>
        <li><b>Votos válidos</b> = votos de las planchas + votos en blanco. Los nulos no cuentan.</li>
        <li><b>Cociente</b> = votos válidos ÷ cargos del bloque.</li>
        <li>Cada plancha recibe un cargo por cada vez que le cabe el cociente.</li>
        <li>Los cargos que sobran van a la plancha con <b>mayor residuo</b>.</li>
      </ol>
      <p class="nm-tip">Ejemplo: 70 + 46 + 12 en blanco = <b>128</b> válidos. 128 ÷ 4 cargos = <b>32</b>. Plancha 1: 2 cargos (sobran 6). Plancha 2: 1 cargo (sobran 14) y gana el último por residuo. ${fuente('Manual, p. 49')}</p>
      <p>Con una sola plancha no hay cociente: necesita la mitad más uno de los votos.</p>
      <a class="btn btn--peque" href="#/eleccion/calculadora">🧮 Abrir la calculadora</a>`,
    radica: () => `<h3>Radicación de documentos</h3><p>Sin enmendaduras y con firmas originales: ${fuente('Manual, p. 50')}</p>
      <ul class="nm-docs">
        <li>📄 Solicitud de inscripción de dignatarios</li>
        <li>📄 Acta de asamblea preparatoria y designación del Tribunal</li>
        <li>👥 Listado de asistencia a la asamblea preparatoria</li>
        <li>📄 Acta de elección de dignatarios</li>
        <li>👥 Listado de asistencia a la jornada de elección</li>
        <li>📝 Formato de planchas o listas</li>
        <li>👪 Certificado de parentesco (solo si la ley lo pide)</li>
      </ul>
      <p class="nm-tip">Se envían a <b>${window.ENLACES ? window.ENLACES.correoDireccion : 'organismoscomunales@antioquia.gov.co'}</b> y se radican en MERCURIO. SURCO es solo para consultar.</p>`,
    faq: () => `<h3>Preguntas frecuentes</h3>${[
      ['¿Los suplentes del Tribunal son obligatorios?', 'Sí. El Tribunal tiene 6 afiliados: 3 titulares y 3 suplentes (Manual, p. 35). Los suplentes reemplazan a quien falte.'],
      ['¿Los votos en blanco cuentan?', 'Sí. Son votos válidos para calcular el cociente. Los nulos no.'],
      ['¿Con cuántas personas vale la votación?', 'En asamblea, con la mitad más uno de los afiliados; en elección directa, con mínimo el 30 %.'],
      ['¿Por qué importa tanto el documento de identidad?', 'Identifica a cada persona. Un número mal escrito puede ser de otra persona y la elección se devuelve.'],
      ['¿Puedo continuar otro día?', 'Sí. Lo que escribe se guarda solo en este equipo y al volver puede seguir donde quedó.'],
      ['¿Verde quiere decir aprobado?', 'No. Verde es prevalidación: la Dirección revisa y expide el reconocimiento.']
    ].map(([p, r]) => `<details class="nm-faq"><summary>${p}</summary><p>${r}</p></details>`).join('')}`,
    src: () => `<h3>Fuentes</h3><ul>
        <li><a href="documentos/Cartilla%20ABC%20Comunal%20-%20Preparemonos%20para%20las%20elecciones.pdf" target="_blank" rel="noopener">Manual Comunal (Cartilla ABC) – Gobernación de Antioquia</a> (páginas citadas en cada pestaña; 19 MB)</li>
        <li>Ley 2166 de 2021 (arts. 34, 35 y 45)</li>
        <li>Decreto 1501 de 2023, Ministerio del Interior</li>
        <li>Circular 09 de 2025, Ministerio del Interior (calendario 2026)</li>
      </ul><p class="nota">Esta ayuda no reemplaza el texto oficial de las normas ni los estatutos de su organismo comunal.</p>`
  };

  let ov;
  function crear() {
    ov = document.createElement('div');
    ov.className = 'nm-fondo';
    ov.hidden = true;
    ov.innerHTML = `<div class="nm-ventana" role="dialog" aria-modal="true" aria-labelledby="nmTitulo">
      <div class="nm-cabeza"><div><h2 id="nmTitulo">📖 La norma, explicada fácil</h2><small>Manual Comunal y Ley 2166 de 2021</small></div>
        <button type="button" class="nm-x" data-nm-cerrar aria-label="Cerrar">✕</button></div>
      <div class="nm-tabs" role="tablist"></div><div class="nm-cuerpo"></div></div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', (ev) => {
      const t = ev.target.closest('[data-nm-tab]');
      if (t) abrir(t.dataset.nmTab);
      else if (ev.target === ov || ev.target.closest('[data-nm-cerrar]')) cerrar();
    });
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && !ov.hidden) cerrar(); });
  }
  function abrir(tab) {
    if (!ov) crear();
    if (!C[tab]) tab = 'linea';
    ov.querySelector('.nm-tabs').innerHTML = TABS.map(([id, t]) => `<button type="button" role="tab" data-nm-tab="${id}" aria-selected="${id === tab}">${t}</button>`).join('');
    ov.querySelector('.nm-cuerpo').innerHTML = C[tab]();
    // El botón "atrás" del navegador o del celular cierra la ventana (js/rutas.js)
    if (ov.hidden && window.Rutas) window.Rutas.abrirCapa(ocultar);
    ov.hidden = false;
    document.body.style.overflow = 'hidden';
    ov.querySelector('.nm-ventana').scrollTop = 0;
    ov.querySelector(`[data-nm-tab="${tab}"]`).focus();
  }
  function ocultar() { ov.hidden = true; document.body.style.overflow = ''; }
  function cerrar() { if (ov.hidden) return; ocultar(); if (window.Rutas) window.Rutas.cerrarCapa(); }

  window.Norma = { abrir, cerrar };
})();
