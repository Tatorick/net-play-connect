-- Create friendly matches (topes) table
CREATE TABLE public.friendly_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  team_id UUID,
  club_id UUID,
  publication_type TEXT NOT NULL CHECK (publication_type IN ('busco_equipo', 'ofrezco_partido')),
  category TEXT NOT NULL,
  preferred_dates_start DATE,
  preferred_dates_end DATE,
  preferred_time_start TIME,
  preferred_time_end TIME,
  specific_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  match_format TEXT NOT NULL,
  additional_notes TEXT,
  expiration_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'expirado', 'cancelado', 'cerrado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.friendly_matches ENABLE ROW LEVEL SECURITY;

-- Create policies for friendly matches
CREATE POLICY "Coaches can view all active matches" 
ON public.friendly_matches 
FOR SELECT 
USING (status = 'activo' AND expiration_date >= CURRENT_DATE);

CREATE POLICY "Coaches can create their own match posts" 
ON public.friendly_matches 
FOR INSERT 
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own match posts" 
ON public.friendly_matches 
FOR UPDATE 
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their own match posts" 
ON public.friendly_matches 
FOR DELETE 
USING (auth.uid() = coach_id);

-- Create function to automatically expire old matches
CREATE OR REPLACE FUNCTION public.update_expired_matches()
RETURNS void AS $$
BEGIN
  UPDATE public.friendly_matches 
  SET status = 'expirado', updated_at = now()
  WHERE expiration_date < CURRENT_DATE AND status = 'activo';
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_friendly_matches_updated_at
BEFORE UPDATE ON public.friendly_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for match interest/responses
CREATE TABLE public.match_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.friendly_matches(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL,
  team_id UUID,
  club_id UUID,
  message TEXT,
  contact_info TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aceptado', 'rechazado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(match_id, coach_id)
);

-- Enable Row Level Security for match interests
ALTER TABLE public.match_interests ENABLE ROW LEVEL SECURITY;

-- Create policies for match interests
CREATE POLICY "Coaches can view interests for their own matches" 
ON public.match_interests 
FOR SELECT 
USING (
  auth.uid() = coach_id OR 
  EXISTS (
    SELECT 1 FROM public.friendly_matches fm 
    WHERE fm.id = match_interests.match_id AND fm.coach_id = auth.uid()
  )
);

CREATE POLICY "Coaches can create interests in matches" 
ON public.match_interests 
FOR INSERT 
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own interests" 
ON public.match_interests 
FOR UPDATE 
USING (auth.uid() = coach_id);

CREATE POLICY "Match owners can update interest status" 
ON public.match_interests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.friendly_matches fm 
    WHERE fm.id = match_interests.match_id AND fm.coach_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates on match interests
CREATE TRIGGER update_match_interests_updated_at
BEFORE UPDATE ON public.match_interests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();