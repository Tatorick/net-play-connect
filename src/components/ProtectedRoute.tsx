import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CoachPendingScreen from './CoachPendingScreen';
import CoachRequestStatusScreen from './CoachRequestStatusScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Cargando perfil...</h2>
          <p className="text-gray-600">Por favor, espera mientras cargamos tu información.</p>
        </div>
      </div>
    );
  }

  // Verificar estados específicos de cada tipo de usuario
  if (profile.role === 'coach_main') {
    const requestStatus = (profile as any).requestStatus;
    
    if (requestStatus === 'pending' || requestStatus === 'rejected') {
      return <CoachRequestStatusScreen />;
    }
    
    if (requestStatus !== 'approved') {
      // Si no hay solicitud, mostrar pantalla de estado
      return <CoachRequestStatusScreen />;
    }
  }

  if (profile.role === 'coach_team') {
    const assignmentStatus = (profile as any).assignmentStatus;
    
    if (assignmentStatus === 'pending') {
      return <CoachPendingScreen />;
    }
    
    if (assignmentStatus === 'rejected') {
      navigate('/access-denied');
      return null;
    }
    
    if (assignmentStatus !== 'approved') {
      return <CoachPendingScreen />;
    }
  }

  // Verificar roles requeridos
  if (requiredRoles && !requiredRoles.includes(profile.role)) {
    navigate('/access-denied');
    return null;
  }

  return <>{children}</>;
}