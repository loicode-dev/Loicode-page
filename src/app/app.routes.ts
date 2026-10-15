import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { PublicLayout } from './layout/public-layout/public-layout';

export const routes: Routes = [
  // ───────────────────────── SITIO PÚBLICO ─────────────────────────
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', title: 'LOI CODE | Desarrollo web, invitaciones y apps', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
      { path: 'nosotros', title: 'Nosotros | LOI CODE', loadComponent: () => import('./pages/about/about').then((m) => m.About) },

      // Blog (Supabase → tabla posts)
      { path: 'blog', title: 'Blog | LOI CODE', loadComponent: () => import('./pages/blog/blog-list/blog-list').then((m) => m.BlogList) },
      { path: 'blog/:slug', loadComponent: () => import('./pages/blog/blog-post/blog-post').then((m) => m.BlogPost) },

      // Servicios (tienda): Desarrollo Web · Invitaciones · Apps
      { path: 'servicios', title: 'Servicios | LOI CODE', loadComponent: () => import('./pages/services/services-overview/services-overview').then((m) => m.ServicesOverview) },
      { path: 'servicios/:category', loadComponent: () => import('./pages/services/service-category/service-category').then((m) => m.ServiceCategory) },
      { path: 'servicios/:category/:slug', loadComponent: () => import('./pages/product-detail/product-detail').then((m) => m.ProductDetail) },

      // Recursos gratuitos (productos sin precio)
      { path: 'recursos', title: 'Recursos gratuitos | LOI CODE', loadComponent: () => import('./pages/resources/resources').then((m) => m.Resources) },
      { path: 'recursos/:slug', loadComponent: () => import('./pages/product-detail/product-detail').then((m) => m.ProductDetail) },

      // Flujos de la tienda
      { path: 'cotizar', title: 'Cotiza tu proyecto | LOI CODE', loadComponent: () => import('./pages/quote/quote').then((m) => m.Quote) },
      { path: 'checkout/:slug', title: 'Finalizar compra | LOI CODE', loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout) },
      { path: 'descarga/:orderId', title: 'Tu descarga | LOI CODE', loadComponent: () => import('./pages/download/download').then((m) => m.Download) },

      // Invitaciones de XV (archivos estáticos en public/invitaciones/misXV)
      { path: 'mis-xv', title: 'Mis XV · Invitaciones | LOI CODE', loadComponent: () => import('./pages/xv-gallery/xv-gallery').then((m) => m.XvGallery) },
      { path: 'invitaciones/misXV', redirectTo: 'mis-xv', pathMatch: 'full' },
    ],
  },

  // ───────────────────────── ADMIN ─────────────────────────
  { path: 'admin/login', title: 'Admin | LOI CODE', loadComponent: () => import('./admin/login/login').then((m) => m.AdminLogin) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    canActivateChild: [adminGuard],
    loadComponent: () => import('./admin/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', title: 'Dashboard | Admin', loadComponent: () => import('./admin/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'productos', title: 'Productos | Admin', data: { free: false }, loadComponent: () => import('./admin/products/product-list/product-list').then((m) => m.ProductList) },
      { path: 'recursos', title: 'Recursos gratuitos | Admin', data: { free: true }, loadComponent: () => import('./admin/products/product-list/product-list').then((m) => m.ProductList) },
      { path: 'productos/nuevo', title: 'Nuevo producto | Admin', loadComponent: () => import('./admin/products/product-form/product-form').then((m) => m.ProductForm) },
      { path: 'productos/:id', title: 'Editar producto | Admin', loadComponent: () => import('./admin/products/product-form/product-form').then((m) => m.ProductForm) },
      { path: 'blog', title: 'Blog | Admin', loadComponent: () => import('./admin/posts/post-list/post-list').then((m) => m.PostList) },
      { path: 'blog/nuevo', title: 'Nuevo post | Admin', loadComponent: () => import('./admin/posts/post-form/post-form').then((m) => m.PostForm) },
      { path: 'blog/:id', title: 'Editar post | Admin', loadComponent: () => import('./admin/posts/post-form/post-form').then((m) => m.PostForm) },
      { path: 'solicitudes', title: 'Solicitudes | Admin', loadComponent: () => import('./admin/leads/leads').then((m) => m.Leads) },
      { path: 'pedidos', title: 'Pedidos | Admin', loadComponent: () => import('./admin/orders/orders').then((m) => m.Orders) },
    ],
  },

  // 404
  {
    path: '**',
    component: PublicLayout,
    children: [{ path: '', title: 'Página no encontrada | LOI CODE', loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound) }],
  },
];
