-- Agregar campos físicos a la tabla players
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS altura DECIMAL(4,2), -- altura en metros (ej: 1.75)
ADD COLUMN IF NOT EXISTS peso DECIMAL(5,2), -- peso en kg (ej: 65.5)
ADD COLUMN IF NOT EXISTS alcance_ataque DECIMAL(4,2), -- alcance de ataque en metros
ADD COLUMN IF NOT EXISTS alcance_bloqueo DECIMAL(4,2), -- alcance de bloqueo en metros
ADD COLUMN IF NOT EXISTS salto_vertical DECIMAL(4,2), -- salto vertical en metros
ADD COLUMN IF NOT EXISTS salto_horizontal DECIMAL(4,2), -- salto horizontal en metros
ADD COLUMN IF NOT EXISTS velocidad_30m DECIMAL(4,2), -- velocidad en 30 metros (segundos)
ADD COLUMN IF NOT EXISTS fecha_medicion DATE, -- fecha de la última medición
ADD COLUMN IF NOT EXISTS notas_fisicas TEXT; -- notas adicionales sobre condición física

-- Agregar comentarios
COMMENT ON COLUMN public.players.altura IS 'Altura del jugador en metros';
COMMENT ON COLUMN public.players.peso IS 'Peso del jugador en kilogramos';
COMMENT ON COLUMN public.players.alcance_ataque IS 'Alcance de ataque en metros';
COMMENT ON COLUMN public.players.alcance_bloqueo IS 'Alcance de bloqueo en metros';
COMMENT ON COLUMN public.players.salto_vertical IS 'Salto vertical en metros';
COMMENT ON COLUMN public.players.salto_horizontal IS 'Salto horizontal en metros';
COMMENT ON COLUMN public.players.velocidad_30m IS 'Velocidad en 30 metros (segundos)';
COMMENT ON COLUMN public.players.fecha_medicion IS 'Fecha de la última medición física';
COMMENT ON COLUMN public.players.notas_fisicas IS 'Notas adicionales sobre condición física'; 