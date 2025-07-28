import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Target, TrendingUp, Activity, Ruler, Weight, Zap } from 'lucide-react';

interface Player {
  id: string;
  full_name: string;
  jersey_number: number;
  position: string;
  team_id: string;
  birthdate: string;
  teams?: { name: string }[];
  // Campos físicos
  altura?: number;
  peso?: number;
  alcance_ataque?: number;
  alcance_bloqueo?: number;
  salto_vertical?: number;
  salto_horizontal?: number;
  velocidad_30m?: number;
  fecha_medicion?: string;
}

interface Team {
  id: string;
  name: string;
  category: string;
}

interface PlayerStatsData {
  player: Player;
  physicalScore: number;
  performanceMetrics: {
    height: number;
    weight: number;
    reach: number;
    jump: number;
    speed: number;
  };
  recommendations: string[];
}

export function PlayerStats() {
  const { profile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.user_id) {
      fetchTeams();
    }
  }, [profile?.user_id]);

  useEffect(() => {
    if (selectedTeam) {
      fetchPlayers(selectedTeam);
    } else {
      setPlayers([]);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('coach_id', profile?.user_id)
        .order('name');

      if (error) throw error;
      setTeams(data || []);
      if (data && data.length > 0) {
        setSelectedTeam(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          player_teams(
            team:teams(
              id,
              name,
              category
            )
          )
        `)
        .eq('team_id', teamId)
        .order('full_name');

      if (error) throw error;
      
      // Transformar los datos
      const transformedPlayers = (data || []).map(player => ({
        ...player,
        teams: player.player_teams?.map((pt: any) => pt.team).filter(Boolean) || []
      })) as Player[];

      setPlayers(transformedPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const calculatePhysicalScore = (player: Player): number => {
    let score = 0;
    let totalMetrics = 0;

    // Altura (0-25 puntos)
    if (player.altura) {
      const heightScore = Math.min((player.altura - 1.5) / 0.5 * 25, 25);
      score += heightScore;
      totalMetrics++;
    }

    // Alcance de ataque (0-25 puntos)
    if (player.alcance_ataque) {
      const reachScore = Math.min((player.alcance_ataque - 2.0) / 1.0 * 25, 25);
      score += reachScore;
      totalMetrics++;
    }

    // Salto vertical (0-25 puntos)
    if (player.salto_vertical) {
      const jumpScore = Math.min((player.salto_vertical - 0.2) / 0.6 * 25, 25);
      score += jumpScore;
      totalMetrics++;
    }

    // Velocidad (0-25 puntos)
    if (player.velocidad_30m) {
      const speedScore = Math.min((8.0 - player.velocidad_30m) / 4.0 * 25, 25);
      score += speedScore;
      totalMetrics++;
    }

    return totalMetrics > 0 ? Math.round(score / totalMetrics) : 0;
  };

  const getPerformanceMetrics = (player: Player) => {
    return {
      height: player.altura ? Math.min((player.altura - 1.5) / 0.5 * 100, 100) : 0,
      weight: player.peso ? Math.min((player.peso - 40) / 60 * 100, 100) : 0,
      reach: player.alcance_ataque ? Math.min((player.alcance_ataque - 2.0) / 1.0 * 100, 100) : 0,
      jump: player.salto_vertical ? Math.min((player.salto_vertical - 0.2) / 0.6 * 100, 100) : 0,
      speed: player.velocidad_30m ? Math.min((8.0 - player.velocidad_30m) / 4.0 * 100, 100) : 0,
    };
  };

  const getRecommendations = (player: Player): string[] => {
    const recommendations: string[] = [];

    if (!player.altura) {
      recommendations.push("Registrar altura para análisis completo");
    }
    if (!player.alcance_ataque) {
      recommendations.push("Medir alcance de ataque para evaluar potencial");
    }
    if (!player.salto_vertical) {
      recommendations.push("Evaluar salto vertical para mejorar rendimiento");
    }
    if (!player.velocidad_30m) {
      recommendations.push("Test de velocidad para análisis de movilidad");
    }

    // Recomendaciones específicas basadas en datos
    if (player.altura && player.altura < 1.65) {
      recommendations.push("Enfoque en técnica y velocidad para compensar altura");
    }
    if (player.alcance_ataque && player.alcance_ataque < 2.5) {
      recommendations.push("Trabajar en ejercicios de alcance y salto");
    }
    if (player.velocidad_30m && player.velocidad_30m > 6.0) {
      recommendations.push("Mejorar velocidad con ejercicios específicos");
    }

    return recommendations;
  };

  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      "Colocador": "bg-blue-100 text-blue-700",
      "Libero": "bg-yellow-100 text-yellow-700",
      "Central": "bg-green-100 text-green-700",
      "Punta": "bg-purple-100 text-purple-700",
      "Opuesto": "bg-red-100 text-red-700",
      "Otro": "bg-gray-100 text-gray-700"
    };
    return colors[position] || "bg-gray-100 text-gray-700";
  };

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Equipo</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un equipo" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} ({team.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Jugadores</p>
                <p className="text-2xl font-bold">{players.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Con Datos Físicos</p>
                <p className="text-2xl font-bold">
                  {players.filter(p => p.altura || p.alcance_ataque || p.salto_vertical).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Promedio Físico</p>
                <p className="text-2xl font-bold">
                  {players.length > 0 
                    ? Math.round(players.reduce((acc, p) => acc + calculatePhysicalScore(p), 0) / players.length)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de jugadores con estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {players.map((player) => {
          const physicalScore = calculatePhysicalScore(player);
          const metrics = getPerformanceMetrics(player);
          const recommendations = getRecommendations(player);
          const hasPhysicalData = player.altura || player.alcance_ataque || player.salto_vertical;

          return (
            <Card key={player.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{player.full_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getPositionColor(player.position)}>
                        {player.position}
                      </Badge>
                      <Badge variant="secondary">#{player.jersey_number}</Badge>
                      {player.birthdate && (
                        <Badge variant="outline">
                          {calculateAge(player.birthdate)} años
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{physicalScore}%</div>
                    <div className="text-sm text-muted-foreground">Puntuación Física</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Métricas físicas */}
                {hasPhysicalData && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Métricas Físicas</h4>
                    <div className="space-y-2">
                      {player.altura && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Altura</span>
                            <span>{player.altura}m</span>
                          </div>
                          <Progress value={metrics.height} className="h-2" />
                        </div>
                      )}
                      {player.alcance_ataque && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Alcance Ataque</span>
                            <span>{player.alcance_ataque}m</span>
                          </div>
                          <Progress value={metrics.reach} className="h-2" />
                        </div>
                      )}
                      {player.salto_vertical && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Salto Vertical</span>
                            <span>{player.salto_vertical}m</span>
                          </div>
                          <Progress value={metrics.jump} className="h-2" />
                        </div>
                      )}
                      {player.velocidad_30m && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Velocidad 30m</span>
                            <span>{player.velocidad_30m}s</span>
                          </div>
                          <Progress value={metrics.speed} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recomendaciones */}
                {recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Recomendaciones</h4>
                    <div className="space-y-1">
                      {recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-primary"></div>
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sin datos físicos */}
                {!hasPhysicalData && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">Sin datos físicos registrados</div>
                    <div className="text-xs mt-1">Registra mediciones para ver estadísticas</div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mensaje cuando no hay jugadores */}
      {players.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay jugadores en este equipo</h3>
            <p className="text-sm">Agrega jugadores desde la sección de Jugadores para ver estadísticas</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}