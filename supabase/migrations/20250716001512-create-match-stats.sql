-- Crear tabla de partidos
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  opponent_team VARCHAR(255),
  match_date DATE NOT NULL,
  location VARCHAR(255),
  sets_won INTEGER DEFAULT 0,
  sets_lost INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  opponent_points INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de eventos de estadísticas
CREATE TABLE IF NOT EXISTS public.match_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- Serve, Reception, Set/Assist, Attack, Block, Defense/Dig, Substitution, Timeout
  result VARCHAR(50) NOT NULL, -- Ace, Error, In Play, Perfect (3), Good (2), Poor (1), Kill, Blocked, etc.
  set_number INTEGER NOT NULL,
  point_number INTEGER NOT NULL,
  is_point BOOLEAN DEFAULT false,
  is_error BOOLEAN DEFAULT false,
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de sets
CREATE TABLE IF NOT EXISTS public.match_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  team_points INTEGER DEFAULT 0,
  opponent_points INTEGER DEFAULT 0,
  winner VARCHAR(10), -- 'team' or 'opponent'
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, set_number)
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_matches_team_id ON public.matches(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date);
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON public.match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_player_id ON public.match_events(player_id);
CREATE INDEX IF NOT EXISTS idx_match_events_action ON public.match_events(action);
CREATE INDEX IF NOT EXISTS idx_match_events_timestamp ON public.match_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_match_sets_match_id ON public.match_sets(match_id);

-- Políticas RLS para matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their own matches" ON public.matches
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM public.teams WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can insert their own matches" ON public.matches
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT id FROM public.teams WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can update their own matches" ON public.matches
  FOR UPDATE USING (
    team_id IN (
      SELECT id FROM public.teams WHERE coach_id = auth.uid()
    )
  );

-- Políticas RLS para match_events
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their team events" ON public.match_events
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM public.teams WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can insert their team events" ON public.match_events
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT id FROM public.teams WHERE coach_id = auth.uid()
    )
  );

-- Políticas RLS para match_sets
ALTER TABLE public.match_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their team sets" ON public.match_sets
  FOR SELECT USING (
    match_id IN (
      SELECT id FROM public.matches WHERE team_id IN (
        SELECT id FROM public.teams WHERE coach_id = auth.uid()
      )
    )
  );

CREATE POLICY "Coaches can insert their team sets" ON public.match_sets
  FOR INSERT WITH CHECK (
    match_id IN (
      SELECT id FROM public.matches WHERE team_id IN (
        SELECT id FROM public.teams WHERE coach_id = auth.uid()
      )
    )
  );

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para matches
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION update_matches_updated_at(); 