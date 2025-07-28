import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Trophy, 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  UserCheck, 
  Target,
  Plus,
  Activity,
  Clock,
  Medal
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Mock data - in real app this would come from API
const dashboardData = {
  coach: {
    stats: {
      teams: 3,
      players: 45,
      upcomingMatches: 8,
      winRate: 72
    },
    recentActivity: [
      { type: "match", description: "Victoria vs Deportivo Alcalá", time: "Hace 2 días", status: "win" },
      { type: "training", description: "Entrenamiento equipo senior", time: "Hace 1 día", status: "completed" },
      { type: "tournament", description: "Inscripción Liga Regional", time: "Hace 3 horas", status: "pending" },
    ],
    upcomingEvents: [
      { type: "match", title: "vs Club Mediterráneo", date: "15 Nov", time: "18:00" },
      { type: "training", title: "Entrenamiento técnico", date: "16 Nov", time: "19:30" },
      { type: "tournament", title: "Torneo de Navidad", date: "20 Nov", time: "09:00" },
    ]
  }
};

const QuickActionCard = ({ icon: Icon, title, description, action, variant = "default", onClick }: {
  icon: any;
  title: string;
  description: string;
  action: string;
  variant?: "default" | "orange" | "success";
  onClick?: () => void;
}) => (
  <Card className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={onClick}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <Icon className={`h-5 w-5 ${
          variant === "orange" ? "text-accent-orange" : 
          variant === "success" ? "text-success" : 
          "text-primary"
        }`} />
        <Button size="sm" variant={variant === "orange" ? "orange" : variant === "success" ? "success" : "default"}>
          {action}
        </Button>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const StatCard = ({ icon: Icon, label, value, trend, color = "primary" }: {
  icon: any;
  label: string;
  value: string | number;
  trend?: string;
  color?: string;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className="text-xs text-success flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg bg-${color}/10 flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { profile } = useAuth();
  const userRole = "coach"; // Esto puede venir del perfil si tienes roles dinámicos
  const data = dashboardData[userRole as keyof typeof dashboardData];
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta, {profile?.full_name || "Entrenador"}. Aquí tienes un resumen de tu actividad.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Equipos"
            value={data.stats.teams}
            trend="+1 este mes"
            color="primary"
          />
          <StatCard
            icon={UserCheck}
            label="Jugadores"
            value={data.stats.players}
            trend="+5 este mes"
            color="accent-orange"
          />
          <StatCard
            icon={Target}
            label="Próximos Partidos"
            value={data.stats.upcomingMatches}
            color="success"
          />
          <StatCard
            icon={Trophy}
            label="% Victorias"
            value={`${data.stats.winRate}%`}
            trend="+8% vs mes anterior"
            color="warning"
          />
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            icon={Plus}
            title="Nuevo Jugador"
            description="Registra un nuevo jugador en tu equipo"
            action="Agregar"
            variant="default"
            onClick={() => navigate("/players", { state: { openNewPlayerForm: true } })}
          />
          <QuickActionCard
            icon={Calendar}
            title="Programar Entrenamiento"
            description="Organiza una nueva sesión de entrenamiento"
            action="Programar"
            variant="orange"
          />
          <QuickActionCard
            icon={Trophy}
            title="Inscribir en Torneo"
            description="Registra tu equipo en una competición"
            action="Inscribir"
            variant="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>
                Últimas acciones y eventos en tu club
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === "win" ? "bg-success" :
                    activity.status === "completed" ? "bg-primary" :
                    "bg-warning"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge variant={
                    activity.status === "win" ? "default" :
                    activity.status === "completed" ? "secondary" :
                    "outline"
                  }>
                    {activity.status === "win" ? "Victoria" :
                     activity.status === "completed" ? "Completado" :
                     "Pendiente"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Próximos Eventos
              </CardTitle>
              <CardDescription>
                Entrenamientos y partidos programados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    event.type === "match" ? "bg-primary/10" :
                    event.type === "training" ? "bg-accent-orange/10" :
                    "bg-success/10"
                  }`}>
                    {event.type === "match" ? (
                      <Target className={`h-5 w-5 text-primary`} />
                    ) : event.type === "training" ? (
                      <Users className={`h-5 w-5 text-accent-orange`} />
                    ) : (
                      <Medal className={`h-5 w-5 text-success`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date} • {event.time}</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    Ver
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}