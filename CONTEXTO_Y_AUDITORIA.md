# Contexto y auditoría técnica — Cinema

Fecha de revisión: 2026-07-26
Última actualización de contexto: 2026-07-27
Alcance original: revisión estática de código, configuración y artefactos PWA.

## Estado actual posterior a la auditoría

La aplicación ya cuenta con autenticación real y persistencia por usuario mediante Supabase. Esta sección prevalece ante las observaciones históricas del resto del documento cuando exista una contradicción.

### Funcionalidad implementada

- Registro con email y contraseña, confirmación por enlace o código OTP de 6 a 10 dígitos e inicio de sesión con Google.
- Sesión persistente mediante cookies, middleware y clientes Supabase separados para navegador y servidor.
- Perfil editable con username único, nombre para mostrar y avatar almacenado en Supabase Storage.
- Favoritos, vistos, lista para ver y puntuación persistidos en `user_media`, aislados por usuario mediante RLS.
- Migración única de preferencias heredadas desde `localStorage` después del primer inicio de sesión.
- Listas de perfil con título, póster, puntuación y navegación al detalle; los registros antiguos sin metadata se completan desde TMDB.
- Navbar responsive con avatar, menú de usuario y buscador estable; en viewports angostos las acciones pasan al menú compacto.
- Flujos nuevos de autenticación, perfil y preferencias internacionalizados para `en-US`, `es-ES` y `es-MX`.
- Estados recuperables para detalles sin datos o sin tráiler.

### Persistencia y componentes principales

| Área | Implementación vigente |
| --- | --- |
| Autenticación | Supabase Auth: email/contraseña, confirmación y Google OAuth |
| Sesión | `@supabase/ssr`, `AuthProvider` y middleware de renovación/protección |
| Perfil | Tabla `profiles` y bucket público `avatars` con políticas por propietario |
| Preferencias | Tabla `user_media` con clave única por usuario, tipo e ID de media |
| Seguridad | Row Level Security para perfiles, preferencias y objetos de avatar |
| Migraciones | `supabase/migrations/20260726000000_auth_and_user_media.sql` y `20260726000001_user_media_metadata.sql` |

### Validaciones realizadas

- Google OAuth fue probado manualmente con resultado satisfactorio.
- `tsc --noEmit`, `next lint` y el build de producción finalizaron correctamente durante la implementación.
- El navbar y las pantallas de acceso en `en-US` fueron revisados visualmente en local.
- El registro por email sigue pendiente de prueba integral por el límite temporal del SMTP de prueba de Supabase. El detalle se mantiene en `PRUEBAS_AUTENTICACION.md`.

### Deuda técnica que continúa vigente

- Mover las credenciales y solicitudes de TMDB al servidor.
- Consolidar el cliente de TMDB y su manejo de errores, cancelación y rate limits.
- Corregir la estrategia PWA/service worker y optimizar imágenes.
- Agregar pruebas automatizadas para autenticación, RLS, perfil y preferencias.
- Completar la internacionalización del código heredado fuera de los flujos nuevos.

> El contenido siguiente conserva la auditoría original como registro histórico. Algunos hallazgos —autenticación inexistente, persistencia exclusiva en `localStorage`, fallos de tipos y manejo básico de detalles— ya fueron resueltos total o parcialmente.

## Resumen ejecutivo

Cinema es una aplicación Next.js 14 (App Router) que consume TMDB para explorar películas, series y personas; permite comparar filmografías de dos personas y guardar estado local de cada título (favorito, visto, lista y puntuación). Tiene tres locales (`en-US`, `es-ES`, `es-MX`), NextUI, Tailwind y una PWA básica.

El proyecto tiene una buena base visual y el flujo de descubrimiento está claro, pero hoy no está en condiciones confiables de despliegue: el build de producción falla, TypeScript tiene errores que se omiten explícitamente, las credenciales de TMDB se envían al navegador y varios estados de carga/error pueden dejar pantallas bloqueadas o producir excepciones. Las prioridades inmediatas son restaurar un build reproducible, retirar secretos del cliente y consolidar el acceso a TMDB.

## Arquitectura actual

| Área | Implementación actual |
| --- | --- |
| Framework | Next.js 14.2.5, React 18, TypeScript estricto en `tsconfig` |
| Rutas | `/[locale]/movies`, `/shows`, `/people`, detalle por ID y `/onscreentogether` |
| Internacionalización | `next-intl`, con `en-US`, `es-ES` y `es-MX` |
| Datos | Llamadas `fetch` desde componentes cliente directamente a TMDB |
| Estado | `MediaContext` dentro del layout “logged”; estado de usuario en `localStorage` |
| UI | NextUI, Tailwind, `next/image`, Font Awesome y Lucide |
| Offline | Service worker escrito a mano en `public/service-worker.js` |

No hay autenticación real: las rutas `signin` y `signup` son formularios visuales sin `onSubmit`, validación, persistencia ni control de acceso. El nombre del grupo `(logged)` no implica protección.

## Verificaciones ejecutadas

| Verificación | Resultado |
| --- | --- |
| ESLint (`next lint`) | Correcto: sin warnings ni errores. |
| TypeScript (`tsc --noEmit`) | Falla con 8 errores: `any` implícitos en la filmografía de personas y props inválidas a `Loading`. |
| Build de producción (`next build`) | Falla: `tailwind.config.ts` requiere `tailwind-scrollbar`, pero el paquete no está presente en `node_modules`, aunque sí figura en `package.json` y `package-lock.json`. También avisa la ausencia de `sharp` y de una base Browserslist actualizada. |

El primer intento de build no pudo descargar Montserrat por la red aislada; al repetirlo con acceso de red, llegó a la compilación y reveló el fallo real de `tailwind-scrollbar`.

## Hallazgos priorizados

### P0 — bloquean despliegue o exponen credenciales

1. **El build de producción no compila.** `tailwind.config.ts` hace `require('tailwind-scrollbar')`, pero el módulo no existe en la instalación actual. La dependencia debe instalarse de forma reproducible con `npm ci`/CI y el build debe ser una condición obligatoria antes de integrar cambios. Archivo: `tailwind.config.ts:31`.

2. **Se ignoran los errores de TypeScript al construir.** `next.config.mjs` activa `ignoreBuildErrors: true`, ocultando fallos que `tsc --noEmit` detecta. Entre ellos hay `any` implícitos en `people/[id]/page.tsx` y el uso de props inexistentes en `Loading` desde `MediaGrid`. Desactivar la opción, corregir los tipos y agregar `typecheck` al pipeline. Archivo: `next.config.mjs:34`.

3. **La API key y el bearer token de TMDB se exponen al cliente.** Las variables con prefijo `NEXT_PUBLIC_` se incluyen en el bundle y, además, el API key se adjunta a URLs visibles. Esto permite el uso externo de la cuota/token. Mover TMDB a route handlers o server actions, conservar la credencial sin prefijo público, validar parámetros en el servidor y aplicar caché/rate limiting. Archivos: `next.config.mjs:12-13`, `src/app/[locale]/utils.tsx:5-12` y múltiples componentes cliente.

### P1 — errores funcionales y de resiliencia

4. **Las pantallas de detalle pueden romperse mientras cargan o si TMDB no devuelve datos.** Se renderiza `MediaUI mediaData={movieData!}` y `PersonUI personData={personData!}` antes de tener estado de éxito. `Suspense` no espera un `useEffect`; la aserción `!` solo silencia TypeScript. Por ejemplo, `mediaData?.backdrop_path !== null` es verdadero para `undefined`, creando una URL inválida, y `personData.name` terminará fallando. Modelar estados `loading / success / error / empty` y renderizar cada componente solo con datos válidos. Archivos: `movies/[id]/page.tsx:55`, `shows/[id]/page.tsx:55`, `people/[id]/page.tsx:85`, `MediaUI.tsx:101`.

5. **No se comprueba `response.ok` ni se tipa/normaliza la respuesta.** `fetchPage` hace `res.json()` para 401, 404, 429 o 5xx y devuelve `undefined` al capturar errores; los llamadores acceden luego a `data.results`. Esto convierte un error de red/API en una excepción secundaria y sin feedback al usuario. Centralizar un cliente TMDB que compruebe `ok`, maneje timeout/abort, devuelva errores tipados y muestre una UI recuperable. Archivo: `src/app/[locale]/utils.tsx:3-17`.

6. **La búsqueda de personas puede hacer una cantidad excesiva e inválida de requests.** El `while (page < data.total_pages)` incrementa el contador de control de a 1, pero los números de página solicitados de a 2; con dos páginas totales ya pide 3 y 4. Además, recorre páginas hasta encontrar más de 100 resultados en vez de limitar antes las solicitudes. Limitar a una o dos páginas, usar paginación explícita y cancelar la búsqueda anterior. Archivo: `src/app/[locale]/(logged)/layout.tsx:210-240`.

7. **La paginación de series queda deshabilitada.** `NextPageButton` decide `disabled={movies.length !== 40}`, aun cuando se usa en series. Como `movies` suele estar vacío al ver `/shows`, el botón aparece pero no avanza. Debe recibir `items.length` de la colección activa y conocer si hay página siguiente desde la respuesta de TMDB. Archivo: `src/app/[locale]/components/Media.tsx:150-154`.

8. **Falta manejo de casos vacíos en los videos.** Si TMDB no devuelve trailers, `video.results[0].key` causa una excepción. También se intenta cargar el reproductor con un ID vacío. Hacer opcional el trailer y mostrar “tráiler no disponible”. El problema está duplicado para películas y series. Archivos: `movies/[id]/page.tsx:34-42`, `shows/[id]/page.tsx:34-42`.

9. **Las solicitudes pueden actualizar estado obsoleto.** Los `useEffect` de listas, sugerencias y detalle no usan `AbortController` ni una marca de vigencia. Cambiar idioma/ruta o escribir rápido puede dejar resultados de una búsqueda anterior sobre la pantalla actual, y actualizar un componente desmontado. Usar abort signals o una librería de datos (SWR/TanStack Query). Archivos: `Media.tsx:37-108`, `onscreentogether/page.tsx:33-79`.

10. **El service worker tiene un fallback roto y una estrategia de caché riesgosa.** `OFFLINE_URL` no está definido, por lo que un fallo de navegación offline provocará un `ReferenceError`. El precache apunta a `/nexus/`, que no corresponde a estas rutas, y la estrategia cachea sin límite toda respuesta GET —incluyendo recursos de TMDB— bajo un nombre de caché que nunca cambia entre releases. Definir una página offline real, versionar cachés y usar políticas separadas y acotadas (assets: cache-first; API: network-first con TTL o sin caché). Archivo: `public/service-worker.js:1-53`.

### P2 — rendimiento, UX y accesibilidad

11. **La galería descarga demasiadas imágenes pesadas.** Cada poster y logo usa `priority={true}`, `unoptimized: true` y el tamaño remoto `original`. En una grilla de 40 elementos se fuerzan decenas de descargas de máxima resolución, anulando la optimización/lazy loading de Next. Elegir tamaños TMDB acordes (`w185`, `w342`, etc.), reservar `priority` para la imagen LCP y habilitar `next/image` con `remotePatterns`/`sharp` en producción. Archivos: `next.config.mjs:8-10`, `MediaGrid.tsx:44-46`, `MediaUI.tsx:110,188,199`.

12. **El loader de grilla puede quedar infinito y agrega esperas artificiales.** La grilla permanece oculta hasta que cargan 10 imágenes y cada `onLoad` programa un `setTimeout` de dos segundos. Si una imagen falla, nunca se alcanza el contador; tampoco hay limpieza de timers. Usar `onError`, mostrar tarjetas con placeholders inmediatamente y eliminar la espera artificial. Archivo: `src/app/[locale]/components/MediaGrid.tsx:18-33`.

13. **Búsquedas sin codificar y con poca validación.** El valor de `search` se interpola directamente en query strings; caracteres como `&`, `?` o espacios pueden alterar la consulta. También se permite buscar vacío. Usar `URL`/`URLSearchParams`, `encodeURIComponent`, `trim`, una longitud mínima y debounce. Archivo: `src/app/[locale]/(logged)/layout.tsx:185-224`.

14. **El diseño no reacciona al redimensionado.** `window.innerWidth` se consulta durante el render para elegir dos modales; si cambia el viewport, no cambia la rama. Ese modal está duplicado casi por completo. Usar CSS responsive/NextUI y una única instancia de modal; si es imprescindible, un hook `useMediaQuery` que escuche cambios. Archivo: `src/app/[locale]/(logged)/layout.tsx:433-545`.

15. **Faltan estados de carga, error y vacío coherentes.** Hay `console.error` en lugar de mensajes, loaders de pantalla completa para tareas locales y varios flujos sin confirmación de que no hay resultados o sin imagen. Crear componentes reutilizables `PageState`/`InlineState` con reintento y mensajes internacionalizados.

16. **Accesibilidad de controles incompleta.** Muchos inputs no tienen `label` asociado, placeholder o nombre accesible; botones de búsqueda/limpiar y posters clicables no tienen una etiqueta semántica, soporte de teclado ni foco visible. Convertir posters a `Link` o `button`, proveer `aria-label`, textos alternativos específicos (título/nombre) y usar un combobox accesible para sugerencias. Archivos: `MediaGrid.tsx:40-47`, `layout.tsx:328-406`, `onscreentogether/page.tsx:222-322`.

17. **El estado de usuario se guarda como muchas claves de `localStorage`.** Cada campo por película/serie genera cuatro claves independientes, no hay migración, sincronización entre pestañas, listado de favoritos ni respaldo por cuenta. Centralizar en una estructura versionada por usuario/medio (por ejemplo JSON o IndexedDB) y, si se implementa autenticación, persistirla en backend. Archivo: `src/app/[locale]/components/MediaUI.tsx:39-98`.

### P3 — mantenibilidad y calidad de producto

18. **Hay duplicación importante.** Las páginas de detalle de película y serie son prácticamente iguales; también se repite la construcción de URLs TMDB, el modal desktop/mobile, las ramas de render por `pathname` y el manejo de estado local de media. Crear un cliente TMDB y componentes/hooks genéricos (`useMediaDetail`, `useMediaList`, `MediaDetailPage`, `useUserMediaState`).

19. **Tipos del dominio incompletos o incorrectos.** TMDB devuelve muchos campos nullable, pero se declaran `string`; `PersonData.place_of_birth` es `number` aunque TMDB lo entrega como string o null; filmografías mezclan movie y TV en un tipo `Movie`. Esto explica parte de los `any` y hace que las garantías de TypeScript no sean reales. Definir tipos de respuesta API con `null`, uniones discriminadas `movie | tv` y mapearlos a view models. Archivo: `src/types/types.tsx:1-67`.

20. **Estructura de layouts HTML inválida.** El root layout produce `<html><body>` y el layout de locale vuelve a producir otros `<html><body>` anidados. Debe haber un único par por árbol de documento; el layout por locale debería aportar providers/contenido, mientras que el root resuelve atributos de documento de forma compatible con i18n. Archivos: `src/app/layout.tsx:9-12`, `src/app/[locale]/layout.tsx:34-43`.

21. **Internacionalización parcial.** Persisten textos en inglés/español dentro de componentes: formularios de auth, mensajes toast, copyright, “Trailer”, “Less/More”, loader y mensajes de filmografía. Además `es-ES` y `es-MX` tienen la misma etiqueta “Spanish”. Extraer todas las cadenas a `messages/`, usar textos localizados y definir nomenclaturas distinguibles. Ejemplos: `PersonUI.tsx:51`, `ExpandableText.tsx:31`, `layout.tsx:233`.

22. **Autenticación es una promesa visual sin implementación.** Los formularios no tienen `name`, `required`, `autoComplete`, validación, submit ni navegación; y no existe middleware de autorización. Si no será una función próxima, ocultar las rutas; si sí, diseñar sesiones, protección de rutas, estados y tratamiento seguro de contraseñas antes de conectarlos.

23. **Documentación y automatización insuficientes.** El README aún es el de `create-next-app`, no documenta TMDB, locales, scripts, arquitectura ni variables. No se observan tests de unidad/E2E ni CI. Reemplazarlo y agregar al menos `lint`, `typecheck`, `build` y pruebas de flujos críticos en pull requests.

24. **Detalles de limpieza.** Hay imports/estados no usados (`language` en los detalles, `screenRef`, `createRef` creado en cada render), `console.log` de diagnóstico en UI y comentarios TO-DO sin seguimiento. Eliminar o convertirlos en tareas con criterio de aceptación. Ejemplos: `MediaGrid.tsx:21-23`, `PersonUI.tsx:24-26`, `layout.tsx:3,47`.

## Plan recomendado

1. **Estabilizar el proyecto:** ejecutar instalación limpia con el lockfile, resolver `tailwind-scrollbar`, quitar `ignoreBuildErrors`, corregir los ocho errores y exigir `lint + typecheck + build` en CI.
2. **Cerrar la superficie de TMDB:** crear `/api/tmdb/...` del lado servidor, eliminar `NEXT_PUBLIC_TMDB_*`, validar y codificar parámetros, tratar 401/404/429/5xx y rotar el bearer token expuesto.
3. **Hacer robusta la interfaz:** estados de carga/error/vacío, detalle sin aserciones no nulas, trailer opcional, `AbortController`, recuperación ante fallo de imágenes y paginación basada en metadata de TMDB.
4. **Reducir consumo y duplicación:** cliente único de TMDB, requests paralelos cuando corresponda, caché de consultas, imágenes de tamaño adecuado y componentes genéricos para movie/TV y para el modal.
5. **Completar el producto:** internacionalización total, accesibilidad de inputs/acciones/grillas, auth real o rutas eliminadas, estrategia PWA correcta y tests E2E para búsqueda, filtros, idioma, detalle y comparación de personas.

## Criterios de salida sugeridos

- `npm ci`, `npm run lint`, `tsc --noEmit` y `next build` terminan correctamente en un entorno limpio.
- Ningún secreto ni token de TMDB aparece en JavaScript, HTML, DevTools o URLs del cliente.
- Un 404, 429, 5xx, timeout, imagen rota o título sin tráiler muestra un estado recuperable, nunca una pantalla en carga perpetua ni un crash.
- Las listas descargan imágenes optimizadas y la navegación de películas, series y personas usa la misma lógica de paginación correcta.
- Todos los flujos visibles tienen texto localizado y se pueden operar con teclado y lector de pantalla.
