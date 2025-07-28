import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

export function AdminCoachRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener solicitudes pendientes de entrenadores principales
      const { data: requestsData, error: reqError } = await supabase
        .from("coach_main_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (reqError) {
        console.error("Error fetching requests:", reqError);
        setError("Error al cargar solicitudes");
        toast({
          title: "Error",
          description: "No se pudieron cargar las solicitudes",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Obtener datos adicionales de perfiles y clubes
      const userIds = Array.from(new Set((requestsData || []).map(r => r.user_id)));
      const clubIds = Array.from(new Set((requestsData || []).map(r => r.club_id)));

      // Obtener perfiles
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);
        
        (profiles || []).forEach(p => {
          profilesMap[p.user_id] = p;
        });
      }

      // Obtener clubes
      let clubsMap: Record<string, any> = {};
      if (clubIds.length > 0) {
        const { data: clubs } = await supabase
          .from("clubs")
          .select("id, name, city")
          .in("id", clubIds);
        
        (clubs || []).forEach(c => {
          clubsMap[c.id] = c;
        });
      }

      // Enriquecer los datos
      const enrichedRequests = (requestsData || []).map(req => ({
        ...req,
        user_full_name: profilesMap[req.user_id]?.full_name || req.user_id,
        user_email: req.user_id, // Mostrar user_id por ahora
        club_name: clubsMap[req.club_id]?.name || "Club no encontrado",
        club_city: clubsMap[req.club_id]?.city || "",
      }));

      setRequests(enrichedRequests);
      
    } catch (error) {
      console.error("Error general:", error);
      setError("Error inesperado");
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, newStatus: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      // Buscar la solicitud para obtener el user_id
      const request = requests.find(r => r.id === id);
      if (!request) {
        toast({
          title: "Error",
          description: "No se encontró la solicitud",
          variant: "destructive"
        });
        return;
      }

      console.log("Actualizando solicitud:", { id, user_id: request.user_id, newStatus });

      // Actualizar el status en coach_main_requests
      const { error: requestError } = await supabase
        .from("coach_main_requests")
        .update({ status: newStatus })
        .eq("id", id);

      if (requestError) {
        console.error("Error updating request:", requestError);
        toast({
          title: "Error",
          description: "No se pudo actualizar la solicitud",
          variant: "destructive"
        });
        return;
      }

      console.log("Solicitud actualizada, actualizando perfil...");

      // Verificar si el perfil existe
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id, user_id, status")
        .eq("user_id", request.user_id)
        .single();

      if (profileCheckError) {
        console.error("Error checking profile:", profileCheckError);
        toast({
          title: "Error",
          description: "No se pudo verificar el perfil del usuario",
          variant: "destructive"
        });
        return;
      }

      console.log("Perfil encontrado:", existingProfile);

      // Actualizar también el status en profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("user_id", request.user_id);

      if (profileError) {
        console.error("Error updating profile status:", profileError);
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado del perfil",
          variant: "destructive"
        });
        return;
      }

      console.log("Perfil actualizado correctamente");

      // Remover la solicitud de la lista
      setRequests((prev) => prev.filter((r) => r.id !== id));
      
      // Mostrar notificación de éxito
      toast({
        title: newStatus === "approved" ? "Solicitud Aprobada" : "Solicitud Rechazada",
        description: newStatus === "approved" 
          ? "El entrenador principal ha sido aprobado y puede acceder a la plataforma"
          : "La solicitud ha sido rechazada",
        variant: newStatus === "approved" ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Error handling action:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la solicitud",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-500">Aprobado</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Solicitudes de Entrenadores Principales
            </CardTitle>
            <CardDescription>
              Aprueba o rechaza solicitudes de entrenadores que desean crear nuevos clubes.
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchRequests}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Cargando solicitudes...
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <div className="text-red-500 font-medium">{error}</div>
            <Button 
              variant="outline" 
              onClick={fetchRequests}
              className="mt-4"
            >
              Reintentar
            </Button>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <div className="text-muted-foreground font-medium">
              No hay solicitudes pendientes de entrenadores principales.
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Todas las solicitudes han sido procesadas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-lg">
                        {req.user_full_name}
                      </div>
                      {getStatusBadge(req.status)}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        <strong>Email:</strong> {req.user_email}
                      </div>
                      <div>
                        <strong>Club:</strong> {req.club_name}
                      </div>
                      <div>
                        <strong>Ciudad:</strong> {req.club_city}
                      </div>
                      <div>
                        <strong>Solicitado:</strong> {new Date(req.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      disabled={actionLoading === req.id}
                      onClick={() => handleAction(req.id, "approved")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === req.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprobar
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={actionLoading === req.id}
                      onClick={() => handleAction(req.id, "rejected")}
                    >
                      {actionLoading === req.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Rechazar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 