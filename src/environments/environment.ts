/**
 * Configuración global del sitio.
 *
 * 1. Crea un proyecto en https://supabase.com y copia la URL y la "anon / publishable key"
 *    (Project Settings → API). Pégalas abajo.
 * 2. Mientras `supabaseUrl` esté vacío, el sitio funciona en **MODO DEMO**:
 *    usa datos de ejemplo y guarda los cambios del admin en el localStorage del navegador.
 *
 * ⚠️ Nunca pongas aquí la "service_role key" ni el Access Token de Mercado Pago:
 *    esos van SOLO como secretos de las Edge Functions (ver supabase/README.md).
 */
export const environment = {
  /** Ej. https://xxxxxxxx.supabase.co */
  supabaseUrl: '',
  /** anon / publishable key (es pública, protegida por RLS) */
  supabaseAnonKey: '',

  /** Nombre de los buckets de Supabase Storage (deben coincidir con supabase/schema.sql) */
  storage: {
    /** Público: portadas de productos y de posts */
    media: 'media',
    /** Público: archivos de recursos gratuitos */
    resources: 'resources',
    /** PRIVADO: archivos de productos de pago (se entregan con URL firmada) */
    downloads: 'downloads',
  },

  site: {
    name: 'LOI CODE',
    tagline: 'Desarrollo web, invitaciones digitales y apps a tu medida',
    email: 'contacto@loicode.com',
    /** Número con lada internacional, sin + ni espacios. Ej. 5215512345678 */
    whatsapp: '5210000000000',
    currency: 'MXN',
    social: {
      facebook: 'https://facebook.com/',
      instagram: 'https://instagram.com/',
      tiktok: 'https://tiktok.com/',
      github: 'https://github.com/',
    },
  },
};

