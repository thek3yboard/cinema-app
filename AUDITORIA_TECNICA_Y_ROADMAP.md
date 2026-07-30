# Auditoría técnica, funcional y roadmap de Cinema Center

> Documento de seguimiento creado el 29 de julio de 2026.
>
> Este archivo registra el estado actual de la aplicación, los hallazgos de la
> auditoría y las mejoras propuestas. Las tareas se pueden marcar a medida que
> se implementan. No reemplaza a `PRUEBAS_AUTENTICACION.md`, que mantiene el
> detalle de las pruebas manuales de autenticación.

## Resumen ejecutivo

Cinema Center ya no es solamente un explorador de TMDB. Actualmente tiene:

- Autenticación con email, código de verificación y Google.
- Perfiles editables con username único y avatar.
- Favoritos, vistos, watchlist y puntuación persistidos por usuario.
- Búsqueda global con sugerencias dinámicas.
- Exploración de películas, series y personas.
- Fichas de contenido y personas.
- Comparación de créditos entre dos personas.
- Internacionalización en inglés y español.
- Diseño responsive y soporte PWA inicial.

La base de producto es buena y la identidad visual es reconocible. La búsqueda
global, el perfil y la nueva ficha de personas son las áreas más maduras. Los
listados, los filtros, las fichas de películas/series, la integración general
con TMDB y `On Screen Together` todavía conservan decisiones del prototipo
original.

Las prioridades generales deberían ser:

1. Centralizar el acceso a TMDB del lado servidor.
2. Corregir los filtros que mezclan parámetros de películas y series.
3. Unificar la experiencia visual de los listados.
4. Mejorar carga, errores, accesibilidad y performance.
5. Incorporar tests de los flujos críticos.
6. Agregar nuevas features sobre una base estable.

## Funcionalidades actuales

### Autenticación y cuenta

- Registro con email, contraseña y username.
- Verificación de email mediante código.
- Inicio de sesión con email y contraseña.
- Inicio de sesión con Google.
- Cierre de sesión.
- Sesión persistente mediante Supabase.
- Migración inicial de preferencias antiguas desde `localStorage`.

### Perfil

- Username único y case-insensitive.
- Nombre para mostrar.
- Avatar almacenado en Supabase Storage.
- Email visible como dato de identidad.
- Listas personales separadas en:
  - Favoritos.
  - Watchlist.
  - Vistos.

### Catálogo

- Exploración de películas.
- Exploración de series.
- Exploración de personas.
- Paginación.
- Orden ascendente y descendente.
- Orden por popularidad, puntuación, actualidad y revenue.
- Fichas de películas y series con:
  - Backdrop.
  - Título.
  - Descripción.
  - Puntuación de TMDB.
  - Trailer.
  - Productoras.
  - Acciones personales.
- Fichas de personas con:
  - Imagen.
  - Biografía expandible.
  - Datos personales.
  - Estadísticas.
  - Filmografía.
  - Filtro película/serie.
  - Orden popular/reciente.

### Búsqueda y descubrimiento

- Búsqueda global de películas, series y personas.
- Sugerencias con debounce.
- Navegación mediante teclado.
- Página de resultados con cards.
- Carga incremental de resultados.
- `On Screen Together` para encontrar películas compartidas entre dos
  personas.

### Internacionalización y navegación

- Locales `en-US` y `es-AR`.
- Los dos archivos de traducciones contienen las mismas claves. Los antiguos
  `es-ES` y `es-MX` se consolidaron porque duplicaban prácticamente todo su
  contenido.
- Navbar responsive.
- Selector de idioma.
- Menú de perfil.
- Favicon e identidad de pestaña de Cinema Center.

## Arquitectura actual

### Stack

- Next.js 14 con App Router.
- React 18.
- TypeScript.
- Tailwind CSS.
- NextUI.
- `next-intl`.
- Supabase Auth, PostgreSQL, Row Level Security y Storage.
- TMDB API v3.
- Sonner para notificaciones.
- Service Worker manual para PWA.

### Patrones positivos

- Supabase es la fuente de identidad y preferencias propias de Cinema Center.
- Las preferencias no dependen de que el usuario tenga una cuenta de TMDB.
- `profiles` y `user_media` tienen políticas de ownership mediante RLS.
- La clave conceptual `user_id + media_type + media_id` es adecuada.
- El callback OAuth valida el destino antes de redirigir.
- La búsqueda global utiliza:
  - Debounce.
  - `AbortController`.
  - `URLSearchParams`.
  - Navegación accesible mediante teclado.
- Las páginas de películas y series reutilizan componentes visuales.
- La base pasa actualmente `tsc --noEmit` y ESLint sin errores.

### Problemas arquitectónicos

#### Acceso a TMDB distribuido

Las llamadas se encuentran repartidas entre páginas, componentes y utilidades.
Esto provoca:

- Autenticación inconsistente.
- URLs construidas manualmente.
- Manejo de errores diferente en cada pantalla.
- Duplicación película/serie.
- Ausencia de caché compartido.
- Tipos parciales.
- Dificultad para testear.

Se recomienda construir una capa única `src/lib/tmdb`, consumida por Server
Components o Route Handlers.

#### Credenciales públicas

`NEXT_PUBLIC_TMDB_BEARER_TOKEN` se incluye en el JavaScript del navegador.
Además, algunas requests envían simultáneamente el `api_key` y el bearer token.

El bearer token debería permanecer exclusivamente en el servidor. Una capa
servidor también permitiría:

- Caché.
- Revalidación.
- Rate limiting.
- Backoff ante respuestas `429`.
- Logging y observabilidad.
- Contratos de error uniformes.

#### Exceso de Client Components

Gran parte de las pantallas principales obtiene los datos después de hidratar
React. Esto afecta:

- First Contentful Paint.
- SEO.
- Tamaño del bundle.
- Caché de Next.js.
- Experiencia en conexiones lentas.

Las fichas y los listados pueden renderizar inicialmente en el servidor y
reservar el cliente para filtros, búsqueda y acciones personales.

#### Contexto global amplio

`MediaContext` combina películas, series, personas, paginación, idioma, orden y
estado visual.

Conviene separar:

- Preferencias globales como idioma y región.
- Filtros serializados en la URL.
- Datos remotos administrados por una capa de caché.
- Estado efímero del navbar.

## UX y UI

### Puntos fuertes

- Paleta azul, mint y naranja consistente.
- Tipografía e identidad visual reconocibles.
- Navbar con buena jerarquía.
- Búsqueda global clara y usable.
- Resultados con poster, título, fecha y tipo.
- Perfil simple de entender.
- Ficha de persona moderna.
- Formularios de autenticación claros.
- Buen soporte de teclado en la búsqueda global.

### Inconsistencias

#### Listados principales

Los listados todavía muestran posters aislados y no tienen el mismo nivel de
información que búsqueda o filmografía.

Se debería mostrar como mínimo:

- Título.
- Año.
- Puntuación.
- Tipo de contenido cuando corresponda.
- Estado del usuario si inició sesión.

Las cards deberían ser enlaces reales y no `div` con `onClick`.

#### Imágenes y loaders

El grid actual:

- Marca todos los posters como prioritarios.
- Usa imágenes `original`.
- Tiene la optimización de Next Image desactivada.
- Espera a que cargue un grupo de imágenes antes de mostrar el grid.
- Agrega una demora artificial.
- Puede quedar cargando si una imagen falla.

Se recomienda:

- Usar `w342` o `w500`.
- Configurar `sizes`.
- Aplicar lazy loading salvo en las primeras cards.
- Mostrar skeleton individual.
- Incorporar `onError` y fallback local.
- Renderizar progresivamente.

#### Accesibilidad

Problemas detectados:

- Posters clickeables que no son enlaces o botones.
- Eventos de paginación ubicados en íconos.
- Rating implementado con `span` y mouse, sin teclado.
- Textos alternativos genéricos.
- Inputs de comparación con labels insuficientes.
- Estados comunicados principalmente por color.

La búsqueda global debería utilizarse como referencia de accesibilidad para los
demás componentes.

#### Catálogo detrás del login

El middleware protege películas, series, personas, búsqueda y comparación.
Como estrategia de producto, convendría evaluar:

- Catálogo, búsqueda y fichas disponibles de forma anónima.
- Login requerido al puntuar, guardar o administrar listas.
- Perfil protegido en el servidor.

Actualmente ocurre lo contrario: el catálogo está protegido por middleware y
`/profile` depende de una redirección cliente.

## Filtros actuales

### Películas y series

- Popularidad.
- Promedio de votos/top rated.
- Now playing.
- Revenue.
- Orden ascendente.
- Orden descendente.
- Exclusión de adultos.
- Exclusión de videos en películas.
- Exclusión de fechas nulas en TV.
- Umbral de votos.

### Personas

- Todo.
- Películas.
- Series.
- Popular.
- Reciente.

### Perfil

- Favoritos.
- Watchlist.
- Vistos.

## Problemas de filtros

### Now playing de series

`/discover/tv` recibe parámetros propios de películas:

- `release_date.gte`.
- `release_date.lte`.
- `with_release_type`.

Para TV corresponden `air_date` o `first_air_date`. Además, los objetos `Date`
se interpolan sin convertirlos explícitamente a `YYYY-MM-DD`.

Solución recomendada:

- Películas: `/movie/now_playing` o Discover Movie bien parametrizado.
- Series: `/tv/on_the_air` o `/tv/airing_today`.

### Revenue en TV

`revenue.asc/desc` no es una opción válida de Discover TV. Películas y series
necesitan catálogos de filtros separados.

### Umbral fijo de votos

`vote_count.gte=200` reduce títulos inflados con pocos votos, pero también:

- Oculta estrenos.
- Perjudica contenido independiente.
- Perjudica mercados menos populares.
- Hace que algunos filtros parezcan incompletos.

El umbral debería depender del modo o ser configurable.

### Filtros faltantes

- Género.
- Año o rango de fechas.
- Rango de puntuación.
- Duración.
- Idioma original.
- País de origen.
- Certificación.
- Proveedor de streaming.
- Tipo de monetización.
- Network.
- Estado de la serie.
- Tipo de serie.
- Región.

Los filtros deberían persistirse en query parameters para soportar enlaces
compartibles, refresh y navegación Back/Forward.

## TMDB: endpoints utilizados

La aplicación usa doce patrones principales:

| Endpoint | Uso |
|---|---|
| `/discover/movie` | Listado y orden de películas |
| `/discover/tv` | Listado y orden de series |
| `/trending/person/week` | Listado de personas |
| `/search/multi` | Búsqueda global |
| `/search/person` | Sugerencias de comparación |
| `/movie/{id}` | Ficha y recuperación de metadata |
| `/movie/{id}/videos` | Trailer |
| `/tv/{id}` | Ficha y recuperación de metadata |
| `/tv/{id}/videos` | Trailer |
| `/person/{id}` | Perfil de persona |
| `/person/{id}/combined_credits` | Filmografía |
| `/person/{id}/movie_credits` | Comparación de personas |

También se utiliza el CDN de imágenes con tamaños `w45`, `w92`, `w185`,
`w300`, `w342`, `w500` y `original`.

## TMDB: capacidades disponibles no utilizadas

| Familia | Casos de uso posibles |
|---|---|
| Listas oficiales | Popular, top rated, upcoming, now playing, airing today y on the air |
| Trending | Tendencias de películas, series, personas o todo; día o semana |
| Credits | Cast, dirección, guion y crew |
| Recommendations | Recomendaciones por título |
| Similar | Películas y series similares |
| Watch providers | Streaming, alquiler y compra por país |
| Reviews | Reseñas externas |
| Images | Posters, backdrops y logos alternativos |
| External IDs | IMDb, Wikidata, redes sociales y TheTVDB |
| Find | Búsqueda mediante identificadores externos |
| Release dates | Estrenos y certificaciones por país |
| Content ratings | Clasificación por edad de series |
| Genres | Géneros localizados |
| Certifications | Certificaciones por país |
| Collections | Sagas y colecciones |
| Companies | Productoras y sus catálogos |
| Networks | Redes de televisión |
| Keywords | Descubrimiento temático |
| Seasons/Episodes | Seguimiento granular de series |
| Person images | Galerías de personas |
| Person external IDs | IMDb y redes sociales |
| Changes | Invalidación y actualización de caché |
| Configuration | Imágenes, países, idiomas y zonas horarias |
| Account/Guest | Cuenta, favoritos, rating y watchlist de TMDB |
| Lists v3/v4 | Listas personalizadas de TMDB |

Mantener Supabase para usuarios y listas propias es una decisión correcta. No
es necesario exigir una segunda cuenta de TMDB.

### Endpoints de mayor valor para incorporar

1. `append_to_response` en detalles.
2. Credits.
3. Recommendations.
4. Similar.
5. Watch providers.
6. Release dates/content ratings.
7. Genres y Configuration.
8. Seasons y Episodes.

Documentación oficial de referencia:

- [OpenAPI completo de TMDB](https://developer.themoviedb.org/openapi/tmdb-api.json)
- [Discover Movie](https://developer.themoviedb.org/reference/discover-movie)
- [Discover TV](https://developer.themoviedb.org/reference/discover-tv)
- [Now Playing](https://developer.themoviedb.org/reference/movie-now-playing-list)
- [On The Air](https://developer.themoviedb.org/reference/tv-series-on-the-air-list)
- [Append To Response](https://developer.themoviedb.org/docs/append-to-response)
- [Watch Providers](https://developer.themoviedb.org/reference/movie-watch-providers)
- [Rate Limiting](https://developer.themoviedb.org/docs/rate-limiting)

## On Screen Together

### Comportamiento actual

- Busca dos personas.
- Obtiene sus créditos de películas.
- Mezcla cast y crew.
- Encuentra IDs de películas compartidos.
- Excluye documentales, apariciones como self, material de archivo y algunos
  trabajos.
- No considera series.

### Problemas conceptuales y técnicos

- Compartir una película no garantiza haber compartido pantalla.
- Una persona puede ser actriz y la otra productora.
- Los filtros internos pueden generar falsos negativos.
- No considera colaboraciones televisivas.
- No muestra los roles que originan la coincidencia.
- Duplica la lógica de ambos buscadores.
- Usa debounce de 100 ms sin cancelar requests.
- Limpiar el texto no necesariamente limpia la persona seleccionada.
- No posee estados de error completos.

### Evolución propuesta

- Presentarlo como “créditos compartidos”.
- Incorporar películas y series.
- Mostrar rol de cada persona.
- Diferenciar cast y crew.
- Mostrar año y poster.
- Agregar total de colaboraciones.
- Incluir filtros películas/series/todo.
- Crear una cronología de colaboraciones.

## Persistencia y perfil

### Aciertos

- RLS vinculada al usuario autenticado.
- Username único case-insensitive en base de datos.
- Metadata de medios persistida junto con preferencias.
- Migración desde `localStorage`.
- Avatar organizado por usuario.
- UI optimista.

### Riesgos y mejoras

- Falta rollback ante errores de persistencia.
- Cambios rápidos pueden enviar estado viejo y sobrescribir otro cambio.
- Permanecen registros aunque todos los flags sean falsos y el rating sea cero.
- La reconstrucción de metadata puede disparar muchas requests TMDB.
- Tamaño y MIME del avatar dependen principalmente del cliente.
- Falta recuperación de contraseña.
- Falta cambio de email y contraseña.
- Falta eliminación/exportación de cuenta.
- Los errores OAuth no se presentan de forma suficientemente clara.
- El código de activación acepta entre 6 y 10 caracteres aunque el producto
  comunica seis.
- El flujo Google fue probado satisfactoriamente.
- El registro por email continúa pendiente de prueba completa.

## PWA

El service worker actual debería corregirse o deshabilitarse.

Problemas:

- Precacha `/nexus/`, una ruta inexistente.
- Usa `OFFLINE_URL` sin definir.
- Intenta cachear indiscriminadamente todos los GET exitosos.
- No distingue assets, navegación, TMDB o requests autenticadas.
- No tiene estrategia explícita de actualización.
- El nombre de caché no está versionado.
- Puede servir contenido viejo después de un despliegue.

Una PWA mal cacheada puede causar más problemas que no tener soporte offline.

## SEO

Falta incorporar:

- Metadata por película, serie y persona.
- Títulos específicos por página.
- Open Graph.
- Twitter cards.
- Canonical por locale.
- `sitemap.xml`.
- `robots.txt`.
- JSON-LD para `Movie`, `TVSeries` y `Person`.
- Render servidor para contenido principal.

## Performance

Orden recomendado:

1. Dejar de usar imágenes `original` en grids.
2. Reactivar Next Image optimization.
3. Mover TMDB al servidor.
4. Aplicar caché y `revalidate`.
5. Usar `append_to_response`.
6. Paralelizar realmente las dos páginas obtenidas por `fetchBoth`.
7. Usar `AbortController` en listados, fichas y comparación.
8. Eliminar la demora artificial del grid.
9. Evitar hidratar contenido estático.
10. Paginar o diferir la recuperación de metadata del perfil.

## Manejo de errores

Se necesita un contrato uniforme para:

- Loading.
- Empty.
- Error.
- Retry.
- Offline.
- Rate limit.
- Sesión expirada.
- Acceso denegado.

`fetchPage` debería verificar `response.ok`, tipar la respuesta y devolver un
error de dominio en lugar de registrar el error y retornar `undefined`.

También conviene incorporar:

- `error.tsx` por segmento.
- `loading.tsx` por segmento.
- Timeouts.
- Abort de requests al desmontar.
- Logging centralizado.
- Toast solo para acciones iniciadas por el usuario.

## Calidad y mantenibilidad

- Eliminar `typescript.ignoreBuildErrors`.
- Normalizar película y serie mediante un tipo `MediaSummary`.
- Modelar correctamente campos nullable.
- Extraer una ficha genérica de media.
- Extraer hooks/componentes duplicados de comparación.
- Eliminar logs de desarrollo.
- Corregir mojibake como `Copyright Â©`.
- Unificar el modal de filtros desktop/mobile.
- Evitar `window.innerWidth` durante render.
- Reducir lógica basada en comparaciones manuales de `pathname`.
- Actualizar o archivar documentación histórica obsoleta.

## Testing

### Estado actual

- [x] `tsc --noEmit` sin errores al momento de la auditoría.
- [x] ESLint sin warnings ni errores al momento de la auditoría.
- [x] `git diff --check` sin errores de whitespace.
- [ ] Tests unitarios.
- [ ] Tests de componentes.
- [ ] Tests de integración.
- [ ] Tests E2E.
- [ ] Workflow de CI.

### Cobertura mínima recomendada

- [ ] Normalización de respuestas TMDB.
- [ ] Construcción de filtros Movie y TV.
- [ ] Fechas de filtros en formato ISO.
- [ ] Migración desde `localStorage`.
- [ ] Políticas y operaciones de `user_media`.
- [ ] Registro con email.
- [ ] Verificación mediante OTP.
- [ ] Inicio de sesión con Google.
- [ ] Logout.
- [ ] Edición de perfil y username duplicado.
- [ ] Subida de avatar.
- [ ] Favoritos, vistos, watchlist y rating.
- [ ] Búsqueda global y navegación por teclado.
- [ ] Cambio de locale.
- [ ] Navbar y grids responsive.
- [ ] Build de producción en CI.

## Atribución y aspectos legales

Debe verificarse que exista una sección visible de créditos a TMDB. TMDB exige
su logo oficial y el aviso indicado en su documentación:

> This product uses the TMDB API but is not endorsed or certified by TMDB.

Referencia:

- [TMDB FAQ y requisitos de atribución](https://developer.themoviedb.org/docs/faq)

Si se incorporan proveedores de streaming también debe respetarse la
atribución requerida a JustWatch.

## Ideas de producto

### Alto valor

- “Dónde verla” por país.
- Reparto y crew.
- Recomendaciones.
- Títulos similares.
- Listas personalizadas.
- Home personalizada.
- Búsqueda reciente.
- Tendencias cuando la búsqueda está vacía.

### Seguimiento personal

- Fecha en que se vio un título.
- Notas privadas.
- Rewatch.
- Estado “viendo actualmente”.
- Progreso por temporada y episodio.
- Diario de visualización.
- Exportación de datos.

### Estadísticas

- Géneros más vistos.
- Actores y directores frecuentes.
- Minutos vistos.
- Distribución de ratings.
- Actividad mensual/anual.
- Películas contra series.
- Idiomas y países predominantes.

### Social

- Perfiles públicos opcionales.
- Compartir listas.
- Comparar gustos entre usuarios.
- Seguir usuarios.
- Reviews propias.
- Recomendaciones entre amigos.

### Exploración

- Páginas de colecciones y sagas.
- Páginas de productoras.
- Páginas de networks.
- Búsqueda por IMDb u otros IDs.
- Navegación por keywords.
- Calendario de estrenos.

## Roadmap priorizado

### P0 — Corrección y base técnica

- [ ] Separar filtros de películas y series.
- [ ] Corregir now playing/on the air.
- [ ] Formatear fechas como `YYYY-MM-DD`.
- [ ] Eliminar revenue para TV.
- [ ] Crear capa TMDB del lado servidor.
- [ ] Retirar el bearer token del cliente.
- [ ] Estandarizar errores de TMDB.
- [ ] Corregir o deshabilitar el service worker.
- [ ] Rehacer carga de imágenes y loaders del grid.
- [ ] Agregar atribución oficial de TMDB.
- [x] Proteger `/profile` mediante middleware o servidor.
- [x] Mantener el catálogo público y reservar las acciones personales para
  usuarios autenticados.
- [ ] Incorporar CI y smoke tests de autenticación.

### P1 — Consolidación de experiencia

- [ ] Rediseñar cards de películas y series.
- [ ] Mostrar título, año, rating y tipo.
- [ ] Convertir cards en enlaces accesibles.
- [ ] Persistir filtros en la URL.
- [ ] Agregar género, año, rating, duración, idioma y país.
- [ ] Agregar “Dónde verla”.
- [ ] Agregar cast y crew.
- [ ] Agregar recomendaciones y similares.
- [ ] Incorporar metadata, Open Graph y JSON-LD.
- [ ] Implementar recuperación de contraseña.
- [ ] Agregar rollback y control de concurrencia en preferencias.
- [ ] Crear home personalizada.

### P2 — Diferenciación

- [ ] Listas personalizadas.
- [ ] Seguimiento por temporada y episodio.
- [ ] Diario de visualización.
- [ ] Estadísticas personales.
- [ ] Comparación de perfiles.
- [ ] Listas públicas compartibles.
- [ ] Recomendaciones personalizadas.
- [ ] Evolucionar `On Screen Together`.
- [ ] Páginas de colección, productora y network.
- [ ] Búsqueda por IDs externos.

## Criterio recomendado para próximas features

Antes de agregar una feature nueva, verificar:

1. ¿Reutiliza la capa TMDB central?
2. ¿Funciona en los dos locales?
3. ¿Tiene estado loading, empty, error y retry?
4. ¿Es accesible con teclado?
5. ¿Funciona en mobile?
6. ¿Mantiene las credenciales fuera del cliente?
7. ¿Tiene al menos una prueba del flujo principal?
8. ¿Respeta las atribuciones de TMDB/JustWatch?
9. ¿La información se puede compartir o recuperar mediante URL?
10. ¿La feature necesita login o puede ofrecer valor anónimo?

## Veredicto

Cinema Center tiene una dirección de producto sólida. La próxima etapa debería
consolidar la plataforma antes de continuar agregando pantallas aisladas:

- Una sola capa de datos TMDB.
- Filtros válidos para cada tipo.
- Catálogo público con acciones privadas, si se aprueba esa decisión.
- Cards y estados visuales consistentes.
- Render del servidor y caché.
- Tests de los flujos críticos.

Después de esta consolidación, las mejoras con mejor relación entre esfuerzo y
valor serían:

1. Dónde verla.
2. Cast y crew.
3. Recomendaciones y similares.
4. Listas personalizadas.
5. Seguimiento de series.
6. Estadísticas personales.
