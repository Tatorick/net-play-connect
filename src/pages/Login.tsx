import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Volleyball, 
  Mail, 
  Lock, 
  ArrowRight, 
  Users, 
  Trophy, 
  BarChart3, 
  MessageSquare, 
  User, 
  MailCheck,
  Shield,
  CheckCircle,
  Zap,
  Star,
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CoachRegisterForm from "../components/CoachRegisterForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Fuente moderna
const interFont = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap";

const userRoles = [
  {
    role: "coach",
    label: "Entrenador",
    description: "Gestión de equipos y jugadores",
    icon: Users,
    variant: "default" as const,
  },
  {
    role: "player",
    label: "Jugador",
    description: "Acceso a entrenamientos y estadísticas",
    icon: Trophy,
    variant: "secondary" as const,
  },
  {
    role: "parent",
    label: "Padre/Madre",
    description: "Seguimiento del progreso de hijos",
    icon: MessageSquare,
    variant: "outline" as const,
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("coach");
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterSelector, setShowRegisterSelector] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error al iniciar sesión",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "¡Bienvenido a VoleiPro!",
          description: "Has iniciado sesión correctamente",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetSuccess(false);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + "/login"
      });
      if (error) {
        toast({
          title: "Error al enviar el correo",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      setResetSuccess(true);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>
      <link rel="stylesheet" href={interFont} />
      
      {/* Fondo dinámico con gradientes complejos */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.2),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(236,72,153,0.1),transparent_50%)]"></div>
        
        {/* Elementos decorativos flotantes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header moderno */}
      <header className="relative z-10">
        <div className="container mx-auto px-6 py-6">
          <nav className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              {/* Logo con fondo blanco */}
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-2xl border border-white/20">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                VoleiPro
              </span>
            </a>
            <div className="hidden md:flex items-center gap-8">
              <a href="/" className="text-gray-300 hover:text-white transition-colors font-medium">Inicio</a>
              <a href="/register" className="text-gray-300 hover:text-white transition-colors font-medium">Registrarse</a>
            </div>
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Contenido informativo */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge de estado */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">Accede a tu plataforma</span>
            </div>

            {/* Título principal */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-black leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Bienvenido de
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  vuelta
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                Accede a tu plataforma de gestión de voleibol y continúa transformando tu club con tecnología de vanguardia.
              </p>
            </div>

            {/* Beneficios destacados */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-white">Seguro</div>
                <div className="text-sm text-gray-400">Acceso protegido</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-white">Rápido</div>
                <div className="text-sm text-gray-400">Inicio instantáneo</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-white">Premium</div>
                <div className="text-sm text-gray-400">Experiencia completa</div>
              </div>
            </div>
          </div>

          {/* Tarjeta de login */}
          <div className="relative">
            <div className="relative z-10">
              {/* Contenedor principal */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                  
                  {/* Header de la tarjeta */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Volleyball className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {showRegisterSelector ? "Crear Cuenta" : "Iniciar Sesión"}
                    </h2>
                    <p className="text-gray-300">
                      {showRegisterSelector
                        ? "Únete a la plataforma de gestión de voleibol"
                        : "Accede a tu plataforma de gestión de voleibol"
                      }
                    </p>
                  </div>

                  {/* Contenido del formulario */}
                  <div className="space-y-6">
                    {showRegisterSelector ? (
                      <>
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-white">Tipo de Usuario</Label>
                          <div className="grid grid-cols-1 gap-3">
                            <button
                              type="button"
                              onClick={() => setShowCoachModal(true)}
                              className="p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] border-white/20 bg-white/5 hover:bg-white/10 shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                  <Users className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <div className="font-semibold text-white">Entrenador</div>
                                  <p className="text-sm text-gray-300">
                                    Gestión de equipos y jugadores
                                  </p>
                                </div>
                              </div>
                            </button>
                            <button
                              type="button"
                              disabled
                              className="p-4 rounded-2xl border text-left transition-all opacity-60 cursor-not-allowed border-gray-600/30 bg-gray-700/50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-600/50 rounded-xl flex items-center justify-center">
                                  <Trophy className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-400">Jugador</div>
                                  <p className="text-sm text-gray-500">
                                    Acceso a entrenamientos y estadísticas
                                  </p>
                                  <span className="text-xs text-yellow-400 font-medium">(próximamente)</span>
                                </div>
                              </div>
                            </button>
                            <button
                              type="button"
                              disabled
                              className="p-4 rounded-2xl border text-left transition-all opacity-60 cursor-not-allowed border-gray-600/30 bg-gray-700/50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-600/50 rounded-xl flex items-center justify-center">
                                  <MessageSquare className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-400">Padre/Madre</div>
                                  <p className="text-sm text-gray-500">
                                    Seguimiento del progreso de hijos
                                  </p>
                                  <span className="text-xs text-yellow-400 font-medium">(próximamente)</span>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                        <div className="text-center mt-6">
                          <Button 
                            variant="ghost" 
                            onClick={() => setShowRegisterSelector(false)}
                            className="text-gray-300 hover:text-white"
                          >
                            ← Volver al inicio de sesión
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Formulario de login */}
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">Contraseña</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-2xl font-semibold shadow-2xl transition-all duration-300 hover:scale-105"
                            size="lg"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              "Iniciando sesión..."
                            ) : (
                              <>
                                Iniciar Sesión
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </form>

                        {/* Enlaces de navegación */}
                        <div className="text-center space-y-3">
                          <p className="text-sm text-gray-300">
                            ¿No tienes una cuenta?{' '}
                            <button
                              type="button"
                              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                              onClick={() => setShowRegisterSelector(true)}
                            >
                              Regístrate aquí
                            </button>
                          </p>
                          <p className="text-xs text-gray-400">
                            ¿Olvidaste tu contraseña?{' '}
                            <button
                              type="button"
                              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                              onClick={() => setShowResetModal(true)}
                            >
                              Recuperar
                            </button>
                          </p>
                        </div>

                        {/* Footer de la tarjeta */}
                        <div className="pt-6 border-t border-white/10">
                          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span>Acceso seguro</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-blue-400" />
                              <span>Datos protegidos</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Elementos decorativos */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
                <Star className="w-8 h-8 text-white" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de recuperación de contraseña */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MailCheck className="w-5 h-5" />
              Recuperar contraseña
            </DialogTitle>
            <DialogDescription>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </DialogDescription>
          </DialogHeader>
          {resetSuccess ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <MailCheck className="w-12 h-12 text-green-500" />
              <p className="text-center font-medium">Si el correo existe, recibirás un enlace para restablecer tu contraseña.</p>
              <Button className="mt-4" onClick={() => setShowResetModal(false)}>Cerrar</Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Correo electrónico</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de registro de entrenador */}
      <Dialog open={showCoachModal} onOpenChange={setShowCoachModal}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Registro de Entrenador
            </DialogTitle>
            <DialogDescription>
              Completa el formulario para crear o unirte a un club en VoleiPro.
            </DialogDescription>
          </DialogHeader>
          <CoachRegisterForm onBack={() => setShowCoachModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}