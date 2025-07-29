import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Key, 
  Copy, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Share2
} from 'lucide-react';

interface ClubCodeGeneratorProps {
  clubId: string;
  currentCode?: string;
  clubName: string;
}

export default function ClubCodeGenerator({ clubId, currentCode, clubName }: ClubCodeGeneratorProps) {
  const [code, setCode] = useState(currentCode || '');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateNewCode = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('regenerate_club_code', {
        club_id_param: clubId
      });

      if (error) throw error;

      setCode(data);
      toast({
        title: 'Código regenerado',
        description: 'Se ha generado un nuevo código de club exitosamente',
      });
    } catch (error: any) {
      console.error('Error generating code:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar un nuevo código',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: 'Código copiado',
        description: 'El código ha sido copiado al portapapeles',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar el código',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Código de Invitación
        </CardTitle>
        <CardDescription>
          Comparte este código con entrenadores secundarios para que se unan a tu club
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Código actual */}
        <div className="space-y-2">
          <Label>Código Actual</Label>
          <div className="flex gap-2">
            <Input
              value={code}
              readOnly
              className="font-mono text-lg"
              placeholder="No hay código generado"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              disabled={!code}
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Información del club */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4" />
            <span className="font-medium">Club: {clubName}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Los entrenadores secundarios necesitarán este código durante su registro
          </p>
        </div>

        {/* Controles */}
        <div className="flex gap-2">
          <Button
            onClick={generateNewCode}
            disabled={loading}
            variant={code ? "outline" : "default"}
            className="flex-1"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {code ? 'Regenerar Código' : 'Generar Código'}
          </Button>
        </div>

        {/* Advertencia */}
        {code && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Importante:</p>
              <p className="text-yellow-700">
                Al regenerar el código, el anterior dejará de funcionar. Asegúrate de comunicar el nuevo código a los entrenadores.
              </p>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              Código Activo
            </Badge>
            <p className="text-2xl font-bold mt-1">{code ? '1' : '0'}</p>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              Invitaciones Pendientes
            </Badge>
            <p className="text-2xl font-bold mt-1">-</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}