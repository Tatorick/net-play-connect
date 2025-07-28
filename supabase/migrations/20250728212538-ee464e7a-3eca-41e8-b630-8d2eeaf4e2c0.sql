-- Fix critical security issue: Enable RLS on player_teams table
ALTER TABLE public.player_teams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for player_teams
CREATE POLICY "Coaches can view players for their teams"
ON public.player_teams
FOR SELECT
USING (
  team_id IN (
    SELECT id FROM teams WHERE coach_id = auth.uid()
  )
);

CREATE POLICY "Coaches can assign players to their teams"
ON public.player_teams
FOR INSERT
WITH CHECK (
  team_id IN (
    SELECT id FROM teams WHERE coach_id = auth.uid()
  )
);

CREATE POLICY "Coaches can remove players from their teams"
ON public.player_teams
FOR DELETE
USING (
  team_id IN (
    SELECT id FROM teams WHERE coach_id = auth.uid()
  )
);

-- Fix function security issues by setting search_path
CREATE OR REPLACE FUNCTION public.generate_club_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  prefix text;
  random_part text;
BEGIN
  prefix := upper(left(NEW.name, 6));
  random_part := substr(md5(random()::text), 1, 6);
  NEW.club_code := prefix || '-' || random_part;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_expired_matches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.friendly_matches 
  SET status = 'expirado', updated_at = now()
  WHERE expiration_date < CURRENT_DATE AND status = 'activo';
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_topes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_topes_registros_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_matches_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;