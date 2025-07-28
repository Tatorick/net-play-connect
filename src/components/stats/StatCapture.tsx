import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Play, Pause, RotateCcw, Clock, Users2, Plus, Target, BarChart3, Calendar } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Match = Database['public']['Tables']['matches']['Row'];
type MatchEvent = Database['public']['Tables']['match_events']['Row'];
type Player = Database['public']['Tables']['players']['Row'];
type Team = Database['public']['Tables']['teams']['Row'];

interface StatEventWithPlayer extends MatchEvent {
  player?: Player;
}

interface LiveStats {
  totalServes: number;
  totalAces: number;
  totalErrors: number;
  totalKills: number;
  totalBlocks: number;
  totalAssists: number;
  servePercentage: number;
  attackPercentage: number;
  blockPercentage: number;
}

const actions = [
  'Serve',
  'Reception', 
  'Set/Assist',
  'Attack',
  'Block',
  'Defense/Dig',
  'Substitution',
  'Timeout'
];

const results = {
  'Serve': ['Ace', 'Error', 'In Play'],
  'Reception': ['Perfect (3)', 'Good (2)', 'Poor (1)', 'Error (0)'],
  'Set/Assist': ['Assist', 'Set', 'Error'],
  'Attack': ['Kill', 'Error', 'Blocked', 'In Play'],
  'Block': ['Point', 'Touch', 'Error'],
  'Defense/Dig': ['Good', 'Poor', 'Error'],
  'Substitution': ['In', 'Out'],
  'Timeout': ['Team', 'Technical']
};

export function StatCapture() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedResult, setSelectedResult] = useState<string>('');
  const [currentSet, setCurrentSet] = useState(1);
  const [currentPoint, setCurrentPoint] = useState(1);
  const [matchActive, setMatchActive] = useState(false);
  const [notes, setNotes] = useState('');
  const [recentEvents, setRecentEvents] = useState<StatEventWithPlayer[]>([]);
  const [liveStats, setLiveStats] = useState<LiveStats>({
    totalServes: 0,
    totalAces: 0,
    totalErrors: 0,
    totalKills: 0,
    totalBlocks: 0,
    totalAssists: 0,
    servePercentage: 0,
    attackPercentage: 0,
    blockPercentage: 0
  });
  const [showNewMatchDialog, setShowNewMatchDialog] = useState(false);
  const [newMatchData, setNewMatchData] = useState({
    opponent_team: '',
    match_date: new Date().toISOString().split('T')[0],
    location: ''
  });

  useEffect(() => {
    if (profile?.user_id) {
      fetchTeams();
    }
  }, [profile?.user_id]);

  useEffect(() => {
    if (selectedTeam) {
      fetchPlayers(selectedTeam);
      fetchMatches();
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (selectedMatch && matchActive) {
      fetchRecentEvents();
      calculateLiveStats();
    }
  }, [selectedMatch, matchActive]);

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
    }
  };

  const fetchMatches = async () => {
    if (!selectedTeam) return;
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('team_id', selectedTeam)
        .order('match_date', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchPlayers = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId)
        .order('jersey_number');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchRecentEvents = async () => {
    if (!selectedMatch) return;
    
    try {
      const { data, error } = await supabase
        .from('match_events')
        .select(`
          *,
          player:players(*)
        `)
        .eq('match_id', selectedMatch)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentEvents(data as StatEventWithPlayer[] || []);
    } catch (error) {
      console.error('Error fetching recent events:', error);
    }
  };

  const calculateLiveStats = async () => {
    if (!selectedMatch) return;
    
    try {
      const { data, error } = await supabase
        .from('match_events')
        .select('action, result')
        .eq('match_id', selectedMatch);

      if (error) throw error;

      const stats = {
        totalServes: data.filter(e => e.action === 'Serve').length,
        totalAces: data.filter(e => e.action === 'Serve' && e.result === 'Ace').length,
        totalErrors: data.filter(e => e.result.includes('Error')).length,
        totalKills: data.filter(e => e.action === 'Attack' && e.result === 'Kill').length,
        totalBlocks: data.filter(e => e.action === 'Block' && e.result === 'Point').length,
        totalAssists: data.filter(e => e.action === 'Set/Assist' && e.result === 'Assist').length,
        servePercentage: 0,
        attackPercentage: 0,
        blockPercentage: 0
      };

      const serves = data.filter(e => e.action === 'Serve');
      const attacks = data.filter(e => e.action === 'Attack');
      const blocks = data.filter(e => e.action === 'Block');

      stats.servePercentage = serves.length > 0 ? (stats.totalAces / serves.length) * 100 : 0;
      stats.attackPercentage = attacks.length > 0 ? (stats.totalKills / attacks.length) * 100 : 0;
      stats.blockPercentage = blocks.length > 0 ? (stats.totalBlocks / blocks.length) * 100 : 0;

      setLiveStats(stats);
    } catch (error) {
      console.error('Error calculating live stats:', error);
    }
  };

  const createNewMatch = async () => {
    if (!selectedTeam || !newMatchData.opponent_team || !newMatchData.match_date) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('matches')
        .insert({
          team_id: selectedTeam,
          opponent_team: newMatchData.opponent_team,
          match_date: newMatchData.match_date,
          location: newMatchData.location,
          status: 'scheduled',
          created_by: profile?.user_id || ''
        })
        .select()
        .single();

      if (error) throw error;

      setMatches(prev => [data, ...prev]);
      setSelectedMatch(data.id);
      setShowNewMatchDialog(false);
      setNewMatchData({
        opponent_team: '',
        match_date: new Date().toISOString().split('T')[0],
        location: ''
      });

      toast({
        title: "Éxito",
        description: "Partido creado correctamente"
      });
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: "Error al crear el partido",
        variant: "destructive"
      });
    }
  };

  const handleStatCapture = async () => {
    if (!selectedPlayer || !selectedAction || !selectedResult || !selectedMatch) {
      toast({
        title: "Error",
        description: "Por favor selecciona jugador, acción, resultado y partido",
        variant: "destructive"
      });
      return;
    }

    if (!matchActive) {
      toast({
        title: "Error",
        description: "El partido debe estar activo para capturar estadísticas",
        variant: "destructive"
      });
      return;
    }

    try {
      const isPoint = ['Ace', 'Kill', 'Point'].includes(selectedResult);
      const isError = selectedResult.includes('Error');

      const eventData = {
        match_id: selectedMatch,
        player_id: selectedPlayer,
        team_id: selectedTeam,
        action: selectedAction,
        result: selectedResult,
        set_number: currentSet,
        point_number: currentPoint,
        is_point: isPoint,
        is_error: isError,
        notes: notes || null,
        created_by: profile?.user_id || ''
      };

      const { error } = await supabase
        .from('match_events')
        .insert(eventData);

      if (error) throw error;

      // Actualizar eventos recientes y estadísticas
      await fetchRecentEvents();
      await calculateLiveStats();

      // Auto-increment point para ciertas acciones
      if (isPoint) {
        setCurrentPoint(prev => prev + 1);
      }

      // Reset form
      setSelectedPlayer('');
      setSelectedAction('');
      setSelectedResult('');
      setNotes('');

      toast({
        title: "Éxito",
        description: "Estadística registrada correctamente"
      });
    } catch (error) {
      console.error('Error capturing stat:', error);
      toast({
        title: "Error",
        description: "Error al registrar la estadística",
        variant: "destructive"
      });
    }
  };

  const toggleMatch = async () => {
    if (!selectedMatch) {
      toast({
        title: "Error",
        description: "Debes seleccionar un partido primero",
        variant: "destructive"
      });
      return;
    }

    try {
      const newStatus = matchActive ? 'completed' : 'in_progress';
      
      const { error } = await supabase
        .from('matches')
        .update({ status: newStatus })
        .eq('id', selectedMatch);

      if (error) throw error;

      setMatchActive(!matchActive);
      if (!matchActive) {
        setCurrentPoint(1);
        setRecentEvents([]);
      }
    } catch (error) {
      console.error('Error updating match status:', error);
      toast({
        title: "Error",
        description: "Error al cambiar el estado del partido",
        variant: "destructive"
      });
    }
  };

  const nextSet = () => {
    setCurrentSet(prev => prev + 1);
    setCurrentPoint(1);
  };

  const resetStats = () => {
    setCurrentSet(1);
    setCurrentPoint(1);
    setRecentEvents([]);
    setMatchActive(false);
  };

  const selectedPlayerData = players.find(p => p.id === selectedPlayer);
  const selectedMatchData = matches.find(m => m.id === selectedMatch);

  return (
    <div className="space-y-6">
      {/* Match Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Selección de Partido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <Label>Partido</Label>
              <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un partido" />
                </SelectTrigger>
                <SelectContent>
                  {matches.map((match) => (
                    <SelectItem key={match.id} value={match.id}>
                      vs {match.opponent_team} - {new Date(match.match_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={showNewMatchDialog} onOpenChange={setShowNewMatchDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Partido
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Partido</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Equipo Rival</Label>
                    <Input
                      value={newMatchData.opponent_team}
                      onChange={(e) => setNewMatchData(prev => ({ ...prev, opponent_team: e.target.value }))}
                      placeholder="Nombre del equipo rival"
                    />
                  </div>
                  <div>
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      value={newMatchData.match_date}
                      onChange={(e) => setNewMatchData(prev => ({ ...prev, match_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Ubicación</Label>
                    <Input
                      value={newMatchData.location}
                      onChange={(e) => setNewMatchData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Lugar del partido"
                    />
                  </div>
                  <Button onClick={createNewMatch} className="w-full">
                    Crear Partido
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Match Controls */}
      {selectedMatch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Control del Partido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={matchActive ? "default" : "secondary"}>
                  {matchActive ? "EN VIVO" : "DETENIDO"}
                </Badge>
                <Button
                  onClick={toggleMatch}
                  variant={matchActive ? "destructive" : "default"}
                  size="sm"
                >
                  {matchActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {matchActive ? "Detener" : "Iniciar"} Partido
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Label>Set:</Label>
                <Badge variant="outline" className="font-mono text-lg px-3">
                  {currentSet}
                </Badge>
                <Button onClick={nextSet} size="sm" variant="outline">
                  Siguiente Set
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Label>Punto:</Label>
                <Badge variant="outline" className="font-mono text-lg px-3">
                  {currentPoint}
                </Badge>
              </div>

              <Button onClick={resetStats} size="sm" variant="outline">
                <RotateCcw className="h-4 w-4 mr-1" />
                Reiniciar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Statistics */}
      {matchActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estadísticas en Vivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{liveStats.totalServes}</div>
                <div className="text-sm text-muted-foreground">Serves</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{liveStats.totalAces}</div>
                <div className="text-sm text-muted-foreground">Aces</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{liveStats.totalKills}</div>
                <div className="text-sm text-muted-foreground">Kills</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{liveStats.totalBlocks}</div>
                <div className="text-sm text-muted-foreground">Blocks</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">{liveStats.servePercentage.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">% Ace</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">{liveStats.attackPercentage.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">% Kill</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">{liveStats.blockPercentage.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">% Block</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stat Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Registrar Acción
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Equipo</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona equipo" />
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

            <div>
              <Label>Jugador</Label>
              <Select 
                value={selectedPlayer} 
                onValueChange={setSelectedPlayer}
                disabled={!selectedTeam}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona jugador" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      #{player.jersey_number} {player.full_name} ({player.position})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Acción</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona acción" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Resultado</Label>
              <Select 
                value={selectedResult} 
                onValueChange={setSelectedResult}
                disabled={!selectedAction}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona resultado" />
                </SelectTrigger>
                <SelectContent>
                  {selectedAction && results[selectedAction as keyof typeof results]?.map((result) => (
                    <SelectItem key={result} value={result}>
                      {result}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Notas (Opcional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agrega notas sobre esta acción..."
            />
          </div>

          <Button 
            onClick={handleStatCapture}
            className="w-full"
            disabled={!selectedPlayer || !selectedAction || !selectedResult || !selectedMatch || !matchActive}
          >
            Registrar Acción
          </Button>
        </CardContent>
      </Card>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentEvents.map((event) => {
                const player = event.player || players.find(p => p.id === event.player_id);
                return (
                  <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Set {event.set_number} - Punto {event.point_number}
                      </Badge>
                      <span className="font-medium">
                        #{player?.jersey_number} {player?.full_name}
                      </span>
                      <Badge>{event.action}</Badge>
                      <Badge variant={
                        ['Ace', 'Kill', 'Point', 'Perfect (3)', 'Good'].some(r => event.result.includes(r)) 
                          ? "default" 
                          : event.result.includes('Error') 
                            ? "destructive" 
                            : "secondary"
                      }>
                        {event.result}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No match selected message */}
      {!selectedMatch && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Selecciona un partido</h3>
            <p className="text-sm">Elige un partido existente o crea uno nuevo para comenzar a capturar estadísticas</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}