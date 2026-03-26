import type { Cita, CitaConDetalles, EstadoCita } from "@/lib/types"
import * as repo from "@/lib/data/citas.repository"
import { getPacienteById, getAllPacientes } from "@/lib/data/pacientes.repository"
import { getDoctorById, getAllDoctores } from "@/lib/data/doctores.repository"

export type CitaInput = Omit<Cita, "id" | "estado" | "creadoEn">

export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}

export function listarCitas(): Cita[] {
  return repo.getAllCitas()
}

export function listarCitasConDetalles(): CitaConDetalles[] {
  const citas = repo.getAllCitas()
  const pacientes = getAllPacientes()
  const doctores = getAllDoctores()

  return citas.map((cita) => ({
    ...cita,
    paciente: pacientes.find((p) => p.id === cita.pacienteId),
    doctor: doctores.find((d) => d.id === cita.doctorId),
  }))
}

export function obtenerCita(id: string): ServiceResult<Cita> {
  const cita = repo.getCitaById(id)
  if (!cita) return { success: false, error: "Cita no encontrada" }
  return { success: true, data: cita }
}

export function crearCita(input: CitaInput): ServiceResult<Cita> {
  const validacion = validarCita(input)
  if (validacion) return { success: false, error: validacion }

  const conflicto = repo.getCitasByDoctor(input.doctorId).find(
    (c) => c.fecha === input.fecha && c.hora === input.hora && c.estado !== "cancelada"
  )
  if (conflicto) {
    return { success: false, error: "El doctor ya tiene una cita programada en esa fecha y hora" }
  }

  const cita = repo.createCita({
    ...input,
    estado: "pendiente",
  })
  return { success: true, data: cita }
}

export function actualizarCita(id: string, input: Partial<CitaInput>): ServiceResult<Cita> {
  const existente = repo.getCitaById(id)
  if (!existente) return { success: false, error: "Cita no encontrada" }

  if (existente.estado !== "pendiente") {
    return { success: false, error: "Solo se pueden editar citas pendientes" }
  }

  if (input.doctorId || input.fecha || input.hora) {
    const doctorId = input.doctorId || existente.doctorId
    const fecha = input.fecha || existente.fecha
    const hora = input.hora || existente.hora

    const conflicto = repo.getCitasByDoctor(doctorId).find(
      (c) => c.id !== id && c.fecha === fecha && c.hora === hora && c.estado !== "cancelada"
    )
    if (conflicto) {
      return { success: false, error: "El doctor ya tiene una cita programada en esa fecha y hora" }
    }
  }

  const updated = repo.updateCita(id, input)
  if (!updated) return { success: false, error: "Error al actualizar cita" }
  return { success: true, data: updated }
}

export function cambiarEstadoCita(id: string, nuevoEstado: EstadoCita): ServiceResult<Cita> {
  const cita = repo.getCitaById(id)
  if (!cita) return { success: false, error: "Cita no encontrada" }

  if (cita.estado !== "pendiente" && nuevoEstado !== cita.estado) {
    return { success: false, error: "Solo se puede cambiar el estado de citas pendientes" }
  }

  const updated = repo.updateCita(id, { estado: nuevoEstado })
  if (!updated) return { success: false, error: "Error al actualizar cita" }
  return { success: true, data: updated }
}

export function eliminarCita(id: string): ServiceResult<void> {
  const cita = repo.getCitaById(id)
  if (!cita) return { success: false, error: "Cita no encontrada" }

  repo.deleteCita(id)
  return { success: true }
}

export function citasPorFecha(fecha: string): Cita[] {
  return repo.getCitasByFecha(fecha)
}

function validarCita(input: CitaInput): string | null {
  if (!input.pacienteId) return "Debe seleccionar un paciente"
  if (!input.doctorId) return "Debe seleccionar un doctor"
  if (!input.fecha) return "La fecha es obligatoria"
  if (!input.hora) return "La hora es obligatoria"
  if (!input.motivo.trim()) return "El motivo es obligatorio"

  const paciente = getPacienteById(input.pacienteId)
  if (!paciente) return "El paciente seleccionado no existe"

  const doctor = getDoctorById(input.doctorId)
  if (!doctor) return "El doctor seleccionado no existe"

  if (input.hora < doctor.horarioInicio || input.hora >= doctor.horarioFin) {
    return `La hora debe estar entre ${doctor.horarioInicio} y ${doctor.horarioFin}`
  }

  const hoy = new Date().toISOString().split("T")[0]
  if (input.fecha < hoy) return "La fecha no puede ser anterior a hoy"

  return null
}
