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
import type { Doctor } from "@/lib/types"
import { ESPECIALIDADES } from "@/lib/types"

const doctorSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellido: z.string().min(1, "El apellido es obligatorio"),
  especialidad: z.string().min(1, "La especialidad es obligatoria"),
  telefono: z.string().min(1, "El telefono es obligatorio"),
  email: z.string().email("Email invalido").or(z.literal("")),
  horarioInicio: z.string().min(1, "El horario de inicio es obligatorio"),
  horarioFin: z.string().min(1, "El horario de fin es obligatorio"),
}).refine((data) => data.horarioInicio < data.horarioFin, {
  message: "El horario de inicio debe ser anterior al de fin",
  path: ["horarioFin"],
})

type DoctorFormData = z.infer<typeof doctorSchema>

interface DoctorFormProps {
  doctor?: Doctor
  onSubmit: (data: DoctorFormData) => void
  onCancel: () => void
}

export function DoctorForm({ doctor, onSubmit, onCancel }: DoctorFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      nombre: doctor?.nombre || "",
      apellido: doctor?.apellido || "",
      especialidad: doctor?.especialidad || "",
      telefono: doctor?.telefono || "",
      email: doctor?.email || "",
      horarioInicio: doctor?.horarioInicio || "08:00",
      horarioFin: doctor?.horarioFin || "16:00",
    },
  })

  const especialidad = watch("especialidad")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input id="nombre" {...register("nombre")} placeholder="Dr./Dra. Nombre" />
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
          <Label>Especialidad *</Label>
          <Select value={especialidad} onValueChange={(v) => setValue("especialidad", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar especialidad" />
            </SelectTrigger>
            <SelectContent>
              {ESPECIALIDADES.map((esp) => (
                <SelectItem key={esp} value={esp}>{esp}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.especialidad && (
            <p className="text-xs text-destructive">{errors.especialidad.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="telefono">Telefono *</Label>
          <Input id="telefono" {...register("telefono")} placeholder="809-555-0000" />
          {errors.telefono && (
            <p className="text-xs text-destructive">{errors.telefono.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} placeholder="correo@clinica.com" />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="horarioInicio">Horario Inicio *</Label>
          <Input id="horarioInicio" type="time" {...register("horarioInicio")} />
          {errors.horarioInicio && (
            <p className="text-xs text-destructive">{errors.horarioInicio.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="horarioFin">Horario Fin *</Label>
          <Input id="horarioFin" type="time" {...register("horarioFin")} />
          {errors.horarioFin && (
            <p className="text-xs text-destructive">{errors.horarioFin.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {doctor ? "Actualizar" : "Crear"} Doctor
        </Button>
      </div>
    </form>
  )
}
