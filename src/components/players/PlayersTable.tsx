import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Eye } from "lucide-react";

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

interface PlayersTableProps {
  players: Player[];
  onEdit: (player: Player) => void;
  onDelete: (playerId: string) => void;
  calculateAge: (birthdate: string) => number;
  getPositionColor: (position: string) => string;
}

export function PlayersTable({ players, onEdit, onDelete, calculateAge, getPositionColor }: PlayersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Jugador</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Posición</TableHead>
            <TableHead>Número</TableHead>
            <TableHead>Equipos</TableHead>
            <TableHead>Datos Físicos</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{player.full_name}</div>
                  <div className="text-sm text-muted-foreground">{player.document_id}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {calculateAge(player.birthdate)} años
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getPositionColor(player.position)}>
                  {player.position}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">#{player.jersey_number}</Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {player.teams?.map((team, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {team.name}
                    </Badge>
                  )) || "Sin equipo"}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm space-y-1">
                  {player.altura && (
                    <div>Altura: {player.altura}m</div>
                  )}
                  {player.peso && (
                    <div>Peso: {player.peso}kg</div>
                  )}
                  {player.alcance_ataque && (
                    <div>Ataque: {player.alcance_ataque}m</div>
                  )}
                  {player.alcance_bloqueo && (
                    <div>Bloqueo: {player.alcance_bloqueo}m</div>
                  )}
                  {!player.altura && !player.peso && !player.alcance_ataque && !player.alcance_bloqueo && (
                    <div className="text-muted-foreground">Sin datos</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm space-y-1">
                  {player.contact_email && (
                    <div>{player.contact_email}</div>
                  )}
                  {player.guardian_contact && (
                    <div className="text-muted-foreground">{player.guardian_contact}</div>
                  )}
                  {!player.contact_email && !player.guardian_contact && (
                    <div className="text-muted-foreground">Sin contacto</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(player)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(player.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 