-- Agregar restricción única para documento de identidad
ALTER TABLE public.players 
ADD CONSTRAINT players_document_id_unique UNIQUE (document_id);

-- Agregar restricción única para número de camiseta por equipo
-- Esto requiere crear una tabla intermedia o usar una restricción compuesta
-- Vamos a usar una restricción compuesta en la tabla players
ALTER TABLE public.players 
ADD CONSTRAINT players_team_jersey_unique UNIQUE (team_id, jersey_number);

-- Crear índices para mejorar el rendimiento de las consultas de validación
CREATE INDEX IF NOT EXISTS idx_players_document_id ON public.players(document_id);
CREATE INDEX IF NOT EXISTS idx_players_team_jersey ON public.players(team_id, jersey_number);

-- Función para validar número de camiseta único por equipo
CREATE OR REPLACE FUNCTION validate_jersey_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar si ya existe un jugador con el mismo número en el mismo equipo
  IF EXISTS (
    SELECT 1 FROM public.players 
    WHERE team_id = NEW.team_id 
    AND jersey_number = NEW.jersey_number 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
  ) THEN
    RAISE EXCEPTION 'El número de camiseta % ya está en uso en este equipo', NEW.jersey_number;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar número de camiseta
CREATE TRIGGER validate_jersey_number_trigger
  BEFORE INSERT OR UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION validate_jersey_number();

-- Función para validar documento único
CREATE OR REPLACE FUNCTION validate_document_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar si ya existe un jugador con el mismo documento
  IF EXISTS (
    SELECT 1 FROM public.players 
    WHERE document_id = NEW.document_id 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
  ) THEN
    RAISE EXCEPTION 'El documento % ya está registrado', NEW.document_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar documento único
CREATE TRIGGER validate_document_id_trigger
  BEFORE INSERT OR UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION validate_document_id(); 