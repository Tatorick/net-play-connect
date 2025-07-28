import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function CoachPendingScreen() {
  return (
    <Dialog open={true}>
      <DialogContent className="max-w-md w-full text-center">
        <DialogHeader>
          <DialogTitle>Acceso pendiente de aprobación</DialogTitle>
          <DialogDescription>
            Tu solicitud de registro ha sido enviada.<br />
            Por favor, espera a que un administrador apruebe tu acceso.<br />
            Recibirás una notificación cuando tu cuenta esté habilitada.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
} 