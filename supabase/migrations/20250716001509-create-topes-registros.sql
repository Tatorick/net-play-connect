-- Crear tabla topes_registros si no existe
CREATE TABLE IF NOT EXISTS public.topes_registros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tope_id UUID REFERENCES public.topes(id) ON DELETE CASCADE,
  equipo_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  estado VARCHAR(20) DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tope_id, equipo_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_topes_registros_tope_id ON public.topes_registros(tope_id);
CREATE INDEX IF NOT EXISTS idx_topes_registros_equipo_id ON public.topes_registros(equipo_id);
CREATE INDEX IF NOT EXISTS idx_topes_registros_user_id ON public.topes_registros(user_id);
CREATE INDEX IF NOT EXISTS idx_topes_registros_estado ON public.topes_registros(estado);

-- Agregar comentarios
COMMENT ON TABLE public.topes_registros IS 'Tabla para almacenar registros de equipos a topes';
COMMENT ON COLUMN public.topes_registros.estado IS 'Estado del registro: pendiente, confirmado, cancelado'; 