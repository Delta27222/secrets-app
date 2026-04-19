"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrganizationMembership } from "@/lib/api";

type Props = {
  memberships: OrganizationMembership[];
};

export function OrganizationsGrid({ memberships }: Props) {
  const router = useRouter();
  const [navigatingTo, setNavigatingTo] = React.useState<string | null>(null);
  const isBusy = navigatingTo !== null;

  const goToOrganization = (orgId: string) => {
    if (isBusy) return;
    setNavigatingTo(orgId);
    router.push(`/organizations/${orgId}`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {memberships.map((membership) => {
        const orgId = membership.organization._id;
        const thisNavigating = navigatingTo === orgId;

        return (
          <Card key={membership._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{membership.organization.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Users className="mr-2 h-4 w-4" />
                <span>
                  Rol:{" "}
                  {membership.role === "owner"
                    ? "Dueño"
                    : membership.role === "admin"
                      ? "Administrador"
                      : "Miembro"}
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Lock className="mr-2 h-4 w-4" />
                <span>Gestiona secretos de forma segura</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="button"
                className="w-full"
                disabled={isBusy}
                onClick={() => goToOrganization(orgId)}
              >
                {thisNavigating ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden />
                    Cargando…
                  </>
                ) : (
                  "Ver Organización"
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
