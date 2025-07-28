import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPin, Users, BedDouble, Utensils, Car, Info, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TopeContactDialogProps {
  open: boolean;
  onClose: () => void;
  tope: any;
  onRegister?: (topeId: string) => Promise<void>;
}

export function TopeContactDialog({ open, onClose, tope, onRegister }: TopeContactDialogProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registros, setRegistros] = useState<any[]>([]);
  const [registrosLoading, setRegistrosLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { profile } = useAuth();

  // Consultar equipos registrados/interesados
  const fetchRegistros = async () => {
    if (!tope) return;
    setRegistrosLoading(true);
    try {
      const { data, error } = await supabase
        .from("topes_registros")
        .select("*, teams(name), profiles(full_name)")
        .eq("tope_id", tope.id)
        .order("created_at", { ascending: true });
      if (!error) setRegistros(data || []);
    } finally {
      setRegistrosLoading(false);
    }
  };

  useEffect(() => {
    if (open && tope) {
      fetchRegistros();
    }
    // eslint-disable-next-line
  }, [open, tope]);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      if (onRegister) {
        await onRegister(tope.id);
        setSuccess(true);
        fetchRegistros();
      }
    } catch (err: any) {
      setError("Ocurrió un error al registrarse al tope.");
    } finally {
      setLoading(false);
    }
  };

  // Confirmar/cancelar participación (solo anfitrión)
  const handleAction = async (registroId: string, newStatus: "confirmado" | "cancelado") => {
    setActionLoading(registroId);
    try {
      const { error } = await supabase
        .from("topes_registros")
        .update({ estado: newStatus })
        .eq("id", registroId);
      if (error) throw error;
      fetchRegistros();
    } catch (err) {
      setError("No se pudo actualizar el estado del equipo.");
    } finally {
      setActionLoading(null);
    }
  };

  if (!tope) return null;

  // Determinar si el usuario es el anfitrión
  const isHost = profile && tope.creado_por === profile.user_id;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Detalles del Tope</DialogTitle>
          <DialogDescription>
            Consulta la información y acepta el tope si te interesa.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 overflow-y-auto flex-1 px-1">
          <div className="flex gap-2 mb-2">
            <Badge variant="secondary">{tope.tipo_publicacion === "busca_equipo" ? "Busco equipo para tope" : "Ofrezco partido en casa"}</Badge>
            <Badge>{tope.categoria}</Badge>
            <Badge className="bg-green-100 text-green-700">{tope.estado}</Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              {tope.fecha_inicio}
              {tope.fecha_fin && tope.fecha_fin !== tope.fecha_inicio && (
                <>&nbsp;al&nbsp;{tope.fecha_fin}</>
              )}
            </div>
            {(tope.hora_inicio || tope.hora_fin) && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {tope.hora_inicio}
                {tope.hora_fin && (
                  <>&nbsp;-&nbsp;{tope.hora_fin}</>
                )}
              </div>
            )}
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {tope.ubicacion}
            </div>
            {tope.cantidad_sets && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {tope.cantidad_sets} sets
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            <strong>Equipo anfitrión:</strong> {tope.equipo?.name || "-"}
            {tope.equipo?.category && <span> ({tope.equipo.category})</span>}
          </div>
          {tope.notas && (
            <div className="text-xs text-muted-foreground mt-1 italic">
              “{tope.notas}”
            </div>
          )}
          <div className="flex gap-2 mt-2">
            {tope.ofrece_hospedaje && <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1"><BedDouble className="h-4 w-4" /> Hospedaje</Badge>}
            {tope.ofrece_comida && <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1"><Utensils className="h-4 w-4" /> Comida</Badge>}
            {tope.ofrece_transporte && <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1"><Car className="h-4 w-4" /> Transporte</Badge>}
            {tope.ofrece_otros && <Badge className="bg-purple-100 text-purple-700 flex items-center gap-1"><Info className="h-4 w-4" /> Otros</Badge>}
          </div>

          {/* Lista de equipos registrados/interesados */}
          <div className="mt-6">
            <div className="font-semibold mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" /> Equipos registrados/interesados
            </div>
            {registrosLoading ? (
              <div className="text-sm text-muted-foreground">Cargando equipos...</div>
            ) : registros.length === 0 ? (
              <div className="text-sm text-muted-foreground">Aún no hay equipos registrados en este tope.</div>
            ) : (
              <div className="space-y-2">
                {registros.map((reg) => (
                  <div key={reg.id} className="flex items-center justify-between border rounded px-3 py-2 bg-muted/50">
                    <div>
                      <div className="font-medium">{reg.teams?.name || "Equipo"}</div>
                      <div className="text-xs text-muted-foreground">Entrenador: {reg.profiles?.full_name || reg.user_id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {reg.estado === "pendiente" && <Badge variant="secondary">Pendiente</Badge>}
                      {reg.estado === "confirmado" && <Badge className="bg-green-100 text-green-700">Confirmado <CheckCircle className="h-4 w-4 ml-1" /></Badge>}
                      {reg.estado === "cancelado" && <Badge className="bg-red-100 text-red-600">Cancelado <XCircle className="h-4 w-4 ml-1" /></Badge>}
                      {isHost && reg.estado === "pendiente" && (
                        <>
                          <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" disabled={actionLoading === reg.id} onClick={() => handleAction(reg.id, "confirmado")}>{actionLoading === reg.id ? "..." : "Confirmar"}</Button>
                          <Button size="sm" variant="destructive" disabled={actionLoading === reg.id} onClick={() => handleAction(reg.id, "cancelado")}>{actionLoading === reg.id ? "..." : "Cancelar"}</Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-4 gap-2 sticky bottom-0 bg-white pb-2">
          {error && <div className="text-sm text-red-500 text-center font-medium mt-2 w-full">{error}</div>}
          {success ? (
            <div className="text-green-600 text-center font-medium mt-4 w-full">¡Te has registrado exitosamente al tope!</div>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
              <Button onClick={handleRegister} disabled={loading}>
                {loading ? "Registrando..." : "Aceptar / Registrarse"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 