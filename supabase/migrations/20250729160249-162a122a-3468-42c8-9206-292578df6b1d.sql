-- Agregar el rol coach_team a los perfiles existentes si no existe
DO $$
BEGIN
  -- No necesitamos crear un enum, solo asegurar que el rol coach_team pueda existir
  -- Agregar trigger para manejar el rol coach_team en el registro automático
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER 
  SET search_path = ''
  AS $function$
  BEGIN
    INSERT INTO public.profiles (user_id, full_name, role)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuario'),
      COALESCE(NEW.raw_user_meta_data ->> 'role', 'coach_main')
    );
    RETURN NEW;
  END;
  $function$;

  -- Crear tabla para manejar solicitudes de coach_main con más detalle
  CREATE TABLE IF NOT EXISTS public.coach_main_request_details (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID NOT NULL,
    rejection_reason TEXT,
    additional_info TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );

  -- Enable RLS on the new table
  ALTER TABLE public.coach_main_request_details ENABLE ROW LEVEL SECURITY;

  -- Policies for coach_main_request_details
  CREATE POLICY "Users can view their own request details" 
  ON public.coach_main_request_details 
  FOR SELECT 
  USING (
    request_id IN (
      SELECT id FROM coach_main_requests 
      WHERE user_id = auth.uid()
    )
  );

  CREATE POLICY "Users can update their own request details" 
  ON public.coach_main_request_details 
  FOR UPDATE 
  USING (
    request_id IN (
      SELECT id FROM coach_main_requests 
      WHERE user_id = auth.uid()
    )
  );

  CREATE POLICY "Admins can manage all request details" 
  ON public.coach_main_request_details 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

  -- Add trigger for updating timestamps
  CREATE TRIGGER update_coach_main_request_details_updated_at
  BEFORE UPDATE ON public.coach_main_request_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

  -- Update clubs table to allow club_code regeneration
  ALTER TABLE public.clubs 
  ADD COLUMN IF NOT EXISTS code_regenerated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

  -- Create function to regenerate club code
  CREATE OR REPLACE FUNCTION public.regenerate_club_code(club_id_param UUID)
  RETURNS TEXT
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
  DECLARE
    club_name TEXT;
    new_code TEXT;
    prefix TEXT;
    random_part TEXT;
  BEGIN
    -- Get club name
    SELECT name INTO club_name 
    FROM public.clubs 
    WHERE id = club_id_param;
    
    IF club_name IS NULL THEN
      RAISE EXCEPTION 'Club not found';
    END IF;
    
    -- Generate new code
    prefix := upper(left(club_name, 6));
    random_part := substr(md5(random()::text || extract(epoch from now())::text), 1, 6);
    new_code := prefix || '-' || random_part;
    
    -- Update club with new code
    UPDATE public.clubs 
    SET club_code = new_code, 
        code_regenerated_at = now(),
        updated_at = now()
    WHERE id = club_id_param;
    
    RETURN new_code;
  END;
  $function$;

  -- Create RLS policy for club code regeneration
  CREATE POLICY "Club representatives can regenerate club code" 
  ON public.clubs 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM club_representatives 
      WHERE club_id = clubs.id AND user_id = auth.uid()
    )
  );

END $$;