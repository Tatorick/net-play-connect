import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarIcon, MapPin, Users, Home, BedDouble, Utensils, Car, Info, CheckCircle, Clock, XCircle } from "lucide-react";

interface TopeCardProps {
  tope: {
    id: string;
    tipo_publicacion: string;
    categoria: string;
    fecha_inicio: string;
    fecha_fin?: string | null;
    hora_inicio?: string | null;
    hora_fin?: string | null;
    ubicacion: string;

    cantidad_sets?: number | null;
    notas?: string | null;
    estado: string;
    creado_por: string;
    equipo?: {
      id: string;
      name: string;
      category: string;
    };
    ofrece_hospedaje?: boolean;
    ofrece_comida?: boolean;
    ofrece_transporte?: boolean;
    ofrece_otros?: string | null;
  };
  onContact: (topeId: string) => void;
}

const estadoColors: Record<string, string> = {
  activo: "bg-green-100 text-green-700",
  confirmado: "bg-blue-100 text-blue-700",
  expirado: "bg-gray-200 text-gray-500",
  cancelado: "bg-red-100 text-red-600",
};

const tipoLabels: Record<string, string> = {
  busca_equipo: "Busco equipo para tope",
  ofrece_partido: "Ofrezco partido en casa",
};

export function TopeCard({ tope, onContact }: TopeCardProps) {
  return (
    <Card className="shadow-md border-0 bg-card/90 hover:shadow-lg transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex gap-2 items-center">
            <Badge className={estadoColors[tope.estado] || "bg-gray-200 text-gray-500"}>
              {tope.estado.charAt(0).toUpperCase() + tope.estado.slice(1)}
            </Badge>
            <Badge variant="secondary">
              {tipoLabels[tope.tipo_publicacion] || tope.tipo_publicacion}
            </Badge>
          </div>
          <CardTitle className="text-lg mt-1">{tope.categoria}</CardTitle>
        </div>
        <div className="flex gap-2">
          {tope.ofrece_hospedaje && <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1"><BedDouble className="h-4 w-4" /> Hospedaje</Badge>}
          {tope.ofrece_comida && <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1"><Utensils className="h-4 w-4" /> Comida</Badge>}
          {tope.ofrece_transporte && <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1"><Car className="h-4 w-4" /> Transporte</Badge>}
          {tope.ofrece_otros && <Badge className="bg-purple-100 text-purple-700 flex items-center gap-1"><Info className="h-4 w-4" /> Otros</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            {tope.fecha_inicio}
            {tope.fecha_fin && tope.fecha_fin !== tope.fecha_inicio && (
              <>
                &nbsp;al&nbsp;{tope.fecha_fin}
              </>
            )}
          </div>
          {(tope.hora_inicio || tope.hora_fin) && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {tope.hora_inicio}
              {tope.hora_fin && (
                <>
                  &nbsp;-&nbsp;{tope.hora_fin}
                </>
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
        <div className="flex justify-end mt-4">
          <Button size="sm" onClick={() => onContact(tope.id)}>
            {tope.estado === "activo" ? "Ver más / Contactar" : "Ver detalles"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 