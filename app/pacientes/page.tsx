"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { PacienteForm } from "@/components/paciente-form"
import type { Paciente } from "@/lib/types"

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detalleOpen, setDetalleOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | undefined>()
  const [pacienteDetalle, setPacienteDetalle] = useState<Paciente | undefined>()

  const cargarPacientes = useCallback(async () => {
    try {
      const response = await fetch("/api/pacientes")
      if (!response.ok) throw new Error("Error al cargar pacientes")
      const data = await response.json()
      setPacientes(data)
    } catch (error) {
      toast.error("Error al cargar pacientes")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarPacientes()
  }, [cargarPacientes])

  const pacientesFiltrados = pacientes.filter((p) => {
    const texto = busqueda.toLowerCase()
    return (
      p.nombre.toLowerCase().includes(texto) ||
      p.apellido.toLowerCase().includes(texto) ||
      p.cedula.toLowerCase().includes(texto)
    )
  })

  function handleCrear() {
    setSelectedPaciente(undefined)
    setDialogOpen(true)
  }

  function handleEditar(paciente: Paciente) {
    setSelectedPaciente(paciente)
    setDialogOpen(true)
  }

  function handleVerDetalle(paciente: Paciente) {
    setPacienteDetalle(paciente)
    setDetalleOpen(true)
  }

  function handleEliminarClick(paciente: Paciente) {
    setSelectedPaciente(paciente)
    setDeleteOpen(true)
  }

  async function handleSubmit(data: Omit<Paciente, "id" | "createdAt">) {
    try {
      if (selectedPaciente) {
        const response = await fetch(`/api/pacientes/${selectedPaciente.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al actualizar")
        }
        toast.success("Paciente actualizado correctamente")
      } else {
        const response = await fetch("/api/pacientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al crear")
        }
        toast.success("Paciente creado correctamente")
      }
      setDialogOpen(false)
      cargarPacientes()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  async function handleEliminar() {
    if (!selectedPaciente) return
    try {
      const response = await fetch(`/api/pacientes/${selectedPaciente.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al eliminar")
      }
      toast.success("Paciente eliminado correctamente")
      setDeleteOpen(false)
      setSelectedPaciente(undefined)
      cargarPacientes()
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
        titulo="Pacientes"
        descripcion="Gestiona los pacientes registrados en el sistema"
      >
        <Button onClick={handleCrear}>
          <Plus className="size-4" />
          Nuevo Paciente
        </Button>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o cedula..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cedula</TableHead>
              <TableHead className="hidden md:table-cell">Telefono</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Genero</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pacientesFiltrados.length > 0 ? (
              pacientesFiltrados.map((paciente) => (
                <TableRow key={paciente.id}>
                  <TableCell className="font-medium">
                    {paciente.nombre} {paciente.apellido}
                  </TableCell>
                  <TableCell>{paciente.cedula}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {paciente.telefono}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {paciente.email || "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className="capitalize">
                      {paciente.genero}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleVerDetalle(paciente)}
                        aria-label="Ver detalle"
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditar(paciente)}
                        aria-label="Editar"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEliminarClick(paciente)}
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
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {busqueda ? "No se encontraron pacientes" : "No hay pacientes registrados"}
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
              {selectedPaciente ? "Editar Paciente" : "Nuevo Paciente"}
            </DialogTitle>
            <DialogDescription>
              {selectedPaciente
                ? "Modifica los datos del paciente"
                : "Completa el formulario para registrar un nuevo paciente"}
            </DialogDescription>
          </DialogHeader>
          <PacienteForm
            paciente={selectedPaciente}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={detalleOpen} onOpenChange={setDetalleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle del Paciente</DialogTitle>
            <DialogDescription>Informacion completa del paciente</DialogDescription>
          </DialogHeader>
          {pacienteDetalle && (
            <div className="grid gap-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium text-muted-foreground">Nombre:</span>
                  <p className="text-foreground">{pacienteDetalle.nombre} {pacienteDetalle.apellido}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Cedula:</span>
                  <p className="text-foreground">{pacienteDetalle.cedula}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium text-muted-foreground">Fecha de Nacimiento:</span>
                  <p className="text-foreground">{pacienteDetalle.fechaNacimiento}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Genero:</span>
                  <p className="capitalize text-foreground">{pacienteDetalle.genero}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium text-muted-foreground">Telefono:</span>
                  <p className="text-foreground">{pacienteDetalle.telefono}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Email:</span>
                  <p className="text-foreground">{pacienteDetalle.email || "-"}</p>
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Direccion:</span>
                <p className="text-foreground">{pacienteDetalle.direccion || "-"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        titulo="Eliminar Paciente"
        descripcion={`Esta seguro de eliminar a ${selectedPaciente?.nombre} ${selectedPaciente?.apellido}? Esta accion no se puede deshacer.`}
        onConfirm={handleEliminar}
      />
    </div>
  )
}
