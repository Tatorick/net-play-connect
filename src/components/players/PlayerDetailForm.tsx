import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const playerSchema = z.object({
  // Información básica
  full_name: z.string().min(2, "Nombre completo debe tener al menos 2 caracteres"),
  document_id: z.string().min(5, "Documento debe tener al menos 5 caracteres"),
  birthdate: z.string().min(1, "Fecha de nacimiento es obligatoria"),
  position: z.string().min(1, "Selecciona una posición"),
  jersey_number: z.number().min(1).max(99, "Número debe estar entre 1 y 99"),
  guardian_name: z.string().min(3, "El nombre del padre/madre/tutor es obligatorio"),
  guardian_contact: z.string().optional(),
  contact_email: z.string().email("Email inválido").optional().or(z.literal("")),
  
  // Equipos
  team_ids: z.array(z.string()).min(1, "Selecciona al menos un equipo"),
  
  // Datos físicos
  altura: z.number().min(1.0).max(2.5).optional(),
  peso: z.number().min(20).max(200).optional(),
  alcance_ataque: z.number().min(1.5).max(4.0).optional(),
  alcance_bloqueo: z.number().min(1.5).max(4.0).optional(),
  salto_vertical: z.number().min(0.1).max(1.5).optional(),
  salto_horizontal: z.number().min(0.5).max(4.0).optional(),
  velocidad_30m: z.number().min(3.0).max(10.0).optional(),
  fecha_medicion: z.string().optional(),
  notas_fisicas: z.string().optional(),
});

type PlayerFormData = z.infer<typeof playerSchema>;

interface Team {
  id: string;
  name: string;
  category: string;
}

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
  guardian_name?: string;
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

interface PlayerDetailFormProps {
  player?: Player | null;
  teams: Team[];
  onSuccess: () => void;
  onCancel: () => void;
}

const positions = [
  "Colocador",
  "Libero",
  "Central",
  "Punta",
  "Opuesto",
  "Otro"
];

export function PlayerDetailForm({ player, teams, onSuccess, onCancel }: PlayerDetailFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialTeamIds, setInitialTeamIds] = useState<string[]>([]);
  const [documentValidation, setDocumentValidation] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: '' });
  const [jerseyValidation, setJerseyValidation] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: '' });

  const form = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      full_name: player?.full_name || "",
      document_id: player?.document_id || "",
      birthdate: player?.birthdate || "",
      position: player?.position || "",
      jersey_number: player?.jersey_number || 1,
      guardian_name: player?.guardian_name || "",
      guardian_contact: player?.guardian_contact || "",
      contact_email: player?.contact_email || "",
      team_ids: [],
      // Datos físicos
      altura: player?.altura || undefined,
      peso: player?.peso || undefined,
      alcance_ataque: player?.alcance_ataque || undefined,
      alcance_bloqueo: player?.alcance_bloqueo || undefined,
      salto_vertical: player?.salto_vertical || undefined,
      salto_horizontal: player?.salto_horizontal || undefined,
      velocidad_30m: player?.velocidad_30m || undefined,
      fecha_medicion: player?.fecha_medicion || "",
      notas_fisicas: player?.notas_fisicas || "",
    },
  });

  // Precargar equipos al editar
  useEffect(() => {
    if (player && player.team_id) {
      setInitialTeamIds([player.team_id]);
      form.setValue("team_ids", [player.team_id]);
    }
  }, [player, form]);

  // Validación en tiempo real del documento
  const validateDocument = async (documentId: string) => {
    if (!documentId || documentId.length < 5) {
      setDocumentValidation({ checking: false, available: null, message: '' });
      return;
    }

    // Si es edición y el documento no cambió, no validar
    if (player && player.document_id === documentId) {
      setDocumentValidation({ checking: false, available: true, message: 'Documento válido' });
      return;
    }

    setDocumentValidation({ checking: true, available: null, message: 'Verificando...' });

    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, full_name')
        .eq('document_id', documentId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No se encontró el documento, está disponible
        setDocumentValidation({ checking: false, available: true, message: 'Documento disponible' });
      } else if (data) {
        // Documento ya existe
        setDocumentValidation({ 
          checking: false, 
          available: false, 
          message: `Documento ya registrado por ${data.full_name}` 
        });
      }
    } catch (error) {
      setDocumentValidation({ checking: false, available: null, message: 'Error al verificar' });
    }
  };

  // Validación en tiempo real del número de camiseta
  const validateJerseyNumber = async (jerseyNumber: number, teamIds: string[]) => {
    if (!jerseyNumber || jerseyNumber < 1 || jerseyNumber > 99) {
      setJerseyValidation({ checking: false, available: null, message: '' });
      return;
    }

    if (teamIds.length === 0) {
      setJerseyValidation({ checking: false, available: null, message: 'Selecciona un equipo primero' });
      return;
    }

    // Si es edición y el número no cambió, no validar
    if (player && player.jersey_number === jerseyNumber) {
      setJerseyValidation({ checking: false, available: true, message: 'Número disponible' });
      return;
    }

    setJerseyValidation({ checking: true, available: null, message: 'Verificando...' });

    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, full_name, team_id')
        .in('team_id', teamIds)
        .eq('jersey_number', jerseyNumber);

      if (error) throw error;

      if (data && data.length > 0) {
        // Número ya está en uso en alguno de los equipos seleccionados
        const conflictingPlayer = data[0];
        const team = teams.find(t => t.id === conflictingPlayer.team_id);
        setJerseyValidation({ 
          checking: false, 
          available: false, 
          message: `Número ${jerseyNumber} ya usado por ${conflictingPlayer.full_name} en ${team?.name || 'equipo'}` 
        });
      } else {
        setJerseyValidation({ checking: false, available: true, message: 'Número disponible' });
      }
    } catch (error) {
      setJerseyValidation({ checking: false, available: null, message: 'Error al verificar' });
    }
  };

  // Debounce para las validaciones
  useEffect(() => {
    const documentId = form.watch('document_id');
    const timeoutId = setTimeout(() => {
      validateDocument(documentId);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [form.watch('document_id')]);

  useEffect(() => {
    const jerseyNumber = form.watch('jersey_number');
    const teamIds = form.watch('team_ids');
    const timeoutId = setTimeout(() => {
      validateJerseyNumber(jerseyNumber, teamIds);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [form.watch('jersey_number'), form.watch('team_ids')]);

  const onSubmit = async (data: PlayerFormData) => {
    setLoading(true);
    try {
      // Validar que se haya seleccionado al menos un equipo
      if (!data.team_ids || data.team_ids.length === 0) {
        toast({
          title: "Error",
          description: "Debes seleccionar al menos un equipo",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Validaciones adicionales antes de enviar
      if (documentValidation.available === false) {
        toast({
          title: "Error",
          description: "El documento ya está registrado",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (jerseyValidation.available === false) {
        toast({
          title: "Error",
          description: "El número de camiseta ya está en uso",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const playerData = {
        full_name: data.full_name,
        document_id: data.document_id,
        birthdate: data.birthdate,
        position: data.position,
        jersey_number: data.jersey_number,
        guardian_name: data.guardian_name,
        guardian_contact: data.guardian_contact || null,
        contact_email: data.contact_email || null,
        team_id: data.team_ids[0] || "",
        // Datos físicos
        altura: data.altura || null,
        peso: data.peso || null,
        alcance_ataque: data.alcance_ataque || null,
        alcance_bloqueo: data.alcance_bloqueo || null,
        salto_vertical: data.salto_vertical || null,
        salto_horizontal: data.salto_horizontal || null,
        velocidad_30m: data.velocidad_30m || null,
        fecha_medicion: data.fecha_medicion || null,
        notas_fisicas: data.notas_fisicas || null,
      };

      if (player) {
        // Update existing player
        console.log("🔄 Actualizando jugador:", playerData);
        const { error } = await supabase
          .from("players")
          .update(playerData as any)
          .eq("id", player.id);
        if (error) {
          console.error("❌ Error actualizando jugador:", error);
          throw error;
        }
      } else {
        // Create new player
        console.log("➕ Creando nuevo jugador:", playerData);
        const { error } = await supabase
          .from("players")
          .insert(playerData as any);
        if (error) {
          console.error("❌ Error creando jugador:", error);
          throw error;
        }
      }

      toast({
        title: "Éxito",
        description: player ? "Jugador actualizado correctamente" : "Jugador registrado correctamente",
      });
      onSuccess();
    } catch (error: any) {
      console.error("Error saving player:", error);
      
      // Manejar errores específicos de la base de datos
      let errorMessage = "Error al guardar el jugador";
      if (error.message) {
        if (error.message.includes("documento")) {
          errorMessage = "El documento ya está registrado en el sistema";
        } else if (error.message.includes("número de camiseta")) {
          errorMessage = "El número de camiseta ya está en uso en este equipo";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Información Básica</TabsTrigger>
            <TabsTrigger value="physical">Datos Físicos</TabsTrigger>
            <TabsTrigger value="teams">Equipos</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: María Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="document_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Documento *</FormLabel>
                        <FormControl>
                          <Input placeholder="Cédula o pasaporte" {...field} />
                        </FormControl>
                        <FormMessage />
                        {documentValidation.checking && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                            {documentValidation.message}
                          </div>
                        )}
                        {!documentValidation.checking && documentValidation.available === true && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            {documentValidation.message}
                          </div>
                        )}
                        {!documentValidation.checking && documentValidation.available === false && (
                          <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{documentValidation.message}</AlertDescription>
                          </Alert>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthdate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Nacimiento *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posición *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona posición" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {positions.map((position) => (
                              <SelectItem key={position} value={position}>
                                {position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jersey_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Camiseta *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="99"
                            placeholder="Ej: 10"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                        {jerseyValidation.checking && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                            {jerseyValidation.message}
                          </div>
                        )}
                        {!jerseyValidation.checking && jerseyValidation.available === true && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            {jerseyValidation.message}
                          </div>
                        )}
                        {!jerseyValidation.checking && jerseyValidation.available === false && (
                          <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{jerseyValidation.message}</AlertDescription>
                          </Alert>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de contacto</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="jugador@email.com"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="guardian_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de Padre/Madre/Tutor *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Juan Pérez"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guardian_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contacto de Padre/Madre/Tutor</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: +593987654321"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="physical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mediciones Físicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="altura"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altura (m)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            min="1.0"
                            max="2.5"
                            placeholder="1.75"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="peso"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1"
                            min="20"
                            max="200"
                            placeholder="65.5"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fecha_medicion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de medición</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="alcance_ataque"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alcance de ataque (m)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            min="1.5"
                            max="4.0"
                            placeholder="2.85"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alcance_bloqueo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alcance de bloqueo (m)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            min="1.5"
                            max="4.0"
                            placeholder="2.75"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salto_vertical"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salto vertical (m)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            min="0.1"
                            max="1.5"
                            placeholder="0.45"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salto_horizontal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salto horizontal (m)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            min="0.5"
                            max="4.0"
                            placeholder="2.20"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="velocidad_30m"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Velocidad 30m (s)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1"
                            min="3.0"
                            max="10.0"
                            placeholder="4.5"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notas_fisicas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas sobre condición física</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observaciones sobre la condición física, lesiones, etc."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asignación de Equipos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="team_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipos *</FormLabel>
                      <div className="space-y-2">
                        {teams.map((team) => (
                          <div key={team.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={team.id}
                              checked={field.value.includes(team.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, team.id]);
                                } else {
                                  field.onChange(field.value.filter((id) => id !== team.id));
                                }
                              }}
                            />
                            <Label htmlFor={team.id} className="text-sm font-normal">
                              {team.name} ({team.category})
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading || documentValidation.available === false || jerseyValidation.available === false}
          >
            {loading ? "Guardando..." : player ? "Actualizar Jugador" : "Registrar Jugador"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 