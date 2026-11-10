/* ============================================================================
   🎬 VIDEOS DE LA PÁGINA
   Cada espacio de video de la página lee su información de esta lista.

   CÓMO PONER UN VIDEO CUANDO ESTÉ LISTO (no hay que tocar nada más):
   1. Busque el video por su título.
   2. Llene "url" con UNA de estas opciones:
        - Enlace de YouTube, por ejemplo: 'https://www.youtube.com/watch?v=XXXXXXXXXXX'
          (también sirve el enlace corto youtu.be o el de Shorts)
        - Archivo propio dentro de la carpeta media/, por ejemplo: 'media/video-1.mp4'
   3. Guarde el archivo. El espacio del video aparece solo en la página.
   Mientras "url" esté vacío ('') el espacio está OCULTO (no se ve nada, ni el título).
   Los enlaces de Shorts (youtube.com/shorts/…) se muestran en un marco vertical 9:16.
   Los videos solo se cargan cuando la persona pulsa ▶, para ahorrar datos.
   ============================================================================ */
window.VIDEOS = {
  // Videos institucionales (YouTube Shorts, verticales)
  'v1': { titulo: '¿Qué es la acción comunal?', url: 'https://youtube.com/shorts/XHZtLvXftZo' },
  'v2': { titulo: '¿Quiénes conforman la acción comunal?', url: 'https://youtube.com/shorts/Wm6wAEs2C4Q' },
  'v3': { titulo: '¿Qué hace la Gobernación de Antioquia por la acción comunal?', url: 'https://youtube.com/shorts/PhsLYbu76EU' },
  // Aún sin video (ocultos hasta llenar url)
  'v4': { titulo: '¿En qué municipios está presente el acompañamiento?', url: '' },
  'v5': { titulo: '¿Dónde consultar información oficial?', url: '' },

  // Animaciones cortas por proceso (30 a 60 segundos, con la mascota de las guías)
  'proc-libro':      { titulo: 'El libro de afiliados', url: '', corto: true },
  'proc-asamblea':   { titulo: 'La asamblea preparatoria', url: '', corto: true },
  'proc-tribunal':   { titulo: 'El Tribunal de Garantías', url: '', corto: true },
  'proc-planchas':   { titulo: 'Cómo postular una plancha', url: '', corto: true },
  'proc-votacion':   { titulo: 'El día de la votación', url: '', corto: true },
  'proc-escrutinio': { titulo: 'Cómo se reparten los cargos', url: '', corto: true },
  'proc-registro':   { titulo: 'Cómo enviar los documentos a la Dirección', url: '', corto: true },

  // Video existente sobre el proceso de elección (archivo local)
  'eleccion': { titulo: 'El proceso de elección paso a paso', url: 'media/video-proceso-eleccion.mp4' }
};
