"use client";
import React from "react";
import { Info } from "lucide-react";

export function VercelSyncForm() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 border border-dashed border-muted-foreground/30 rounded-xl text-center bg-muted/20 shadow-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-blue-100 p-3 rounded-full">
          <Info className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Funcionalidad en desarrollo
        </h3>
        <p className="text-sm text-muted-foreground">
          Estamos trabajando para habilitar esta sección pronto. ¡Gracias por tu
          paciencia!
        </p>
      </div>
    </div>
  );
}
