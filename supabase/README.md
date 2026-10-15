# Configuración de Supabase & Mercado Pago · LOI CODE

Este directorio contiene la arquitectura de base de datos, almacenamiento seguro y funciones backend listas para producción.

## 1. Base de Datos en Supabase
1. Ingresa a [https://supabase.com](https://supabase.com) y crea tu proyecto.
2. Ve al **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`.
3. Para registrar tu primer usuario administrador:
   - Ve a **Authentication** en Supabase y crea tu usuario (correo y contraseña).
   - En el SQL Editor, ejecuta:
     ```sql
     insert into public.admin_users (email) values ('tu-correo@loicode.com');
     ```

## 2. Configuración en la aplicación Angular
En el archivo `src/environments/environment.ts`:
```typescript
export const environment = {
  supabaseUrl: 'https://xxxxxxxx.supabase.co',
  supabaseAnonKey: 'eyJhbGciOi...',
  // ...
};
```
*Nota: Si dejas `supabaseUrl` vacío, la web funciona automáticamente en **MODO DEMO**, con datos locales y acceso admin para pruebas (`admin@demo.com` / `demo1234`).*

## 3. Despliegue de Edge Functions (Mercado Pago)
Para conectar los cobros reales con Mercado Pago mediante Supabase CLI:

```bash
# 1. Iniciar sesión en Supabase CLI
supabase login
supabase link --project-ref tu-project-id

# 2. Configurar secretos
supabase secrets set MP_ACCESS_TOKEN="APP_USR-xxxx"
supabase secrets set SITE_URL="https://loicode.com"

# 3. Desplegar funciones
supabase functions deploy create-preference
supabase functions deploy mp-webhook
supabase functions deploy get-download
```

## 4. Webhook de Mercado Pago
En tu panel de desarrolladores de Mercado Pago, agrega la URL de notificaciones Webhook:
`https://xxxxxxxx.supabase.co/functions/v1/mp-webhook` marcando el evento **Pagos (payment)**.

