"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VercelSyncForm() {

  return (
    <form action="onSubmit">
      <div className="flex flex-col items-center space-y-5">
        <Input placeholder="Ingrese el Vercel Api Key" />
        <Input placeholder="Ingrese el Service Id del proyecto" />
        <div className="flex justify-end items-end w-full">
          <Button className="">Sincronizar con Vercel</Button>
        </div>
      </div>
    </form>
  );
}
