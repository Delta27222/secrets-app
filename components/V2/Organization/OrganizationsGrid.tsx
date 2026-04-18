import React from "react";
import Link from "next/link";
import { Lock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function OrganizationsGrid({ memberships }: { memberships: any[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {memberships.map((membership) => (
        <Card key={membership._id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>{membership.organization.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Users className="mr-2 h-4 w-4" />
              <span>
                Rol:{' '}
                {membership.role === 'owner'
                  ? 'Dueño'
                  : membership.role === 'admin'
                  ? 'Administrador'
                  : 'Miembro'}
              </span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Lock className="mr-2 h-4 w-4" />
              <span>Gestiona secretos de forma segura</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={`/organizations/${membership.organization._id}`}>Ver Organización</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
