import type { Paciente, Doctor, Cita } from "@/lib/types"
import { setAll, isSeeded, markSeeded } from "./storage"

function generateId(): string {
  return crypto.randomUUID()
}

const pacientesSeed: Paciente[] = [
  { id: generateId(), nombre: "Maria", apellido: "Garcia Lopez", cedula: "001-1234567-8", fechaNacimiento: "1985-03-15", telefono: "809-555-0101", email: "maria.garcia@email.com", direccion: "Calle Principal #45, Santo Domingo", genero: "femenino", createdAt: "2025-01-10T08:00:00Z" },
  { id: generateId(), nombre: "Carlos", apellido: "Martinez Reyes", cedula: "002-9876543-2", fechaNacimiento: "1990-07-22", telefono: "809-555-0102", email: "carlos.martinez@email.com", direccion: "Av. Independencia #120, Santiago", genero: "masculino", createdAt: "2025-01-12T09:00:00Z" },
  { id: generateId(), nombre: "Ana", apellido: "Rodriguez Perez", cedula: "003-4567890-1", fechaNacimiento: "1978-11-30", telefono: "809-555-0103", email: "ana.rodriguez@email.com", direccion: "Calle Duarte #78, La Vega", genero: "femenino", createdAt: "2025-01-15T10:00:00Z" },
  { id: generateId(), nombre: "Jose", apellido: "Hernandez Cruz", cedula: "004-1122334-5", fechaNacimiento: "1995-01-08", telefono: "809-555-0104", email: "jose.hernandez@email.com", direccion: "Av. 27 de Febrero #200, Santo Domingo", genero: "masculino", createdAt: "2025-02-01T08:30:00Z" },
  { id: generateId(), nombre: "Laura", apellido: "Diaz Santos", cedula: "005-5566778-9", fechaNacimiento: "1988-05-19", telefono: "809-555-0105", email: "laura.diaz@email.com", direccion: "Calle El Conde #55, Zona Colonial", genero: "femenino", createdAt: "2025-02-05T11:00:00Z" },
  { id: generateId(), nombre: "Pedro", apellido: "Sanchez Mora", cedula: "006-9988776-3", fechaNacimiento: "1972-09-03", telefono: "809-555-0106", email: "pedro.sanchez@email.com", direccion: "Calle Las Americas #90, San Cristobal", genero: "masculino", createdAt: "2025-02-10T14:00:00Z" },
  { id: generateId(), nombre: "Sofia", apellido: "Torres Mendez", cedula: "007-3344556-7", fechaNacimiento: "2000-12-25", telefono: "809-555-0107", email: "sofia.torres@email.com", direccion: "Av. Abraham Lincoln #300, Piantini", genero: "femenino", createdAt: "2025-02-15T09:00:00Z" },
  { id: generateId(), nombre: "Miguel", apellido: "Ramirez Vega", cedula: "008-7788990-1", fechaNacimiento: "1982-04-11", telefono: "809-555-0108", email: "miguel.ramirez@email.com", direccion: "Calle Maximo Gomez #67, Gazcue", genero: "masculino", createdAt: "2025-03-01T08:00:00Z" },
  { id: generateId(), nombre: "Carmen", apellido: "Flores Jimenez", cedula: "009-2233445-6", fechaNacimiento: "1993-08-17", telefono: "809-555-0109", email: "carmen.flores@email.com", direccion: "Av. Romulo Betancourt #150, Bella Vista", genero: "femenino", createdAt: "2025-03-05T10:30:00Z" },
  { id: generateId(), nombre: "Roberto", apellido: "Castillo Pena", cedula: "010-6677889-0", fechaNacimiento: "1968-02-28", telefono: "809-555-0110", email: "roberto.castillo@email.com", direccion: "Calle Jose Contreras #22, Naco", genero: "masculino", createdAt: "2025-03-10T13:00:00Z" },
]

const doctoresSeed: Doctor[] = [
  { id: generateId(), nombre: "Dr. Juan", apellido: "Perez Almonte", especialidad: "Medicina General", telefono: "809-555-0201", email: "dr.perez@clinica.com", horarioInicio: "08:00", horarioFin: "16:00", createdAt: "2025-01-01T08:00:00Z" },
  { id: generateId(), nombre: "Dra. Isabel", apellido: "Gomez Rivera", especialidad: "Pediatria", telefono: "809-555-0202", email: "dra.gomez@clinica.com", horarioInicio: "08:00", horarioFin: "14:00", createdAt: "2025-01-01T08:00:00Z" },
  { id: generateId(), nombre: "Dr. Francisco", apellido: "Lopez Taveras", especialidad: "Cardiologia", telefono: "809-555-0203", email: "dr.lopez@clinica.com", horarioInicio: "09:00", horarioFin: "17:00", createdAt: "2025-01-01T08:00:00Z" },
  { id: generateId(), nombre: "Dra. Patricia", apellido: "Nunez Soto", especialidad: "Dermatologia", telefono: "809-555-0204", email: "dra.nunez@clinica.com", horarioInicio: "08:00", horarioFin: "15:00", createdAt: "2025-01-01T08:00:00Z" },
  { id: generateId(), nombre: "Dr. Ricardo", apellido: "Vargas Mejia", especialidad: "Traumatologia", telefono: "809-555-0205", email: "dr.vargas@clinica.com", horarioInicio: "09:00", horarioFin: "16:00", createdAt: "2025-01-01T08:00:00Z" },
  { id: generateId(), nombre: "Dra. Lucia", apellido: "Fernandez Gil", especialidad: "Ginecologia", telefono: "809-555-0206", email: "dra.fernandez@clinica.com", horarioInicio: "08:00", horarioFin: "14:00", createdAt: "2025-01-01T08:00:00Z" },
  { id: generateId(), nombre: "Dr. Andres", apellido: "Morales Baez", especialidad: "Oftalmologia", telefono: "809-555-0207", email: "dr.morales@clinica.com", horarioInicio: "10:00", horarioFin: "17:00", createdAt: "2025-01-01T08:00:00Z" },
  { id: generateId(), nombre: "Dra. Elena", apellido: "Reyes Polanco", especialidad: "Neurologia", telefono: "809-555-0208", email: "dra.reyes@clinica.com", horarioInicio: "08:00", horarioFin: "15:00", createdAt: "2025-01-01T08:00:00Z" },
]

export function seedDatabase(): void {
  if (isSeeded()) return

  setAll("pacientes", pacientesSeed)
  setAll("doctores", doctoresSeed)

  const today = new Date()
  const citasSeed: Cita[] = [
    { id: generateId(), pacienteId: pacientesSeed[0].id, doctorId: doctoresSeed[0].id, fecha: formatDate(today, 0), hora: "09:00", motivo: "Consulta general - dolor de cabeza persistente", estado: "pendiente", notas: "", createdAt: "2025-03-20T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[1].id, doctorId: doctoresSeed[2].id, fecha: formatDate(today, 0), hora: "10:00", motivo: "Control de presion arterial", estado: "pendiente", notas: "", createdAt: "2025-03-20T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[2].id, doctorId: doctoresSeed[1].id, fecha: formatDate(today, 0), hora: "11:00", motivo: "Control pediatrico hijo menor", estado: "pendiente", notas: "", createdAt: "2025-03-20T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[3].id, doctorId: doctoresSeed[3].id, fecha: formatDate(today, 1), hora: "08:30", motivo: "Revision de lunar sospechoso", estado: "pendiente", notas: "", createdAt: "2025-03-19T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[4].id, doctorId: doctoresSeed[5].id, fecha: formatDate(today, 1), hora: "09:30", motivo: "Control prenatal mensual", estado: "pendiente", notas: "", createdAt: "2025-03-19T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[5].id, doctorId: doctoresSeed[4].id, fecha: formatDate(today, 2), hora: "10:00", motivo: "Dolor en rodilla derecha", estado: "pendiente", notas: "", createdAt: "2025-03-18T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[6].id, doctorId: doctoresSeed[6].id, fecha: formatDate(today, 2), hora: "14:00", motivo: "Examen de vista anual", estado: "pendiente", notas: "", createdAt: "2025-03-18T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[7].id, doctorId: doctoresSeed[7].id, fecha: formatDate(today, 3), hora: "08:00", motivo: "Migranas frecuentes", estado: "pendiente", notas: "", createdAt: "2025-03-17T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[0].id, doctorId: doctoresSeed[2].id, fecha: formatDate(today, -1), hora: "09:00", motivo: "Electrocardiograma de rutina", estado: "completada", notas: "Resultados normales, proximo control en 6 meses", createdAt: "2025-03-15T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[1].id, doctorId: doctoresSeed[0].id, fecha: formatDate(today, -2), hora: "10:30", motivo: "Gripe estacional", estado: "completada", notas: "Se receto antigripal y reposo por 3 dias", createdAt: "2025-03-14T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[8].id, doctorId: doctoresSeed[3].id, fecha: formatDate(today, -3), hora: "11:00", motivo: "Tratamiento de acne", estado: "completada", notas: "Se inicio tratamiento topico, control en 1 mes", createdAt: "2025-03-13T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[9].id, doctorId: doctoresSeed[1].id, fecha: formatDate(today, -4), hora: "08:00", motivo: "Vacunacion hijo", estado: "completada", notas: "Vacuna aplicada sin complicaciones", createdAt: "2025-03-12T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[2].id, doctorId: doctoresSeed[0].id, fecha: formatDate(today, -5), hora: "14:00", motivo: "Dolor abdominal", estado: "completada", notas: "Posible gastritis, se ordeno endoscopia", createdAt: "2025-03-11T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[3].id, doctorId: doctoresSeed[5].id, fecha: formatDate(today, -2), hora: "09:00", motivo: "Consulta ginecologica", estado: "cancelada", notas: "Paciente cancelo por motivos personales", createdAt: "2025-03-14T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[5].id, doctorId: doctoresSeed[7].id, fecha: formatDate(today, -3), hora: "15:00", motivo: "Estudio neurologico", estado: "cancelada", notas: "Reprogramada para la proxima semana", createdAt: "2025-03-13T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[4].id, doctorId: doctoresSeed[0].id, fecha: formatDate(today, -6), hora: "08:30", motivo: "Chequeo general anual", estado: "completada", notas: "Todo en orden, proximo chequeo en 1 ano", createdAt: "2025-03-10T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[6].id, doctorId: doctoresSeed[2].id, fecha: formatDate(today, -7), hora: "11:30", motivo: "Dolor en el pecho", estado: "completada", notas: "Ansiedad. Se refirio a psicologia", createdAt: "2025-03-09T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[8].id, doctorId: doctoresSeed[4].id, fecha: formatDate(today, -1), hora: "10:00", motivo: "Esguince de tobillo", estado: "completada", notas: "Reposo e inmovilizacion por 2 semanas", createdAt: "2025-03-15T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[7].id, doctorId: doctoresSeed[6].id, fecha: formatDate(today, 4), hora: "10:30", motivo: "Revision de lentes", estado: "pendiente", notas: "", createdAt: "2025-03-16T08:00:00Z" },
    { id: generateId(), pacienteId: pacientesSeed[9].id, doctorId: doctoresSeed[0].id, fecha: formatDate(today, 5), hora: "09:00", motivo: "Resultados de laboratorio", estado: "pendiente", notas: "", createdAt: "2025-03-15T08:00:00Z" },
  ]

  setAll("citas", citasSeed)
  markSeeded()
}

function formatDate(base: Date, offsetDays: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split("T")[0]
}
