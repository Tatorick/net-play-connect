import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Volleyball, Lock, CheckCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({
        title: "Contraseña demasiado corta",
        description: "La contraseña debe tener al menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Por favor, asegúrate de que ambas contraseñas sean iguales.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({
          title: "Error al cambiar la contraseña",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout showSidebar={false}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <header className="container mx-auto px-4 py-6">
          <a href="/" className="flex items-center gap-2 w-fit">
            <Volleyball className="h-8 w-8 text-primary animate-volleyball-bounce" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              VoleiPro
            </h1>
          </a>
        </header>
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-md mx-auto animate-fade-in-up">
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Restablecer contraseña</CardTitle>
                  <CardDescription>
                    Ingresa tu nueva contraseña para tu cuenta.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {success ? (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <CheckCircle className="w-12 h-12 text-[#10b981]" />
                    <p className="text-center text-[#1e293b] font-medium">¡Contraseña cambiada con éxito!<br />Serás redirigido al inicio de sesión.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Nueva contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        minLength={8}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        minLength={8}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Cambiando..." : "Cambiar contraseña"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
} 