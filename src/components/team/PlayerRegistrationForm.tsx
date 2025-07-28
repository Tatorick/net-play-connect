import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const playerSchema = z.object({
  full_name: z.string().min(2, 'Nombre completo debe tener al menos 2 caracteres'),
  document_id: z.string().min(5, 'Documento debe tener al menos 5 caracteres'),
  birthdate: z.preprocess((val) => {
    if (typeof val === 'string') {
      // Validar formato yyyy-MM-dd
      const match = val.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
      if (!match) return undefined;
      const year = match[1];
      if (year.length !== 4) return undefined;
      const date = new Date(val + 'T00:00:00');
      if (isNaN(date.getTime())) return undefined;
      return date;
    }
    if (val instanceof Date && !isNaN(val.getTime())) {
      // Validar año
      const year = val.getFullYear().toString();
      if (year.length !== 4) return undefined;
      return val;
    }
    return undefined;
  }, z.date({ required_error: 'Fecha de nacimiento es obligatoria' }))
    .refine((date) => {
      if (!(date instanceof Date) || isNaN(date.getTime())) return false;
      const year = date.getFullYear();
      return year > 1900 && year < 2100;
    }, {
      message: 'Introduce una fecha válida con año de 4 dígitos (ej: 2005-08-15)'
    }),
  position: z.string().min(1, 'Selecciona una posición'),
  jersey_number: z.number().min(1).max(99, 'Número debe estar entre 1 y 99'),
  guardian_name: z.string().min(3, 'El nombre del padre/madre/tutor es obligatorio'),
  guardian_contact: z.string().optional(),
  team_ids: z.array(z.string()).min(1, 'Selecciona al menos un equipo'),
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
}

interface PlayerRegistrationFormProps {
  player?: Player | null;
  teams: Team[];
  onSuccess: () => void;
  onCancel: () => void;
}

const positions = [
  'Colocador',
  'Libero',
  'Central',
  'Punta',
  'Opuesto',
  'Otro'
];

export function PlayerRegistrationForm({ player, teams, onSuccess, onCancel }: PlayerRegistrationFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialTeamIds, setInitialTeamIds] = useState<string[]>([]);

  const form = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      full_name: player?.full_name || '',
      document_id: player?.document_id || '',
      birthdate: player ? new Date(player.birthdate + 'T00:00:00') : undefined,
      position: player?.position || '',
      jersey_number: player?.jersey_number || 1,
      guardian_name: (player && 'guardian_name' in player && (player as any).guardian_name) ? (player as any).guardian_name : '',
      guardian_contact: player?.guardian_contact || '',
      team_ids: [],
    },
  });

  // Precargar equipos al editar
  useEffect(() => {
    const fetchPlayerTeams = async () => {
      if (player) {
        const { data: playerTeams } = await supabase
          .from('player_teams')
          .select('team_id')
          .eq('player_id', player.id);
        const ids = (playerTeams || []).map((pt: { team_id: string }) => pt.team_id);
        setInitialTeamIds(ids);
        form.setValue('team_ids', ids);
      }
    };
    fetchPlayerTeams();
    // eslint-disable-next-line
  }, [player]);

  const onSubmit = async (data: PlayerFormData) => {
    setLoading(true);
    try {
      const playerData = {
        full_name: data.full_name,
        document_id: data.document_id,
        birthdate: format(data.birthdate, 'yyyy-MM-dd'),
        position: data.position,
        jersey_number: data.jersey_number,
        guardian_name: data.guardian_name,
        guardian_contact: data.guardian_contact || null,
        team_id: data.team_ids[0], // TEMPORAL: para cumplir con el esquema actual
      };

      let playerId = player?.id;
      if (player) {
        // Update existing player
        const { error } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', player.id);
        if (error) throw error;
      } else {
        // Create new player
        const { data: newPlayer, error } = await supabase
          .from('players')
          .insert(playerData)
          .select('id')
          .single();
        if (error) throw error;
        playerId = newPlayer.id;
      }

      // Sincronizar player_teams
      // 1. Eliminar relaciones no seleccionadas
      if (playerId) {
        const toRemove = initialTeamIds.filter((id) => !data.team_ids.includes(id));
        if (toRemove.length > 0) {
          await supabase
            .from('player_teams')
            .delete()
            .in('team_id', toRemove)
            .eq('player_id', playerId);
        }
        // 2. Añadir nuevas relaciones
        const toAdd = data.team_ids.filter((id) => !initialTeamIds.includes(id));
        if (toAdd.length > 0) {
          const inserts = toAdd.map((team_id) => ({ player_id: playerId, team_id }));
          await supabase.from('player_teams').insert(inserts);
        }
      }

      onSuccess();
      form.reset();
    } catch (error) {
      console.error('Error saving player:', error);
      toast({
        title: "Error",
        description: "Failed to save player",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <Input
                    type="date"
                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                    onChange={e => {
                      // Validar manualmente el input
                      const val = e.target.value;
                      // Solo permitir yyyy-MM-dd
                      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                        const year = val.substring(0, 4);
                        if (year.length === 4) {
                          const date = new Date(val + 'T00:00:00');
                          field.onChange(date);
                          return;
                        }
                      }
                      // Si no es válido, pasar string para que zod lo rechace
                      field.onChange(val);
                    }}
                    placeholder="Selecciona o escribe la fecha"
                  />
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
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="team_ids"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipos *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value || field.value.length === 0 ? "text-muted-foreground" : ""
                      )}
                    >
                      {field.value && field.value.length > 0
                        ? teams.filter(t => field.value.includes(t.id)).map(t => t.name).join(", ")
                        : "Selecciona uno o varios equipos"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar equipo..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron equipos.</CommandEmpty>
                        {teams.map((team) => (
                          <CommandItem key={team.id} value={team.id} onSelect={() => {
                            const exists = field.value.includes(team.id);
                            if (exists) {
                              field.onChange(field.value.filter((id: string) => id !== team.id));
                            } else {
                              field.onChange([...field.value, team.id]);
                            }
                          }}>
                            <Checkbox
                              checked={field.value.includes(team.id)}
                              className="mr-2"
                              tabIndex={-1}
                              aria-hidden="true"
                            />
                            {team.name} ({team.category})
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

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

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : player ? 'Actualizar Jugadora' : 'Registrar Jugadora'}
          </Button>
        </div>
      </form>
    </Form>
  );
}