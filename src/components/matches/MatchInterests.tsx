import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageSquareIcon, CheckIcon, XIcon, PhoneIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MatchInterest {
  id: string;
  match_id: string;
  coach_id: string;
  message?: string;
  contact_info?: string;
  status: string;
  created_at: string;
  profiles?: { full_name: string } | null;
  teams?: { name: string } | null;
  clubs?: { name: string } | null;
  friendly_matches?: {
    category: string;
    publication_type: string;
    location: string;
    match_format: string;
  } | null;
}

export function MatchInterests() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [interests, setInterests] = useState<MatchInterest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
    const { data, error } = await (supabase as any)
      .from("match_interests")
      .select(`
        *,
        profiles(full_name),
        teams(name),
        clubs(name),
        friendly_matches(category, publication_type, location, match_format)
      `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInterests((data || []) as unknown as MatchInterest[]);
    } catch (error) {
      console.error("Error fetching interests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseToInterest = async (interestId: string, newStatus: string) => {
    try {
    const { error } = await (supabase as any)
      .from("match_interests")
      .update({ status: newStatus })
      .eq("id", interestId);

      if (error) throw error;

      toast({
        title: newStatus === "aceptado" ? "Solicitud aceptada" : "Solicitud rechazada",
        description: `La solicitud ha sido ${newStatus === "aceptado" ? "aceptada" : "rechazada"} exitosamente.`,
      });

      fetchInterests();
    } catch (error) {
      console.error("Error updating interest status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la solicitud. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendiente":
        return <Badge variant="outline">Pendiente</Badge>;
      case "aceptado":
        return <Badge className="bg-green-100 text-green-800">Aceptado</Badge>;
      case "rechazado":
        return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPublicationTypeLabel = (type: string) => {
    return type === "busco_equipo" ? "Busca equipo" : "Ofrece partido";
  };

  // Filter interests received (for my matches) vs sent (my interests in other matches)
  const receivedInterests = interests.filter(interest => 
    interest.coach_id !== profile?.user_id
  );
  
  const sentInterests = interests.filter(interest => 
    interest.coach_id === profile?.user_id
  );

  if (isLoading) {
    return <div className="text-center py-8">Cargando solicitudes de interés...</div>;
  }

  return (
    <Tabs defaultValue="received" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="received">
          Recibidas ({receivedInterests.length})
        </TabsTrigger>
        <TabsTrigger value="sent">
          Enviadas ({sentInterests.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="received" className="space-y-4">
        {receivedInterests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No has recibido solicitudes de interés aún.
          </div>
        ) : (
          <div className="space-y-4">
            {receivedInterests.map((interest) => (
              <Card key={interest.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      Solicitud para: {interest.friendly_matches?.category}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        {getPublicationTypeLabel(interest.friendly_matches?.publication_type || "")}
                      </Badge>
                      {getStatusBadge(interest.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Equipo Interesado:</div>
                      <div className="text-sm text-muted-foreground">
                        {interest.profiles?.full_name || "Entrenador"}
                        {interest.teams && <span className="ml-1">({interest.teams.name})</span>}
                        {interest.clubs && <span className="ml-1">[{interest.clubs.name}]</span>}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium">Fecha de solicitud:</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(interest.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                      </div>
                    </div>
                  </div>

                  {interest.message && (
                    <div>
                      <div className="text-sm font-medium mb-1">Mensaje:</div>
                      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                        {interest.message}
                      </div>
                    </div>
                  )}

                  {interest.contact_info && (
                    <div className="flex items-center text-sm">
                      <PhoneIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium mr-2">Contacto:</span>
                      <span>{interest.contact_info}</span>
                    </div>
                  )}

                  {interest.status === "pendiente" && (
                    <div className="flex gap-2 pt-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="flex-1">
                            <CheckIcon className="h-4 w-4 mr-2" />
                            Aceptar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Aceptar solicitud?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esto marcará la solicitud como aceptada. Podrás contactar al equipo para coordinar el partido.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleResponseToInterest(interest.id, "aceptado")}
                            >
                              Aceptar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="flex-1">
                            <XIcon className="h-4 w-4 mr-2" />
                            Rechazar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Rechazar solicitud?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción marcará la solicitud como rechazada.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleResponseToInterest(interest.id, "rechazado")}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Rechazar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="sent" className="space-y-4">
        {sentInterests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No has enviado solicitudes de interés aún.
          </div>
        ) : (
          <div className="space-y-4">
            {sentInterests.map((interest) => (
              <Card key={interest.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      Interés en: {interest.friendly_matches?.category}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        {getPublicationTypeLabel(interest.friendly_matches?.publication_type || "")}
                      </Badge>
                      {getStatusBadge(interest.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium">Ubicación:</span> {interest.friendly_matches?.location}
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Formato:</span> {interest.friendly_matches?.match_format}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Enviado el {format(new Date(interest.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                  </div>

                  {interest.message && (
                    <div>
                      <div className="text-sm font-medium mb-1">Tu mensaje:</div>
                      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                        {interest.message}
                      </div>
                    </div>
                  )}

                  {interest.contact_info && (
                    <div className="text-sm">
                      <span className="font-medium">Contacto proporcionado:</span> {interest.contact_info}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}