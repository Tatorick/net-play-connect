-- Script para aplicar la migración manualmente en Supabase Dashboard
-- Copia y pega este contenido en el SQL Editor de Supabase

-- Agregar campo status a profiles si no existe
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Crear tabla para solicitudes de entrenadores principales
CREATE TABLE IF NOT EXISTS public.coach_main_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, club_id)
);

-- Crear tabla para asignaciones de entrenadores secundarios
CREATE TABLE IF NOT EXISTS public.club_coach_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  coach_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(club_id, coach_user_id)
);

-- Habilitar RLS
ALTER TABLE public.coach_main_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_coach_assignments ENABLE ROW LEVEL SECURITY;

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Eliminar políticas existentes si existen (para evitar duplicados)
DROP POLICY IF EXISTS "Admins can view all coach main requests" ON public.coach_main_requests;
DROP POLICY IF EXISTS "Admins can update coach main requests" ON public.coach_main_requests;
DROP POLICY IF EXISTS "Users can create their own coach main requests" ON public.coach_main_requests;
DROP POLICY IF EXISTS "Users can view their own coach main requests" ON public.coach_main_requests;

DROP POLICY IF EXISTS "Club coaches can view assignments for their club" ON public.club_coach_assignments;
DROP POLICY IF EXISTS "Club coaches can update assignments for their club" ON public.club_coach_assignments;
DROP POLICY IF EXISTS "Users can create their own club assignments" ON public.club_coach_assignments;
DROP POLICY IF EXISTS "Users can view their own club assignments" ON public.club_coach_assignments;

-- Políticas para coach_main_requests
CREATE POLICY "Admins can view all coach main requests" 
ON public.coach_main_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update coach main requests" 
ON public.coach_main_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can create their own coach main requests" 
ON public.coach_main_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own coach main requests" 
ON public.coach_main_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Políticas para club_coach_assignments
-- Los entrenadores principales pueden ver las asignaciones de su club
CREATE POLICY "Club coaches can view assignments for their club" 
ON public.club_coach_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.coach_main_requests cmr
    WHERE cmr.club_id = club_coach_assignments.club_id 
    AND cmr.user_id = auth.uid()
    AND cmr.status = 'approved'
  )
);

CREATE POLICY "Club coaches can update assignments for their club" 
ON public.club_coach_assignments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.coach_main_requests cmr
    WHERE cmr.club_id = club_coach_assignments.club_id 
    AND cmr.user_id = auth.uid()
    AND cmr.status = 'approved'
  )
);

CREATE POLICY "Users can create their own club assignments" 
ON public.club_coach_assignments 
FOR INSERT 
WITH CHECK (auth.uid() = coach_user_id);

CREATE POLICY "Users can view their own club assignments" 
ON public.club_coach_assignments 
FOR SELECT 
USING (auth.uid() = coach_user_id);

-- Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS update_coach_main_requests_updated_at ON public.coach_main_requests;
DROP TRIGGER IF EXISTS update_club_coach_assignments_updated_at ON public.club_coach_assignments;

-- Crear triggers para actualizar timestamps
CREATE TRIGGER update_coach_main_requests_updated_at
    BEFORE UPDATE ON public.coach_main_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_club_coach_assignments_updated_at
    BEFORE UPDATE ON public.club_coach_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column(); 