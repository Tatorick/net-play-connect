import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";


interface TopeFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const tiposPublicacion = [
  { value: "busca_equipo", label: "Busco equipo para tope" },
  { value: "ofrece_partido", label: "Ofrezco partido en casa" },
];

const setsOptions = [
  { value: 3, label: "3 sets" },
  { value: 5, label: "5 sets" },
  { value: 1, label: "1 set (amistoso corto)" },
  { value: 0, label: "Otro / Tiempo libre" },
];

export function TopeForm({ onClose, onSuccess }: TopeFormProps) {
  const [tipoPublicacion, setTipoPublicacion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [latitud, setLatitud] = useState<number | undefined>(undefined);
  const [longitud, setLongitud] = useState<number | undefined>(undefined);
  const [cantidadSets, setCantidadSets] = useState("");
  const [notas, setNotas] = useState("");
  const [vigenciaHasta, setVigenciaHasta] = useState("");
  const [ofreceHospedaje, setOfreceHospedaje] = useState(false);
  const [ofreceComida, setOfreceComida] = useState(false);
  const [ofreceTransporte, setOfreceTransporte] = useState(false);
  const [ofreceOtros, setOfreceOtros] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!tipoPublicacion || !categoria || !fechaInicio || !ubicacion || !vigenciaHasta) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }
    setLoading(true);
    try {
      // Buscar el equipo principal del usuario
      const { data: teams, error: teamError } = await supabase
        .from("teams")
        .select("id")
        .eq("coach_id", profile?.user_id)
        .limit(1);
      if (teamError || !teams || teams.length === 0) throw new Error("No se encontró tu equipo principal. Debes ser entrenador de un equipo para publicar un tope.");
      const equipo_id = teams[0].id;
      console.log("🗺️ Datos del tope a insertar:", {
        ubicacion,
        latitud,
        longitud,
        tipo_publicacion: tipoPublicacion,
        categoria,
        fecha_inicio: fechaInicio
      });

      // Insertar el tope
      const { error: topeError } = await supabase
        .from("topes")
        .insert({
          tipo_publicacion: tipoPublicacion,
          equipo_id,
          categoria,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin || fechaInicio,
          hora_inicio: horaInicio || null,
          hora_fin: horaFin || null,
          ubicacion,
          latitud: latitud || null,
          longitud: longitud || null,
          cantidad_sets: cantidadSets ? Number(cantidadSets) : null,
          notas,
          estado: "activo",
          vigencia_hasta: vigenciaHasta,
          creado_por: profile?.user_id,
          ofrece_hospedaje: ofreceHospedaje,
          ofrece_comida: ofreceComida,
          ofrece_transporte: ofreceTransporte,
          ofrece_otros: ofreceOtros || null,
        });
      if (topeError) throw topeError;
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al publicar el tope");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[80vh] overflow-y-auto px-1">
      <div className="space-y-2">
        <Label>Tipo de publicación *</Label>
        <Select value={tipoPublicacion} onValueChange={setTipoPublicacion} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tipo de publicación" />
          </SelectTrigger>
          <SelectContent>
            {tiposPublicacion.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Categoría / Nivel *</Label>
        <Input
          placeholder="Ej: Sub-14 Femenino, Senior Masculino Libre"
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha de inicio *</Label>
          <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Fecha de fin</Label>
          <Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Hora de inicio</Label>
          <Input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Hora de fin</Label>
          <Input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Ubicación *</Label>
        <Input
          placeholder="Dirección de la cancha o zona de preferencia"
          value={ubicacion}
          onChange={e => setUbicacion(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Ubicación *</Label>
        <Input
          placeholder="Dirección de la cancha o zona de preferencia"
          value={ubicacion}
          onChange={e => setUbicacion(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Número de sets o tiempo de juego</Label>
        <Select value={cantidadSets} onValueChange={setCantidadSets}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona cantidad de sets o tiempo" />
          </SelectTrigger>
          <SelectContent>
            {setsOptions.map((s) => (
              <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Notas adicionales</Label>
        <Textarea
          placeholder="Ej: Queremos probar nuevas rotaciones, tenemos árbitro, etc."
          value={notas}
          onChange={e => setNotas(e.target.value)}
        />
      </div>
      {/* Ofertas del anfitrión */}
      <div className="space-y-2">
        <Label>¿Ofreces algo a los visitantes?</Label>
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={ofreceHospedaje} onChange={e => setOfreceHospedaje(e.target.checked)} /> Hospedaje
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={ofreceComida} onChange={e => setOfreceComida(e.target.checked)} /> Comida
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={ofreceTransporte} onChange={e => setOfreceTransporte(e.target.checked)} /> Transporte
          </label>
        </div>
        <Input
          placeholder="Otros (ej: hidratación, snacks, etc.)"
          value={ofreceOtros}
          onChange={e => setOfreceOtros(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Vigencia del anuncio *</Label>
        <Input type="date" value={vigenciaHasta} onChange={e => setVigenciaHasta(e.target.value)} required />
      </div>
      {error && <div className="text-sm text-red-500 text-center font-medium mt-2">{error}</div>}
      <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-white pb-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Publicando..." : "Publicar Tope"}
        </Button>
      </div>
    </form>
  );
} 