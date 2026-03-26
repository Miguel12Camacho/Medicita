"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Paciente } from "@/lib/types"

const pacienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellido: z.string().min(1, "El apellido es obligatorio"),
  cedula: z.string().min(1, "La cedula es obligatoria"),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  telefono: z.string().min(1, "El telefono es obligatorio"),
  email: z.string().email("Email invalido").or(z.literal("")),
  direccion: z.string(),
  genero: z.enum(["masculino", "femenino", "otro"]),
})

type PacienteFormData = z.infer<typeof pacienteSchema>

interface PacienteFormProps {
  paciente?: Paciente
  onSubmit: (data: PacienteFormData) => void
  onCancel: () => void
}

export function PacienteForm({ paciente, onSubmit, onCancel }: PacienteFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      nombre: paciente?.nombre || "",
      apellido: paciente?.apellido || "",
      cedula: paciente?.cedula || "",
      fechaNacimiento: paciente?.fechaNacimiento || "",
      telefono: paciente?.telefono || "",
      email: paciente?.email || "",
      direccion: paciente?.direccion || "",
      genero: paciente?.genero || "masculino",
    },
  })

  const genero = watch("genero")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input id="nombre" {...register("nombre")} placeholder="Nombre" />
          {errors.nombre && (
            <p className="text-xs text-destructive">{errors.nombre.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="apellido">Apellido *</Label>
          <Input id="apellido" {...register("apellido")} placeholder="Apellido" />
          {errors.apellido && (
            <p className="text-xs text-destructive">{errors.apellido.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cedula">Cedula *</Label>
          <Input id="cedula" {...register("cedula")} placeholder="000-0000000-0" />
          {errors.cedula && (
            <p className="text-xs text-destructive">{errors.cedula.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
          <Input
            id="fechaNacimiento"
            type="date"
            {...register("fechaNacimiento")}
          />
          {errors.fechaNacimiento && (
            <p className="text-xs text-destructive">{errors.fechaNacimiento.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="telefono">Telefono *</Label>
          <Input id="telefono" {...register("telefono")} placeholder="809-555-0000" />
          {errors.telefono && (
            <p className="text-xs text-destructive">{errors.telefono.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} placeholder="correo@ejemplo.com" />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="direccion">Direccion</Label>
          <Input id="direccion" {...register("direccion")} placeholder="Direccion completa" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Genero *</Label>
          <Select value={genero} onValueChange={(v) => setValue("genero", v as PacienteFormData["genero"])}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar genero" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="femenino">Femenino</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {paciente ? "Actualizar" : "Crear"} Paciente
        </Button>
      </div>
    </form>
  )
}
