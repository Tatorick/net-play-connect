import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TopeCard } from "./TopeCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, XCircle, Users } from "lucide-react";
import { TopeContactDialog } from "./TopeContactDialog";
import { useAuth } from "@/contexts/AuthContext";

interface TopesBoardProps {
  onContact?: (topeId: string) => void;
}

export function TopesBoard({ onContact }: TopesBoardProps) {
  const [topes, setTopes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTope, setSelectedTope] = useState<any | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { user, profile } = useAuth();

  const fetchTopes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("topes")
        .select(`
          *,
          equipo:teams(
            id,
            name,
            category
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching topes:", error);
        throw error;
      }
      
      setTopes(data || []);
    } catch (err: any) {
      console.error("Error en fetchTopes:", err);
      setError("Error al cargar los topes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopes();
  }, []);

  const handleContact = (topeId: string) => {
    const tope = topes.find((t) => t.id === topeId);
    setSelectedTope(tope);
    setShowDialog(true);
    if (onContact) onContact(topeId);
  };

  // Lógica para registrar al usuario/equipo en el tope
  const handleRegister = async (topeId: string) => {
    if (!user || !profile) throw new Error("Debes iniciar sesión como entrenador para registrarte");
    // Buscar el equipo principal del usuario
    const { data: teams, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("coach_id", profile.user_id)
      .limit(1);
    if (teamError || !teams || teams.length === 0) throw new Error("No se encontró tu equipo principal. Debes ser entrenador de un equipo para registrarte.");
    const equipo_id = teams[0].id;
    // Verificar si ya está registrado
    const { data: existing, error: existError } = await supabase
      .from("topes_registros")
      .select("id")
      .eq("tope_id", topeId)
      .eq("equipo_id", equipo_id)
      .single();
    if (existing) throw new Error("Ya te has registrado a este tope con tu equipo.");
    // Registrar
    const { error: regError } = await supabase
      .from("topes_registros")
      .insert({ tope_id: topeId, equipo_id, user_id: profile.user_id, estado: "pendiente" });
    if (regError) throw new Error("No se pudo registrar al tope.");
  };

  if (loading) {
    return (
      <Card className="my-8">
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Cargando topes...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="my-8">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <XCircle className="h-8 w-8 text-red-500 mb-2" />
          <div className="text-red-500 font-medium mb-2">{error}</div>
          <button
            className="text-primary underline text-sm"
            onClick={fetchTopes}
          >
            Reintentar
          </button>
        </CardContent>
      </Card>
    );
  }

  if (topes.length === 0) {
    return (
      <Card className="my-8">
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Users className="h-10 w-10 mb-2 opacity-50" />
          <div className="font-medium">No hay topes publicados actualmente.</div>
          <div className="text-sm">Sé el primero en publicar un tope amistoso.</div>
          <Button 
            variant="outline" 
            onClick={fetchTopes}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Lista de topes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
        {topes.map((tope) => (
          <TopeCard
            key={tope.id}
            tope={tope}
            onContact={handleContact}
          />
        ))}
      </div>
      
      <TopeContactDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        tope={selectedTope}
        onRegister={handleRegister}
      />
    </>
  );
} 