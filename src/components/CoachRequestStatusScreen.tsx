import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  MessageSquare, 
  Upload 
} from 'lucide-react';

interface RequestDetails {
  id: string;
  status: string;
  rejection_reason?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface RequestDetailInfo {
  additional_info?: string;
  rejection_reason?: string;
}

export default function CoachRequestStatusScreen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [requestDetails, setRequestDetails] = useState<RequestDetailInfo | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRequestStatus();
    }
  }, [user]);

  const fetchRequestStatus = async () => {
    if (!user) return;

    try {
      // Obtener solicitud principal
      const { data: requestData, error: requestError } = await supabase
        .from('coach_main_requests')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (requestError) throw requestError;
      setRequest(requestData);

      // Obtener detalles adicionales si existen
      if (requestData) {
        const { data: detailsData, error: detailsError } = await supabase
          .from('coach_main_request_details')
          .select('*')
          .eq('request_id', requestData.id)
          .maybeSingle();

        if (!detailsError && detailsData) {
          setRequestDetails(detailsData);
        }
      }
    } catch (error: any) {
      console.error('Error fetching request status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el estado de tu solicitud',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAdditionalInfo = async () => {
    if (!request || !additionalInfo.trim()) return;

    setSubmitting(true);
    try {
      // Crear o actualizar detalles de la solicitud
      const { error: upsertError } = await supabase
        .from('coach_main_request_details')
        .upsert({
          request_id: request.id,
          additional_info: additionalInfo,
        });

      if (upsertError) throw upsertError;

      // Actualizar estado de la solicitud a 'pending' para nueva revisión
      const { error: updateError } = await supabase
        .from('coach_main_requests')
        .update({ status: 'pending' })
        .eq('id', request.id);

      if (updateError) throw updateError;

      toast({
        title: 'Información enviada',
        description: 'Tu información adicional ha sido enviada para revisión',
      });

      setAdditionalInfo('');
      fetchRequestStatus();
    } catch (error: any) {
      console.error('Error submitting additional info:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar la información',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Pendiente',
          color: 'bg-yellow-100 text-yellow-800',
          description: 'Tu solicitud está siendo revisada por un administrador'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          label: 'Aprobada',
          color: 'bg-green-100 text-green-800',
          description: '¡Tu solicitud ha sido aprobada! Ya puedes acceder al dashboard'
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rechazada',
          color: 'bg-red-100 text-red-800',
          description: 'Tu solicitud ha sido rechazada. Revisa los comentarios del administrador'
        };
      case 'under_review':
        return {
          icon: AlertCircle,
          label: 'En Revisión',
          color: 'bg-blue-100 text-blue-800',
          description: 'Se está realizando una revisión adicional de tu solicitud'
        };
      default:
        return {
          icon: Clock,
          label: 'Desconocido',
          color: 'bg-gray-100 text-gray-800',
          description: 'Estado desconocido'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Cargando estado de solicitud...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No se encontró solicitud</CardTitle>
            <CardDescription>
              No se encontró una solicitud de registro para tu cuenta.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(request.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Estado Principal */}
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
              <StatusIcon className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Estado de tu Solicitud</CardTitle>
            <CardDescription>{statusInfo.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Badge className={`text-lg px-4 py-2 ${statusInfo.color}`}>
              {statusInfo.label}
            </Badge>
            <p className="text-sm text-muted-foreground mt-4">
              Solicitud creada el: {new Date(request.created_at).toLocaleDateString('es-ES')}
            </p>
            {request.updated_at !== request.created_at && (
              <p className="text-sm text-muted-foreground">
                Última actualización: {new Date(request.updated_at).toLocaleDateString('es-ES')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Información de Rechazo */}
        {request.status === 'rejected' && requestDetails?.rejection_reason && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Motivo del Rechazo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{requestDetails.rejection_reason}</p>
            </CardContent>
          </Card>
        )}

        {/* Información Adicional Enviada */}
        {requestDetails?.additional_info && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Información Adicional Enviada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{requestDetails.additional_info}</p>
            </CardContent>
          </Card>
        )}

        {/* Formulario para Información Adicional */}
        {request.status === 'rejected' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Enviar Información Adicional
              </CardTitle>
              <CardDescription>
                Proporciona información adicional solicitada por el administrador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe tu experiencia, certificaciones, o cualquier información adicional relevante..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={6}
              />
              <Button 
                onClick={handleSubmitAdditionalInfo}
                disabled={submitting || !additionalInfo.trim()}
                className="w-full"
              >
                {submitting ? 'Enviando...' : 'Enviar Información'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Botón de Actualizar */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              variant="outline" 
              onClick={fetchRequestStatus}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar Estado
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}