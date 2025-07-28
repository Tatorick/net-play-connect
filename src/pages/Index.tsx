import React from "react";
import volleyballHero from "@/assets/volleyball-hero.jpg";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, CheckCircle, Shield, Users, Zap, UserPlus, LogIn, ArrowRight, Star, TrendingUp, Award } from "lucide-react";

// Fuente moderna
const interFont = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap";

export default function Index() {
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

      {/* Header moderno con glassmorphism */}
      <header className="relative z-10">
        <div className="container mx-auto px-6 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo con fondo blanco para mejor visibilidad */}
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-2xl border border-white/20">
                <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                VoleiPro
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors font-medium">Características</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors font-medium">Precios</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors font-medium">Contacto</a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section completamente rediseñado */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Contenido principal */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge de estado */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-300">Plataforma en crecimiento activo</span>
            </div>

            {/* Título principal con efectos modernos */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Revoluciona
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  tu club
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                La plataforma más avanzada para gestión de voleibol. 
                <span className="text-white font-semibold"> Tecnología de vanguardia</span> para equipos profesionales.
              </p>
            </div>

            {/* Botones modernos con mejor contraste */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl transition-all duration-300 hover:scale-105"
                size="lg"
                onClick={() => window.location.href = '/register'}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <UserPlus className="w-6 h-6" />
                  Regístrate aquí
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              
              <Button
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl transition-all duration-300 hover:scale-105"
                size="lg"
                onClick={() => window.location.href = '/login'}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <LogIn className="w-6 h-6" />
                  Iniciar sesión
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>SSL Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Sin costes ocultos</span>
              </div>
            </div>
          </div>

          {/* Imagen principal con efectos modernos */}
          <div className="relative">
            <div className="relative z-10">
              {/* Contenedor principal de la imagen */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-2 border border-white/20">
                  <img
                    src={volleyballHero}
                    alt="Voleibol Hero"
                    className="w-full h-auto rounded-2xl shadow-2xl"
                    style={{ 
                      filter: 'contrast(1.1) saturate(1.2)',
                    }}
                  />
                </div>
              </div>

              {/* Elementos flotantes decorativos */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
                <Award className="w-10 h-10 text-white" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de características moderna */}
      <section id="features" className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              ¿Por qué elegir <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">VoleiPro</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Diseñado por entrenadores, para entrenadores. Tecnología de vanguardia que transforma la gestión deportiva.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: "Interfaz Intuitiva",
                description: "Diseño moderno y fácil de usar que se adapta a tu flujo de trabajo.",
                gradient: "from-green-400 to-blue-500"
              },
              {
                icon: Shield,
                title: "Seguridad Avanzada",
                description: "Protección de datos de nivel empresarial con encriptación de extremo a extremo.",
                gradient: "from-blue-400 to-purple-500"
              },
              {
                icon: Users,
                title: "Comunidad Activa",
                description: "Conecta con miles de entrenadores y comparte mejores prácticas.",
                gradient: "from-purple-400 to-pink-500"
              },
              {
                icon: Zap,
                title: "Rendimiento Óptimo",
                description: "Velocidad de carga ultrarrápida y sincronización en tiempo real.",
                gradient: "from-yellow-400 to-orange-500"
              },
              {
                icon: Star,
                title: "Soporte Premium",
                description: "Atención personalizada 24/7 con expertos en voleibol.",
                gradient: "from-pink-400 to-red-500"
              },
              {
                icon: Award,
                title: "Reconocimiento",
                description: "Plataforma galardonada por su innovación en gestión deportiva.",
                gradient: "from-indigo-400 to-purple-500"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:bg-white/10"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de testimonios */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-16">
            Lo que dicen nuestros <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">usuarios</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Carlos Rodríguez",
                role: "Entrenador Senior",
                content: "VoleiPro ha revolucionado completamente la gestión de mi club. La interfaz es increíblemente intuitiva.",
                rating: 5
              },
              {
                name: "María García",
                role: "Directora Técnica",
                content: "El soporte es excepcional y las herramientas de análisis han mejorado nuestro rendimiento.",
                rating: 5
              },
              {
                name: "David López",
                role: "Coordinador",
                content: "La mejor inversión que hemos hecho. La plataforma se paga sola con la eficiencia que nos aporta.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-3xl border border-white/20">
            <h2 className="text-4xl font-bold text-white mb-6">
              ¿Listo para transformar tu club?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Únete a miles de entrenadores que ya están revolucionando la gestión del voleibol.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl transition-all duration-300 hover:scale-105"
                size="lg"
                onClick={() => window.location.href = '/register'}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Regístrate aquí
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl transition-all duration-300 hover:scale-105"
                size="lg"
                onClick={() => window.location.href = '/login'}
              >
                Iniciar sesión
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer moderno */}
      <footer className="relative py-16 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {/* Logo en footer con fondo blanco */}
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-xl font-bold text-white">VoleiPro</span>
              </div>
              <p className="text-gray-400">
                La plataforma más avanzada para gestión de voleibol profesional.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Estado</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Síguenos</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Facebook className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Twitter className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} AlchemizeApps. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
