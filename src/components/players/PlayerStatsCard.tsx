import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2, User, Calendar, Target, Activity, Ruler, Weight } from "lucide-react";

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

interface PlayerStatsCardProps {
  player: Player;
  onEdit: () => void;
  onDelete: () => void;
  calculateAge: (birthdate: string) => number;
  getPositionColor: (position: string) => string;
}

export function PlayerStatsCard({ player, onEdit, onDelete, calculateAge, getPositionColor }: PlayerStatsCardProps) {
  const hasPhysicalData = player.altura || player.peso || player.alcance_ataque || player.alcance_bloqueo;
  
  const calculateBMI = () => {
    if (player.altura && player.peso) {
      return (player.peso / (player.altura * player.altura)).toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {player.full_name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getPositionColor(player.position)}>
                {player.position}
              </Badge>
              <Badge variant="secondary">#{player.jersey_number}</Badge>
              <Badge variant="outline">
                {calculateAge(player.birthdate)} años
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información básica */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <strong>Documento:</strong> {player.document_id}
          </div>
          {player.teams && player.teams.length > 0 && (
            <div className="space-y-1">
              <div className="text-sm font-medium">Equipos:</div>
              <div className="flex flex-wrap gap-1">
                {player.teams.map((team, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {team.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Datos físicos */}
        {hasPhysicalData && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Datos Físicos</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {player.altura && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium">{player.altura}m</div>
                    <div className="text-xs text-muted-foreground">Altura</div>
                  </div>
                </div>
              )}
              
              {player.peso && (
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="text-sm font-medium">{player.peso}kg</div>
                    <div className="text-xs text-muted-foreground">Peso</div>
                  </div>
                </div>
              )}
              
              {bmi && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="text-sm font-medium">{bmi}</div>
                    <div className="text-xs text-muted-foreground">IMC</div>
                  </div>
                </div>
              )}
              
              {player.alcance_ataque && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="text-sm font-medium">{player.alcance_ataque}m</div>
                    <div className="text-xs text-muted-foreground">Ataque</div>
                  </div>
                </div>
              )}
            </div>

            {/* Barras de progreso para métricas clave */}
            <div className="space-y-2">
              {player.alcance_ataque && player.alcance_bloqueo && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Alcance</span>
                    <span>{player.alcance_ataque}m / {player.alcance_bloqueo}m</span>
                  </div>
                  <Progress 
                    value={((player.alcance_ataque - 2.0) / (3.5 - 2.0)) * 100} 
                    className="h-2"
                  />
                </div>
              )}
              
              {player.salto_vertical && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Salto Vertical</span>
                    <span>{player.salto_vertical}m</span>
                  </div>
                  <Progress 
                    value={(player.salto_vertical / 0.8) * 100} 
                    className="h-2"
                  />
                </div>
              )}
              
              {player.velocidad_30m && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Velocidad 30m</span>
                    <span>{player.velocidad_30m}s</span>
                  </div>
                  <Progress 
                    value={((8.0 - player.velocidad_30m) / (8.0 - 3.5)) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </div>

            {player.fecha_medicion && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Medición: {new Date(player.fecha_medicion).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {/* Contacto */}
        {(player.contact_email || player.guardian_contact) && (
          <div className="space-y-1">
            <div className="text-sm font-medium">Contacto:</div>
            {player.contact_email && (
              <div className="text-sm text-muted-foreground">{player.contact_email}</div>
            )}
            {player.guardian_contact && (
              <div className="text-sm text-muted-foreground">{player.guardian_contact}</div>
            )}
          </div>
        )}

        {/* Sin datos físicos */}
        {!hasPhysicalData && (
          <div className="text-center py-4 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">Sin datos físicos registrados</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 