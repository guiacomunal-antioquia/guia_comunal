/* Asistente comunal de la DPCC.
   Mejoras frente a la versión base:
   - Entiende preguntas sin tildes o con errores de ortografía (normalización + corrección por distancia de edición).
   - Entiende sinónimos y varias formas de preguntar (diccionario propio aplicado a la pregunta y a la base).
   - No repite la fuente en cada respuesta: solo la muestra si la persona pregunta "¿de dónde sale?".
   - Usa enlaces reales (SURCO afiliados y certificados, página de la Dirección).
   - Recuerda el tema anterior para responder preguntas de seguimiento ("¿y cuántos son?").
   - Cuando la persona dice su municipio, responde algo útil y lo recuerda para el resto de la conversación.
   La base (js/kb.js) se genera desde "Chatbot/Base del bot.xlsx" y solo se descarga cuando se usa el asistente. */
(function () {
  'use strict';

  const norm = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[¿?¡!.,;:()"'«»/\\-]/g, ' ').replace(/(.)\1{2,}/g, '$1').replace(/\s+/g, ' ').trim();
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const STOP = new Set(('a al algo algun alguna como con cual cuales cuando de del donde el ella ellos en entre era es esa ese eso esta este esto estoy fue ha han hay hace hacer la las le les lo los me mi mis muy necesito no nos o para pero por porque puede puedo pues que quiero se ser si sin sobre son su sus te tengo tiene tu un una uno unos unas usted ustedes y ya yo favor gracias hola buenas buenos dias tardes noches saber quisiera queria podria deseo informacion info ayuda ayudame ayudeme dime digame explicame explique').split(' '));

  /* Sinónimos: cada frase o palabra de la izquierda se reemplaza por las palabras de la derecha,
     tanto en la pregunta como en la base, para que coincidan. */
  const SINONIMOS = [
    ['junta de accion comunal|juntas de accion comunal|junta comunal|accion comunal|jacs|jac', 'jac junta'],
    ['junta de vivienda comunal|junta de vivienda comunitaria|juntas de vivienda|jvc', 'vivienda junta'],
    ['junta directiva|mesa directiva|directivos|directiva|lideres comunales|cargos directivos', 'dignatario directiva'],
    ['dignatarios|dignataria|dignatarias', 'dignatario'],
    ['tribunal de garantias|tribunal de garantia|garantias|tg', 'tribunal'],
    ['votaciones|votacion|votar|comicios|elegir|eleccion|elecciones|elegidos|elijen|eligen', 'eleccion'],
    ['candidatos|candidato|candidata|postulados|postulado|postular|postularme|postulacion|aspirantes|aspirar', 'candidato plancha'],
    ['planchas|plancha|listas|lista', 'plancha'],
    ['cuorum|corum|kuorum|quorun|quorum', 'quorum'],
    ['cuociente|cosiente|cuosiente|cociente|reparten los cargos|repartir los cargos|reparto de cargos|reparten|reparto|asignan los cargos|como quedan los cargos|mayor residuo|residuo|residuos', 'cociente'],
    ['papeles|documentacion|documentos|radicar|radicacion|entregar los documentos', 'documentos radicar'],
    ['quejas|queja|reclamo|reclamar|demandar|denunciar|denuncia|inconformidad|impugnar|impugnacion|impugnaciones', 'impugnacion'],
    ['reglamento interno|reglamento|estatuto|estatutos', 'estatutos'],
    ['miembros|miembro|integrantes|integrante|personas conforman|conforman|conformado', 'integrante'],
    ['socio|socios|inscribirme|inscribir|pertenecer|hacer parte|entrar a la|afiliarme|afiliarse|afiliar|afiliacion|afiliados|afiliado|afiliada', 'afiliado'],
    ['formularios|formulario|planillas|plantillas|formatos|formato', 'formatos'],
    ['mujeres|mujer|genero|paridad|cuota', 'mujeres'],
    ['familiares|familiar|pariente|parientes|hermano|hermana|esposo|esposa|primo|prima|hijo|hija|papa|mama|cunado|cunada|suegro|parentesco', 'parentesco'],
    ['menor de edad|menores de edad|menores|mayor de edad|anos de edad|edad', 'edad'],
    ['surco|plataforma surco', 'surco'],
    ['certificacion|constancia de existencia|existencia y representacion|representacion legal|certificado|certificados', 'certificado'],
    ['presi', 'presidente'], ['secre', 'secretario'], ['tesorera', 'tesorero'], ['vice', 'vicepresidente'],
    ['semaforo|rojo|amarillo|verde|prevalidado|prevalidacion', 'semaforo'],
    ['subir|cargar|adjuntar|escanear|escaneado|escaneada|enviar el acta|mandar', 'subir'],
    ['entrega del cargo|entregar la junta|empalme', 'empalme'],
    ['asocomunales|asociacion de juntas|asociacion comunal|asocomunal', 'asocomunal'],
    ['gobernacion|dpcc|participacion comunitaria|esta dependencia|la direccion', 'direccion'],
    ['plazo|plazos|cuando son|fecha|fechas|calendario|dia de las', 'fecha'],
    ['periodo|cuanto dura|duracion|cuatrienio', 'periodo'],
    ['requisito|requisitos|condiciones|que se necesita|que necesito', 'requisitos'],
    ['comisiones de trabajo|comision de trabajo|comisiones|comision', 'comision'],
    ['convocar|convocatoria|citar|citacion|invitar a la asamblea', 'convocatoria'],
    ['creo una|crear una|crearla|fundar|constituir|formar una|nueva junta|hacer una junta', 'crear'],
    ['devolvieron|devuelven|devolucion|devoluciones|rechazaron|rechazo', 'devolucion'],
    ['pasos|paso a paso|etapas|proceso electoral|ruta', 'pasos etapas'],
    ['libro de afiliados|libro', 'libro'],
    ['tarjeton|papeleta|boleta', 'tarjeton'],
    ['empate|empatados|empataron', 'empate'],
    ['blanco|en blanco', 'blanco'],
    ['delegado|delegados|delegada', 'delegado'],
    ['fiscal|fiscalia', 'fiscal'],
    ['conciliador|conciliadores|convivencia', 'conciliador']
  ].map(([frases, canon]) => ({ re: new RegExp('\\b(' + frases.split('|').map((f) => f.replace(/ /g, '\\s+')).join('|') + ')\\b', 'g'), canon }));

  function canonizar(texto) {
    let t = ' ' + norm(texto) + ' ';
    SINONIMOS.forEach((s) => { t = t.replace(s.re, ' ' + s.canon + ' '); });
    return t.replace(/\s+/g, ' ').trim();
  }
  const raiz = (w) => { if (w.length > 4) w = w.replace(/(es|s)$/, ''); return w.length > 6 ? w.slice(0, 6) : w; };

  function distancia(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]; let minFila = i;
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev[j - 2] + 1);
        if (cur[j] < minFila) minFila = cur[j];
      }
      if (minFila > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }

  /* ---------- Índice ---------- */
  let KB = [], VOCAB = new Map(), IDF = {}, INDICE = [];
  const MUNS = [];

  function palabras(textoCanon) { return textoCanon.split(' ').filter((w) => w.length > 1 && !STOP.has(w)); }

  function construirIndice() {
    KB = window.KB || [];
    const df = {};
    INDICE = KB.map((e) => {
      const pesos = {};
      const sumar = (texto, w) => palabras(canonizar(texto)).forEach((p) => {
        VOCAB.set(p, (VOCAB.get(p) || 0) + 1);
        const r = raiz(p);
        pesos[r] = Math.max(pesos[r] || 0, w);
      });
      sumar(e.q, 3); sumar(e.v, 2.5); sumar(e.a, 0.6); sumar((e.pasos || []).join(' '), 0.4); sumar(e.problema || '', 0.3);
      Object.keys(pesos).forEach((r) => { df[r] = (df[r] || 0) + 1; });
      const frases = [e.q].concat(String(e.v).split('|')).map((f) => canonizar(f)).filter((f) => f.length > 6);
      return { e, pesos, frases };
    });
    const N = KB.length;
    Object.keys(df).forEach((r) => { IDF[r] = Math.log(1 + N / df[r]); });
    STOP.forEach((w) => { if (w.length > 3) VOCAB.set(w, (VOCAB.get(w) || 0) + 20); });   // "kiero" → "quiero"
    SINONIMOS.forEach((s) => {
      s.canon.split(' ').forEach((w) => VOCAB.set(w, (VOCAB.get(w) || 0) + 5));
      // Las formas de los sinónimos son vocabulario del dominio: se prefieren al corregir ("qeja" → "queja")
      s.re.source.replace(/\\b|\(|\)|\\s\+/g, ' ').split(/[|\s]+/).filter((w) => w.length > 3).forEach((w) => VOCAB.set(w, (VOCAB.get(w) || 0) + 40));
    });
    Object.entries(window.MUNICIPIOS || {}).forEach(([sub, lista]) => lista.forEach((m) => MUNS.push({ m, sub, n: norm(m) })));
    Object.entries(window.MUNICIPIOS_PROPIOS || {}).forEach(([m, x]) => MUNS.push({ m, sub: x.sub, n: norm(m), propio: x }));
    [['Carolina', 'Carolina del Príncipe'], ['Donmatías', 'Don Matías'], ['Santa Fe', 'Santa Fe de Antioquia'], ['Peñol', 'El Peñol'], ['Retiro', 'El Retiro'], ['Santuario', 'El Santuario'], ['San Vicente', 'San Vicente Ferrer']]
      .forEach(([corto, largo]) => { const x = MUNS.find((y) => y.m === largo); if (x) MUNS.push(Object.assign({}, x, { n: norm(corto) })); });
    MUNS.sort((a, b) => b.n.length - a.n.length);
  }

  function corregir(w) {
    if (VOCAB.has(w) || w.length < 4 || /^\d+$/.test(w)) return w;
    const max = w.length >= 7 ? 2 : 1;
    let mejor = w, md = max + 1, frec = 0;
    VOCAB.forEach((f, v) => {
      if (Math.abs(v.length - w.length) > max) return;
      const d = distancia(w, v, max);
      if (d < md || (d === md && f > frec)) { md = d; mejor = v; frec = f; }
    });
    return md <= max ? mejor : w;
  }

  function analizar(texto) {
    // Primero los sinónimos (para no "corregir" palabras válidas), luego la ortografía y otra vez los sinónimos
    const corregido = canonizar(texto).split(' ').map((w) => (STOP.has(w) ? w : corregir(w))).join(' ');
    const canon = canonizar(corregido);
    return { canon, raices: [...new Set(palabras(canon).map(raiz))] };
  }

  function buscar(texto, extra) {
    const q = analizar(texto);
    const raices = q.raices.slice();
    const pesoExtra = {};
    if (extra) analizar(extra.texto).raices.forEach((r) => { if (!raices.includes(r)) pesoExtra[r] = 0.6; });
    if (!raices.length && !Object.keys(pesoExtra).length) return [];
    return INDICE.map(({ e, pesos, frases }) => {
      let s = 0;
      raices.forEach((r) => {
        if (pesos[r]) { s += pesos[r] * (IDF[r] || 1); return; }
        // Conjugaciones y derivados ("afilio" ~ "afiliado"): coincidencia parcial por las 5 primeras letras
        if (r.length >= 5) {
          const k = Object.keys(pesos).find((x) => x.length >= 5 && x.slice(0, 5) === r.slice(0, 5));
          if (k) s += pesos[k] * (IDF[k] || 1) * 0.6;
        }
      });
      Object.entries(pesoExtra).forEach(([r, f]) => { if (pesos[r]) s += pesos[r] * (IDF[r] || 1) * f; });
      if (q.canon.length > 6 && frases.some((f) => f.includes(q.canon) || q.canon.includes(f))) s += 8;
      if (extra && extra.categoria && e.c === extra.categoria) s *= 1.2;
      return { e, s };
    }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  }

  function municipioEn(texto) {
    const t = ' ' + norm(texto) + ' ';
    return MUNS.find((x) => t.includes(' ' + x.n + ' '));
  }

  /* ---------- Interfaz ---------- */
  const caja = () => document.getElementById('chatMensajes');
  const ctx = { ultimo: null, municipio: null, esperandoMunicipio: null, oferta: null };

  function burbuja(html, quien = 'bot') {
    const d = document.createElement('div');
    d.className = 'msj msj--' + quien;
    d.innerHTML = html;
    caja().appendChild(d);
    caja().scrollTop = caja().scrollHeight;
    return d;
  }
  function sugerencias(items) {
    if (!items.length) return;
    const d = document.createElement('div');
    d.className = 'sugerencias';
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = it.etiqueta;
      b.addEventListener('click', () => { d.remove(); it.accion(); });
      d.appendChild(b);
    });
    caja().appendChild(d);
    caja().scrollTop = caja().scrollHeight;
  }
  const preguntaChip = (e) => ({ etiqueta: e.q, accion: () => { burbuja(esc(e.q), 'yo'); responderEntrada(e); } });

  function parrafos(t) { return String(t).split(/\n+/).map((p) => `<p>${esc(p)}</p>`).join(''); }
  function enlaceHTML(label, url) {
    if (url.startsWith('#')) return `<button type="button" data-ir-pagina="${esc(url)}">${esc(label)} →</button>`;
    const pdf = /\.pdf$/i.test(url);
    return `<a href="${esc(encodeURI(url))}" ${pdf ? 'download' : 'target="_blank" rel="noopener"'}>${esc(label)} ${pdf ? '⬇' : '↗'}</a>`;
  }

  function responderEntrada(e, desdeSeguimiento) {
    ctx.ultimo = e;
    let html = parrafos(e.a);
    if (e.pasos && e.pasos.length) html += `<p class="msj__tit">✅ Qué hacer</p><ol>${e.pasos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>`;
    if (e.docs && e.docs.length) html += `<details class="msj__mas"><summary>📎 Ten a la mano</summary><ul>${e.docs.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></details>`;
    if (e.problema) html += `<details class="msj__mas"><summary>⚠️ Si hay un problema</summary><p>${esc(e.problema)}</p></details>`;
    const links = (e.links || []).map(([l, u]) => enlaceHTML(l, u)).join('');
    if (links) html += `<div class="msj__enlaces">${links}</div>`;
    activarBotones(burbuja(html));

    if (e.municipio) {
      if (ctx.municipio) responderMunicipio(ctx.municipio, e);
      else {
        ctx.esperandoMunicipio = e;
        burbuja('<p>📍 ¿En qué municipio está tu organismo comunal (la Junta o la Asocomunal)? Así te digo quién lo atiende.</p>');
      }
      return;
    }
    const rel = buscar(e.q + ' ' + e.v, { texto: e.q, categoria: e.c }).filter((x) => x.e.id !== e.id).slice(0, 2).map((x) => preguntaChip(x.e));
    if (!desdeSeguimiento && rel.length) sugerencias(rel);
  }

  function activarBotones(nodo) {
    nodo.querySelectorAll('[data-ir-pagina]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.prellenar && window.prellenarMunicipio) window.prellenarMunicipio(b.dataset.prellenar);
      // En el celular el asistente tapa la pantalla y se cierra solo al ir a otra sección (js/rutas.js).
      window.Rutas.ir(b.dataset.irPagina);
    }));
  }

  function profesionalDe(mun) {
    return Object.entries(window.PROFESIONALES || {}).find(([, p]) => p.municipios.includes(mun));
  }

  /* Ruta según el municipio: los 8 con atención propia van a su alcaldía; los demás, a la Gobernación
     con su profesional de zona. */
  function responderMunicipio(mu, tema) {
    ctx.municipio = mu;
    ctx.esperandoMunicipio = null;
    let html;
    if (mu.propio) {
      const p = mu.propio;
      html = `<p>📍 <strong>${esc(mu.m)}</strong> tiene atención municipal propia. Sus organismos comunales los atiende la alcaldía, no la Gobernación.</p>
        <p><strong>${esc(p.entidad)}</strong><br>${p.tel ? '📞 ' + esc(p.tel) + '<br>' : ''}${p.correo ? '✉️ ' + esc(p.correo) : ''}</p>
        <div class="msj__enlaces"><a href="${esc(p.web)}" target="_blank" rel="noopener">Ir al canal de ${esc(mu.m)} ↗</a></div>`;
    } else {
      const pr = profesionalDe(mu.m);
      const temaTxt = tema ? norm(tema.q) : '';
      html = `<p>📍 <strong>${esc(mu.m)}</strong> (${esc(mu.sub)}) lo atiende la <strong>Gobernación de Antioquia</strong>.</p>`;
      if (pr) html += `<p>👤 Profesional de zona: <strong>${esc(pr[0])}</strong> (zona ${esc(pr[1].zona)}).</p>`;
      if (/impugn|conflicto/.test(temaTxt)) html += `<p>La impugnación se presenta primero ante la Comisión de Convivencia y Conciliación de la ASOCOMUNAL de ${esc(mu.m)}. Si no hay ASOCOMUNAL, ante la Dirección.</p>`;
      html += `<p>✉️ ${esc(window.ENLACES.correoDireccion)}</p>
        <div class="msj__enlaces">
          <button type="button" data-ir-pagina="#/mapa" data-municipio-mapa="${esc(mu.m)}">Ver ${esc(mu.m)} en el mapa →</button>
          <a href="${esc(window.ENLACES.mercurio)}" target="_blank" rel="noopener">Radicar solicitud o PQRSD ↗</a>
          <a href="${esc(window.ENLACES.surcoAfiliados)}" target="_blank" rel="noopener">Afiliados en SURCO ↗</a>
        </div>`;
    }
    const b = burbuja(html);
    b.querySelectorAll('[data-municipio-mapa]').forEach((x) => x.addEventListener('click', () => {
      setTimeout(() => window.Mapa && window.Mapa.seleccionar(x.dataset.municipioMapa), 400);
    }));
    activarBotones(b);
    if (!mu.propio) sugerencias(['Paso a paso de las Elecciones Comunales 2026', 'Inscripción o reconocimiento de dignatarios', 'Quiero impugnar una elección o decisión']
      .map((q) => KB.find((e) => e.q === q)).filter(Boolean).map(preguntaChip));
  }

  /* Intenciones de conversación */
  const RE = {
    saludo: /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|saludos|ola)\b/,
    gracias: /\b(gracias|muchas gracias|mil gracias|listo gracias|ok gracias)\b/,
    despedida: /^(chao|adios|hasta luego|nos vemos|bye)\b/,
    menu: /^(menu|temas|opciones|inicio|empezar|ayuda|que puedes hacer|que sabes)$/,
    fuente: /(de donde (sale|salio|sacaste)|cual es la fuente|fuente|en que (ley|norma|articulo)|que (ley|norma|articulo) (dice|lo dice)|fundamento)/,
    mas: /^(mas|mas informacion|explicame mejor|no entendi|no entiendo|como asi|amplia|ampliar|detalles|y que mas)\b/,
    humano: /(hablar con (alguien|una persona|un funcionario|un asesor)|asesor|funcionario|persona real|llamar|telefono de la direccion|correo de la direccion|contacto)/,
    seguimiento: /^(y|e|pero|entonces|tambien|ademas|y si|y que|y cuanto|y cuantos|y cuando|y donde|y quien|y como)\b/,
    referencia: /\b(eso|esa|ese|esto|esta|ellos|ellas|alli|ahi|lo mismo|esos|esas)\b/
  };

  /* Categorías del asistente (hoja "Categorías" de la base) */
  const TEMAS = [['🏘️', 'Juntas de Acción Comunal', 'jac'], ['🗳️', 'Elecciones comunales', 'elecciones'], ['👥', 'Dignatarios', 'dignatarios'], ['📘', 'ABC Comunal', 'abc'],
    ['📄', 'Trámites y documentos', 'tramites'], ['⚖️', 'Problemas dentro de una JAC', 'problemas'], ['🤝', 'Participación ciudadana', 'participacion']];

  function menuInicial() {
    burbuja(`<p>¡Hola! Soy el asistente de la Dirección de Participación Comunitaria y Ciudadana. Escribe tu pregunta como la dirías, o elige un tema.</p>
      <p class="msj__nota">🔒 No escribas números de documento de identidad, contraseñas ni datos bancarios. <a href="${esc(window.ENLACES.politicaDatos)}" target="_blank" rel="noopener">Política de tratamiento de datos</a></p>`);
    temasComoChips();
  }
  function temasComoChips() {
    sugerencias(TEMAS.map(([ico, nombre, cat]) => ({
      etiqueta: ico + ' ' + nombre,
      accion: () => {
        burbuja(esc(nombre), 'yo');
        burbuja('<p>Elige una pregunta o escribe la tuya:</p>');
        sugerencias(KB.filter((e) => e.c === cat).map(preguntaChip));
      }
    })));
  }

  function responder(texto) {
    const n = norm(texto);
    if (!n) return;

    if (RE.menu.test(n)) { burbuja('<p>Claro. Estos son los temas:</p>'); temasComoChips(); return; }
    if (RE.gracias.test(n) && n.split(' ').length <= 4) { burbuja('<p>¡Con gusto! Si te surge otra duda, aquí estoy.</p>'); return; }
    if (RE.despedida.test(n)) { burbuja('<p>¡Hasta pronto! Mucho éxito con tu organismo comunal.</p>'); return; }
    if (RE.fuente.test(n) && ctx.ultimo) {
      burbuja(`<p>Esa respuesta se basa en: <strong>${esc(ctx.ultimo.f || 'Ley 2166 de 2021')}</strong>, y en el Manual Comunal de la Gobernación de Antioquia (2025).</p>`);
      return;
    }
    if (RE.humano.test(n)) {
      activarBotones(burbuja(`<p>Para hablar con alguien de la Dirección usa los canales de atención que están al final de la página de inicio, o la página oficial de la Dirección.</p><div class="msj__enlaces">${enlaceHTML('Página de la Dirección', window.ENLACES.direccion)}<button type="button" data-ir-pagina="#/inicio/ayuda">Ver canales de atención</button></div>`));
      return;
    }

    // Municipio
    const mu = municipioEn(texto);
    const pideMunicipio = /\b(municipio|vivo en|soy de|somos de|estoy en|queda en|es de|junta de|vereda|barrio)\b/.test(n) || n.split(' ').length <= 4;
    if (mu && (ctx.esperandoMunicipio || pideMunicipio)) {
      const tema = ctx.esperandoMunicipio || ctx.ultimo;
      const resto = n.replace(mu.n, '').replace(/\b(municipio|de|en|el|la|soy|vivo|estoy|somos|queda|es|mi|junta)\b/g, '').trim();
      responderMunicipio(mu, ctx.esperandoMunicipio ? tema : null);
      if (resto.split(' ').filter((w) => w.length > 3).length >= 2) {
        const r = buscar(texto);
        if (r[0] && r[0].s > 6) responderEntrada(r[0].e, true);
      }
      return;
    }
    if (mu) ctx.municipio = mu;
    // Esperaba un municipio pero llegó otra cosa: si parece una pregunta, se responde; si no, se aclara.
    if (ctx.esperandoMunicipio && n.split(' ').length <= 3 && !mu && !((buscar(texto)[0] || {}).s >= 5)) {
      burbuja('<p>No reconocí ese municipio. Escríbelo como aparece en el mapa de Antioquia, por ejemplo: <em>Santa Fe de Antioquia</em> o <em>El Carmen de Viboral</em>. Si prefieres, hazme otra pregunta.</p>');
      return;
    }
    ctx.esperandoMunicipio = null;

    if (RE.mas.test(n) && ctx.ultimo) {
      const rel = buscar(ctx.ultimo.q + ' ' + ctx.ultimo.v, { texto: ctx.ultimo.q, categoria: ctx.ultimo.c }).filter((x) => x.e.id !== ctx.ultimo.id).slice(0, 4);
      burbuja('<p>Te dejo otras preguntas sobre el mismo tema que pueden aclararlo:</p>');
      sugerencias(rel.map((x) => preguntaChip(x.e)));
      return;
    }

    if (RE.saludo.test(n) && analizar(texto).raices.length === 0) {
      burbuja('<p>¡Hola! ¿En qué te puedo ayudar? Puedes escribir tu pregunta o elegir un tema.</p>');
      temasComoChips();
      return;
    }

    // Búsqueda. Si la pregunta es corta o hace referencia a lo anterior ("¿y cuántos son?"),
    // se completa con el tema de la respuesta anterior.
    let res = buscar(texto);
    // Preguntas de seguimiento: "¿y quiénes no pueden ser?", "¿y si hay una sola?" se responden con el tema anterior.
    // Si la pregunta nueva es clara por sí sola, manda la pregunta nueva.
    const explicita = RE.seguimiento.test(n) || RE.referencia.test(n);
    const debil = !res[0] || res[0].s < 8;
    if (ctx.ultimo && (explicita || (res[0] && debil)) && analizar(texto).raices.length) {
      const conCtx = buscar(texto, { texto: ctx.ultimo.q + ' ' + ctx.ultimo.v, categoria: ctx.ultimo.c });
      if (conCtx[0] && (explicita || !res[0] || conCtx[0].s > res[0].s * 1.3)) res = conCtx;
    }
    const top = res[0];

    if (!top || top.s < 3.5) {
      burbuja(`<p>No estoy seguro de haber entendido${ctx.ultimo ? '' : ''}. ¿Puedes decirlo de otra forma? También puedes elegir un tema.</p>`);
      if (top && top.s >= 1.5) sugerencias(res.slice(0, 3).map((x) => preguntaChip(x.e)));
      else temasComoChips();
      return;
    }
    const segundo = res[1];
    if (segundo && top.s < 14 && segundo.s > top.s * 0.88 && segundo.e.c !== top.e.c) {
      burbuja('<p>Encontré varias respuestas posibles. ¿Cuál se parece más a lo que buscas?</p>');
      sugerencias(res.slice(0, 3).map((x) => preguntaChip(x.e)));
      return;
    }
    responderEntrada(top.e);
    if (mu && !top.e.municipio) burbuja(`<p class="msj__nota">📍 Anoté que tu organismo comunal está en ${esc(mu.m)} (${esc(mu.sub)}).</p>`);
  }

  /* ---------- Arranque ---------- */
  let estado = 'apagado';
  function iniciar() {
    if (estado !== 'apagado') return;
    estado = 'cargando';
    burbuja('<p>Cargando el asistente…</p>');
    const s = document.createElement('script');
    s.src = 'js/kb.js';
    s.onload = () => {
      construirIndice();
      caja().innerHTML = '';
      estado = 'listo';
      menuInicial();
    };
    s.onerror = () => { estado = 'apagado'; caja().innerHTML = ''; burbuja('<p>No pude cargar el asistente. Revisa tu conexión e inténtalo de nuevo.</p>'); };
    document.head.appendChild(s);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chatForm');
    const ent = document.getElementById('chatEntrada');
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const t = ent.value.trim();
      if (!t) return;
      if (estado !== 'listo') { iniciar(); return; }
      burbuja(esc(t), 'yo');
      ent.value = '';
      caja().querySelectorAll('.sugerencias').forEach((x) => x.remove());
      setTimeout(() => responder(t), 180);
    });
  });

  window.Chatbot = { iniciar, _responder: (t) => responder(t), _buscar: buscar, _analizar: analizar };
})();
