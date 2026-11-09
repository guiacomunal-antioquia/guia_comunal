/* Datos fijos de la página. Fuentes: Manual Comunal (Gobernación de Antioquia, 2025), Ley 2166 de 2021,
   Decreto 1501 de 2023, Circular 09 de 2025 del Ministerio del Interior y archivo "Profesionales de zona". */

/* ===================================================================================
   MUNICIPIOS QUE SON COMPETENCIA DE LA GOBERNACIÓN (117), por subregión.
   Se usan en todas las listas desplegables de la página.
   =================================================================================== */
window.MUNICIPIOS = {
  'Bajo Cauca': ['Cáceres', 'Caucasia', 'El Bagre', 'Nechí', 'Tarazá', 'Zaragoza'],
  'Magdalena Medio': ['Caracolí', 'Maceo', 'Puerto Berrío', 'Puerto Nare', 'Puerto Triunfo', 'Yondó'],
  'Nordeste': ['Amalfi', 'Anorí', 'Cisneros', 'Remedios', 'San Roque', 'Santo Domingo', 'Segovia', 'Vegachí', 'Yalí', 'Yolombó'],
  'Norte': ['Angostura', 'Belmira', 'Briceño', 'Campamento', 'Carolina del Príncipe', 'Don Matías', 'Entrerríos', 'Gómez Plata', 'Guadalupe', 'Ituango', 'San Andrés de Cuerquia', 'San José de la Montaña', 'San Pedro de los Milagros', 'Santa Rosa de Osos', 'Toledo', 'Valdivia', 'Yarumal'],
  'Occidente': ['Abriaquí', 'Anzá', 'Armenia', 'Buriticá', 'Cañasgordas', 'Dabeiba', 'Ebéjico', 'Frontino', 'Giraldo', 'Heliconia', 'Liborina', 'Olaya', 'Peque', 'Sabanalarga', 'San Jerónimo', 'Santa Fe de Antioquia', 'Sopetrán', 'Uramita'],
  'Oriente': ['Abejorral', 'Alejandría', 'Argelia', 'Cocorná', 'Concepción', 'El Carmen de Viboral', 'El Peñol', 'El Retiro', 'El Santuario', 'Granada', 'Guarne', 'Guatapé', 'La Ceja', 'La Unión', 'Marinilla', 'Nariño', 'San Carlos', 'San Francisco', 'San Luis', 'San Rafael', 'San Vicente Ferrer', 'Sonsón'],
  'Suroeste': ['Amagá', 'Andes', 'Angelópolis', 'Betania', 'Betulia', 'Caicedo', 'Caramanta', 'Ciudad Bolívar', 'Concordia', 'Fredonia', 'Hispania', 'Jardín', 'Jericó', 'La Pintada', 'Montebello', 'Pueblorrico', 'Salgar', 'Santa Bárbara', 'Támesis', 'Tarso', 'Titiribí', 'Urrao', 'Valparaíso', 'Venecia'],
  'Urabá': ['Apartadó', 'Arboletes', 'Carepa', 'Chigorodó', 'Murindó', 'Mutatá', 'Necoclí', 'San Juan de Urabá', 'San Pedro de Urabá', 'Turbo', 'Vigía del Fuerte'],
  'Valle de Aburrá': ['Barbosa', 'Girardota', 'La Estrella']
};

/* Los datos del mapa (profesionales, fotos, correos, promotores, número de juntas y municipios
   que atiende su alcaldía) están en datos/mapa.js, para actualizarlos sin tocar el código. */

window.ENLACES = {
  surcoAfiliados: 'https://surco.antioquia.gov.co/Surco/formularios/registroAfiliados/frmafiliadospublicados.xhtml',
  surcoCertificados: 'https://surco.antioquia.gov.co/Surco/formularios/certificadosPublicados/frmcertificadospublicados.xhtml',
  adres: 'https://www.adres.gov.co/consulte-su-eps',
  policia: 'https://antecedentes.policia.gov.co:7005/WebJudicial/',
  direccion: 'https://www.antioquia.gov.co/direccion-de-participacion-comunitaria-y-ciudadana',
  mercurio: 'https://mercurio.antioquia.gov.co/mercurio/ServletPublic?operacion=9&codIndice=00126&idAsunto=PQRSDW&indicador=1&logueoPqr=S',
  politicaDatos: 'https://compilacionjuridica.antioquia.gov.co/compilacion/compilacion/docs/d_gobant_2022070004096_2022.htm',
  estimulos: 'https://www.antioquia.gov.co/estimulos-2026',
  observatorio: 'https://opc-spcc-gobantioquia.hub.arcgis.com/pages/indicadores',
  correoDireccion: 'organismoscomunales@antioquia.gov.co'
};

/* Formatos oficiales en Word (copias con nombres claros en descargas/) */
window.FORMATOS = [
  { id: 'tribunal', grupo: 'Asamblea preparatoria', nombre: 'Acta de asamblea preparatoria y Tribunal de Garantías', archivo: 'Acta de asamblea preparatoria y designacion del Tribunal de Garantias.docx' },
  { id: 'listadoTribunal', grupo: 'Asamblea preparatoria', nombre: 'Listado de asistencia – asamblea preparatoria', archivo: 'Listado de asistencia - Asamblea preparatoria.docx' },
  { id: 'planchas', grupo: 'Postulación', nombre: 'Formato de postulación por planchas', archivo: 'Formato de postulacion por planchas.docx' },
  { id: 'listas', grupo: 'Postulación', nombre: 'Formato de postulación por listas', archivo: 'Formato de postulacion por listas.docx' },
  { id: 'actaAsamblea', grupo: 'Elección en asamblea', nombre: 'Acta de elección – en asamblea', archivo: 'Acta de eleccion de dignatarios - En asamblea.docx' },
  { id: 'listadoAsamblea', grupo: 'Elección en asamblea', nombre: 'Listado de asistencia – asamblea de elección', archivo: 'Listado de asistencia - Asamblea de eleccion.docx' },
  { id: 'actaDirecta', grupo: 'Elección directa', nombre: 'Acta de elección – elección directa', archivo: 'Acta de eleccion de dignatarios - Eleccion directa.docx' },
  { id: 'escrutinioMesa', grupo: 'Elección directa', nombre: 'Acta de escrutinio por mesa', archivo: 'Acta de escrutinio por mesa - Eleccion directa.docx' },
  { id: 'listadoDirecta', grupo: 'Elección directa', nombre: 'Listado de asistencia por mesa', archivo: 'Listado de asistencia por mesa - Eleccion directa.docx' },
  { id: 'solicitud', grupo: 'Registro en la Gobernación', nombre: 'Solicitud de inscripción de dignatarios', archivo: 'Solicitud de inscripcion de dignatarios JAC-JVC.docx' }
];

/* Línea de tiempo de la elección: etapa, cuándo, quién y qué hace */
window.LINEA_TIEMPO = [
  { id: 'libro', icono: '📒', titulo: 'Libro de afiliados', cuando: 'Antes de todo', quien: ['Secretario'], hace: ['Revisa y depura el libro', 'Quita registros repetidos', 'Confirma quiénes votan'], ojo: 'Nadie puede estar afiliado a dos juntas.', video: 'proc-libro', guia: 'g1' },
  { id: 'asamblea', icono: '👥', titulo: 'Asamblea preparatoria', cuando: '30 días o más antes', quien: ['Presidente', 'Secretario', 'Afiliados'], hace: ['Convoca con 8 a 15 días', 'Define asamblea o elección directa', 'Define planchas o listas, fecha y empates'], ojo: 'Deja todo escrito en el acta.', video: 'proc-asamblea', guia: 'g2', herramienta: 'paso-asamblea' },
  { id: 'tribunal', icono: '⚖️', titulo: 'Tribunal de Garantías', cuando: 'En la asamblea preparatoria', quien: ['Asamblea', '6 afiliados'], hace: ['3 principales y 3 suplentes', 'No pueden ser candidatos', 'No pueden ser dignatarios actuales'], ojo: 'Es la causa n.º 1 de devoluciones.', video: 'proc-tribunal', guia: 'g2', herramienta: 'paso-tribunal' },
  { id: 'postulacion', icono: '📝', titulo: 'Postulación de planchas', cuando: 'Hasta la fecha límite', quien: ['Candidatos', 'Tribunal'], hace: ['Se entregan al Tribunal', 'Cada candidato firma', 'Nadie en dos cargos'], ojo: 'Sin firma de recibido del Tribunal, se devuelve.', video: 'proc-planchas', guia: 'g3', herramienta: 'paso-planchas' },
  { id: 'votacion', icono: '🗳️', titulo: 'Votación', cuando: 'Día de la elección', quien: ['Afiliados', 'Tribunal', 'Jurados'], hace: ['Se vota por bloques', 'Asamblea: mitad más uno', 'Directa: mínimo 30 %'], ojo: 'Mínimo 2 integrantes del Tribunal presentes.', video: 'proc-votacion', guia: 'g3', herramienta: 'paso-votos' },
  { id: 'escrutinio', icono: '🧮', titulo: 'Escrutinio', cuando: 'Al cerrar la votación', quien: ['Tribunal', 'Secretario'], hace: ['Se cuentan los votos', 'Cociente y mayor residuo', 'Quedan los dignatarios elegidos'], ojo: 'Un error en el cociente devuelve todo.', video: 'proc-escrutinio', guia: 'g3', herramienta: 'paso-votos' },
  { id: 'registro', icono: '📨', titulo: 'Registro en la Gobernación', cuando: 'Después de la elección', quien: ['Presidente', 'Secretario'], hace: ['Firmas originales', 'Sin enmendaduras', 'Envío al correo de la Dirección'], ojo: 'La Dirección revisa y expide el reconocimiento.', video: 'proc-registro', guia: 'g4', herramienta: 'paso-enviar' }
];

/* Calendario 2026 (Circular 09 de 2025, Ministerio del Interior) */
window.CALENDARIO_2026 = [
  ['Tribunal de Garantías', 'Hasta el 26 de marzo'],
  ['Afiliaciones', 'Hasta el 10 de abril'],
  ['Elección JAC y JVC', 'Domingo 26 de abril'],
  ['Nuevo periodo', '1 de julio de 2026 a 30 de junio de 2030']
];
window.FECHA_OFICIAL_2026 = '2026-04-26';

/* Carrusel del inicio. Cada foto tiene dos tamaños en img/carrusel/: dpcc-NN.webp (1280 px)
   y dpcc-NN-640.webp (640 px, para celular). Para regenerarlos desde las fotos originales:
   python _mantenimiento/build_imagenes.py "<carpeta Propuesta de Mejora>".
   alt: lo que se ve (lo lee el lector de pantalla). texto: frase opcional sobre la foto. */
window.CARRUSEL = [
  { n: 6, alt: 'Foto de grupo de un encuentro comunal', texto: 'Juntas que construyen territorio' },
  { n: 7, alt: 'Pareja de líderes comunales con su certificado', texto: 'Acompañamiento en los municipios de Antioquia' },
  { n: 4, alt: 'Entrega de certificado a una lideresa comunal', texto: 'Elecciones transparentes y participativas' },
  { n: 2, alt: 'Líderes comunales en un auditorio' },
  { n: 9, alt: 'Entrega de certificado a un líder comunal' },
  { n: 15, alt: 'Mesa de trabajo con líderes comunales' },
  { n: 5, alt: 'Líderes comunales con sus certificados' },
  { n: 23, alt: 'Auditorio lleno en un encuentro comunal' },
  { n: 19, alt: 'Líderes comunales reciben su certificado' },
  { n: 11, alt: 'Capacitación a líderes comunales' },
  { n: 20, alt: 'Una lideresa comunal recibe su certificado' },
  { n: 13, alt: 'Entrega de certificado en un concejo municipal' },
  { n: 16, alt: 'Asesoría a juntas en una mesa de trabajo' },
  { n: 21, alt: 'Grupo de líderes comunales celebra con sus certificados' },
  { n: 3, alt: 'Encuentro comunal en un recinto' },
  { n: 8, alt: 'Entrega de certificados en un salón comunal' },
  { n: 17, alt: 'Atención a una lideresa comunal' },
  { n: 22, alt: 'Funcionario de la Dirección habla con líderes comunales' },
  { n: 10, alt: 'Dignatarios comunales con funcionarios de la Gobernación' },
  { n: 14, alt: 'Líderes comunales y funcionarias en un concejo municipal' },
  { n: 18, alt: 'Entrega de certificado a un líder comunal' },
  { n: 12, alt: 'Asistentes a una jornada comunal' },
  { n: 24, alt: 'Funcionaria orienta a líderes comunales' },
  { n: 1, alt: 'Foto de grupo de líderes comunales en un recinto' }
].map((x) => Object.assign(x, { img: `img/carrusel/dpcc-${String(x.n).padStart(2, '0')}.webp` }));
