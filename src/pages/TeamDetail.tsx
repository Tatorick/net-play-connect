import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, ArrowLeft } from 'lucide-react';
import { PlayersTable } from '@/components/team/PlayersTable';
import { PlayerRegistrationForm } from '@/components/team/PlayerRegistrationForm';
import { useToast } from '@/hooks/use-toast';

export default function TeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [coachName, setCoachName] = useState<string>("");

  useEffect(() => {
    const fetchTeamAndPlayers = async () => {
      setLoading(true);
      try {
        // Obtener datos del equipo
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .single();
        if (teamError) throw teamError;
        setTeam(teamData);
        // Obtener nombre del entrenador principal
        if (teamData?.coach_id) {
          const { data: coachProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', teamData.coach_id)
            .single();
          setCoachName(coachProfile?.full_name || teamData.coach_id);
        } else {
          setCoachName('');
        }
        // Obtener jugadoras asociadas
        const { data: playerTeams, error: ptError } = await supabase
          .from('player_teams')
          .select('player_id')
          .eq('team_id', teamId);
        if (ptError) throw ptError;
        const playerIds = (playerTeams || []).map(pt => pt.player_id);
        let playersList: any[] = [];
        if (playerIds.length > 0) {
          const { data: playersData } = await supabase
            .from('players')
            .select('*')
            .in('id', playerIds);
          playersList = playersData || [];
        }
        setPlayers(playersList);
      } catch (error) {
        toast({ title: 'Error', description: 'No se pudo cargar el equipo o jugadoras', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchTeamAndPlayers();
  }, [teamId, toast]);

  const handlePlayerSuccess = () => {
    setShowPlayerForm(false);
    setEditingPlayer(null);
    // Refrescar jugadores
    setLoading(true);
    supabase
      .from('player_teams')
      .select('player_id')
      .eq('team_id', teamId)
      .then(({ data: playerTeams }) => {
        const playerIds = (playerTeams || []).map(pt => pt.player_id);
        if (playerIds.length > 0) {
          supabase
            .from('players')
            .select('*')
            .in('id', playerIds)
            .then(({ data: playersData }) => {
              setPlayers(playersData || []);
              setLoading(false);
            });
        } else {
          setPlayers([]);
          setLoading(false);
        }
      });
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      await supabase.from('player_teams').delete().eq('player_id', playerId).eq('team_id', teamId);
      setPlayers(players.filter(p => p.id !== playerId));
      toast({ title: 'Éxito', description: 'Jugadora eliminada del equipo' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar la jugadora', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6 text-center">Cargando equipo...</div>
      </Layout>
    );
  }

  if (!team) {
    return (
      <Layout>
        <div className="container mx-auto p-6 text-center">Equipo no encontrado</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver a equipos
        </Button>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{team.name}</CardTitle>
            <CardDescription>Categoría: {team.category}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Entrenador principal: {coachName}</div>
          </CardContent>
        </Card>
        <Tabs defaultValue="players" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="players">Jugadoras</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="capture">Captura</TabsTrigger>
          </TabsList>
          <TabsContent value="players">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Jugadoras del equipo</h2>
              <Button onClick={() => setShowPlayerForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Añadir Jugadora
              </Button>
            </div>
            {showPlayerForm && (
              <div className="mb-6 p-4 border rounded-lg">
                <PlayerRegistrationForm
                  player={editingPlayer}
                  teams={[team]}
                  onSuccess={handlePlayerSuccess}
                  onCancel={() => {
                    setShowPlayerForm(false);
                    setEditingPlayer(null);
                  }}
                />
              </div>
            )}
            <PlayersTable
              players={players}
              onEdit={(player) => {
                setEditingPlayer(player);
                setShowPlayerForm(true);
              }}
              onDelete={handleDeletePlayer}
            />
          </TabsContent>
          <TabsContent value="stats">
            <div className="py-8 text-center text-muted-foreground">
              <h2 className="text-xl font-bold mb-2">Estadísticas del equipo</h2>
              <p>Próximamente: estadísticas avanzadas del equipo y jugadoras.</p>
            </div>
          </TabsContent>
          <TabsContent value="capture">
            <div className="py-8 text-center text-muted-foreground">
              <h2 className="text-xl font-bold mb-2">Captura de estadísticas</h2>
              <p>Próximamente: módulo para capturar estadísticas en tiempo real.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
} 