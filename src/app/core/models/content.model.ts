export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown */
  content: string;
  cover_url: string | null;
  tags: string[];
  author: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PostInput = Omit<Post, 'id' | 'created_at' | 'updated_at'>;

export function emptyPost(): PostInput {
  return {
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    cover_url: null,
    tags: [],
    author: 'LOI CODE',
    is_published: false,
    published_at: null,
  };
}

/** Solicitud de cotización (productos "a la medida") */
export type LeadStatus = 'nuevo' | 'contactado' | 'en_proceso' | 'cerrado' | 'descartado';

export interface Lead {
  id: string;
  product_id: string | null;
  product_title: string | null;
  service: string;
  name: string;
  email: string;
  phone: string | null;
  budget: string | null;
  deadline: string | null;
  message: string;
  /** Campos extra según el servicio (ej. fecha del evento en invitaciones) */
  extra: Record<string, string>;
  status: LeadStatus;
  created_at: string;
}

export type LeadInput = Omit<Lead, 'id' | 'status' | 'created_at'>;

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  en_proceso: 'En proceso',
  cerrado: 'Cerrado',
  descartado: 'Descartado',
};

/** Pedido de un producto de pago (Mercado Pago) */
export type OrderStatus = 'pending' | 'approved' | 'in_process' | 'rejected' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  product_id: string;
  product_title: string;
  email: string;
  name: string | null;
  amount: number;
  currency: string;
  status: OrderStatus;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  download_count: number;
  paid_at: string | null;
  created_at: string;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  approved: 'Pagado',
  in_process: 'En proceso',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

/** Respuesta de la Edge Function get-download */
export interface DownloadInfo {
  status: OrderStatus;
  product_title: string;
  kind: 'download' | 'webapp';
  url: string | null;
  expires_in?: number;
  message?: string;
}

/** Invitación de XV publicada en public/invitaciones/misXV */
export interface XvInvitation {
  slug: string;
  name: string;
  date: string;
  theme: string;
  cover: string;
  colors?: string[];
  description?: string;
}

