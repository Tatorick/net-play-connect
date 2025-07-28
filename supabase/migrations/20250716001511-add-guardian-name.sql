-- Agregar campo guardian_name a la tabla players
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS guardian_name TEXT;

-- Agregar comentario
COMMENT ON COLUMN public.players.guardian_name IS 'Nombre del padre, madre o tutor del jugador'; 