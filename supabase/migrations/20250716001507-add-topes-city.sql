-- Agregar columna ciudad a la tabla topes
ALTER TABLE public.topes 
ADD COLUMN ciudad VARCHAR(100);

-- Agregar comentario para documentar la nueva columna
COMMENT ON COLUMN public.topes.ciudad IS 'Ciudad donde se realizará el tope';

-- Crear índice para búsquedas por ciudad
CREATE INDEX idx_topes_ciudad ON public.topes(ciudad); 