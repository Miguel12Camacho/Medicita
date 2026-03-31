"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { CalendarCheck, HeartPulse, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Doctor } from "@/lib/types"

type Genero = "masculino" | "femenino" | "otro"

interface FormData {
  nombre: string
  apellido: string
  cedula: string
  fechaNacimiento: string
  telefono: string
  email: string
  direccion: string
  genero: Genero | ""
  especialidad: string
  doctorId: string
  fecha: string
  hora: string
  motivo: string
}

const horasBase = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30",
]

const initialForm: FormData = {
  nombre: "",
  apellido: "",
  cedula: "",
  fechaNacimiento: "",
  telefono: "",
  email: "",
  direccion: "",
  genero: "",
  especialidad: "",
  doctorId: "",
  fecha: "",
  hora: "",
  motivo: "",
}

export default function ClientePage() {
  const [form, setForm] = useState<FormData>(initialForm)
  const [doctores, setDoctores] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDoctores, setLoadingDoctores] = useState(true)

  useEffect(() => {
    async function cargarDoctores() {
      try {
        const res = await fetch("/api/doctores")
        if (!res.ok) throw new Error("No se pudieron cargar los doctores")
        const data = await res.json()
        setDoctores(data)
      } catch (error) {
        toast.error("Error al cargar doctores")
      } finally {
        setLoadingDoctores(false)
      }
    }

    cargarDoctores()
  }, [])

  const especialidades = useMemo(() => {
    const unicas = [...new Set(doctores.map((d) => d.especialidad))]
    return unicas.sort()
  }, [doctores])

  const doctoresFiltrados = useMemo(() => {
    if (!form.especialidad) return []
    return doctores.filter((d) => d.especialidad === form.especialidad)
  }, [doctores, form.especialidad])

  const doctorSeleccionado = useMemo(() => {
    return doctores.find((d) => d.id === form.doctorId)
  }, [doctores, form.doctorId])

  const horasDisponibles = useMemo(() => {
    if (!doctorSeleccionado) return []

    return horasBase.filter((hora) => {
      return hora >= doctorSeleccionado.horarioInicio && hora <= doctorSeleccionado.horarioFin
    })
  }, [doctorSeleccionado])

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function limpiarFormulario() {
    setForm(initialForm)
  }

  function validarFormulario() {
    if (!form.nombre.trim()) return "El nombre es obligatorio"
    if (!form.apellido.trim()) return "El apellido es obligatorio"
    if (!form.cedula.trim()) return "La cédula es obligatoria"
    if (!form.fechaNacimiento) return "La fecha de nacimiento es obligatoria"
    if (!form.telefono.trim()) return "El teléfono es obligatorio"
    if (!form.email.trim()) return "El correo es obligatorio"
    if (!form.direccion.trim()) return "La dirección es obligatoria"
    if (!form.genero) return "El género es obligatorio"
    if (!form.especialidad) return "La especialidad es obligatoria"
    if (!form.doctorId) return "Debes seleccionar un doctor"
    if (!form.fecha) return "Debes seleccionar una fecha"
    if (!form.hora) return "Debes seleccionar una hora"
    if (!form.motivo.trim()) return "El motivo es obligatorio"
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const error = validarFormulario()
    if (error) {
      toast.error(error)
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/cliente/agendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "No se pudo registrar la cita")
      }

      toast.success("Tu cita fue registrada correctamente")
      limpiarFormulario()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">

        <div className="flex justify-start">
        <Link href="/">
            <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Regresar al inicio
            </Button>
        </Link>
        </div>


      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HeartPulse className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Registro de cita médica</h1>
            <p className="text-sm text-muted-foreground">
              Completa tus datos para agendar una cita. Esta información se reflejará en el panel administrativo.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos del paciente</CardTitle>
            <CardDescription>
              Esta información se guarda en la tabla de pacientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => updateField("nombre", e.target.value)}
                placeholder="Oscar"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                value={form.apellido}
                onChange={(e) => updateField("apellido", e.target.value)}
                placeholder="Rodarte"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula</Label>
              <Input
                id="cedula"
                value={form.cedula}
                onChange={(e) => updateField("cedula", e.target.value)}
                placeholder="000-0000000-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
              <Input
                id="fechaNacimiento"
                type="date"
                value={form.fechaNacimiento}
                onChange={(e) => updateField("fechaNacimiento", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={form.telefono}
                onChange={(e) => updateField("telefono", e.target.value)}
                placeholder="8112345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={form.direccion}
                onChange={(e) => updateField("direccion", e.target.value)}
                placeholder="Calle, colonia, ciudad"
              />
            </div>

            <div className="space-y-2">
              <Label>Género</Label>
              <Select
                value={form.genero}
                onValueChange={(value) => updateField("genero", value as Genero)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="femenino">Femenino</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos de la cita</CardTitle>
            <CardDescription>
              Esta información se guarda en la tabla de citas y será visible para el administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Especialidad</Label>
              <Select
                value={form.especialidad}
                onValueChange={(value) => {
                  updateField("especialidad", value)
                  updateField("doctorId", "")
                  updateField("hora", "")
                }}
                disabled={loadingDoctores}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map((especialidad) => (
                    <SelectItem key={especialidad} value={especialidad}>
                      {especialidad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select
                value={form.doctorId}
                onValueChange={(value) => {
                  updateField("doctorId", value)
                  updateField("hora", "")
                }}
                disabled={!form.especialidad}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctoresFiltrados.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.nombre} {doctor.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha de la cita</Label>
              <Input
                id="fecha"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={form.fecha}
                onChange={(e) => updateField("fecha", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Hora</Label>
              <Select
                value={form.hora}
                onValueChange={(value) => updateField("hora", value)}
                disabled={!form.doctorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una hora" />
                </SelectTrigger>
                <SelectContent>
                  {horasDisponibles.map((hora) => (
                    <SelectItem key={hora} value={hora}>
                      {hora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="motivo">Motivo de la cita</Label>
              <Textarea
                id="motivo"
                value={form.motivo}
                onChange={(e) => updateField("motivo", e.target.value)}
                placeholder="Describe brevemente el motivo de tu cita"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={limpiarFormulario}>
            Limpiar
          </Button>
          <Button type="submit" disabled={loading}>
            <CalendarCheck className="mr-2 size-4" />
            {loading ? "Registrando..." : "Registrar cita"}
          </Button>
        </div>
      </form>
    </div>
  )
}