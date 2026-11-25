# Quiropraxia & Vida: turnos online (demo)

Sitio y sistema de turnos para el Lic. Hugo Rodriguez. Next.js 16, Tailwind 4.

## Correr la demo

```powershell
npm install
npm run dev
```

Abrí `http://localhost:3000`. Panel de Hugo en `/admin`.

La contraseña del panel está en `.env.local` (`ADMIN_PASSWORD`). Copiá `.env.example` para crear el tuyo.
Los datos de la demo se guardan en `data/db.json` y se crean solos. Borrá esa carpeta para reiniciar.

## Qué falta reemplazar (placeholders)

- `app/(site)/page.tsx`: los testimonios son de ejemplo y están marcados. Reemplazar por reales, con permiso de cada paciente.
- `public/brand/hugo.jpg`: sale de una gráfica de Instagram y tiene poca resolución. Conviene una foto original.
- Favicon: sigue el de Next.js. Falta uno con la marca.
- `app/(site)/privacidad/page.tsx`: borrador a revisar por Hugo (Ley 25.326).

## Pasar a producción

Con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` definidas, la app guarda en Supabase. Sin ellas usa el archivo local.

1. Crear el proyecto de Supabase y ejecutar `supabase/schema.sql` (incluye los permisos de `service_role`).
2. En Vercel, cargar las variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` (una contraseña fuerte, distinta de la de desarrollo) y `ADMIN_SECRET` (texto largo al azar).

El login del panel usa la contraseña de `ADMIN_PASSWORD` con una cookie firmada de 7 días.

## Datos confirmados con Hugo

- Atiende de lunes a viernes, de 14:00 a 20:00 hs.
- La consulta dura 45 minutos. Ambos datos se cambian desde `/admin/horarios`.

## Usarlo para cualquier negocio (plantilla configurable)

El sistema sirve para cualquier lugar que dé turnos. El texto, los servicios de ejemplo y el vocabulario
(paciente, cliente, alumno; consulta, servicio, clase) salen de un **perfil**, en `lib/profile.ts`.

Rubros disponibles: `consultorio`, `peluqueria`, `estetica`, `taller` y `estudio`.
Sin variables, el sitio muestra el de Hugo (perfil `hugo`, con su foto, video y logo).

Para un cliente nuevo, hacés un proyecto de Vercel con este mismo repositorio y cargás:

| Variable | Qué hace |
| --- | --- |
| `PROFILE_KEY` | Rubro: `consultorio`, `peluqueria`, `estetica`, `taller` o `estudio` |
| `BUSINESS_NAME` | Nombre del negocio |
| `BUSINESS_PROFESSIONAL` | Nombre de quien atiende |
| `BUSINESS_WHATSAPP` | WhatsApp con código de país, por ejemplo `5493511234567` |
| `BUSINESS_WHATSAPP_DISPLAY` | Cómo se ve el número, por ejemplo `351 123-4567` |
| `BUSINESS_ADDRESS`, `BUSINESS_CITY`, `BUSINESS_MAP_QUERY` | Dirección, ciudad y búsqueda para el mapa |
| `BUSINESS_INSTAGRAM`, `BUSINESS_TAGLINE` | Instagram y frase corta (opcionales) |
| `DB_TABLE_PREFIX` | Si comparte el Supabase con otros clientes, un prefijo propio para sus tablas, por ejemplo `lola_` |
| `ADMIN_PASSWORD`, `ADMIN_SECRET` | Login del panel de ese cliente |

Horarios, servicios y precios se cambian después desde el panel (`/admin/horarios`).
Si usa `DB_TABLE_PREFIX`, hay que crear sus tablas con `supabase/schema.sql` cambiando los nombres por los
del prefijo.

## La demo con selector de rubro

Con `DEMO_MODE=1` el sitio es una demo: el visitante elige el rubro (barra naranja de arriba) y ve nombres,
servicios y textos de ese rubro. Cada rubro tiene sus propias tablas (`demo_<rubro>_...`), que se crean con
`supabase/demo_schema.sql`. La contraseña del panel de la demo es pública a propósito: son datos de mentira.
