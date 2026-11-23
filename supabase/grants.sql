-- Ejecutar una vez en el editor SQL de Supabase si ya corriste schema.sql antes de que tuviera los permisos.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
