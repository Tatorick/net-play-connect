import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  UserCheck, 
  Calendar,
  MapPin,
  Target,
  Activity,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PlayerDetailForm } from "@/components/players/PlayerDetailForm";
import { PlayersTable } from "@/components/players/PlayersTable";
import { PlayerStatsCard } from "@/components/players/PlayerStatsCard";
import { useLocation } from "react-router-dom";

interface Player {
  id: string;
  full_name: string;
  document_id: string;
  birthdate: string;
  position: string;
  jersey_number: number;
  contact_email?: string;
  guardian_contact?: string;
  team_id: string;
  created_at: string;
  updated_at: string;
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
  notas_fisicas?: string;
}

interface Team {
  id: string;
  name: string;
  category: string;
}

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const { profile } = useAuth();
  const location = useLocation();

  const positions = [
    "Colocador",
    "Libero", 
    "Central",
    "Punta",
    "Opuesto",
    "Otro"
  ];

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from("players")
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
        .order("full_name");

      if (error) throw error;
      
      // Transformar los datos para facilitar el uso
      const transformedPlayers = (data || []).map(player => ({
        ...player,
        teams: player.player_teams?.map((pt: any) => pt.team).filter(Boolean) || []
      }));

      setPlayers(transformedPlayers);
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      // Verificar que profile?.user_id existe antes de hacer la consulta
      if (!profile?.user_id) {
        console.log("⚠️ profile?.user_id no está disponible aún");
        return;
      }

      const { data, error } = await supabase
        .from("teams")
        .select("id, name, category")
        .eq("coach_id", profile.user_id)
        .order("name");

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  useEffect(() => {
    // Solo ejecutar cuando profile?.user_id esté disponible
    if (profile?.user_id) {
      fetchPlayers();
      fetchTeams();
    }
  }, [profile?.user_id]);

  // Abrir el formulario automáticamente si se navega desde el dashboard
  useEffect(() => {
    if (location.state && location.state.openNewPlayerForm) {
      setShowPlayerForm(true);
      setSelectedPlayer(null);
    }
    // Limpia el estado para evitar que se vuelva a abrir si el usuario navega dentro de la página
    // (esto requiere que el router permita manipular el estado, si no, se puede ignorar)
    // window.history.replaceState({}, document.title);
  }, [location.state]);

  const handlePlayerSuccess = () => {
    fetchPlayers();
    setShowPlayerForm(false);
    setSelectedPlayer(null);
  };

  const handleEditPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setShowPlayerForm(true);
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este jugador?")) {
      try {
        const { error } = await supabase
          .from("players")
          .delete()
          .eq("id", playerId);

        if (error) throw error;
        
        setPlayers(players.filter(p => p.id !== playerId));
      } catch (error) {
        console.error("Error deleting player:", error);
        alert("Error al eliminar el jugador");
      }
    }
  };

  // Filtrar jugadores
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.document_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeam = !selectedTeam || player.teams?.some((team: any) => team.id === selectedTeam);
    
    const matchesPosition = !selectedPosition || player.position === selectedPosition;
    
    return matchesSearch && matchesTeam && matchesPosition;
  });

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

  // Mostrar loading mientras se carga el profile o los datos
  if (loading || !profile?.user_id) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-3 text-muted-foreground">
              {!profile?.user_id ? "Cargando perfil..." : "Cargando jugadores..."}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Jugadores</h1>
          <p className="text-muted-foreground">
            Gestiona todos los jugadores registrados en tus equipos.
          </p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <UserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Activos</p>
                  <p className="text-2xl font-bold">{players.filter(p => p.teams && p.teams.length > 0).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Equipos</p>
                  <p className="text-2xl font-bold">{teams.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Con Datos Físicos</p>
                  <p className="text-2xl font-bold">
                    {players.filter(p => p.altura || p.peso || p.alcance_ataque).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y controles */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                {/* Búsqueda */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filtro por equipo */}
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Todos los equipos</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.category})
                    </option>
                  ))}
                </select>

                {/* Filtro por posición */}
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Todas las posiciones</option>
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                {/* Cambiar vista */}
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  Tabla
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                >
                  Tarjetas
                </Button>

                {/* Agregar jugador */}
                <Button onClick={() => setShowPlayerForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Jugador
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenido principal */}
        <Tabs defaultValue="players" className="space-y-6">
          <TabsList>
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Jugadores ({filteredPlayers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="players">
            {viewMode === "table" ? (
              <PlayersTable
                players={filteredPlayers}
                onEdit={handleEditPlayer}
                onDelete={handleDeletePlayer}
                calculateAge={calculateAge}
                getPositionColor={getPositionColor}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlayers.map((player) => (
                  <PlayerStatsCard
                    key={player.id}
                    player={player}
                    onEdit={() => handleEditPlayer(player)}
                    onDelete={() => handleDeletePlayer(player.id)}
                    calculateAge={calculateAge}
                    getPositionColor={getPositionColor}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Formulario de jugador */}
        <Dialog open={showPlayerForm} onOpenChange={setShowPlayerForm}>
          <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPlayer ? "Editar Jugador" : "Agregar Nuevo Jugador"}
              </DialogTitle>
            </DialogHeader>
            <PlayerDetailForm
              player={selectedPlayer}
              teams={teams}
              onSuccess={handlePlayerSuccess}
              onCancel={() => {
                setShowPlayerForm(false);
                setSelectedPlayer(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
} 