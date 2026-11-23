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
