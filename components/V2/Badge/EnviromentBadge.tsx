import { Badge } from "@/components/ui/badge"

export const getEnvironmentBadge = (slug: string) => {
  switch (slug) {
    case "prod":
      return <Badge className="bg-green-500">{slug}</Badge>
    case "stg":
      return <Badge className="bg-blue-500">{slug}</Badge>
    case "dev":
      return <Badge className="bg-amber-500">{slug}</Badge>
    default:
      return <Badge>{slug}</Badge>
  }
}
