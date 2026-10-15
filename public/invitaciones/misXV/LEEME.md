# Carpeta `invitaciones/misXV` · LOI CODE

Esta carpeta almacena todas las invitaciones digitales interactivas para XV Años creadas en el estudio.

## Estructura

```text
public/invitaciones/misXV/
├── invitaciones.json      <- Catálogo de invitaciones que se listan en el sitio web (/mis-xv)
├── _plantilla/            <- Plantilla base para duplicar al crear una nueva invitación
│   ├── index.html
│   └── cover.jpg
└── sofia/                 <- Ejemplo de invitación publicada (/invitaciones/misXV/sofia/index.html)
    ├── index.html
    └── cover.jpg
```

## ¿Cómo subir una nueva invitación para XV Años?

1. Duplica la carpeta `_plantilla/` y renómbrala con el nombre o slug de la festejada (ejemplo: `valentina`).
2. Edita el archivo `index.html` dentro de la nueva carpeta:
   - Cambia el nombre, fecha, hora y sedes del evento.
   - Reemplaza los enlaces de Google Maps con las direcciones reales.
   - Configura el número de WhatsApp para la confirmación de asistencia (RSVP).
   - Agrega la foto de portada `cover.jpg`.
3. Registra la nueva invitación en `public/invitaciones/misXV/invitaciones.json`:
   ```json
   {
     "slug": "valentina",
     "name": "Valentina",
     "date": "2026-12-15",
     "theme": "Rosa Pastel & Plata",
     "cover": "cover.jpg",
     "colors": ["#ffccd5", "#c0c0c0", "#ffffff"],
     "description": "Invitación interactiva con música, mapa y confirmación."
   }
   ```
4. ¡Listo! La invitación quedará accesible directamente en:
   - La URL pública: `https://tudominio.com/invitaciones/misXV/valentina/index.html`
   - La galería de portafolio del sitio: `/mis-xv`
   - La sección de Servicios → Invitaciones

