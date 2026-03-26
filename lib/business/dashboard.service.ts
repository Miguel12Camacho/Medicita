import { getAllPacientes } from "@/lib/data/pacientes.repository"
import { getAllDoctores } from "@/lib/data/doctores.repository"
import { getAllCitas, getCitasByFecha } from "@/lib/data/citas.repository"
import { getPacienteById } from "@/lib/data/pacientes.repository"
import { getDoctorById } from "@/lib/data/doctores.repository"
import type { Cita } from "@/lib/types"

export interface DashboardStats {
  totalPacientes: number
  totalDoctores: number
  citasHoy: number
  citasPendientes: number
}

export interface CitaPorEspecialidad {
  especialidad: string
  cantidad: number
}

export interface CitaPorEstado {
  estado: string
  cantidad: number
  fill: string
}

export interface CitaConDetalles extends Cita {
  pacienteNombre: string
  doctorNombre: string
  doctorEspecialidad: string
}

export function obtenerEstadisticas(): DashboardStats {
  const hoy = new Date().toISOString().split("T")[0]
  const citas = getAllCitas()

  return {
    totalPacientes: getAllPacientes().length,
    totalDoctores: getAllDoctores().length,
    citasHoy: getCitasByFecha(hoy).filter((c) => c.estado === "pendiente").length,
    citasPendientes: citas.filter((c) => c.estado === "pendiente").length,
  }
}

export function citasPorEspecialidad(): CitaPorEspecialidad[] {
  const citas = getAllCitas()
  const doctores = getAllDoctores()
  const conteo: Record<string, number> = {}

  citas.forEach((cita) => {
    const doctor = doctores.find((d) => d.id === cita.doctorId)
    if (doctor) {
      conteo[doctor.especialidad] = (conteo[doctor.especialidad] || 0) + 1
    }
  })

  return Object.entries(conteo)
    .map(([especialidad, cantidad]) => ({ especialidad, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
}

export function citasPorEstado(): CitaPorEstado[] {
  const citas = getAllCitas()
  const estados = {
    pendiente: { label: "Pendientes", fill: "var(--color-chart-1)" },
    completada: { label: "Completadas", fill: "var(--color-chart-2)" },
    cancelada: { label: "Canceladas", fill: "var(--color-chart-5)" },
  }

  return Object.entries(estados).map(([key, config]) => ({
    estado: config.label,
    cantidad: citas.filter((c) => c.estado === key).length,
    fill: config.fill,
  }))
}

export function proximasCitasHoy(): CitaConDetalles[] {
  const hoy = new Date().toISOString().split("T")[0]
  const citasHoy = getCitasByFecha(hoy)
    .filter((c) => c.estado === "pendiente")
    .sort((a, b) => a.hora.localeCompare(b.hora))

  return citasHoy.map((cita) => {
    const paciente = getPacienteById(cita.pacienteId)
    const doctor = getDoctorById(cita.doctorId)
    return {
      ...cita,
      pacienteNombre: paciente ? `${paciente.nombre} ${paciente.apellido}` : "Desconocido",
      doctorNombre: doctor ? `${doctor.nombre} ${doctor.apellido}` : "Desconocido",
      doctorEspecialidad: doctor?.especialidad || "N/A",
    }
  })
}
