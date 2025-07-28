import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  publication_type: z.enum(["busco_equipo", "ofrezco_partido"]),
  team_id: z.string().optional(),
  club_id: z.string().optional(),
  category: z.string().min(1, "La categoría es requerida"),
  preferred_dates_start: z.date().optional(),
  preferred_dates_end: z.date().optional(),
  preferred_time_start: z.string().optional(),
  preferred_time_end: z.string().optional(),
  specific_date: z.date().optional(),
  location: z.string().min(1, "La ubicación es requerida"),
  match_format: z.string().min(1, "El formato del partido es requerido"),
  additional_notes: z.string().optional(),
  expiration_date: z.date().min(new Date(), "La fecha de expiración debe ser futura"),
});

type FormData = z.infer<typeof formSchema>;

interface FriendlyMatchFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function FriendlyMatchForm({ onSuccess, onCancel }: FriendlyMatchFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      publication_type: "busco_equipo",
      expiration_date: addDays(new Date(), 30),
    },
  });

  useEffect(() => {
    fetchTeamsAndClubs();
  }, []);

  const fetchTeamsAndClubs = async () => {
    try {
      // Fetch user's teams
      const { data: teamsData } = await supabase
        .from("teams")
        .select("*")
        .eq("coach_id", profile?.user_id);

      // Fetch clubs where user is a representative
      const { data: clubsData } = await supabase
        .from("clubs")
        .select(`
          *,
          club_representatives!inner(user_id)
        `)
        .eq("club_representatives.user_id", profile?.user_id);

      setTeams(teamsData || []);
      setClubs(clubsData || []);
    } catch (error) {
      console.error("Error fetching teams and clubs:", error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const matchData = {
        coach_id: profile?.user_id,
        team_id: data.team_id || null,
        club_id: data.club_id || null,
        publication_type: data.publication_type,
        category: data.category,
        preferred_dates_start: data.preferred_dates_start,
        preferred_dates_end: data.preferred_dates_end,
        preferred_time_start: data.preferred_time_start,
        preferred_time_end: data.preferred_time_end,
        specific_date: data.specific_date,
        location: data.location,
        match_format: data.match_format,
        additional_notes: data.additional_notes,
        expiration_date: data.expiration_date,
      };

      const { error } = await supabase
        .from("friendly_matches")
        .insert([{
          ...matchData,
          preferred_dates_start: data.preferred_dates_start?.toISOString().split('T')[0] || null,
          preferred_dates_end: data.preferred_dates_end?.toISOString().split('T')[0] || null,
          specific_date: data.specific_date?.toISOString() || null,
          expiration_date: data.expiration_date.toISOString().split('T')[0],
        }]);

      if (error) throw error;

      toast({
        title: "¡Tope publicado!",
        description: "Tu publicación ha sido creada exitosamente.",
      });

      onSuccess();
    } catch (error) {
      console.error("Error creating match:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la publicación. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="publication_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Publicación</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="busco_equipo">Busco equipo para tope</SelectItem>
                  <SelectItem value="ofrezco_partido">Ofrezco partido en casa</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="team_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipo (Opcional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un equipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} - {team.category}
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
            name="club_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Club (Opcional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un club" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría/Nivel</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Sub-14 Femenino, Senior Masculino Libre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="text-sm font-medium">Fechas y Horarios Preferidos</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="preferred_dates_start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha Inicio (Rango)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Selecciona fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_dates_end"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha Fin (Rango)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Selecciona fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="preferred_time_start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora Inicio</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_time_end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora Fin</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Dirección de la cancha o zona preferida" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="match_format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Formato del Partido</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ej: 3 sets, 90 minutos, al mejor de 5" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additional_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas Adicionales (Opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Ej: Probando nuevas rotaciones, necesitamos árbitro, etc."
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiration_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Expiración del Anuncio</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Publicando..." : "Publicar Tope"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}