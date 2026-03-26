import type { Doctor } from "@/lib/types"
import * as repo from "@/lib/data/doctores.repository"
import { getCitasByDoctor } from "@/lib/data/citas.repository"

export type DoctorInput = Omit<Doctor, "id" | "createdAt">

export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}

export function listarDoctores(): Doctor[] {
  return repo.getAllDoctores()
}

export function obtenerDoctor(id: string): ServiceResult<Doctor> {
  const doctor = repo.getDoctorById(id)
  if (!doctor) return { success: false, error: "Doctor no encontrado" }
  return { success: true, data: doctor }
}

export function crearDoctor(input: DoctorInput): ServiceResult<Doctor> {
  const validacion = validarDoctor(input)
  if (validacion) return { success: false, error: validacion }

  const doctor = repo.createDoctor(input)
  return { success: true, data: doctor }
}

export function actualizarDoctor(id: string, input: Partial<DoctorInput>): ServiceResult<Doctor> {
  const existente = repo.getDoctorById(id)
  if (!existente) return { success: false, error: "Doctor no encontrado" }

  const updated = repo.updateDoctor(id, input)
  if (!updated) return { success: false, error: "Error al actualizar doctor" }
  return { success: true, data: updated }
}

export function eliminarDoctor(id: string): ServiceResult<void> {
  const doctor = repo.getDoctorById(id)
  if (!doctor) return { success: false, error: "Doctor no encontrado" }

  const citasPendientes = getCitasByDoctor(id).filter((c) => c.estado === "pendiente")
  if (citasPendientes.length > 0) {
    return { success: false, error: `No se puede eliminar: tiene ${citasPendientes.length} cita(s) pendiente(s)` }
  }

  repo.deleteDoctor(id)
  return { success: true }
}

function validarDoctor(input: DoctorInput): string | null {
  if (!input.nombre.trim()) return "El nombre es obligatorio"
  if (!input.apellido.trim()) return "El apellido es obligatorio"
  if (!input.especialidad) return "La especialidad es obligatoria"
  if (!input.telefono.trim()) return "El telefono es obligatorio"
  if (!input.horarioInicio || !input.horarioFin) return "Los horarios son obligatorios"
  if (input.horarioInicio >= input.horarioFin) return "El horario de inicio debe ser anterior al de fin"
  return null
}
