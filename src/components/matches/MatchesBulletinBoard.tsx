import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, MapPinIcon, ClockIcon, UserIcon, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface FriendlyMatch {
  id: string;
  coach_id: string;
  publication_type: string;
  category: string;
  location: string;
  match_format: string;
  additional_notes?: string;
  preferred_dates_start?: string;
  preferred_dates_end?: string;
  preferred_time_start?: string;
  preferred_time_end?: string;
  created_at: string;
  teams?: { name: string } | null;
  clubs?: { name: string } | null;
  profiles?: { full_name: string } | null;
}

export function MatchesBulletinBoard() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<FriendlyMatch[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<FriendlyMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    publication_type: "",
    location: "",
  });
  const [sortBy, setSortBy] = useState("created_at");
  
  // Interest form state
  const [selectedMatch, setSelectedMatch] = useState<FriendlyMatch | null>(null);
  const [interestForm, setInterestForm] = useState({
    message: "",
    contact_info: "",
  });
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    filterAndSortMatches();
  }, [matches, filters, sortBy]);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("friendly_matches")
        .select(`
          *,
          teams(name),
          clubs(name),
          profiles(full_name)
        `)
        .eq("status", "activo")
        .gte("expiration_date", new Date().toISOString().split("T")[0])
        .neq("coach_id", profile?.user_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMatches((data || []) as unknown as FriendlyMatch[]);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortMatches = () => {
    let filtered = matches.filter((match) => {
      return (
        (filters.category === "" || match.category.toLowerCase().includes(filters.category.toLowerCase())) &&
        (filters.publication_type === "" || match.publication_type === filters.publication_type) &&
        (filters.location === "" || match.location.toLowerCase().includes(filters.location.toLowerCase()))
      );
    });

    // Sort matches
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "preferred_dates_start":
          const dateA = a.preferred_dates_start ? new Date(a.preferred_dates_start).getTime() : 0;
          const dateB = b.preferred_dates_start ? new Date(b.preferred_dates_start).getTime() : 0;
          return dateA - dateB;
        default:
          return 0;
      }
    });

    setFilteredMatches(filtered);
  };

  const handleShowInterest = async () => {
    if (!selectedMatch) return;

    setIsSubmittingInterest(true);
    try {
    const { error } = await (supabase as any)
      .from("match_interests")
      .insert([
        {
          match_id: selectedMatch.id,
          coach_id: profile?.user_id,
          message: interestForm.message,
          contact_info: interestForm.contact_info,
        },
      ]);

      if (error) throw error;

      toast({
        title: "¡Interés enviado!",
        description: "Tu solicitud ha sido enviada al organizador del tope.",
      });

      setSelectedMatch(null);
      setInterestForm({ message: "", contact_info: "" });
    } catch (error: any) {
      console.error("Error submitting interest:", error);
      if (error.code === "23505") {
        toast({
          title: "Ya mostraste interés",
          description: "Ya has enviado una solicitud para este tope.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo enviar tu solicitud. Intenta de nuevo.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmittingInterest(false);
    }
  };

  const getPublicationTypeLabel = (type: string) => {
    return type === "busco_equipo" ? "Busca equipo" : "Ofrece partido";
  };

  const getPublicationTypeBadgeColor = (type: string) => {
    return type === "busco_equipo" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando topes disponibles...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <Label>Categoría</Label>
          <Input
            placeholder="Buscar por categoría..."
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          />
        </div>
        
        <div>
          <Label>Tipo de Publicación</Label>
          <Select value={filters.publication_type} onValueChange={(value) => setFilters({ ...filters, publication_type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los tipos</SelectItem>
              <SelectItem value="busco_equipo">Busca equipo</SelectItem>
              <SelectItem value="ofrezco_partido">Ofrece partido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Ubicación</Label>
          <Input
            placeholder="Buscar por ubicación..."
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
        </div>
        
        <div>
          <Label>Ordenar por</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Fecha de publicación</SelectItem>
              <SelectItem value="preferred_dates_start">Fecha del partido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMatches.map((match) => (
          <Card key={match.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{match.category}</CardTitle>
                <Badge className={getPublicationTypeBadgeColor(match.publication_type)}>
                  {getPublicationTypeLabel(match.publication_type)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4 mr-2" />
                {match.profiles?.full_name || "Entrenador"}
                {match.teams && <span className="ml-1">({match.teams.name})</span>}
                {match.clubs && <span className="ml-1">[{match.clubs.name}]</span>}
              </div>
              
              <div className="flex items-center text-sm">
                <MapPinIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                {match.location}
              </div>
              
              {(match.preferred_dates_start || match.preferred_dates_end) && (
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  {match.preferred_dates_start && format(new Date(match.preferred_dates_start), "dd/MM", { locale: es })}
                  {match.preferred_dates_start && match.preferred_dates_end && " - "}
                  {match.preferred_dates_end && format(new Date(match.preferred_dates_end), "dd/MM", { locale: es })}
                </div>
              )}
              
              {(match.preferred_time_start || match.preferred_time_end) && (
                <div className="flex items-center text-sm">
                  <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  {match.preferred_time_start}
                  {match.preferred_time_start && match.preferred_time_end && " - "}
                  {match.preferred_time_end}
                </div>
              )}
              
              <div className="text-sm">
                <span className="font-medium">Formato:</span> {match.match_format}
              </div>
              
              {match.additional_notes && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Notas:</span> {match.additional_notes}
                </div>
              )}
              
              <div className="pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedMatch(match)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Mostrar Interés
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Mostrar Interés en el Tope</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="message">Mensaje para el organizador</Label>
                        <Textarea
                          id="message"
                          placeholder="Describe tu equipo, experiencia, o cualquier información relevante..."
                          value={interestForm.message}
                          onChange={(e) => setInterestForm({ ...interestForm, message: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="contact">Información de contacto</Label>
                        <Input
                          id="contact"
                          placeholder="Teléfono, email o WhatsApp"
                          value={interestForm.contact_info}
                          onChange={(e) => setInterestForm({ ...interestForm, contact_info: e.target.value })}
                        />
                      </div>
                      
                      <Button 
                        onClick={handleShowInterest} 
                        disabled={isSubmittingInterest}
                        className="w-full"
                      >
                        {isSubmittingInterest ? "Enviando..." : "Enviar Solicitud"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron topes que coincidan con tus filtros.
        </div>
      )}
    </div>
  );
}