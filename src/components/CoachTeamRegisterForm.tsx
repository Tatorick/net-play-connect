import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, ArrowLeft, Key } from 'lucide-react';

interface CoachTeamRegisterFormProps {
  onBack: () => void;
}

export default function CoachTeamRegisterForm({ onBack }: CoachTeamRegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    clubCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Verificar que el código de club existe
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select('id, name')
        .eq('club_code', formData.clubCode)
        .single();

      if (clubError || !club) {
        throw new Error('Código de club inválido. Verifica con tu entrenador principal.');
      }

      // 2. Registrar el usuario
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            role: 'coach_team'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 3. Crear solicitud de asignación al club
        const { error: assignmentError } = await supabase
          .from('club_coach_assignments')
          .insert([{
            club_id: club.id,
            coach_user_id: authData.user.id,
            status: 'pending'
          }]);

        if (assignmentError) throw assignmentError;

        setSuccess(`¡Registro exitoso! Tu solicitud para unirte al club "${club.name}" ha sido enviada. El entrenador principal debe aprobar tu acceso.`);
        
        toast({
          title: 'Registro exitoso',
          description: 'Tu solicitud ha sido enviada para aprobación',
        });
      }
    } catch (error: any) {
      console.error('Error en el registro:', error);
      toast({
        title: 'Error en el registro',
        description: error.message || 'Ha ocurrido un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">¡Registro Exitoso!</CardTitle>
          <CardDescription>{success}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Registro de Entrenador Secundario
        </CardTitle>
        <CardDescription>
          Completa tu información para unirte a un club existente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirma tu contraseña"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clubCode" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Código de Club *
              </Label>
              <Input
                id="clubCode"
                type="text"
                value={formData.clubCode}
                onChange={(e) => handleInputChange('clubCode', e.target.value.toUpperCase())}
                placeholder="Ej: VOLEIP-A1B2C3"
                className="font-mono"
                required
              />
              <p className="text-sm text-muted-foreground">
                Solicita este código a tu entrenador principal
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}