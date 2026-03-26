"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/page-header"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { DoctorForm } from "@/components/doctor-form"
import type { Doctor } from "@/lib/types"
import { ESPECIALIDADES } from "@/lib/types"

export default function DoctoresPage() {
  const [doctores, setDoctores] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("todas")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detalleOpen, setDetalleOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>()
  const [doctorDetalle, setDoctorDetalle] = useState<Doctor | undefined>()

  const cargarDoctores = useCallback(async () => {
    try {
      const response = await fetch("/api/doctores")
      if (!response.ok) throw new Error("Error al cargar doctores")
      const data = await response.json()
      setDoctores(data)
    } catch (error) {
      toast.error("Error al cargar doctores")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarDoctores()
  }, [cargarDoctores])

  const doctoresFiltrados = doctores.filter((d) => {
    const texto = busqueda.toLowerCase()
    const coincideTexto =
      d.nombre.toLowerCase().includes(texto) ||
      d.apellido.toLowerCase().includes(texto) ||
      d.especialidad.toLowerCase().includes(texto)
    const coincideEspecialidad =
      filtroEspecialidad === "todas" || d.especialidad === filtroEspecialidad
    return coincideTexto && coincideEspecialidad
  })

  function handleCrear() {
    setSelectedDoctor(undefined)
    setDialogOpen(true)
  }

  function handleEditar(doctor: Doctor) {
    setSelectedDoctor(doctor)
    setDialogOpen(true)
  }

  function handleVerDetalle(doctor: Doctor) {
    setDoctorDetalle(doctor)
    setDetalleOpen(true)
  }

  function handleEliminarClick(doctor: Doctor) {
    setSelectedDoctor(doctor)
    setDeleteOpen(true)
  }

  async function handleSubmit(data: Omit<Doctor, "id" | "createdAt">) {
    try {
      if (selectedDoctor) {
        const response = await fetch(`/api/doctores/${selectedDoctor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al actualizar")
        }
        toast.success("Doctor actualizado correctamente")
      } else {
        const response = await fetch("/api/doctores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al crear")
        }
        toast.success("Doctor creado correctamente")
      }
      setDialogOpen(false)
      cargarDoctores()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  async function handleEliminar() {
    if (!selectedDoctor) return
    try {
      const response = await fetch(`/api/doctores/${selectedDoctor.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al eliminar")
      }
      toast.success("Doctor eliminado correctamente")
      setDeleteOpen(false)
      setSelectedDoctor(undefined)
      cargarDoctores()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Doctores"
        descripcion="Gestiona los doctores y sus especialidades"
      >
        <Button onClick={handleCrear}>
          <Plus className="size-4" />
          Nuevo Doctor
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o especialidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroEspecialidad} onValueChange={setFiltroEspecialidad}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Especialidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las especialidades</SelectItem>
            {ESPECIALIDADES.map((esp) => (
              <SelectItem key={esp} value={esp}>{esp}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead className="hidden md:table-cell">Telefono</TableHead>
              <TableHead className="hidden lg:table-cell">Horario</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctoresFiltrados.length > 0 ? (
              doctoresFiltrados.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">
                    {doctor.nombre} {doctor.apellido}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{doctor.especialidad}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {doctor.telefono}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {doctor.horarioInicio} - {doctor.horarioFin}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleVerDetalle(doctor)}
                        aria-label="Ver detalle"
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditar(doctor)}
                        aria-label="Editar"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEliminarClick(doctor)}
                        aria-label="Eliminar"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {busqueda || filtroEspecialidad !== "todas"
                    ? "No se encontraron doctores"
                    : "No hay doctores registrados"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDoctor ? "Editar Doctor" : "Nuevo Doctor"}
            </DialogTitle>
            <DialogDescription>
              {selectedDoctor
                ? "Modifica los datos del doctor"
                : "Completa el formulario para registrar un nuevo doctor"}
            </DialogDescription>
          </DialogHeader>
          <DoctorForm
            doctor={selectedDoctor}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={detalleOpen} onOpenChange={setDetalleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle del Doctor</DialogTitle>
            <DialogDescription>Informacion completa del doctor</DialogDescription>
          </DialogHeader>
          {doctorDetalle && (
            <div className="grid gap-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium text-muted-foreground">Nombre:</span>
                  <p className="text-foreground">{doctorDetalle.nombre} {doctorDetalle.apellido}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Especialidad:</span>
                  <p className="text-foreground">{doctorDetalle.especialidad}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium text-muted-foreground">Telefono:</span>
                  <p className="text-foreground">{doctorDetalle.telefono}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Email:</span>
                  <p className="text-foreground">{doctorDetalle.email || "-"}</p>
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Horario de Atencion:</span>
                <p className="text-foreground">{doctorDetalle.horarioInicio} - {doctorDetalle.horarioFin}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        titulo="Eliminar Doctor"
        descripcion={`Esta seguro de eliminar a ${selectedDoctor?.nombre} ${selectedDoctor?.apellido}? Esta accion no se puede deshacer.`}
        onConfirm={handleEliminar}
      />
    </div>
  )
}
