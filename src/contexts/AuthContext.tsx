import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  status?: string; // Estado de aprobación ('pending', 'approved', etc.)
  assignmentStatus?: string; // Nuevo campo para el estado de la asignación
  requestStatus?: string; // Nuevo campo para el estado de la solicitud de coach_main
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116' && error.message?.includes('no rows returned')) {
          toast({
            title: 'Perfil no encontrado',
            description: 'No se encontró un perfil para este usuario. Por favor, completa tu información.',
            variant: 'default',
          });
        } else {
          toast({
            title: 'Error al cargar el perfil',
            description: error.message || 'No se pudo cargar el perfil del usuario.',
            variant: 'destructive',
          });
        }
        return;
      }

      console.log('Perfil cargado:', data);
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error al cargar el perfil',
        description: error.message || 'No se pudo cargar el perfil del usuario.',
        variant: 'destructive',
      });
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error al cerrar sesión',
        description: error.message || 'No se pudo cerrar la sesión.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile data after user signs in
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Polling para refrescar estado cuando el usuario está pendiente
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (profile && profile.status === 'pending' && user) {
      interval = setInterval(() => {
        console.log('Refrescando perfil...');
        fetchProfile(user.id);
      }, 5000); // cada 5 segundos
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [profile, user]);

  const value = {
    user,
    profile,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}