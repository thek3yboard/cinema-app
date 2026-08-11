# Cinema

Aplicación de descubrimiento de películas, series y personas basada en TMDB. Incluye cuentas de usuario con email/contraseña + activación OTP, inicio de sesión con Google, perfil editable y listas privadas sincronizadas.

## Puesta en marcha

```bash
npm install
npm run dev
```

1. Copiar `.env.example` a `.env.local` y completar TMDB y Supabase. El acceso por email/contraseña está desactivado por defecto (`NEXT_PUBLIC_ENABLE_EMAIL_AUTH=false`) para evitar los límites del SMTP de prueba de Supabase; establecerlo en `true` solo con un SMTP de producción configurado.
2. Ejecutar todas las migraciones de `supabase/migrations/` en orden en el proyecto Supabase. Si ya se ejecutó la primera, aplicar también `20260726000001_user_media_metadata.sql` para mostrar títulos y posters en las listas existentes.
3. Completar la configuración de Email OTP y Google OAuth detallada en [supabase/README.md](supabase/README.md).

## Comandos

```bash
npm run lint
npm run typecheck
npm run build
```

## Seguridad de datos

- Las listas de usuario se almacenan en `user_media`; las políticas RLS impiden leer o modificar datos de otra cuenta.
- El estado local anterior se migra una única vez después del primer inicio de sesión.
- Las claves públicas de Supabase pueden estar en el navegador. Nunca agregar una `service_role` al cliente ni al repositorio.
- Las credenciales de TMDB siguen pendientes de moverse a rutas de servidor; consultar `CONTEXTO_Y_AUDITORIA.md`.

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
