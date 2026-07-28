# Configuración de Supabase

1. Crear un proyecto Supabase y ejecutar todas las migraciones de `migrations/` en orden en el SQL Editor (o mediante la CLI). Si el proyecto ya existe, aplicar la migración nueva `20260726000001_user_media_metadata.sql`.
2. En **Authentication > Providers**, habilitar Email y Google. En Google Cloud crear un OAuth Web Client y copiar su Client ID/secret al proveedor Google de Supabase.
3. En **Authentication > URL Configuration**, agregar las URLs de redirección, por ejemplo:
   - `http://localhost:3000/en-US/auth/callback`
   - `http://localhost:3000/es-ES/auth/callback`
   - `https://TU-DOMINIO/en-US/auth/callback`
4. Configurar el SMTP personalizado en **Authentication > Email**. Si se usa Resend, verificar primero el dominio del remitente en Resend; el campo **Sender email** de Supabase debe pertenecer exactamente a ese dominio (por ejemplo, `Cinema <no-reply@auth.tudominio.com>` si se verificó `auth.tudominio.com`). Los valores SMTP de Resend son host `smtp.resend.com`, usuario `resend`, password la API key de Resend y puerto `465` (SSL) o `587` (STARTTLS). No usar un dominio sin verificar: Supabase devolverá un 500 al intentar enviar el código.
5. En **Authentication > Email Templates > Confirm signup**, usar `{{ .Token }}` para incluir el OTP. El texto no debe fijar la cantidad de dígitos: esa longitud se configura en **Authentication > Providers > Email**. Para este proyecto se recomienda mantenerla en 6; la interfaz admite de 6 a 10 para no bloquear usuarios si la configuración cambia.
5. Copiar la URL del proyecto y la Publishable key a `.env.local`, tomando como referencia `.env.example`.

Con el SMTP de prueba de Supabase no se puede editar la plantilla y el correo usa un enlace de confirmación en vez de un OTP. Cinema admite ambos flujos: al abrir ese enlace se crea la sesión y se redirige a la aplicación. El OTP personalizado requiere SMTP propio.

La Publishable key se puede exponer en el navegador; nunca agregar `service_role` al frontend ni al repositorio.
