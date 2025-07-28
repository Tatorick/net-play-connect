import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Trophy, Target, TrendingUp, Activity, Calendar, MapPin } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  category: string;
}

interface Player {
  id: string;
  full_name: string;
  position: string;
  jersey_number: number;
  birthdate: string;
  altura?: number;
  peso?: number;
  alcance_ataque?: number;
  alcance_bloqueo?: number;
  salto_vertical?: number;
  velocidad_30m?: number;
}

interface TeamStatsData {
  team: Team;
  totalPlayers: number;
  averageAge: number;
  positionDistribution: Record<string, number>;
  physicalMetrics: {
    averageHeight: number;
    averageWeight: number;
    averageReach: number;
    averageJump: number;
    averageSpeed: number;
  };
  topPerformers: Player[];
}

export function TeamStats() {
  const { profile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [teamStats, setTeamStats] = useState<TeamStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.user_id) {
      fetchTeams();
    }
  }, [profile?.user_id]);

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamStats(selectedTeam);
    } else {
      setTeamStats(null);
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

  const fetchTeamStats = async (teamId: string) => {
    try {
      const { data: players, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId)
        .order('full_name');

      if (error) throw error;

      const team = teams.find(t => t.id === teamId);
      if (!team || !players) return;

      const stats = calculateTeamStats(team, players);
      setTeamStats(stats);
    } catch (error) {
      console.error('Error fetching team stats:', error);
    }
  };

  const calculateTeamStats = (team: Team, players: Player[]): TeamStatsData => {
    // Distribución de posiciones
    const positionDistribution: Record<string, number> = {};
    players.forEach(player => {
      positionDistribution[player.position] = (positionDistribution[player.position] || 0) + 1;
    });

    // Calcular edad promedio
    const totalAge = players.reduce((sum, player) => {
      const age = calculateAge(player.birthdate);
      return sum + age;
    }, 0);
    const averageAge = players.length > 0 ? Math.round(totalAge / players.length) : 0;

    // Métricas físicas promedio
    const playersWithHeight = players.filter(p => p.altura);
    const playersWithWeight = players.filter(p => p.peso);
    const playersWithReach = players.filter(p => p.alcance_ataque);
    const playersWithJump = players.filter(p => p.salto_vertical);
    const playersWithSpeed = players.filter(p => p.velocidad_30m);

    const averageHeight = playersWithHeight.length > 0 
      ? playersWithHeight.reduce((sum, p) => sum + (p.altura || 0), 0) / playersWithHeight.length 
      : 0;
    
    const averageWeight = playersWithWeight.length > 0 
      ? playersWithWeight.reduce((sum, p) => sum + (p.peso || 0), 0) / playersWithWeight.length 
      : 0;
    
    const averageReach = playersWithReach.length > 0 
      ? playersWithReach.reduce((sum, p) => sum + (p.alcance_ataque || 0), 0) / playersWithReach.length 
      : 0;
    
    const averageJump = playersWithJump.length > 0 
      ? playersWithJump.reduce((sum, p) => sum + (p.salto_vertical || 0), 0) / playersWithJump.length 
      : 0;
    
    const averageSpeed = playersWithSpeed.length > 0 
      ? playersWithSpeed.reduce((sum, p) => sum + (p.velocidad_30m || 0), 0) / playersWithSpeed.length 
      : 0;

    // Top performers (jugadores con mejor puntuación física)
    const topPerformers = players
      .filter(p => p.altura || p.alcance_ataque || p.salto_vertical)
      .sort((a, b) => calculatePhysicalScore(b) - calculatePhysicalScore(a))
      .slice(0, 3);

    return {
      team,
      totalPlayers: players.length,
      averageAge,
      positionDistribution,
      physicalMetrics: {
        averageHeight,
        averageWeight,
        averageReach,
        averageJump,
        averageSpeed
      },
      topPerformers
    };
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

  const calculatePhysicalScore = (player: Player): number => {
    let score = 0;
    let totalMetrics = 0;

    if (player.altura) {
      const heightScore = Math.min((player.altura - 1.5) / 0.5 * 25, 25);
      score += heightScore;
      totalMetrics++;
    }

    if (player.alcance_ataque) {
      const reachScore = Math.min((player.alcance_ataque - 2.0) / 1.0 * 25, 25);
      score += reachScore;
      totalMetrics++;
    }

    if (player.salto_vertical) {
      const jumpScore = Math.min((player.salto_vertical - 0.2) / 0.6 * 25, 25);
      score += jumpScore;
      totalMetrics++;
    }

    if (player.velocidad_30m) {
      const speedScore = Math.min((8.0 - player.velocidad_30m) / 4.0 * 25, 25);
      score += speedScore;
      totalMetrics++;
    }

    return totalMetrics > 0 ? Math.round(score / totalMetrics) : 0;
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
          <CardTitle>Seleccionar Equipo</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {teamStats && (
        <>
          {/* Información general del equipo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Jugadores</p>
                    <p className="text-2xl font-bold">{teamStats.totalPlayers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Edad Promedio</p>
                    <p className="text-2xl font-bold">{teamStats.averageAge} años</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Altura Promedio</p>
                    <p className="text-2xl font-bold">
                      {teamStats.physicalMetrics.averageHeight > 0 
                        ? `${teamStats.physicalMetrics.averageHeight.toFixed(2)}m`
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Alcance Promedio</p>
                    <p className="text-2xl font-bold">
                      {teamStats.physicalMetrics.averageReach > 0 
                        ? `${teamStats.physicalMetrics.averageReach.toFixed(2)}m`
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribución de posiciones */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Posiciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(teamStats.positionDistribution).map(([position, count]) => (
                  <div key={position} className="text-center">
                    <Badge className={getPositionColor(position)}>
                      {position}
                    </Badge>
                    <div className="text-2xl font-bold mt-2">{count}</div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round((count / teamStats.totalPlayers) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métricas físicas detalladas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas Físicas del Equipo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamStats.physicalMetrics.averageHeight > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Altura Promedio</span>
                      <span>{teamStats.physicalMetrics.averageHeight.toFixed(2)}m</span>
                    </div>
                    <Progress 
                      value={(teamStats.physicalMetrics.averageHeight - 1.5) / 0.5 * 100} 
                      className="h-2"
                    />
                  </div>
                )}
                {teamStats.physicalMetrics.averageWeight > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Peso Promedio</span>
                      <span>{teamStats.physicalMetrics.averageWeight.toFixed(1)}kg</span>
                    </div>
                    <Progress 
                      value={(teamStats.physicalMetrics.averageWeight - 40) / 60 * 100} 
                      className="h-2"
                    />
                  </div>
                )}
                {teamStats.physicalMetrics.averageReach > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Alcance Promedio</span>
                      <span>{teamStats.physicalMetrics.averageReach.toFixed(2)}m</span>
                    </div>
                    <Progress 
                      value={(teamStats.physicalMetrics.averageReach - 2.0) / 1.0 * 100} 
                      className="h-2"
                    />
                  </div>
                )}
                {teamStats.physicalMetrics.averageJump > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Salto Promedio</span>
                      <span>{teamStats.physicalMetrics.averageJump.toFixed(2)}m</span>
                    </div>
                    <Progress 
                      value={(teamStats.physicalMetrics.averageJump - 0.2) / 0.6 * 100} 
                      className="h-2"
                    />
                  </div>
                )}
                {teamStats.physicalMetrics.averageSpeed > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Velocidad Promedio</span>
                      <span>{teamStats.physicalMetrics.averageSpeed.toFixed(1)}s</span>
                    </div>
                    <Progress 
                      value={(8.0 - teamStats.physicalMetrics.averageSpeed) / 4.0 * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top performers */}
            <Card>
              <CardHeader>
                <CardTitle>Mejores Rendimientos Físicos</CardTitle>
              </CardHeader>
              <CardContent>
                {teamStats.topPerformers.length > 0 ? (
                  <div className="space-y-3">
                    {teamStats.topPerformers.map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{player.full_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {player.position} • #{player.jersey_number}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {calculatePhysicalScore(player)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Puntuación</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No hay datos físicos suficientes</div>
                    <div className="text-xs mt-1">Registra mediciones de jugadores para ver rankings</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Análisis y recomendaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis del Equipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Fortalezas</h4>
                  <div className="space-y-2">
                    {teamStats.physicalMetrics.averageHeight > 1.75 && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Buena altura promedio para bloqueo y ataque</span>
                      </div>
                    )}
                    {teamStats.physicalMetrics.averageReach > 2.6 && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Excelente alcance de ataque</span>
                      </div>
                    )}
                    {teamStats.averageAge >= 16 && teamStats.averageAge <= 18 && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Edad ideal para desarrollo técnico</span>
                      </div>
                    )}
                    {Object.keys(teamStats.positionDistribution).length >= 4 && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Buena distribución de posiciones</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Áreas de Mejora</h4>
                  <div className="space-y-2">
                    {teamStats.physicalMetrics.averageHeight < 1.65 && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span>Considerar ejercicios de salto y técnica</span>
                      </div>
                    )}
                    {teamStats.physicalMetrics.averageReach < 2.4 && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span>Trabajar en ejercicios de alcance</span>
                      </div>
                    )}
                    {teamStats.physicalMetrics.averageSpeed > 6.0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span>Mejorar velocidad con entrenamientos específicos</span>
                      </div>
                    )}
                    {teamStats.totalPlayers < 8 && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span>Considerar agregar más jugadores al equipo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Mensaje cuando no hay equipo seleccionado */}
      {!teamStats && teams.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Trophy className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Selecciona un equipo</h3>
            <p className="text-sm">Elige un equipo para ver sus estadísticas detalladas</p>
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay equipos */}
      {teams.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Trophy className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay equipos registrados</h3>
            <p className="text-sm">Crea equipos desde la sección de Equipos para ver estadísticas</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}