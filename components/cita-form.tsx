"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { Cita, Paciente, Doctor } from "@/lib/types"

const citaSchema = z.object({
  pacienteId: z.string().min(1, "Seleccione un paciente"),
  doctorId: z.string().min(1, "Seleccione un doctor"),
  fecha: z.date({ required_error: "Seleccione una fecha" }),
  hora: z.string().min(1, "Seleccione una hora"),
  motivo: z.string().min(3, "El motivo debe tener al menos 3 caracteres"),
  notas: z.string().optional(),
})

type CitaFormValues = z.infer<typeof citaSchema>

interface CitaFormProps {
  cita?: Cita | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<Cita, "id" | "estado" | "createdAt">) => void
}

const horasDisponibles = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
]

export function CitaForm({ cita, open, onOpenChange, onSubmit }: CitaFormProps) {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [doctores, setDoctores] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  const form = useForm<CitaFormValues>({
    resolver: zodResolver(citaSchema),
    defaultValues: {
      pacienteId: "",
      doctorId: "",
      hora: "",
      motivo: "",
      notas: "",
    },
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [pacientesRes, doctoresRes] = await Promise.all([
          fetch("/api/pacientes"),
          fetch("/api/doctores"),
        ])
        if (pacientesRes.ok && doctoresRes.ok) {
          setPacientes(await pacientesRes.json())
          setDoctores(await doctoresRes.json())
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    if (open) {
      loadData()
    }
  }, [open])

  useEffect(() => {
    if (cita) {
      form.reset({
        pacienteId: cita.pacienteId,
        doctorId: cita.doctorId,
        fecha: new Date(cita.fecha),
        hora: cita.hora,
        motivo: cita.motivo,
        notas: cita.notas || "",
      })
    } else {
      form.reset({
        pacienteId: "",
        doctorId: "",
        hora: "",
        motivo: "",
        notas: "",
      })
    }
  }, [cita, form, open])

  const handleSubmit = (data: CitaFormValues) => {
    onSubmit({
      pacienteId: data.pacienteId,
      doctorId: data.doctorId,
      fecha: format(data.fecha, "yyyy-MM-dd"),
      hora: data.hora,
      motivo: data.motivo,
      notas: data.notas || "",
    })
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {cita ? "Editar Cita" : "Nueva Cita"}
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="pacienteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un paciente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pacientes.map((paciente) => (
                          <SelectItem key={paciente.id} value={paciente.id}>
                            {paciente.nombre} {paciente.apellido} - {paciente.cedula}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un doctor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctores.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.nombre} {doctor.apellido} - {doctor.especialidad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fecha"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: es })
                              ) : (
                                <span>Seleccionar</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            locale={es}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hora"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Hora" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {horasDisponibles.map((hora) => (
                            <SelectItem key={hora} value={hora}>
                              {hora}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="motivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo de la consulta</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describa el motivo de la consulta..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas adicionales (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notas adicionales..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {cita ? "Guardar Cambios" : "Agendar Cita"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
