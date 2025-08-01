import React, { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Building2, MapPin, Globe, Landmark } from "lucide-react";
import { useNavigate } from "react-router-dom";

function validateEmail(email: string) {
  // Regex simple para email
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function strengthLabel(score: number) {
  if (score <= 2) return "Débil";
  if (score === 3 || score === 4) return "Media";
  if (score === 5) return "Fuerte";
  return "";
}

export default function CoachRegisterForm({ onBack }: { onBack?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Campos controlados para validación
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Validaciones inline
  const isFullNameValid = fullName.trim().length >= 3;
  const isEmailValid = validateEmail(email);
  const passwordScore = passwordStrength(password);
  const isPasswordValid = passwordScore >= 4;

  const canSubmit = !loading && isFullNameValid && isEmailValid && isPasswordValid;

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const club_name = form.club_name?.value;
    const city = form.city?.value;
    const province = form.province?.value;
    const country = form.country?.value;

    try {
      // 1. Registro en Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (signUpError) throw signUpError;
      const user_id = signUpData.user?.id;
      if (!user_id) throw new Error("No se pudo obtener el ID de usuario");

      // Crear club
      const { data: club, error: clubError } = await supabase
        .from("clubs")
        .insert([{ name: club_name, city, province, country, email }])
        .select()
        .single();
      if (clubError) throw clubError;
      
      // Crear solicitud de aprobación para coach_main
      const { error: requestError } = await supabase
        .from("coach_main_requests")
        .insert([{ user_id, club_id: club.id, status: "pending" }]);
      if (requestError) throw requestError;
      
      // Crear el registro del representante del club
      const { error: representativeError } = await supabase
        .from("club_representatives")
        .insert([{
          club_id: club.id,
          user_id: user_id,
          full_name: fullName,
          national_id: '', 
          personal_email: email,
          phone: '', 
          role_in_club: 'Entrenador Principal',
          terms_accepted: false,
          info_confirmed: false
        }]);
      if (representativeError) throw representativeError;

      setSuccess("¡Registro exitoso! Tu solicitud ha sido enviada para aprobación.");
      setFullName("");
      setEmail("");
      setPassword("");
      setFullNameTouched(false);
      setEmailTouched(false);
      setPasswordTouched(false);
      if (form) form.reset();
      if (onBack) onBack();
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Error en el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {onBack && (
        <Button type="button" variant="outline" onClick={onBack} className="mb-2">
          ← Volver
        </Button>
      )}
      <div className="space-y-2">
        <Label htmlFor="full_name">Nombre completo</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="Tu nombre completo"
            className="pl-10"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            onBlur={() => setFullNameTouched(true)}
            required
          />
        </div>
        {fullNameTouched && !isFullNameValid && (
          <div className="text-xs text-red-500 mt-1">El nombre debe tener al menos 3 caracteres.</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            className="pl-10"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            required
          />
        </div>
        {emailTouched && !isEmailValid && (
          <div className="text-xs text-red-500 mt-1">Introduce un email válido.</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            minLength={8}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            required
          />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-full h-2 rounded bg-gray-200 overflow-hidden">
            <div
              className={`h-2 rounded transition-all duration-300 ${
                passwordScore <= 2
                  ? "bg-red-400 w-1/4"
                  : passwordScore === 3
                  ? "bg-yellow-400 w-2/4"
                  : passwordScore === 4
                  ? "bg-blue-400 w-3/4"
                  : passwordScore === 5
                  ? "bg-green-500 w-full"
                  : ""
              }`}
            />
          </div>
          <span className={`text-xs font-medium ${
            passwordScore <= 2
              ? "text-red-500"
              : passwordScore === 3
              ? "text-yellow-600"
              : passwordScore === 4
              ? "text-blue-600"
              : passwordScore === 5
              ? "text-green-600"
              : ""
          }`}>
            {strengthLabel(passwordScore)}
          </span>
        </div>
        {passwordTouched && !isPasswordValid && (
          <div className="text-xs text-red-500 mt-1">La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.</div>
        )}
      </div>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-blue-600" />
          <div>
            <div className="font-semibold text-gray-900">Crear Nuevo Club</div>
            <p className="text-sm text-gray-600">Registro como entrenador principal</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="club_name">Nombre del club</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="club_name"
                name="club_name"
                type="text"
                placeholder="Nombre del club"
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="city"
                name="city"
                type="text"
                placeholder="Ciudad"
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">Provincia</Label>
            <div className="relative">
              <Landmark className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="province"
                name="province"
                type="text"
                placeholder="Provincia"
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="country"
                name="country"
                type="text"
                placeholder="País"
                className="pl-10"
                required
              />
            </div>
          </div>
        </div>
      </div>
      {error && <div className="text-sm text-red-500 text-center font-medium mt-2">{error}</div>}
      {success && <div className="text-sm text-green-600 text-center font-medium mt-2">{success}</div>}
      <Button type="submit" className="w-full" size="lg" disabled={!canSubmit}>
        {loading ? "Registrando..." : "Registrarse"}
      </Button>
    </form>
  );
} 