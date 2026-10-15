import { Lead, Order, Post } from '../models/content.model';
import { Product } from '../models/product.model';

/**
 * Datos de ejemplo para el MODO DEMO.
 * Cuando conectes Supabase, ejecuta supabase/seed.sql si quieres estos mismos datos en tu BD.
 */
const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString();

function p(partial: Partial<Product> & Pick<Product, 'id' | 'slug' | 'title' | 'category' | 'kind'>): Product {
  return {
    short_description: '',
    description: '',
    price: null,
    currency: 'MXN',
    cover_url: null,
    gallery: [],
    features: [],
    tags: [],
    demo_url: null,
    external_url: null,
    file_url: null,
    file_path: null,
    is_published: true,
    is_featured: false,
    sort_order: 0,
    created_at: d(30),
    updated_at: d(1),
    ...partial,
  };
}

export const MOCK_PRODUCTS: Product[] = [
  // ───────────── DESARROLLO WEB ─────────────
  p({
    id: 'p-web-landing',
    slug: 'landing-page-a-la-medida',
    title: 'Landing Page a la medida',
    category: 'web',
    kind: 'custom',
    price: 3500,
    is_featured: true,
    sort_order: 1,
    cover_url: 'assets/img/index/banner/CODE_sitios_web.jpg',
    short_description: 'Una página enfocada en convertir visitantes en clientes, diseñada desde cero para tu marca.',
    description: `## ¿Qué incluye?

Diseñamos y desarrollamos una **landing page única** para tu negocio, optimizada para móviles y para Google.

- Diseño personalizado con tu identidad de marca
- Formulario de contacto conectado a tu correo / WhatsApp
- Optimización SEO básica y velocidad de carga
- Hosting y dominio el primer año (opcional)

### Proceso
1. Llenas el formulario de cotización
2. Agendamos una llamada para conocer tu proyecto
3. Te enviamos propuesta y tiempos
4. ¡Desarrollamos y publicamos!`,
    features: ['Diseño 100% personalizado', 'Responsive', 'SEO básico', 'Formulario de contacto', '2 rondas de cambios'],
    tags: ['landing', 'negocios'],
  }),
  p({
    id: 'p-web-ecommerce',
    slug: 'tienda-en-linea',
    title: 'Tienda en línea',
    category: 'web',
    kind: 'custom',
    price: 12000,
    sort_order: 2,
    short_description: 'E-commerce con carrito, pagos en línea y panel para administrar tus productos.',
    description: `## Vende 24/7

Tienda en línea completa con **pasarela de pago**, inventario y panel administrativo.

- Catálogo ilimitado de productos
- Pagos con tarjeta, OXXO y transferencia
- Panel administrativo
- Capacitación incluida`,
    features: ['Carrito de compras', 'Pagos en línea', 'Panel administrativo', 'Capacitación'],
    tags: ['ecommerce'],
  }),
  p({
    id: 'p-web-template',
    slug: 'plantilla-portafolio-angular',
    title: 'Plantilla Portafolio Angular',
    category: 'web',
    kind: 'download',
    price: 349,
    is_featured: true,
    sort_order: 3,
    short_description: 'Plantilla profesional lista para personalizar: código fuente completo en Angular + Bootstrap.',
    description: `## Lánzate hoy mismo

Plantilla de portafolio **prefabricada**. Al confirmar tu pago se habilita la descarga del código fuente.

- Angular + Bootstrap 5
- 6 secciones listas
- Modo oscuro
- Documentación de instalación`,
    features: ['Código fuente completo', 'Documentación', 'Actualizaciones 6 meses', 'Licencia de uso comercial'],
    tags: ['plantilla', 'angular'],
    demo_url: 'https://angular.dev',
    file_path: 'plantillas/portafolio-angular.zip',
  }),

  // ───────────── INVITACIONES ─────────────
  p({
    id: 'p-inv-xv',
    slug: 'invitacion-xv-anos-personalizada',
    title: 'Invitación XV años personalizada',
    category: 'invitaciones',
    kind: 'custom',
    price: 400,
    is_featured: true,
    sort_order: 1,
    cover_url: 'assets/img/index/banner/CODE_invitaciones.jpg',
    short_description: 'Invitación web con música, cuenta regresiva, galería, mapa y confirmación por WhatsApp.',
    description: `## Una invitación tan única como tus XV

- Cuenta regresiva al evento
- Música de fondo
- Galería de fotos
- Ubicación con Google Maps
- Confirmación de asistencia por WhatsApp
- Código de vestimenta y mesa de regalos

Mira ejemplos reales en la sección **Mis XV**.`,
    features: ['Música de fondo', 'Cuenta regresiva', 'Mapa', 'Confirmación RSVP', 'Galería'],
    tags: ['xv', 'evento'],
    demo_url: '/invitaciones/misXV/sofia/index.html',
  }),
  p({
    id: 'p-inv-boda',
    slug: 'invitacion-boda-digital',
    title: 'Invitación de boda digital',
    category: 'invitaciones',
    kind: 'custom',
    price: 600,
    sort_order: 2,
    short_description: 'Elegante invitación para tu boda con itinerario, hospedaje y mesa de regalos.',
    description: '## Su historia, en una invitación\n\nItinerario, padrinos, hospedaje, mesa de regalos y confirmación de asistencia.',
    features: ['Itinerario', 'Hospedaje sugerido', 'Mesa de regalos', 'RSVP'],
    tags: ['boda'],
  }),
  p({
    id: 'p-inv-template',
    slug: 'plantilla-invitacion-cumpleanos',
    title: 'Plantilla invitación de cumpleaños',
    category: 'invitaciones',
    kind: 'download',
    price: 149,
    sort_order: 3,
    short_description: 'Plantilla HTML editable: cambia textos y fotos y publícala tú mismo.',
    description: '## Hazlo tú mismo\n\nDescarga la plantilla, edita el archivo `datos.js` con la información de tu evento y súbela gratis a Netlify o GitHub Pages.',
    features: ['HTML + CSS + JS', 'Guía paso a paso', 'Fácil de editar'],
    tags: ['plantilla', 'cumpleaños'],
    file_path: 'plantillas/invitacion-cumple.zip',
  }),

  // ───────────── APPS ─────────────
  p({
    id: 'p-app-custom',
    slug: 'app-movil-a-la-medida',
    title: 'App móvil / web a la medida',
    category: 'apps',
    kind: 'custom',
    price: null,
    is_featured: true,
    sort_order: 1,
    short_description: 'Convertimos tu idea en una aplicación funcional para Android, iOS y web.',
    description: '## De la idea a la tienda de apps\n\nAnálisis, diseño UX/UI, desarrollo, publicación y soporte.',
    features: ['Android + iOS + Web', 'Diseño UX/UI', 'Backend incluido', 'Publicación en tiendas'],
    tags: ['app', 'movil'],
  }),
  p({
    id: 'p-app-pos',
    slug: 'punto-de-venta-web',
    title: 'Punto de venta web',
    category: 'apps',
    kind: 'webapp',
    price: 899,
    sort_order: 2,
    short_description: 'Sistema de punto de venta en la nube. Paga una vez y accede desde cualquier dispositivo.',
    description: '## Controla tu negocio\n\nVentas, inventario, cortes de caja y reportes. Tras el pago recibirás tu enlace de acceso.',
    features: ['Inventario', 'Cortes de caja', 'Reportes', 'Multi-dispositivo'],
    tags: ['pos', 'negocios'],
    external_url: 'https://example.com/pos',
  }),
  p({
    id: 'p-app-cotizador',
    slug: 'generador-de-cotizaciones',
    title: 'Generador de cotizaciones',
    category: 'apps',
    kind: 'download',
    price: 249,
    sort_order: 3,
    short_description: 'Programa de escritorio para crear cotizaciones en PDF con tu logo en segundos.',
    description: '## Cotiza como profesional\n\nPrograma para Windows. Al confirmar tu pago podrás descargar el instalador.',
    features: ['PDF con tu logo', 'Catálogo de clientes', 'Windows 10/11'],
    tags: ['escritorio'],
    file_path: 'apps/cotizador-setup.exe',
  }),

  // ───────────── RECURSOS GRATUITOS (sin precio) ─────────────
  p({
    id: 'p-free-checklist',
    slug: 'checklist-lanzamiento-web',
    title: 'Checklist para lanzar tu sitio web',
    category: 'web',
    kind: 'download',
    price: null,
    sort_order: 10,
    short_description: '30 puntos que debes revisar antes de publicar tu página. ¡Gratis!',
    description: '## No olvides nada\n\nSEO, velocidad, seguridad, analítica y legal: todo en una lista.',
    features: ['30 puntos', 'Formato de texto', 'Descarga inmediata'],
    tags: ['gratis', 'guía'],
    file_url: 'assets/demo/checklist-lanzamiento-web.txt',
  }),
  p({
    id: 'p-free-qr',
    slug: 'generador-qr-invitaciones',
    title: 'Generador de QR para invitaciones',
    category: 'invitaciones',
    kind: 'webapp',
    price: 0,
    sort_order: 11,
    short_description: 'Crea el código QR de tu invitación digital para imprimirlo en tus tarjetas.',
    description: '## Gratis y sin registro\n\nPega el enlace de tu invitación y descarga el QR.',
    features: ['Sin registro', 'Descarga PNG'],
    tags: ['gratis', 'qr'],
    external_url: 'https://www.qrcode-monkey.com/es/',
  }),
  p({
    id: 'p-free-paleta',
    slug: 'paletas-de-colores-xv',
    title: 'Paletas de colores para XV años',
    category: 'invitaciones',
    kind: 'download',
    price: null,
    sort_order: 12,
    short_description: '10 paletas de colores con códigos HEX para tu fiesta e invitación.',
    description: '## Inspírate\n\nPaletas pensadas para temáticas: princesa, boho, vintage, glam y más.',
    features: ['10 paletas', 'Códigos HEX'],
    tags: ['gratis', 'xv', 'diseño'],
    file_url: 'assets/demo/paletas-xv.txt',
  }),
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    slug: 'cuanto-cuesta-una-pagina-web',
    title: '¿Cuánto cuesta una página web en 2026?',
    excerpt: 'Te explicamos qué factores influyen en el precio de un sitio web y cómo elegir la mejor opción para tu negocio.',
    content: `Una de las preguntas más comunes es **¿cuánto cuesta una página web?** La respuesta depende de varios factores:

## 1. Tipo de sitio
- **Landing page**: ideal para campañas o negocios que inician.
- **Sitio corporativo**: varias secciones, blog y formularios.
- **Tienda en línea**: catálogo, carrito y pagos.

## 2. Diseño a la medida vs. plantilla
Una plantilla es más económica y rápida; un diseño a la medida refleja mejor tu marca.

## 3. Mantenimiento
No olvides considerar hosting, dominio y actualizaciones.

> ¿Quieres una cotización exacta? Visita la sección de **Servicios → Desarrollo Web**.`,
    cover_url: 'assets/img/index/banner/CODE_sitios_web.jpg',
    tags: ['web', 'precios'],
    author: 'LOI CODE',
    is_published: true,
    published_at: d(3),
    created_at: d(3),
    updated_at: d(3),
  },
  {
    id: 'post-2',
    slug: 'ventajas-invitaciones-digitales',
    title: '7 ventajas de las invitaciones digitales',
    excerpt: 'Ahorra, sorprende a tus invitados y lleva el control de asistencia con una invitación web.',
    content: `Las invitaciones digitales llegaron para quedarse. Estas son sus principales ventajas:

1. **Ahorro**: sin impresión ni envíos.
2. **Ecológicas**: cero papel.
3. **Interactivas**: música, mapas y galerías.
4. **Confirmación inmediata** por WhatsApp.
5. **Fáciles de compartir**.
6. **Actualizables** si cambia algún dato.
7. **Recuerdo digital** para siempre.`,
    cover_url: 'assets/img/index/banner/CODE_invitaciones.jpg',
    tags: ['invitaciones', 'xv'],
    author: 'LOI CODE',
    is_published: true,
    published_at: d(10),
    created_at: d(10),
    updated_at: d(10),
  },
  {
    id: 'post-3',
    slug: 'borrador-apps-para-negocios',
    title: 'Apps que todo negocio pequeño necesita',
    excerpt: 'Borrador: herramientas digitales para organizar tu negocio.',
    content: 'Contenido en construcción…',
    cover_url: null,
    tags: ['apps'],
    author: 'LOI CODE',
    is_published: false,
    published_at: null,
    created_at: d(1),
    updated_at: d(1),
  },
];

export const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1',
    product_id: 'p-inv-xv',
    product_title: 'Invitación XV años personalizada',
    service: 'invitaciones',
    name: 'María López',
    email: 'maria@example.com',
    phone: '5512345678',
    budget: '$400 - $800',
    deadline: '1 mes',
    message: 'Hola, quiero una invitación con temática de princesa para los XV de mi hija.',
    extra: { 'Fecha del evento': '2026-12-12', 'Nombre de la quinceañera': 'Valentina' },
    status: 'nuevo',
    created_at: d(1),
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'order-demo-1',
    product_id: 'p-web-template',
    product_title: 'Plantilla Portafolio Angular',
    email: 'cliente@example.com',
    name: 'Juan Pérez',
    amount: 349,
    currency: 'MXN',
    status: 'approved',
    mp_preference_id: 'demo',
    mp_payment_id: 'demo-123',
    download_count: 1,
    paid_at: d(2),
    created_at: d(2),
  },
];

