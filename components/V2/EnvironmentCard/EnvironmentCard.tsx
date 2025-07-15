"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProjectEnvironments } from "@/hooks";
import { Environment } from "@/lib/api";
import { getEnvironmentBadge } from "../Badge/EnviromentBadge";
import { Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RenderIsotipoIcon, VercelIsotipoIcon } from "@/components/ui/V2/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnvironmentCardProps {
  environment: Environment;
}
export function EnvironmentCard({ environment }: EnvironmentCardProps) {
  const {
    handleViewEnvironment,
    setDialogToOpen,
    setEnvironmentDetailsOpen,
    setSelectedEnvironment,
  } = useProjectEnvironments();
  const {
    render_token,
    render_server_id,
    vercel_token,
    vercel_project_id,
  } = environment;

  const render = render_token && render_server_id;
  const vercel = vercel_token && vercel_project_id;

  const handleOpenDialog = (dialog: string) => {
    setDialogToOpen(dialog);
    setEnvironmentDetailsOpen(true);
    setSelectedEnvironment(environment);
  };

  return (
    <Card key={environment._id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{environment.name}</CardTitle>
          {getEnvironmentBadge(environment.slug)}
        </div>
        <CardDescription>{environment._id}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex flex-row justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <Server className="mr-2 h-4 w-4" />
            <span>
              {Object.keys(environment.secrets || {}).length} variable
              {Object.keys(environment.secrets || {}).length !== 1
                ? "s"
                : ""}{" "}
              configurada
              {Object.keys(environment.secrets || {}).length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleOpenDialog("render")}
                    className="p-1 rounded-sm bg-transparent transition-transform duration-200 ease-in-out hover:scale-110  "
                    tabIndex={0}
                    aria-label="Ver detalles de Render"
                  >
                    <div className="relative">
                      <span className="absolute scale-40 -top-3 -left-2">
                        {render ? "✔️" : "❌"}
                      </span>
                      <RenderIsotipoIcon
                        className={`size-5 cursor-pointer ${
                          render ? "opacity-100" : "opacity-40"
                        }`}
                      />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {render ? "Conectado a Render" : "Render no configurado"}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleOpenDialog("vercel")}
                    className="p-1 rounded-sm bg-transparent transition-transform duration-200 ease-in-out hover:scale-110  "
                    tabIndex={0}
                    aria-label="Ver detalles de Vercel"
                  >
                    <div className="relative">
                      <span className="absolute scale-40 -top-3 -left-2">
                        {vercel ? "✔️" : "❌"}
                      </span>
                      <VercelIsotipoIcon
                        className={`size-5 cursor-pointer ${
                          vercel ? "opacity-100" : "opacity-40"
                        }`}
                      />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {vercel ? "Conectado a Vercel" : "Vercel no configurado"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => handleViewEnvironment(environment.slug)}
        >
          Ver Detalles
        </Button>
      </CardFooter>
    </Card>
  );
}
