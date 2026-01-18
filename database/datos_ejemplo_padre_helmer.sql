-- Datos de ejemplo: Padre Helmer
-- Este script inserta información del Padre Helmer como ejemplo en la base de datos

USE diocesis;

-- Insertar como Misionero (ya que es un sacerdote)
INSERT INTO misioneros (
  nombre_completo,
  tipo,
  biografia,
  email,
  telefono,
  contacto,
  experiencia,
  activo,
  created_at,
  updated_at
) VALUES (
  'Helmer Fabián Burbano',
  'Sacerdote',
  'Sacerdote de la Diócesis de Pasto, comprometido con la evangelización y el servicio a la comunidad. Con amplia experiencia en pastoral y formación.',
  'helmer.burbano@diocesisdepasto.org',
  '+57 300 123 4567',
  'Curia Episcopal - Diócesis de Pasto',
  'Más de 10 años de experiencia en ministerio sacerdotal, formación de seminaristas y trabajo pastoral en diferentes parroquias de la diócesis.',
  TRUE,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  nombre_completo = VALUES(nombre_completo),
  tipo = VALUES(tipo),
  biografia = VALUES(biografia),
  email = VALUES(email),
  telefono = VALUES(telefono),
  contacto = VALUES(contacto),
  experiencia = VALUES(experiencia),
  updated_at = NOW();

-- También insertar como Párroco si tiene parroquia asignada
-- (Descomentar y ajustar si es necesario)
/*
INSERT INTO parroquias (
  nombre,
  nombre_canonico,
  direccion,
  telefono,
  email,
  parroco,
  zona_pastoral,
  activa,
  destacada,
  created_at,
  updated_at
) VALUES (
  'Parroquia San José',
  'Parroquia San José - Ipiales',
  'Calle 10 No. 5-20, Ipiales, Nariño',
  '+57 2 773 1234',
  'parroquia.sanjose@diocesisdepasto.org',
  'Helmer Fabián Burbano',
  'Zona Centro',
  TRUE,
  FALSE,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  parroco = VALUES(parroco),
  updated_at = NOW();
*/

-- Verificar que se insertó correctamente
SELECT 
  id,
  nombre_completo,
  tipo,
  email,
  telefono,
  activo
FROM misioneros
WHERE nombre_completo LIKE '%Helmer%'
ORDER BY created_at DESC
LIMIT 1;





