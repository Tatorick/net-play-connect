import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CalendarIcon, MapPinIcon, ClockIcon, EditIcon, TrashIcon, EyeIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface FriendlyMatch {
  id: string;
  publication_type: string;
  category: string;
  location: string;
  match_format: string;
  additional_notes?: string;
  preferred_dates_start?: string;
  preferred_dates_end?: string;
  preferred_time_start?: string;
  preferred_time_end?: string;
  status: string;
  created_at: string;
  expiration_date: string;
  teams?: { name: string } | null;
  clubs?: { name: string } | null;
}

export function MyMatchPosts() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<FriendlyMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyMatches();
  }, []);

  const fetchMyMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("friendly_matches")
        .select(`
          *,
          teams(name),
          clubs(name)
        `)
        .eq("coach_id", profile?.user_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMatches((data || []) as unknown as FriendlyMatch[]);
    } catch (error) {
      console.error("Error fetching my matches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from("friendly_matches")
        .delete()
        .eq("id", matchId);

      if (error) throw error;

      toast({
        title: "Publicación eliminada",
        description: "La publicación ha sido eliminada exitosamente.",
      });

      setMatches(matches.filter(match => match.id !== matchId));
    } catch (error) {
      console.error("Error deleting match:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la publicación. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (matchId: string, currentStatus: string) => {
    const newStatus = currentStatus === "activo" ? "cerrado" : "activo";
    
    try {
      const { error } = await supabase
        .from("friendly_matches")
        .update({ status: newStatus })
        .eq("id", matchId);

      if (error) throw error;

      toast({
        title: newStatus === "activo" ? "Publicación reactivada" : "Publicación cerrada",
        description: `La publicación ha sido ${newStatus === "activo" ? "reactivada" : "cerrada"} exitosamente.`,
      });

      fetchMyMatches();
    } catch (error) {
      console.error("Error updating match status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, expirationDate: string) => {
    const isExpired = new Date(expirationDate) < new Date();
    
    if (isExpired) {
      return <Badge variant="secondary">Expirado</Badge>;
    }
    
    switch (status) {
      case "activo":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case "cerrado":
        return <Badge variant="outline">Cerrado</Badge>;
      case "expirado":
        return <Badge variant="secondary">Expirado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPublicationTypeLabel = (type: string) => {
    return type === "busco_equipo" ? "Busca equipo" : "Ofrece partido";
  };

  const getPublicationTypeBadgeColor = (type: string) => {
    return type === "busco_equipo" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando tus publicaciones...</div>;
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No has publicado ningún tope aún.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.map((match) => {
        const isExpired = new Date(match.expiration_date) < new Date();
        const canToggle = !isExpired && match.status !== "expirado";
        
        return (
          <Card key={match.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{match.category}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getPublicationTypeBadgeColor(match.publication_type)}>
                    {getPublicationTypeLabel(match.publication_type)}
                  </Badge>
                  {getStatusBadge(match.status, match.expiration_date)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {(match.teams || match.clubs) && (
                <div className="text-sm font-medium">
                  {match.teams?.name && <span>Equipo: {match.teams.name}</span>}
                  {match.clubs?.name && <span>Club: {match.clubs.name}</span>}
                </div>
              )}
              
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
              
              <div className="text-xs text-muted-foreground">
                Expira: {format(new Date(match.expiration_date), "dd/MM/yyyy", { locale: es })}
              </div>
              
              {match.additional_notes && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Notas:</span> {match.additional_notes}
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                {canToggle && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(match.id, match.status)}
                    className="flex-1"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    {match.status === "activo" ? "Cerrar" : "Reactivar"}
                  </Button>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar publicación?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. La publicación será eliminada permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteMatch(match.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}