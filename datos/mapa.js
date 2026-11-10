/* ===================================================================================
   ✏️ DATOS DEL MAPA — ARCHIVO PARA ACTUALIZAR SIN PROGRAMAR
   Ábralo con el Bloc de notas (o cualquier editor de texto), cambie lo que necesite y guarde.
   No hay que tocar ningún otro archivo.

   Reglas sencillas:
   - Cambie solo el texto que está entre comillas simples: 'así'.
   - Donde dice 'Dato', escriba la información. Lo que quede como 'Dato' NO se muestra en la página
     (se oculta el campo); aparece solo cuando tenga la información. Sin foto se muestra solo el nombre.
   - Los números de juntas pueden ir sin comillas (120) o con comillas ('120').
   - Fotos: guarde la foto en la carpeta indicada (rectangular 4:5, por ejemplo 320 × 400 px,
     de la cabeza a la cintura) y escriba aquí el nombre del archivo. Sin foto ('sin-foto.svg') se ve solo el nombre.
   - Solo información pública: nombres y contactos institucionales y estadísticas generales.
     Nunca cédulas ni datos personales de afiliados.

   EN EL FUTURO: estos datos (juntas registradas, activas, inactivas, Asocomunales y promotores)
   vendrían directamente de SURCO, que es donde la Dirección los registra. Cuando exista esa
   conexión, este archivo se reemplaza por la consulta a SURCO y el mapa no cambia.
   =================================================================================== */

/* 1. PROFESIONALES DE ZONA y los municipios que atiende cada uno
      (archivo "Profesionales de zona", 2026). */
window.PROFESIONALES = {
  'Silvia Avendaño':             { zona: 1, municipios: ['Puerto Berrío', 'Yondó', 'San Roque', 'Santo Domingo', 'Amalfi', 'Remedios', 'Segovia', 'Vegachí', 'Yolombó', 'Anorí'] },
  'Carlos Muñoz':                { zona: 2, municipios: ['Necoclí', 'San Juan de Urabá', 'Arboletes', 'Apartadó', 'Carepa', 'Chigorodó', 'Turbo', 'Murindó', 'Vigía del Fuerte', 'Mutatá', 'Amagá', 'Titiribí', 'Fredonia', 'Venecia', 'Marinilla'] },
  'Jovani Zapata':               { zona: 3, municipios: ['Andes', 'Betania', 'Hispania', 'Jardín', 'Salgar', 'Urrao', 'Betulia', 'Caramanta', 'Jericó', 'La Pintada', 'Montebello', 'Pueblorrico', 'Santa Bárbara', 'Támesis', 'Tarso', 'Valparaíso'] },
  'Héctor Correa':               { zona: 4, municipios: ['Buriticá', 'Giraldo', 'Liborina', 'Olaya', 'Sabanalarga', 'San Jerónimo', 'Santa Fe de Antioquia', 'Sopetrán', 'Anzá', 'Caicedo', 'Ebéjico', 'Dabeiba', 'Uramita', 'Peque', 'Frontino', 'Abriaquí', 'Cañasgordas'] },
  'Sebastián Mira':              { zona: 5, municipios: ['Alejandría', 'Concepción', 'Guatapé', 'Abejorral', 'Argelia', 'Nariño', 'Sonsón', 'El Peñol', 'San Carlos', 'San Rafael', 'San Francisco', 'San Luis', 'Puerto Nare', 'Puerto Triunfo', 'La Unión'] },
  'David Ramírez':               { zona: 6, municipios: ['Cáceres', 'Caucasia', 'El Bagre', 'Nechí', 'Zaragoza', 'Tarazá', 'Valdivia', 'Briceño', 'Ituango', 'San Andrés de Cuerquia', 'Toledo', 'Angostura', 'Campamento', 'Yarumal', 'San José de la Montaña'] },
  'John Wilson Zapata Martínez': { zona: 7, municipios: ['El Carmen de Viboral', 'El Retiro', 'Barbosa', 'Santa Rosa de Osos', 'Belmira', 'San Pedro de los Milagros', 'Entrerríos'] },
  'Ana Machado':                 { zona: 7, municipios: ['San Vicente Ferrer', 'La Estrella'] },
  'Sandra Arias':                { zona: 7, municipios: ['Guarne', 'El Santuario', 'Don Matías'] },
  'Mónica Caro':                 { zona: '1, 2, 3, 5 y 7', municipios: ['Maceo', 'Caracolí', 'Yalí', 'Cisneros', 'Carolina del Príncipe', 'Gómez Plata', 'Guadalupe', 'Heliconia', 'Angelópolis', 'Armenia', 'San Pedro de Urabá', 'Concordia', 'Ciudad Bolívar', 'Granada', 'Cocorná', 'La Ceja', 'Girardota'] }
};

/* 2. CORREO de cada profesional de zona. */
window.CORREOS_PROFESIONALES = {
  'Silvia Avendaño': 'Dato',
  'Carlos Muñoz': 'Dato',
  'Jovani Zapata': 'Dato',
  'Héctor Correa': 'Dato',
  'Sebastián Mira': 'Dato',
  'David Ramírez': 'Dato',
  'John Wilson Zapata Martínez': 'Dato',
  'Ana Machado': 'Dato',
  'Sandra Arias': 'Dato',
  'Mónica Caro': 'Dato'
};

/* 3. FOTO de cada profesional (carpeta img/profesionales/).
      Para poner una foto nueva: guárdela en esa carpeta y cambie 'sin-foto.svg' por su nombre.
      La foto "Carlos Augusto Paniagua" se usa para Carlos Muñoz (zona 2). */
window.FOTOS_PROFESIONALES = {
  'Silvia Avendaño': 'silvia-avendano.webp',
  'Carlos Muñoz': 'carlos-munoz.webp',
  'Jovani Zapata': 'jovani-zapata.webp',
  'Héctor Correa': 'hector-correa.webp',
  'Sebastián Mira': 'sebastian-mira.webp',
  'David Ramírez': 'sin-foto.svg',
  'John Wilson Zapata Martínez': 'john-wilson-zapata.webp',
  'Ana Machado': 'sin-foto.svg',
  'Sandra Arias': 'sin-foto.svg',
  'Mónica Caro': 'sin-foto.svg'
};

/* 4. MUNICIPIOS QUE NO SON COMPETENCIA DE LA GOBERNACIÓN (los atiende su alcaldía).
      entidad: dependencia que atiende a los organismos comunales · tel · correo · web: página. */
window.MUNICIPIOS_PROPIOS = {
  'Medellín':   { sub: 'Valle de Aburrá', entidad: 'Secretaría de Participación Ciudadana / Centros de Desarrollo Social', tel: '(604) 44 44 144', correo: 'Dato', web: 'https://www.medellin.gov.co/es/centros-de-desarrollo-social/' },
  'Bello':      { sub: 'Valle de Aburrá', entidad: 'Secretaría de Inclusión Social, Familia y Participación Ciudadana', tel: '(604) 322 0206 ext. 2202', correo: 'contactenos@bello.gov.co', web: 'https://bello.gov.co/NuestraAlcaldia/Dependencias/Paginas/Secretaria-de-Inclusion-Social-Familia-y-Participacion-Ciudadana.aspx' },
  'Itagüí':     { sub: 'Valle de Aburrá', entidad: 'Secretaría de Participación Ciudadana', tel: '(604) 373 7676 ext. 2700', correo: 'contactenos@itagui.gov.co', web: 'https://itagui.gov.co/micrositios/micrositio/participacion' },
  'Envigado':   { sub: 'Valle de Aburrá', entidad: 'Bienestar Social y Comunitario', tel: '(604) 339 4000', correo: 'ciudadano@envigado.gov.co', web: 'https://www.envigado.gov.co/descripcion-general/6-participacion-ciudadana' },
  'Sabaneta':   { sub: 'Valle de Aburrá', entidad: 'Secretaría de Gobierno y Desarrollo Ciudadano', tel: '(604) 440 6802', correo: 'contactenos@sabaneta.gov.co', web: 'https://sabaneta.gov.co/participa/' },
  'Copacabana': { sub: 'Valle de Aburrá', entidad: 'Secretaría de Desarrollo y Bienestar Social', tel: '(604) 274 0069 ext. 122 o 141', correo: 'desarrollocomunitario@copacabana.gov.co', web: 'https://www.copacabana.gov.co/' },
  'Caldas':     { sub: 'Valle de Aburrá', entidad: 'Desarrollo Comunitario', tel: '(604) 378 8500', correo: 'contactenos@caldasantioquia.gov.co', web: 'https://caldasantioquia.gov.co/Desarrollo/DesarrolloComunitario/Paginas/Participa.aspx' },
  'Rionegro':   { sub: 'Oriente', entidad: 'Subsecretaría de Participación Ciudadana', tel: '(604) 520 4060 ext. 1332', correo: 'atencionusuario@rionegro.gov.co', web: 'https://rionegro.gov.co/publicaciones/470/participacion-ciudadana/' }
};

/* 5. DATOS DE CADA MUNICIPIO ATENDIDO POR LA GOBERNACIÓN (117).
      promotor: nombre del promotor · fotoPromotor: archivo en img/promotores/ ('' = silueta)
      contacto: teléfono o correo institucional del promotor
      registradas / activas / inactivas: número de Juntas de Acción Comunal
      asocomunales: número de Asociaciones de Juntas del municipio
      (Fuente futura: SURCO.) */
window.CONTACTOS_MUNICIPIO = {
  // Bajo Cauca
  'Cáceres':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Caucasia':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'El Bagre':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Nechí':                      { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Tarazá':                     { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Zaragoza':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  // Magdalena Medio
  'Caracolí':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Maceo':                      { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Puerto Berrío':              { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Puerto Nare':                { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Puerto Triunfo':             { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Yondó':                      { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  // Nordeste
  'Amalfi':                     { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Anorí':                      { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Cisneros':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Remedios':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'San Roque':                  { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Santo Domingo':              { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Segovia':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Vegachí':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Yalí':                       { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Yolombó':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  // Norte
  'Angostura':                  { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Belmira':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Briceño':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Campamento':                 { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Carolina del Príncipe':      { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Don Matías':                 { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Entrerríos':                 { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Gómez Plata':                { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Guadalupe':                  { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Ituango':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'San Andrés de Cuerquia':     { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'San José de la Montaña':     { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'San Pedro de los Milagros':  { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Santa Rosa de Osos':         { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Toledo':                     { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Valdivia':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Yarumal':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  // Occidente
  'Abriaquí':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Anzá':                       { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Armenia':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Buriticá':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Cañasgordas':                { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Dabeiba':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Ebéjico':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Frontino':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Giraldo':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Heliconia':                  { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Liborina':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Olaya':                      { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Peque':                      { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Sabanalarga':                { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'San Jerónimo':               { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Santa Fe de Antioquia':      { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Sopetrán':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Uramita':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  // Oriente
  'Abejorral':                  { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Alejandría':                 { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Argelia':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Cocorná':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Concepción':                 { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'El Carmen de Viboral':       { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'El Peñol':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'El Retiro':                  { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'El Santuario':               { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Granada':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Guarne':                     { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Guatapé':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'La Ceja':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'La Unión':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Marinilla':                  { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Nariño':                     { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'San Carlos':                 { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'San Francisco':              { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'San Luis':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'San Rafael':                 { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'San Vicente Ferrer':         { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Sonsón':                     { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  // Suroeste
  'Amagá':                      { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Andes':                      { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Angelópolis':                { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Betania':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Betulia':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Caicedo':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Caramanta':                  { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Ciudad Bolívar':             { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Concordia':                  { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Fredonia':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Hispania':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Jardín':                     { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Jericó':                     { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'La Pintada':                 { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Montebello':                 { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Pueblorrico':                { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Salgar':                     { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Santa Bárbara':              { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Támesis':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Tarso':                      { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Titiribí':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Urrao':                      { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Valparaíso':                 { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Venecia':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  // Urabá
  'Apartadó':                   { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Arboletes':                  { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Carepa':                     { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Chigorodó':                  { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Murindó':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Mutatá':                     { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Necoclí':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'San Juan de Urabá':          { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'San Pedro de Urabá':         { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Turbo':                      { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Vigía del Fuerte':           { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  // Valle de Aburrá
  'Barbosa':                    { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'Girardota':                  { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' },
  'La Estrella':                { promotor: 'Dato', fotoPromotor: '', contacto: 'Dato', registradas: 'Dato', activas: 'Dato', inactivas: 'Dato', asocomunales: 'Dato' }
};
/* ======================= FIN DE LOS DATOS DEL MAPA ======================= */
