/** Categorías de servicio que aparecen en el menú "Servicios" */
export type ProductCategory = 'web' | 'invitaciones' | 'apps';

/**
 * Cómo se entrega el producto:
 *  - custom   → Es "a la medida": el cliente llena un formulario de cotización.
 *  - download → Programa / archivo prefabricado: se paga (o es gratis) y se descarga.
 *  - webapp   → Aplicación web: se paga (o es gratis) y se redirige a su URL.
 */
export type ProductKind = 'custom' | 'download' | 'webapp';

export interface Product {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  /** Markdown */
  description: string;
  category: ProductCategory;
  kind: ProductKind;
  /**
   * Precio en `currency`. Regla del sitio:
   *  "Un producto que NO tiene precio (null / 0) y no es a la medida es un RECURSO GRATUITO".
   *  En productos `custom` el precio es solo referencial ("desde $X").
   */
  price: number | null;
  currency: string;
  cover_url: string | null;
  gallery: string[];
  features: string[];
  tags: string[];
  /** Demo / vista previa pública */
  demo_url: string | null;
  /** URL de la app web (kind = webapp) */
  external_url: string | null;
  /** Recursos gratuitos: URL pública del archivo */
  file_url: string | null;
  /** Productos de pago: ruta del archivo dentro del bucket PRIVADO `downloads` */
  file_path: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type ProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

export const CATEGORY_INFO: Record<
  ProductCategory,
  { label: string; route: string; icon: string; title: string; subtitle: string; banner: string }
> = {
  web: {
    label: 'Desarrollo Web',
    route: '/servicios/desarrollo-web',
    icon: 'bi-laptop',
    title: 'Desarrollo Web',
    subtitle: 'Landing pages, sitios corporativos, tiendas en línea y plantillas listas para usar.',
    banner: 'assets/img/index/banner/CODE_sitios_web.jpg',
  },
  invitaciones: {
    label: 'Invitaciones',
    route: '/servicios/invitaciones',
    icon: 'bi-envelope-heart',
    title: 'Invitaciones Digitales',
    subtitle: 'XV años, bodas, bautizos y cumpleaños: invitaciones web con música, mapa y confirmación.',
    banner: 'assets/img/index/banner/CODE_invitaciones.jpg',
  },
  apps: {
    label: 'Apps',
    route: '/servicios/apps',
    icon: 'bi-phone',
    title: 'Apps',
    subtitle: 'Aplicaciones web y móviles, sistemas administrativos y herramientas listas para tu negocio.',
    banner: '',
  },
};

/** Mapea el segmento de URL a la categoría */
export const CATEGORY_BY_SLUG: Record<string, ProductCategory> = {
  'desarrollo-web': 'web',
  invitaciones: 'invitaciones',
  apps: 'apps',
};

/** Regla central: un producto sin precio (y que no es a la medida) es gratuito. */
export function isFree(p: Pick<Product, 'price' | 'kind'>): boolean {
  return p.kind !== 'custom' && (p.price === null || p.price === undefined || Number(p.price) <= 0);
}

export type ProductAction = 'quote' | 'buy' | 'download' | 'open';

/** Determina qué hace el botón principal de un producto. */
export function productAction(p: Pick<Product, 'price' | 'kind'>): ProductAction {
  if (p.kind === 'custom') return 'quote';
  if (!isFree(p)) return 'buy';
  return p.kind === 'webapp' ? 'open' : 'download';
}

export const ACTION_LABEL: Record<ProductAction, { label: string; icon: string }> = {
  quote: { label: 'Cotizar proyecto', icon: 'bi-chat-square-text' },
  buy: { label: 'Comprar ahora', icon: 'bi-cart-check' },
  download: { label: 'Descargar gratis', icon: 'bi-download' },
  open: { label: 'Abrir app', icon: 'bi-box-arrow-up-right' },
};

export function emptyProduct(): ProductInput {
  return {
    slug: '',
    title: '',
    short_description: '',
    description: '',
    category: 'web',
    kind: 'custom',
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
  };
}

