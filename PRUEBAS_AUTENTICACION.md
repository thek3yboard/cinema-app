# Pruebas de autenticación y perfil

Última actualización: 2026-07-26

## Configuración actual de pruebas

- Supabase Auth configurado con el SMTP de prueba.
- El SMTP de prueba solo entrega correos a miembros de la organización y limita los envíos a 2 por hora.
- Como no hay SMTP propio todavía, Supabase envía el template estándar con enlace de confirmación, no el OTP personalizado. La aplicación acepta ambos flujos: enlace de confirmación o código numérico de 6 a 10 dígitos.
- URL de callback requerida: `http://localhost:3000/en-US/auth/callback` para local y `https://cinema-center.vercel.app/en-US/auth/callback` para producción.

## Pruebas realizadas

| Escenario | Estado | Evidencia / resultado |
| --- | --- | --- |
| Compilación TypeScript | Aprobada | `tsc --noEmit` finaliza sin errores. |
| Lint | Aprobada | `next lint` finaliza sin errores. |
| Build de producción | Aprobada | `next build` compila correctamente. |
| Inicio de sesión con Google | Aprobada | Probado manualmente por el usuario; acceso exitoso. |
| Variables de Supabase | Aprobada | `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` están presentes en `.env.local`. |
| Envío de confirmación por email | Bloqueada temporalmente | Se alcanzó el límite de 2 emails/hora del SMTP de prueba (HTTP 429). |

## Pendiente prioritario: registro por email

Cuando se restablezca el límite de correo:

1. Registrar un email que pertenezca a un miembro de la organización de Supabase.
2. Verificar que se muestra la pantalla de activación después del registro.
3. Abrir el enlace **Confirm email address** del email estándar de Supabase.
4. Confirmar que redirige a `/{locale}/auth/callback`, crea la sesión y termina en `/{locale}/movies`.
5. Cerrar sesión e iniciar con el email y contraseña recién registrados.
6. Probar **Reenviar email de activación** solamente una vez si la cuenta sigue pendiente.

## Pendientes funcionales adicionales

- Confirmar que una ruta protegida redirige a `/signin` cuando no hay sesión.
- Verificar cerrar sesión desde el dropdown y que las rutas protegidas dejan de ser accesibles.
- Editar nombre para mostrar y username en Perfil.
- Intentar establecer un username ya existente y verificar el error de unicidad.
- Subir avatar PNG, JPG y WebP válidos; rechazar un archivo mayor a 2 MB o no imagen.
- Agregar, remover y persistir favorito, visto, pendiente y puntuación para una película y una serie.
- Recargar sesión y verificar que los estados de media permanecen por usuario.
- Verificar que las listas muestran título, poster y enlace al detalle; los registros existentes deben completarse automáticamente al abrir Perfil.
- Validar que sin sesión no se muestren las acciones de favorito/visto/pendiente/puntuación.
- Validar una migración única de datos heredados de `localStorage` al primer login.
- Verificar que un usuario no puede leer ni modificar `profiles` ni `user_media` de otro usuario (RLS).
- Probar Google OAuth en Vercel con el callback de producción permitido.

## Pendiente para producción

- Obtener un dominio propio y configurar SMTP personalizado.
- Verificar el dominio en el proveedor de correo y usar un remitente de ese dominio.
- Volver al template OTP con `{{ .Token }}` si se desea mantener el registro por código de seis dígitos.
- Ejecutar las pruebas de registro, reenvío y expiración de OTP con SMTP personalizado.
