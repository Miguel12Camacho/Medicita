export interface Paciente {
  id: string
  nombre: string
  apellido: string
  cedula: string
  fechaNacimiento: string
  telefono: string
  email: string
  direccion: string
  genero: "masculino" | "femenino" | "otro"
  createdAt: string
}

export interface Doctor {
  id: string
  nombre: string
  apellido: string
  especialidad: string
  telefono: string
  email: string
  horarioInicio: string
  horarioFin: string
  createdAt: string
}

export interface Cita {
  id: string
  pacienteId: string
  doctorId: string
  fecha: string
  hora: string
  motivo: string
  estado: "pendiente" | "completada" | "cancelada"
  notas: string
  createdAt: string
}

export interface CitaConDetalles extends Cita {
  pacienteNombre: string
  doctorNombre: string
  especialidad: string
  paciente?: Paciente
  doctor?: Doctor
}

export type EstadoCita = "pendiente" | "completada" | "cancelada"

export const ESPECIALIDADES = [
  "Medicina General",
  "Pediatria",
  "Cardiologia",
  "Dermatologia",
  "Ginecologia",
  "Oftalmologia",
  "Traumatologia",
  "Neurologia",
] as const

export const HORAS_DISPONIBLES = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
] as const
