import { Building2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyOrganizations() {
  return (
    <div className="text-center py-12">
      <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">No perteneces a ninguna organización</h3>
      <p className="text-muted-foreground mb-6">
        Crea una nueva organización para comenzar a gestionar secretos.
      </p>
      <Button>
        <Plus className="mr-2 h-4 w-4" /> Crear Organización
      </Button>
    </div>
  );
}
