-- Crear tabla topes si no existe
CREATE TABLE IF NOT EXISTS public.topes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_publicacion VARCHAR(50) NOT NULL,
  equipo_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  categoria VARCHAR(100) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  hora_inicio TIME,
  hora_fin TIME,
  ubicacion TEXT NOT NULL,
  ciudad VARCHAR(100),
  cantidad_sets INTEGER,
  notas TEXT,
  estado VARCHAR(20) DEFAULT 'activo',
  vigencia_hasta DATE NOT NULL,
  creado_por UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ofrece_hospedaje BOOLEAN DEFAULT FALSE,
  ofrece_comida BOOLEAN DEFAULT FALSE,
  ofrece_transporte BOOLEAN DEFAULT FALSE,
  ofrece_otros TEXT
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_topes_estado ON public.topes(estado);
CREATE INDEX IF NOT EXISTS idx_topes_ciudad ON public.topes(ciudad);
CREATE INDEX IF NOT EXISTS idx_topes_fecha_inicio ON public.topes(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_topes_equipo_id ON public.topes(equipo_id);
CREATE INDEX IF NOT EXISTS idx_topes_creado_por ON public.topes(creado_por);

-- Agregar comentarios
COMMENT ON TABLE public.topes IS 'Tabla para almacenar topes amistosos';
COMMENT ON COLUMN public.topes.tipo_publicacion IS 'Tipo de publicación: busca_equipo, ofrece_partido';
COMMENT ON COLUMN public.topes.estado IS 'Estado del tope: activo, confirmado, expirado, cancelado';
COMMENT ON COLUMN public.topes.ciudad IS 'Ciudad donde se realizará el tope'; 