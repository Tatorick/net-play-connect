import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Mail, Phone, Globe, Facebook, Instagram, Twitter, User, IdCard, Building } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ClubFormData {
  // General Club Information
  name: string;
  city: string;
  province: string;
  country: string;
  foundation_date?: string;
  
  // Contact Information
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  
  // Representative Information
  rep_full_name: string;
  rep_national_id: string;
  rep_personal_email: string;
  rep_phone: string;
  rep_role_in_club: string;
  
  // Terms
  terms_accepted: boolean;
  info_confirmed: boolean;
}

interface Club {
  id: string;
  name: string;
  city: string;
  province: string;
  country: string;
  foundation_date?: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  logo_url?: string;
}

interface ClubRepresentative {
  id: string;
  club_id: string;
  full_name: string;
  national_id: string;
  personal_email: string;
  phone: string;
  role_in_club: string;
  terms_accepted: boolean;
  info_confirmed: boolean;
}

function ClubCoachRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // id de solicitud en acción

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      if (!user) {
        setError("No autenticado");
        setLoading(false);
        return;
      }
      // Buscar el club donde el usuario es coach_main (por email)
      const { data: club, error: clubError } = await (supabase as any)
        .from("clubs")
        .select("id")
        .eq("email", user.email)
        .single();
      if (clubError || !club) {
        setError("No se encontró el club del entrenador principal");
        setLoading(false);
        return;
      }
      // 2. Obtener solicitudes pendientes para ese club
      const { data, error: reqError } = await (supabase as any)
        .from("club_coach_assignments")
        .select("id, coach_user_id, status, profiles:coach_user_id(full_name, user_id)")
        .eq("club_id", club.id)
        .eq("status", "pending");
      if (reqError) {
        setError("Error al cargar solicitudes");
        setLoading(false);
        return;
      }
      setRequests(data || []);
      setLoading(false);
    };
    fetchRequests();
  }, [user]);

  const handleAction = async (id: string, newStatus: "approved" | "rejected") => {
    setActionLoading(id);
    await (supabase as any)
      .from("club_coach_assignments")
      .update({ status: newStatus })
      .eq("id", id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setActionLoading(null);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Solicitudes de Entrenadores Secundarios</CardTitle>
        <CardDescription>Aprueba o rechaza entrenadores que desean unirse a tu club.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Cargando solicitudes...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div>No hay solicitudes pendientes.</div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-medium">{req.profiles?.full_name || req.coach_user_id}</div>
                  <div className="text-xs text-muted-foreground">ID: {req.coach_user_id}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    disabled={actionLoading === req.id}
                    onClick={() => handleAction(req.id, "approved")}
                  >
                    Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={actionLoading === req.id}
                    onClick={() => handleAction(req.id, "rejected")}
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ClubManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [club, setClub] = useState<Club | null>(null);
  const [representative, setRepresentative] = useState<ClubRepresentative | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ClubFormData>();

  const watchTerms = watch("terms_accepted");
  const watchInfoConfirmed = watch("info_confirmed");

  // Load existing club data
  useEffect(() => {
    const loadClubData = async () => {
      if (!user) return;
      try {
        // Check if user has a club representative record
        const { data: repData } = await (supabase as any)
          .from('club_representatives')
          .select(`*, clubs (*)`)
          .eq('user_id', user.id)
          .single();
        if (repData && repData.clubs) {
          let clubObj = repData.clubs;
          if (Array.isArray(clubObj)) {
            clubObj = clubObj[0] || {};
          }
          if (clubObj && typeof clubObj === 'object' && !Array.isArray(clubObj)) {
            setRepresentative(repData as any);
            setClub(clubObj as any);
          // Populate form with existing data
          reset({
              name: clubObj.name || '',
              city: clubObj.city || '',
              province: clubObj.province || '',
              country: clubObj.country || '',
              foundation_date: clubObj.foundation_date || '',
              email: clubObj.email || '',
              phone: clubObj.phone || '',
              address: clubObj.address || '',
              website: clubObj.website || '',
              facebook: clubObj.facebook || '',
              instagram: clubObj.instagram || '',
              twitter: clubObj.twitter || '',
              rep_full_name: repData.full_name || '',
              rep_national_id: repData.national_id || '',
              rep_personal_email: repData.personal_email || '',
              rep_phone: repData.phone || '',
              rep_role_in_club: repData.role_in_club || '',
              terms_accepted: repData.terms_accepted || false,
              info_confirmed: repData.info_confirmed || false,
          });
          }
        }
      } catch (error) {
        console.error('Error loading club data:', error);
      }
    };
    loadClubData();
  }, [user, reset]);

  const onSubmit = async (data: ClubFormData) => {
    if (!user) return;

    setIsLoading(true);

    try {
      if (club && representative) {
        // Update existing club and representative
        const { error: clubError } = await (supabase as any)
          .from('clubs')
          .update({
            name: data.name,
            city: data.city,
            province: data.province,
            country: data.country,
            foundation_date: data.foundation_date || null,
            email: data.email,
            phone: data.phone || null,
            address: data.address || null,
            website: data.website || null,
            facebook: data.facebook || null,
            instagram: data.instagram || null,
            twitter: data.twitter || null,
          })
          .eq('id', club.id);
        if (clubError) throw clubError;
        const { error: repError } = await (supabase as any)
          .from('club_representatives')
          .update({
            full_name: data.rep_full_name,
            national_id: data.rep_national_id,
            personal_email: data.rep_personal_email,
            phone: data.rep_phone,
            role_in_club: data.rep_role_in_club,
            terms_accepted: data.terms_accepted,
            info_confirmed: data.info_confirmed,
          })
          .eq('id', representative.id);
        if (repError) throw repError;
        toast({
          title: "Club actualizado",
          description: "La información del club se ha actualizado correctamente.",
        });
        setIsEditing(false);
      } else {
        // Create new club and representative
        const { data: clubData, error: clubError } = await (supabase as any)
          .from('clubs')
          .insert({
            name: data.name,
            city: data.city,
            province: data.province,
            country: data.country,
            foundation_date: data.foundation_date || null,
            email: data.email,
            phone: data.phone || null,
            address: data.address || null,
            website: data.website || null,
            facebook: data.facebook || null,
            instagram: data.instagram || null,
            twitter: data.twitter || null,
          })
          .select()
          .single();
        if (clubError) throw clubError;
        const { error: repError } = await (supabase as any)
          .from('club_representatives')
          .insert({
            club_id: clubData.id,
            user_id: user.id,
            full_name: data.rep_full_name,
            national_id: data.rep_national_id,
            personal_email: data.rep_personal_email,
            phone: data.rep_phone,
            role_in_club: data.rep_role_in_club,
            terms_accepted: data.terms_accepted,
            info_confirmed: data.info_confirmed,
          });
        if (repError) throw repError;
        setClub(clubData as any);
        toast({
          title: "Club registrado",
          description: "Tu club se ha registrado correctamente en VoleiPro.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = watchTerms && watchInfoConfirmed;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Mi Club</h1>
              <p className="text-muted-foreground mt-2">
                {club ? "Gestiona la información de tu club" : "Registra tu club en VoleiPro"}
              </p>
            </div>
            {club && !isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Editar Información
              </Button>
            )}
          </div>

          {!club || isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* General Club Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Información General del Club
                  </CardTitle>
                  <CardDescription>
                    Datos básicos de identificación del club
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Club *</Label>
                      <Input
                        id="name"
                        {...register("name", { required: "Este campo es obligatorio" })}
                        placeholder="Ej: Club Voleibol Madrid"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        {...register("city", { required: "Este campo es obligatorio" })}
                        placeholder="Ej: Madrid"
                      />
                      {errors.city && (
                        <p className="text-sm text-destructive">{errors.city.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="province">Provincia *</Label>
                      <Input
                        id="province"
                        {...register("province", { required: "Este campo es obligatorio" })}
                        placeholder="Ej: Madrid"
                      />
                      {errors.province && (
                        <p className="text-sm text-destructive">{errors.province.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">País *</Label>
                      <Input
                        id="country"
                        {...register("country", { required: "Este campo es obligatorio" })}
                        placeholder="Ej: España"
                      />
                      {errors.country && (
                        <p className="text-sm text-destructive">{errors.country.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="foundation_date">Fecha de Fundación</Label>
                      <Input
                        id="foundation_date"
                        type="date"
                        {...register("foundation_date")}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Información de Contacto
                  </CardTitle>
                  <CardDescription>
                    Datos de contacto del club
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email del Club *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email", { required: "Este campo es obligatorio" })}
                        placeholder="contacto@tuclub.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        placeholder="+34 600 000 000"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address">Dirección / Sede del Club</Label>
                      <Textarea
                        id="address"
                        {...register("address")}
                        placeholder="Dirección completa del club"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Sitio Web</Label>
                      <Input
                        id="website"
                        {...register("website")}
                        placeholder="https://www.tuclub.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        {...register("facebook")}
                        placeholder="@tuclub"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        {...register("instagram")}
                        placeholder="@tuclub"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        {...register("twitter")}
                        placeholder="@tuclub"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Representative Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información del Representante
                  </CardTitle>
                  <CardDescription>
                    Datos del representante o entrenador principal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rep_full_name">Nombre Completo *</Label>
                      <Input
                        id="rep_full_name"
                        {...register("rep_full_name", { required: "Este campo es obligatorio" })}
                        placeholder="Nombre y apellidos"
                      />
                      {errors.rep_full_name && (
                        <p className="text-sm text-destructive">{errors.rep_full_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rep_national_id">DNI/NIE/Documento *</Label>
                      <Input
                        id="rep_national_id"
                        {...register("rep_national_id", { required: "Este campo es obligatorio" })}
                        placeholder="12345678A"
                      />
                      {errors.rep_national_id && (
                        <p className="text-sm text-destructive">{errors.rep_national_id.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rep_personal_email">Email Personal *</Label>
                      <Input
                        id="rep_personal_email"
                        type="email"
                        {...register("rep_personal_email", { required: "Este campo es obligatorio" })}
                        placeholder="tu@email.com"
                      />
                      {errors.rep_personal_email && (
                        <p className="text-sm text-destructive">{errors.rep_personal_email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rep_phone">Teléfono *</Label>
                      <Input
                        id="rep_phone"
                        {...register("rep_phone", { required: "Este campo es obligatorio" })}
                        placeholder="+34 600 000 000"
                      />
                      {errors.rep_phone && (
                        <p className="text-sm text-destructive">{errors.rep_phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rep_role_in_club">Rol en el Club *</Label>
                      <Select onValueChange={(value) => setValue("rep_role_in_club", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="President">Presidente</SelectItem>
                          <SelectItem value="Coach">Entrenador</SelectItem>
                          <SelectItem value="Coordinator">Coordinador</SelectItem>
                          <SelectItem value="Other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.rep_role_in_club && (
                        <p className="text-sm text-destructive">{errors.rep_role_in_club.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle>Términos y Condiciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms_accepted"
                      {...register("terms_accepted", { required: true })}
                      onCheckedChange={(checked) => setValue("terms_accepted", !!checked)}
                    />
                    <Label htmlFor="terms_accepted" className="text-sm">
                      Acepto los términos y condiciones de VoleiPro *
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="info_confirmed"
                      {...register("info_confirmed", { required: true })}
                      onCheckedChange={(checked) => setValue("info_confirmed", !!checked)}
                    />
                    <Label htmlFor="info_confirmed" className="text-sm">
                      Confirmo que la información proporcionada es veraz y exacta *
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="flex-1"
                >
                  {isLoading
                    ? (club ? "Actualizando..." : "Registrando...")
                    : (club ? "Actualizar Club" : "Registrar Club")
                  }
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          ) : (
            // Display mode
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {club.name}
                  </CardTitle>
                  <CardDescription>
                    {club.city}, {club.province}, {club.country}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {club.foundation_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Fundado: {new Date(club.foundation_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{club.city}, {club.province}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{club.email}</span>
                    </div>

                    {club.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{club.phone}</span>
                      </div>
                    )}

                    {club.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          Sitio Web
                        </a>
                      </div>
                    )}
                  </div>

                  {club.address && (
                    <div>
                      <Label className="text-sm font-medium">Dirección:</Label>
                      <p className="text-sm text-muted-foreground mt-1">{club.address}</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    {club.facebook && (
                      <a href={`https://facebook.com/${club.facebook}`} target="_blank" rel="noopener noreferrer">
                        <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary" />
                      </a>
                    )}
                    {club.instagram && (
                      <a href={`https://instagram.com/${club.instagram}`} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary" />
                      </a>
                    )}
                    {club.twitter && (
                      <a href={`https://twitter.com/${club.twitter}`} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {representative && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Representante del Club
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Nombre:</Label>
                        <p className="text-sm text-muted-foreground">{representative.full_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Rol:</Label>
                        <p className="text-sm text-muted-foreground">{representative.role_in_club}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email:</Label>
                        <p className="text-sm text-muted-foreground">{representative.personal_email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Teléfono:</Label>
                        <p className="text-sm text-muted-foreground">{representative.phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <ClubCoachRequests />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}