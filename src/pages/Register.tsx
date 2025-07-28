import React, { useState } from "react";
import CoachRegisterForm from "../components/CoachRegisterForm";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Users, 
  Trophy, 
  MessageSquare, 
  ArrowRight, 
  Star, 
  Shield, 
  Zap, 
  CheckCircle,
  Volleyball,
  UserPlus,
  Sparkles,
  Target
} from "lucide-react";

// Fuente moderna
const interFont = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap";

export default function Register() {
  const [showCoachModal, setShowCoachModal] = useState(false);

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
              <a href="/login" className="text-gray-300 hover:text-white transition-colors font-medium">Iniciar sesión</a>
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
              <span className="text-sm font-medium text-gray-300">Únete a la revolución del voleibol</span>
            </div>

            {/* Título principal */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-black leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Únete a
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  VoleiPro
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                Elige tu rol y comienza a transformar la gestión de tu club de voleibol con tecnología de vanguardia.
              </p>
            </div>

            {/* Beneficios destacados */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-white">Seguro</div>
                <div className="text-sm text-gray-400">Datos protegidos</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-white">Rápido</div>
                <div className="text-sm text-gray-400">Configuración instantánea</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-white">Premium</div>
                <div className="text-sm text-gray-400">Calidad profesional</div>
              </div>
            </div>
          </div>

          {/* Tarjeta de selección de rol */}
          <div className="relative">
            <div className="relative z-10">
              {/* Contenedor principal */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                  
                  {/* Header de la tarjeta */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">¿Cómo deseas registrarte?</h2>
                    <p className="text-gray-300">Selecciona el tipo de usuario para continuar</p>
                  </div>

                  {/* Opciones de registro */}
                  <div className="space-y-4">
                    {/* Entrenador - Activo */}
                    <button
                      onClick={() => setShowCoachModal(true)}
                      className="group relative w-full p-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl text-left transition-all duration-300 hover:scale-105 shadow-2xl border border-white/20"
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">Entrenador</h3>
                            <p className="text-blue-100 text-sm">Gestión completa de equipos y jugadores</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    {/* Jugador - Deshabilitado */}
                    <button
                      disabled
                      className="group relative w-full p-6 bg-gray-700/50 rounded-2xl text-left transition-all duration-300 opacity-60 cursor-not-allowed border border-gray-600/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-600/50 rounded-xl flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-400">Jugador/a</h3>
                            <p className="text-gray-500 text-sm">Acceso a entrenamientos y estadísticas</p>
                            <span className="text-xs text-yellow-400 font-medium">(próximamente)</span>
                          </div>
                        </div>
                        <div className="w-5 h-5"></div>
                      </div>
                    </button>

                    {/* Padre/Madre - Deshabilitado */}
                    <button
                      disabled
                      className="group relative w-full p-6 bg-gray-700/50 rounded-2xl text-left transition-all duration-300 opacity-60 cursor-not-allowed border border-gray-600/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-600/50 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-400">Padre/Madre</h3>
                            <p className="text-gray-500 text-sm">Seguimiento del progreso de hijos</p>
                            <span className="text-xs text-yellow-400 font-medium">(próximamente)</span>
                          </div>
                        </div>
                        <div className="w-5 h-5"></div>
                      </div>
                    </button>
                  </div>

                  {/* Footer de la tarjeta */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Registro gratuito</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span>Datos seguros</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elementos decorativos */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
                <Target className="w-8 h-8 text-white" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                <Volleyball className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de registro de entrenador */}
      <Dialog open={showCoachModal} onOpenChange={setShowCoachModal}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
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