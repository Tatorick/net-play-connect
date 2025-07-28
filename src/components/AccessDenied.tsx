import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AccessDenied() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl">Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para acceder a esta sección. 
              Solo los administradores pueden gestionar esta área.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Si crees que esto es un error, contacta al administrador del sistema.
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard")} 
                className="flex-1"
              >
                Volver al Dashboard
              </Button>
              <Button 
                onClick={() => navigate("/")} 
                className="flex-1"
              >
                Ir al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 