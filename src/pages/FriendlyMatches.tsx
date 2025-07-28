import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FriendlyMatchForm } from "@/components/matches/FriendlyMatchForm";
import { MatchesBulletinBoard } from "@/components/matches/MatchesBulletinBoard";
import { MyMatchPosts } from "@/components/matches/MyMatchPosts";
import { MatchInterests } from "@/components/matches/MatchInterests";

export default function FriendlyMatches() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Partidos Amistosos</h1>
            <p className="text-muted-foreground">
              Organiza y encuentra topes de voleibol con otros equipos
            </p>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Publicar Tope
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Publicar Partido Amistoso</DialogTitle>
              </DialogHeader>
              <FriendlyMatchForm 
                onSuccess={handleFormSuccess}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="explore" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="explore">Explorar Topes</TabsTrigger>
            <TabsTrigger value="my-posts">Mis Publicaciones</TabsTrigger>
            <TabsTrigger value="interests">Interesados</TabsTrigger>
            <TabsTrigger value="matches">Partidos Confirmados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="explore" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tablón de Topes Disponibles</CardTitle>
                <CardDescription>
                  Encuentra partidos amistosos disponibles en tu región
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MatchesBulletinBoard key={refreshKey} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="my-posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mis Publicaciones</CardTitle>
                <CardDescription>
                  Gestiona los topes que has publicado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MyMatchPosts key={refreshKey} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="interests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipos Interesados</CardTitle>
                <CardDescription>
                  Revisa y gestiona las solicitudes para tus topes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MatchInterests key={refreshKey} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="matches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Partidos Confirmados</CardTitle>
                <CardDescription>
                  Topes acordados y próximos partidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Funcionalidad próximamente disponible
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}