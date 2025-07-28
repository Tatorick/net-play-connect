import { Layout } from "@/components/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TopeForm } from "@/components/topes/TopeForm";
import { TopesBoard } from "@/components/topes/TopesBoard";

export default function Matches() {
  const [showTopeForm, setShowTopeForm] = useState(false);

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Partidos y Topes</h1>
          <p className="text-muted-foreground">Gestiona partidos oficiales y publica o encuentra topes amistosos.</p>
        </div>
        <Tabs defaultValue="topes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Partidos
            </TabsTrigger>
            <TabsTrigger value="topes" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Topes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="matches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Partidos Oficiales</CardTitle>
                <CardDescription>Próximamente: gestión de partidos oficiales y torneos.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center text-muted-foreground">
                  <Trophy className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>La gestión de partidos oficiales estará disponible próximamente.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="topes" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Topes Amistosos</CardTitle>
                  <CardDescription>Publica o encuentra oportunidades para partidos amistosos.</CardDescription>
                </div>
                <Button onClick={() => setShowTopeForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Publicar Tope
                </Button>
              </CardHeader>
            </Card>
            
            {/* Tablón de topes */}
            <TopesBoard />
            {/* <TopesBoardStep /> */}
            {/* <TopesBoardDebug /> */}
            
            {/* Formulario de publicación */}
            <div style={{ zIndex: 999999, position: 'relative' }}>
              <Dialog open={showTopeForm} onOpenChange={setShowTopeForm}>
                <DialogContent className="max-w-lg w-full">
                  <DialogHeader>
                    <DialogTitle>Publicar Tope Amistoso</DialogTitle>
                  </DialogHeader>
                  <TopeForm 
                    onClose={() => setShowTopeForm(false)} 
                    onSuccess={() => {
                      setShowTopeForm(false);
                      // Recargar la página para mostrar el nuevo tope
                      window.location.reload();
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
} 