/* Genera los documentos Word a partir de las copias de los formatos oficiales con marcadores
   (js/plantillas.js, creadas con build_templates.py). Los formatos originales no se tocan.
   Marcadores:
     {{campo}}     dato; vacío si no hay
     {{campo|_}}   dato; si no hay, deja una línea para llenar a mano
     {{#lista:N}}  fila de tabla que se repite por cada elemento (mínimo N filas)
     {{.campo}}    dato del elemento dentro de la fila repetida
   JSZip y las plantillas solo se descargan la primera vez que alguien genera un documento. */
(function () {
  const JSZIP_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
  const cargados = {};

  function cargarScript(src) {
    if (!cargados[src]) {
      cargados[src] = new Promise((ok, falla) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = ok;
        s.onerror = () => { delete cargados[src]; falla(new Error('No se pudo cargar ' + src)); };
        document.head.appendChild(s);
      });
    }
    return cargados[src];
  }

  function escXml(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function inicioFila(xml, desde) {
    const a = xml.lastIndexOf('<w:tr>', desde);
    const b = xml.lastIndexOf('<w:tr ', desde);
    return Math.max(a, b);
  }

  function expandirFilas(xml, datos) {
    const re = /\{\{#(\w+):(\d+)\}\}/;
    let m;
    while ((m = re.exec(xml))) {
      const ini = inicioFila(xml, m.index);
      const fin = xml.indexOf('</w:tr>', m.index) + '</w:tr>'.length;
      const modelo = xml.slice(ini, fin).replace(m[0], '');
      const items = (datos[m[1]] || []).slice();
      const minimo = parseInt(m[2], 10);
      while (items.length < minimo) items.push({});
      const filas = items.map((it, i) => modelo.replace(/\{\{\.(\w+)\}\}/g, (_, k) => {
        if (k === 'n') return String(it.n || i + 1);
        return it[k] == null ? '' : escXml(it[k]);
      })).join('');
      xml = xml.slice(0, ini) + filas + xml.slice(fin);
    }
    return xml;
  }

  function llenar(xml, datos) {
    xml = expandirFilas(xml, datos);
    return xml.replace(/\{\{(\w+)(\|_)?\}\}/g, (_, k, linea) => {
      const v = datos[k];
      if (v === undefined || v === null || v === '') return linea ? '____________' : '';
      return escXml(v);
    });
  }

  function descargarBlob(blob, nombre) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nombre;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function generarWord(plantilla, datos, nombreArchivo) {
    await cargarScript(JSZIP_URL);
    if (!window.PLANTILLAS) await cargarScript('js/plantillas.js');
    const zip = await window.JSZip.loadAsync(window.PLANTILLAS[plantilla], { base64: true });
    const xml = await zip.file('word/document.xml').async('string');
    zip.file('word/document.xml', llenar(xml, datos));
    const blob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    window.Word.descargarBlob(blob, nombreArchivo);
    return blob;
  }

  window.Word = { generarWord, descargarBlob, cargarScript, cargarZip: () => cargarScript(JSZIP_URL) };
})();
