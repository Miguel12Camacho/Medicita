import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  titulo: string
  valor: number | string
  descripcion?: string
  icon: LucideIcon
}

export function StatsCard({ titulo, valor, descripcion, icon: Icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {titulo}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{valor}</div>
        {descripcion && (
          <p className="mt-1 text-xs text-muted-foreground">{descripcion}</p>
        )}
      </CardContent>
    </Card>
  )
}
