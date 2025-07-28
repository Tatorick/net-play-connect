import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCapture } from '@/components/stats/StatCapture';
import { PlayerStats } from '@/components/stats/PlayerStats';
import { TeamStats } from '@/components/stats/TeamStats';
import { StatsReports } from '@/components/stats/StatsReports';
import { BarChart3, Users, Target, FileText, TrendingUp, Calendar, Trophy, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface QuickStats {
  totalPlayers: number;
  totalTeams: number;
  totalMatches: number;
  totalTopes: number;
  playersWithStats: number;
  recentActivity: number;
}

export default function Statistics() {
  const { profile } = useAuth();
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalPlayers: 0,
    totalTeams: 0,
    totalMatches: 0,
    totalTopes: 0,
    playersWithStats: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.user_id) {
      fetchQuickStats();
    }
  }, [profile?.user_id]);

  const fetchQuickStats = async () => {
    try {
      setLoading(true);
      
      // Obtener equipos del coach
      const { data: teams } = await supabase
        .from('teams')
        .select('id')
        .eq('coach_id', profile?.user_id);
      
      const teamIds = teams?.map(t => t.id) || [];
      
      // Obtener jugadores
      const { data: players } = await supabase
        .from('players')
        .select('id, altura, peso, alcance_ataque')
        .in('team_id', teamIds);
      
      // Obtener topes
      const { data: topes } = await supabase
        .from('topes')
        .select('id')
        .in('equipo_id', teamIds);
      
      // Obtener jugadores con datos físicos
      const playersWithPhysicalData = players?.filter(p => 
        p.altura || p.peso || p.alcance_ataque
      ).length || 0;

      setQuickStats({
        totalPlayers: players?.length || 0,
        totalTeams: teams?.length || 0,
        totalMatches: 0, // Por implementar
        totalTopes: topes?.length || 0,
        playersWithStats: playersWithPhysicalData,
        recentActivity: 0 // Por implementar
      });
    } catch (error) {
      console.error('Error fetching quick stats:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-foreground">Estadísticas</h1>
          <p className="text-muted-foreground">
            Captura, analiza y rastrea el rendimiento de voleibol de tus equipos
          </p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Jugadores</p>
                  <p className="text-2xl font-bold">{quickStats.totalPlayers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Equipos</p>
                  <p className="text-2xl font-bold">{quickStats.totalTeams}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Con Datos Físicos</p>
                  <p className="text-2xl font-bold">{quickStats.playersWithStats}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Topes Publicados</p>
                  <p className="text-2xl font-bold">{quickStats.totalTopes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="capture" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="capture" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Captura en Vivo
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Estadísticas de Jugadores
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estadísticas de Equipo
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reportes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="capture">
            <Card>
              <CardHeader>
                <CardTitle>Captura de Estadísticas en Vivo</CardTitle>
                <CardDescription>
                  Registra acciones y eventos de jugadores durante partidos o entrenamientos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StatCapture />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="players">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento Individual de Jugadores</CardTitle>
                <CardDescription>
                  Visualiza estadísticas detalladas y métricas de rendimiento para cada jugador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlayerStats />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Equipo</CardTitle>
                <CardDescription>
                  Analiza el rendimiento del equipo, rotaciones y estadísticas generales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TeamStats />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reportes y Visualizaciones</CardTitle>
                <CardDescription>
                  Genera reportes completos y exporta datos para análisis avanzado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StatsReports />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximas Funcionalidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Estadísticas de partidos oficiales</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Análisis de tendencias de rendimiento</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Comparación entre equipos</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Exportación a Excel/PDF</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consejos de Uso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  1
                </div>
                <div>
                  <p className="font-medium">Captura en tiempo real</p>
                  <p className="text-sm text-muted-foreground">Usa la captura en vivo durante partidos para obtener datos precisos.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  2
                </div>
                <div>
                  <p className="font-medium">Analiza tendencias</p>
                  <p className="text-sm text-muted-foreground">Revisa las estadísticas regularmente para identificar patrones.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  3
                </div>
                <div>
                  <p className="font-medium">Genera reportes</p>
                  <p className="text-sm text-muted-foreground">Exporta datos para compartir con jugadores y padres.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}