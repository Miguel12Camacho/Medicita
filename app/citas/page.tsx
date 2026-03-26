"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { CitaForm } from "@/components/cita-form"
import type { Cita, CitaConDetalles, EstadoCita } from "@/lib/types"

const estadoConfig: Record<EstadoCita, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  pendiente: { label: "Pendiente", variant: "secondary", icon: Clock },
  completada: { label: "Completada", variant: "default", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", variant: "destructive", icon: XCircle },
}

export default function CitasPage() {
  const [citas, setCitas] = useState<CitaConDetalles[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<EstadoCita | "todos">("todos")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null)
  const [citaToDelete, setCitaToDelete] = useState<CitaConDetalles | null>(null)

  const loadData = useCallback(async () => {
    try {
      const response = await fetch("/api/citas")
      if (!response.ok) throw new Error("Error al cargar citas")
      const data = await response.json()
      setCitas(data)
    } catch (error) {
      toast.error("Error al cargar citas")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredCitas = useMemo(() => {
    return citas.filter((cita) => {
      const matchesSearch =
        cita.pacienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.doctorNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.motivo.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesEstado = estadoFilter === "todos" || cita.estado === estadoFilter

      return matchesSearch && matchesEstado
    })
  }, [citas, searchTerm, estadoFilter])

  const handleCreate = async (data: Omit<Cita, "id" | "estado" | "createdAt">) => {
    try {
      const response = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear cita")
      }
      toast.success("Cita agendada exitosamente")
      loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  const handleEdit = (cita: CitaConDetalles) => {
    setSelectedCita({
      id: cita.id,
      pacienteId: cita.pacienteId,
      doctorId: cita.doctorId,
      fecha: cita.fecha,
      hora: cita.hora,
      motivo: cita.motivo,
      estado: cita.estado,
      notas: cita.notas,
      createdAt: cita.createdAt,
    })
    setIsFormOpen(true)
  }

  const handleUpdate = async (data: Omit<Cita, "id" | "estado" | "createdAt">) => {
    if (!selectedCita) return
    try {
      const response = await fetch(`/api/citas/${selectedCita.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar cita")
      }
      toast.success("Cita actualizada exitosamente")
      loadData()
      setSelectedCita(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  const handleDelete = async () => {
    if (!citaToDelete) return
    try {
      const response = await fetch(`/api/citas/${citaToDelete.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al eliminar cita")
      }
      toast.success("Cita eliminada exitosamente")
      loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error desconocido")
    }
    setCitaToDelete(null)
  }

  const handleChangeEstado = async (citaId: string, nuevoEstado: EstadoCita) => {
    try {
      const response = await fetch(`/api/citas/${citaId}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al cambiar estado")
      }
      const estadoLabel = estadoConfig[nuevoEstado].label.toLowerCase()
      toast.success(`Cita marcada como ${estadoLabel}`)
      loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  const formatFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), "dd MMM yyyy", { locale: es })
    } catch {
      return fecha
    }
  }

  const citasPendientes = citas.filter((c) => c.estado === "pendiente").length
  const citasCompletadas = citas.filter((c) => c.estado === "completada").length
  const citasCanceladas = citas.filter((c) => c.estado === "cancelada").length

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Gestion de Citas"
        descripcion="Administra las citas medicas del sistema"
      >
        <Button onClick={() => { setSelectedCita(null); setIsFormOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cita
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citasPendientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citasCompletadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citasCanceladas}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Citas</CardTitle>
          <CardDescription>
            Historial completo de citas medicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente, doctor o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={estadoFilter}
              onValueChange={(v) => setEstadoFilter(v as EstadoCita | "todos")}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="completada">Completadas</SelectItem>
                <SelectItem value="cancelada">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCitas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Calendar className="h-8 w-8" />
                        <p>No se encontraron citas</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCitas.map((cita) => {
                    const EstadoIcon = estadoConfig[cita.estado].icon
                    return (
                      <TableRow key={cita.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{cita.pacienteNombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{cita.doctorNombre}</p>
                              <p className="text-xs text-muted-foreground">
                                {cita.especialidad}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{formatFecha(cita.fecha)}</span>
                            <span className="text-xs text-muted-foreground">{cita.hora}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="line-clamp-2 max-w-[200px]">{cita.motivo}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={estadoConfig[cita.estado].variant}>
                            <EstadoIcon className="mr-1 h-3 w-3" />
                            {estadoConfig[cita.estado].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {cita.estado === "pendiente" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEdit(cita)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleChangeEstado(cita.id, "completada")}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                    Marcar Completada
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleChangeEstado(cita.id, "cancelada")}
                                  >
                                    <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                    Cancelar Cita
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() => setCitaToDelete(cita)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Info */}
          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {filteredCitas.length} de {citas.length} citas
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <CitaForm
        cita={selectedCita}
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setSelectedCita(null)
        }}
        onSubmit={selectedCita ? handleUpdate : handleCreate}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!citaToDelete}
        onOpenChange={(open) => !open && setCitaToDelete(null)}
        titulo="Eliminar Cita"
        descripcion={`Esta seguro que desea eliminar la cita de ${citaToDelete?.pacienteNombre} con ${citaToDelete?.doctorNombre}? Esta accion no se puede deshacer.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
