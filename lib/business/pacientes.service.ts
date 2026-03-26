import type { Paciente } from "@/lib/types"
import * as repo from "@/lib/data/pacientes.repository"
import { getCitasByPaciente } from "@/lib/data/citas.repository"

export type PacienteInput = Omit<Paciente, "id" | "createdAt">

export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}

export function listarPacientes(): Paciente[] {
  return repo.getAllPacientes()
}

export function obtenerPaciente(id: string): ServiceResult<Paciente> {
  const paciente = repo.getPacienteById(id)
  if (!paciente) return { success: false, error: "Paciente no encontrado" }
  return { success: true, data: paciente }
}

export function crearPaciente(input: PacienteInput): ServiceResult<Paciente> {
  const validacion = validarPaciente(input)
  if (validacion) return { success: false, error: validacion }

  const existente = repo.getAllPacientes().find((p) => p.cedula === input.cedula)
  if (existente) return { success: false, error: "Ya existe un paciente con esta cedula" }

  const paciente = repo.createPaciente(input)
  return { success: true, data: paciente }
}

export function actualizarPaciente(id: string, input: Partial<PacienteInput>): ServiceResult<Paciente> {
  const existente = repo.getPacienteById(id)
  if (!existente) return { success: false, error: "Paciente no encontrado" }

  if (input.cedula && input.cedula !== existente.cedula) {
    const duplicado = repo.getAllPacientes().find((p) => p.cedula === input.cedula)
    if (duplicado) return { success: false, error: "Ya existe un paciente con esta cedula" }
  }

  const updated = repo.updatePaciente(id, input)
  if (!updated) return { success: false, error: "Error al actualizar paciente" }
  return { success: true, data: updated }
}

export function eliminarPaciente(id: string): ServiceResult<void> {
  const paciente = repo.getPacienteById(id)
  if (!paciente) return { success: false, error: "Paciente no encontrado" }

  const citasPendientes = getCitasByPaciente(id).filter((c) => c.estado === "pendiente")
  if (citasPendientes.length > 0) {
    return { success: false, error: `No se puede eliminar: tiene ${citasPendientes.length} cita(s) pendiente(s)` }
  }

  repo.deletePaciente(id)
  return { success: true }
}

function validarPaciente(input: PacienteInput): string | null {
  if (!input.nombre.trim()) return "El nombre es obligatorio"
  if (!input.apellido.trim()) return "El apellido es obligatorio"
  if (!input.cedula.trim()) return "La cedula es obligatoria"
  if (!input.fechaNacimiento) return "La fecha de nacimiento es obligatoria"
  if (!input.telefono.trim()) return "El telefono es obligatorio"
  return null
}
