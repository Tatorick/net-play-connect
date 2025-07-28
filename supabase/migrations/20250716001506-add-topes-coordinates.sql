-- Agregar columnas de coordenadas a la tabla topes
ALTER TABLE public.topes 
ADD COLUMN latitud DECIMAL(10, 8),
ADD COLUMN longitud DECIMAL(11, 8);

-- Agregar comentarios para documentar las nuevas columnas
COMMENT ON COLUMN public.topes.latitud IS 'Latitud de la ubicación del tope (coordenada Y)';
COMMENT ON COLUMN public.topes.longitud IS 'Longitud de la ubicación del tope (coordenada X)';

-- Crear índice para búsquedas geográficas
CREATE INDEX idx_topes_coordinates ON public.topes(latitud, longitud) WHERE latitud IS NOT NULL AND longitud IS NOT NULL; 