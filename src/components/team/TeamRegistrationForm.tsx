import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const teamSchema = z.object({
  name: z.string().min(2, 'El nombre del equipo debe tener al menos 2 caracteres'),
  category: z.string().min(1, 'Selecciona una categoría'),
  coach_id: z.string().min(1, 'Selecciona un entrenador principal'),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface Coach {
  id: string;
  full_name: string;
  user_id: string;
}

interface Team {
  id: string;
  name: string;
  category: string;
  coach_id: string;
  club_id: string; // Added club_id to the Team interface
}

interface TeamRegistrationFormProps {
  team?: Team | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const categories = [
  'U12',
  'U14',
  'U16',
  'U18',
  'U20',
  'Senior',
  'Master',
  'Veteranos'
];

export function TeamRegistrationForm({ team, onSuccess, onCancel }: TeamRegistrationFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team?.name || '',
      category: team?.category || '',
      coach_id: team?.coach_id || '',
    },
  });

  useEffect(() => {
    fetchCoaches();
  }, []);

  useEffect(() => {
    if (team) {
      form.reset({
        name: team.name,
        category: team.category,
        coach_id: team.coach_id,
      });
    }
  }, [team, form]);

  const fetchCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, user_id')
        .in('role', ['coach_main', 'coach_team']);

      if (error) throw error;
      setCoaches(data || []);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      toast({
        title: "Error",
        description: "Failed to load coaches",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: TeamFormData) => {
    setLoading(true);
    try {
      if (team) {
        // Update existing team
        const { error } = await supabase
          .from('teams')
          .update({
            name: data.name,
            category: data.category,
            coach_id: data.coach_id,
          })
          .eq('id', team.id);

        if (error) throw error;
      } else {
        // Create new team
        const { error } = await supabase
          .from('teams')
          .insert({
            name: data.name,
            category: data.category,
            coach_id: data.coach_id,
          });

        if (error) throw error;
      }

      onSuccess();
      form.reset();
    } catch (error) {
      console.error('Error saving team:', error);
      toast({
        title: "Error",
        description: "Failed to save team",
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Equipo</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Juvenil Femenino" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
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
            name="coach_id"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Entrenador Principal</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona entrenador principal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {coaches.map((coach) => (
                      <SelectItem key={coach.user_id} value={coach.user_id}>
                        {coach.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            {loading ? 'Guardando...' : team ? 'Actualizar Equipo' : 'Crear Equipo'}
          </Button>
        </div>
      </form>
      {/* Asignación de entrenadores secundarios al equipo */}
      {team ? (
        // <TeamCoachAssignment teamId={team.id} clubId={team.club_id} />
        <div className="mt-6 text-sm text-muted-foreground text-center">
          (Funcionalidad de asignación de entrenadores secundarios próximamente)
        </div>
      ) : (
        <div className="mt-6 text-sm text-muted-foreground text-center">
          Puedes asignar entrenadores secundarios una vez creado el equipo.
        </div>
      )}
    </Form>
  );
}