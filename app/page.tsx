"use client"

import { useEffect, useState } from "react"
import { Users, Stethoscope, CalendarCheck, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Bar, BarChart, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Pie, PieChart, Legend } from "recharts"
import { PageHeader } from "@/components/page-header"
import { StatsCard } from "@/components/stats-card"

interface DashboardData {
  estadisticas: {
    totalPacientes: number
    totalDoctores: number
    citasPendientes: number
    citasCompletadas: number
  }
  citasPorMes: Array<{ mes: string; total: number }>
  citasPorEspecialidad: Array<{ especialidad: string; total: number }>
  proximasCitas: Array<{
    id: string
    fecha: string
    hora: string
    pacienteNombre: string
    doctorNombre: string
    especialidad: string
    motivo: string
  }>
}

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch("/api/dashboard")
        if (!response.ok) throw new Error("Error al cargar datos")
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">{error || "Error al cargar datos"}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Dashboard"
        descripcion="Resumen general del sistema de citas medicas"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          titulo="Total Pacientes"
          valor={data.estadisticas.totalPacientes}
          descripcion="Pacientes registrados"
          icon={Users}
        />
        <StatsCard
          titulo="Total Doctores"
          valor={data.estadisticas.totalDoctores}
          descripcion="Doctores activos"
          icon={Stethoscope}
        />
        <StatsCard
          titulo="Citas Pendientes"
          valor={data.estadisticas.citasPendientes}
          descripcion="Citas por atender"
          icon={CalendarCheck}
        />
        <StatsCard
          titulo="Citas Completadas"
          valor={data.estadisticas.citasCompletadas}
          descripcion="Citas atendidas"
          icon={Clock}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Citas por Especialidad</CardTitle>
          </CardHeader>
          <CardContent>
            {data.citasPorEspecialidad.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.citasPorEspecialidad} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="especialidad"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius)",
                      color: "var(--color-popover-foreground)",
                    }}
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                    {data.citasPorEspecialidad.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No hay datos disponibles
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Citas por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            {data.citasPorMes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.citasPorMes}>
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius)",
                      color: "var(--color-popover-foreground)",
                    }}
                  />
                  <Bar dataKey="total" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No hay datos disponibles
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Proximas Citas</CardTitle>
        </CardHeader>
        <CardContent>
          {data.proximasCitas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.proximasCitas.map((cita) => (
                  <TableRow key={cita.id}>
                    <TableCell className="font-medium">{cita.fecha}</TableCell>
                    <TableCell>{cita.hora}</TableCell>
                    <TableCell>{cita.pacienteNombre}</TableCell>
                    <TableCell>{cita.doctorNombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{cita.especialidad}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {cita.motivo}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No hay citas pendientes
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
