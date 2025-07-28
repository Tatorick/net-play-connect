import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Download, BarChart3, Users, Target, TrendingUp, Calendar, Filter } from 'lucide-react';

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
  fecha_medicion?: string;
}

interface ReportData {
  team: Team;
  players: Player[];
  summary: {
    totalPlayers: number;
    averageAge: number;
    playersWithPhysicalData: number;
    averageHeight: number;
    averageReach: number;
    averageJump: number;
    averageSpeed: number;
  };
  positionAnalysis: Record<string, {
    count: number;
    averageHeight: number;
    averageReach: number;
    topPlayer: Player | null;
  }>;
  recommendations: string[];
}

export function StatsReports() {
  const { profile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    if (profile?.user_id) {
      fetchTeams();
    }
  }, [profile?.user_id]);

  useEffect(() => {
    if (selectedTeam) {
      generateReport(selectedTeam);
    } else {
      setReportData(null);
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

  const generateReport = async (teamId: string) => {
    try {
      setGeneratingReport(true);
      const { data: players, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId)
        .order('full_name');

      if (error) throw error;

      const team = teams.find(t => t.id === teamId);
      if (!team || !players) return;

      const report = createReportData(team, players);
      setReportData(report);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const createReportData = (team: Team, players: Player[]): ReportData => {
    // Calcular resumen
    const totalPlayers = players.length;
    const averageAge = players.length > 0 
      ? Math.round(players.reduce((sum, p) => sum + calculateAge(p.birthdate), 0) / players.length)
      : 0;
    
    const playersWithPhysicalData = players.filter(p => 
      p.altura || p.alcance_ataque || p.salto_vertical || p.velocidad_30m
    ).length;

    const playersWithHeight = players.filter(p => p.altura);
    const playersWithReach = players.filter(p => p.alcance_ataque);
    const playersWithJump = players.filter(p => p.salto_vertical);
    const playersWithSpeed = players.filter(p => p.velocidad_30m);

    const averageHeight = playersWithHeight.length > 0 
      ? playersWithHeight.reduce((sum, p) => sum + (p.altura || 0), 0) / playersWithHeight.length 
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

    // Análisis por posición
    const positionAnalysis: Record<string, any> = {};
    const positions = [...new Set(players.map(p => p.position))];
    
    positions.forEach(position => {
      const positionPlayers = players.filter(p => p.position === position);
      const positionPlayersWithHeight = positionPlayers.filter(p => p.altura);
      const positionPlayersWithReach = positionPlayers.filter(p => p.alcance_ataque);
      
      const avgHeight = positionPlayersWithHeight.length > 0 
        ? positionPlayersWithHeight.reduce((sum, p) => sum + (p.altura || 0), 0) / positionPlayersWithHeight.length 
        : 0;
      
      const avgReach = positionPlayersWithReach.length > 0 
        ? positionPlayersWithReach.reduce((sum, p) => sum + (p.alcance_ataque || 0), 0) / positionPlayersWithReach.length 
        : 0;

      const topPlayer = positionPlayers
        .filter(p => p.altura || p.alcance_ataque || p.salto_vertical)
        .sort((a, b) => calculatePhysicalScore(b) - calculatePhysicalScore(a))[0] || null;

      positionAnalysis[position] = {
        count: positionPlayers.length,
        averageHeight: avgHeight,
        averageReach: avgReach,
        topPlayer
      };
    });

    // Recomendaciones
    const recommendations: string[] = [];
    
    if (playersWithPhysicalData < totalPlayers * 0.5) {
      recommendations.push("Completar mediciones físicas de todos los jugadores para análisis completo");
    }
    
    if (averageHeight < 1.65) {
      recommendations.push("Implementar programa de desarrollo de salto y técnica para compensar altura");
    }
    
    if (averageReach < 2.4) {
      recommendations.push("Trabajar en ejercicios específicos para mejorar alcance de ataque");
    }
    
    if (averageSpeed > 6.0) {
      recommendations.push("Desarrollar programa de velocidad y agilidad");
    }
    
    if (totalPlayers < 8) {
      recommendations.push("Considerar agregar más jugadores para tener rotaciones completas");
    }

    return {
      team,
      players,
      summary: {
        totalPlayers,
        averageAge,
        playersWithPhysicalData,
        averageHeight,
        averageReach,
        averageJump,
        averageSpeed
      },
      positionAnalysis,
      recommendations
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

  const handleExportPDF = () => {
    // Implementar exportación a PDF
    console.log('Exportando a PDF...');
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    
    const csvData = [
      ['Nombre', 'Posición', 'Número', 'Edad', 'Altura', 'Alcance Ataque', 'Salto Vertical', 'Velocidad 30m', 'Puntuación Física'],
      ...reportData.players.map(player => [
        player.full_name,
        player.position,
        player.jersey_number.toString(),
        calculateAge(player.birthdate).toString(),
        player.altura?.toString() || 'N/A',
        player.alcance_ataque?.toString() || 'N/A',
        player.salto_vertical?.toString() || 'N/A',
        player.velocidad_30m?.toString() || 'N/A',
        calculatePhysicalScore(player).toString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${reportData.team.name}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    // Implementar exportación a Excel
    console.log('Exportando a Excel...');
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
      {/* Filtros y controles */}
      <Card>
        <CardHeader>
          <CardTitle>Generar Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
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
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportCSV}
                disabled={!reportData}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                disabled={!reportData}
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportExcel}
                disabled={!reportData}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {generatingReport && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
            Generando reporte...
          </CardContent>
        </Card>
      )}

      {reportData && (
        <>
          {/* Resumen ejecutivo */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen Ejecutivo - {reportData.team.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{reportData.summary.totalPlayers}</div>
                  <div className="text-sm text-muted-foreground">Total Jugadores</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{reportData.summary.averageAge}</div>
                  <div className="text-sm text-muted-foreground">Edad Promedio</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">
                    {reportData.summary.averageHeight > 0 
                      ? `${reportData.summary.averageHeight.toFixed(2)}m`
                      : 'N/A'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Altura Promedio</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold">
                    {reportData.summary.averageReach > 0 
                      ? `${reportData.summary.averageReach.toFixed(2)}m`
                      : 'N/A'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Alcance Promedio</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análisis por posición */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis por Posición</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(reportData.positionAnalysis).map(([position, data]) => (
                  <div key={position} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={getPositionColor(position)}>
                          {position}
                        </Badge>
                        <span className="font-medium">{data.count} jugadores</span>
                      </div>
                      {data.topPlayer && (
                        <div className="text-sm text-muted-foreground">
                          Mejor: {data.topPlayer.full_name} ({calculatePhysicalScore(data.topPlayer)}%)
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {data.averageHeight > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Altura Promedio</span>
                            <span>{data.averageHeight.toFixed(2)}m</span>
                          </div>
                          <Progress 
                            value={(data.averageHeight - 1.5) / 0.5 * 100} 
                            className="h-2"
                          />
                        </div>
                      )}
                      {data.averageReach > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Alcance Promedio</span>
                            <span>{data.averageReach.toFixed(2)}m</span>
                          </div>
                          <Progress 
                            value={(data.averageReach - 2.0) / 1.0 * 100} 
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recomendaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones y Plan de Acción</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabla detallada */}
          <Card>
            <CardHeader>
              <CardTitle>Datos Detallados de Jugadores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Jugador</th>
                      <th className="text-left p-2">Posición</th>
                      <th className="text-left p-2">Número</th>
                      <th className="text-left p-2">Edad</th>
                      <th className="text-left p-2">Altura</th>
                      <th className="text-left p-2">Alcance</th>
                      <th className="text-left p-2">Salto</th>
                      <th className="text-left p-2">Velocidad</th>
                      <th className="text-left p-2">Puntuación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.players.map((player) => (
                      <tr key={player.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{player.full_name}</td>
                        <td className="p-2">
                          <Badge className={getPositionColor(player.position)}>
                            {player.position}
                          </Badge>
                        </td>
                        <td className="p-2">#{player.jersey_number}</td>
                        <td className="p-2">{calculateAge(player.birthdate)} años</td>
                        <td className="p-2">{player.altura ? `${player.altura}m` : 'N/A'}</td>
                        <td className="p-2">{player.alcance_ataque ? `${player.alcance_ataque}m` : 'N/A'}</td>
                        <td className="p-2">{player.salto_vertical ? `${player.salto_vertical}m` : 'N/A'}</td>
                        <td className="p-2">{player.velocidad_30m ? `${player.velocidad_30m}s` : 'N/A'}</td>
                        <td className="p-2">
                          <Badge variant="outline">
                            {calculatePhysicalScore(player)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Mensaje cuando no hay equipo seleccionado */}
      {!reportData && teams.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Selecciona un equipo</h3>
            <p className="text-sm">Elige un equipo para generar su reporte detallado</p>
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay equipos */}
      {teams.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay equipos registrados</h3>
            <p className="text-sm">Crea equipos desde la sección de Equipos para generar reportes</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}