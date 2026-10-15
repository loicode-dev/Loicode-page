-- ============================================================================
-- LOI CODE · ESQUEMA DE BASE DE DATOS PARA SUPABASE
-- Ejecuta este script en el SQL Editor de tu proyecto en https://supabase.com
-- ============================================================================

-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- 1. TABLA: admin_users (Correos autorizados para el panel de administración)
create table if not exists public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Función para verificar si el usuario conectado es admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
       or email = (auth.jwt() ->> 'email')
  );
$$;

-- 2. TABLA: products (Servicios a la medida, programas prefabricados y recursos gratuitos)
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  short_description text not null,
  description text not null,
  category text not null check (category in ('web', 'invitaciones', 'apps')),
  kind text not null check (kind in ('custom', 'download', 'webapp')),
  price numeric(10, 2) default null, -- Si es null o <= 0 es RECURSO GRATUITO
  currency text default 'MXN' not null,
  cover_url text,
  gallery text[] default array[]::text[],
  features text[] default array[]::text[],
  tags text[] default array[]::text[],
  demo_url text,
  external_url text,
  file_url text,
  file_path text,
  is_published boolean default true not null,
  is_featured boolean default false not null,
  sort_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TABLA: posts (Artículos de Blog)
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  cover_url text,
  tags text[] default array[]::text[],
  author text default 'LOI CODE' not null,
  is_published boolean default false not null,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABLA: leads (Solicitudes de cotización a la medida)
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete set null,
  product_title text,
  service text not null,
  name text not null,
  email text not null,
  phone text,
  budget text,
  deadline text,
  message text not null,
  extra jsonb default '{}'::jsonb not null,
  status text default 'nuevo' not null check (status in ('nuevo', 'contactado', 'en_proceso', 'cerrado', 'descartado')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TABLA: orders (Pedidos y transacciones con Mercado Pago)
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  product_title text not null,
  email text not null,
  name text,
  amount numeric(10, 2) not null,
  currency text default 'MXN' not null,
  status text default 'pending' not null check (status in ('pending', 'approved', 'in_process', 'rejected', 'cancelled', 'refunded')),
  mp_preference_id text,
  mp_payment_id text,
  download_count integer default 0 not null,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================================================

alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.posts enable row level security;
alter table public.leads enable row level security;
alter table public.orders enable row level security;

-- Admin Users
create policy "Admins pueden ver admin_users" on public.admin_users
  for select using (public.is_admin());

-- Products: Público puede leer los publicados; Admin control total
create policy "Público puede ver productos publicados" on public.products
  for select using (is_published = true or public.is_admin());

create policy "Admins gestionan productos" on public.products
  for all using (public.is_admin());

-- Posts: Público puede leer los publicados; Admin control total
create policy "Público puede ver posts publicados" on public.posts
  for select using (is_published = true or public.is_admin());

create policy "Admins gestionan posts" on public.posts
  for all using (public.is_admin());

-- Leads: Cualquiera puede crear una cotización; Solo admin puede leer o editar
create policy "Cualquiera puede enviar una cotización" on public.leads
  for insert with check (true);

create policy "Solo admin puede leer y gestionar cotizaciones" on public.leads
  for all using (public.is_admin());

-- Orders: Solo admins pueden consultar pedidos (o Edge Functions con service role)
create policy "Solo admin puede ver pedidos" on public.orders
  for select using (public.is_admin());

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Insertar buckets si no existen
insert into storage.buckets (id, name, public)
values
  ('media', 'media', true),
  ('resources', 'resources', true),
  ('downloads', 'downloads', false)
on conflict (id) do nothing;

-- Políticas de Storage
-- media y resources son públicos para lectura
create policy "Objetos públicos en media" on storage.objects
  for select using (bucket_id in ('media', 'resources'));

create policy "Admins pueden subir archivos en media y resources" on storage.objects
  for insert with check (bucket_id in ('media', 'resources') and (public.is_admin() or auth.role() = 'service_role'));

create policy "Solo service_role y admin en downloads privados" on storage.objects
  for all using (bucket_id = 'downloads' and (public.is_admin() or auth.role() = 'service_role'));

