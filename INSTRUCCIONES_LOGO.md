# Instrucciones para Agregar los Nuevos Logos

## Archivos de Imagen Necesarios

Necesitas guardar dos imágenes en la carpeta `client/public/images/`:

### 1. Escudo/Emblema (`escudo.png`)
- **Ubicación:** `client/public/images/escudo.png`
- **Descripción:** El escudo con las dos manos dándose la mano, sol amarillo arriba y verde abajo
- **Tamaño recomendado:** 150x150px o proporcional
- **Formato:** PNG con fondo transparente (preferible)

### 2. Logo de Texto (`logo-texto.png`)
- **Ubicación:** `client/public/images/logo-texto.png`
- **Descripción:** Logo de texto con "CONCEJO MUNICIPAL" en verde y "GUACHUCAL" en amarillo sobre barra amarilla, fondo negro
- **Tamaño recomendado:** Ancho máximo 400px, alto proporcional
- **Formato:** PNG con fondo transparente o con fondo negro

## Pasos para Agregar las Imágenes

1. **Copia las imágenes** que tienes
2. **Renómbralas** como:
   - `escudo.png`
   - `logo-texto.png`
3. **Guárdalas** en la carpeta: `client/public/images/`
4. **Verifica** que los nombres sean exactamente:
   - `escudo.png` (minúsculas)
   - `logo-texto.png` (minúsculas, con guión)

## Si las Imágenes No Están Disponibles

El sistema tiene **fallbacks automáticos**:
- Si `escudo.png` no existe, se mostrará un SVG del escudo
- Si `logo-texto.png` no existe, se mostrará el texto estilizado con CSS

## Verificación

Después de agregar las imágenes:
1. Reinicia el servidor frontend si está corriendo
2. Recarga la página en el navegador (Ctrl+F5 para limpiar caché)
3. Verifica que se muestren las imágenes correctamente

## Nota sobre el Texto

El logo de texto mostrará "GUACHUCAL" (no "Gualeguaychú") como está configurado en el código.













