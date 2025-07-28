import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamRegistrationForm } from '@/components/team/TeamRegistrationForm';
import { TeamsTable } from '@/components/team/TeamsTable';
import { Button } from '@/components/ui/button';
import { Trophy, Plus, Users, Target, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: string;
  name: string;
  category: string;
  coach_id: string;
  club_id: string;
  created_at: string;
  updated_at: string;
}

export default function MyTeam() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('coach_id', profile?.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los equipos",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTeams();
      setLoading(false);
    };

    loadData();
  }, [profile?.user_id]);

  const handleTeamSuccess = () => {
    setShowTeamForm(false);
    setEditingTeam(null);
    fetchTeams();
    toast({
      title: "Éxito",
      description: editingTeam ? "Equipo actualizado correctamente" : "Equipo creado correctamente"
    });
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este equipo? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      
      fetchTeams();
      toast({
        title: "Éxito",
        description: "Equipo eliminado correctamente"
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el equipo",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Equipos</h1>
          <p className="text-muted-foreground">Gestiona tus equipos de voleibol y sus configuraciones.</p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Equipos</p>
                  <p className="text-2xl font-bold">{teams.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Jugadores Totales</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Partidos Próximos</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Entrenamientos</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mis Equipos</CardTitle>
                <CardDescription>
                  Crea y gestiona tus equipos de voleibol. Los jugadores se asignan desde la sección de Jugadores.
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowTeamForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Crear Equipo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showTeamForm && (
              <div className="mb-6 p-4 border rounded-lg bg-muted/20">
                <TeamRegistrationForm
                  team={editingTeam}
                  onSuccess={handleTeamSuccess}
                  onCancel={() => {
                    setShowTeamForm(false);
                    setEditingTeam(null);
                  }}
                />
              </div>
            )}
            
            {teams.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No tienes equipos registrados</h3>
                <p className="text-sm mb-4">
                  Crea tu primer equipo para comenzar a gestionar tu club de voleibol.
                </p>
                <Button 
                  onClick={() => setShowTeamForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Crear Primer Equipo
                </Button>
              </div>
            ) : (
                              <TeamsTable
                  teams={teams}
                  onEdit={(team) => {
                    setEditingTeam(team as Team);
                    setShowTeamForm(true);
                  }}
                  onDelete={handleDeleteTeam}
                />
            )}
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Cómo funciona?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  1
                </div>
                <div>
                  <p className="font-medium">Crea tus equipos</p>
                  <p className="text-sm text-muted-foreground">Define categorías y configuraciones para cada equipo.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  2
                </div>
                <div>
                  <p className="font-medium">Registra jugadores</p>
                  <p className="text-sm text-muted-foreground">Ve a la sección de Jugadores para registrar y asignar jugadores a equipos.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  3
                </div>
                <div>
                  <p className="font-medium">Gestiona partidos</p>
                  <p className="text-sm text-muted-foreground">Organiza topes y partidos desde la sección de Partidos.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximas funcionalidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Estadísticas por equipo</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Calendario de entrenamientos</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Reportes de rendimiento</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Gestión de torneos</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}