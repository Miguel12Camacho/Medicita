import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"

interface PacienteRow {
  id: string
  nombre: string
  apellido: string
  cedula: string
  fecha_nacimiento: string
  telefono: string
  email: string
  direccion: string
  genero: "masculino" | "femenino" | "otro"
  created_at: string
}

interface DoctorRow {
  id: string
  nombre: string
  apellido: string
  especialidad: string
  telefono: string
  email: string
  horario_inicio: string
  horario_fin: string
  created_at: string
}

interface CitaRow {
  id: string
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const {
      nombre,
      apellido,
      cedula,
      fechaNacimiento,
      telefono,
      email,
      direccion,
      genero,
      especialidad,
      doctorId,
      fecha,
      hora,
      motivo,
    } = data

    if (
      !nombre || !apellido || !cedula || !fechaNacimiento || !telefono ||
      !email || !direccion || !genero || !especialidad || !doctorId ||
      !fecha || !hora || !motivo
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      )
    }

    const doctores = await query<DoctorRow[]>(
      "SELECT * FROM doctores WHERE id = ? LIMIT 1",
      [doctorId]
    )

    if (doctores.length === 0) {
      return NextResponse.json(
        { error: "El doctor seleccionado no existe" },
        { status: 404 }
      )
    }

    const doctor = doctores[0]

    if (doctor.especialidad !== especialidad) {
      return NextResponse.json(
        { error: "La especialidad no coincide con el doctor seleccionado" },
        { status: 400 }
      )
    }

    if (hora < doctor.horario_inicio || hora > doctor.horario_fin) {
      return NextResponse.json(
        { error: "La hora seleccionada está fuera del horario del doctor" },
        { status: 400 }
      )
    }

    const conflicto = await query<CitaRow[]>(
      `SELECT id
       FROM citas
       WHERE doctor_id = ? AND fecha = ? AND hora = ? AND estado != 'cancelada'
       LIMIT 1`,
      [doctorId, fecha, hora]
    )

    if (conflicto.length > 0) {
      return NextResponse.json(
        { error: "Ese horario ya no está disponible para el doctor" },
        { status: 400 }
      )
    }

    const pacientesExistentes = await query<PacienteRow[]>(
      "SELECT * FROM pacientes WHERE cedula = ? LIMIT 1",
      [cedula]
    )

    let pacienteId = ""

    if (pacientesExistentes.length > 0) {
      pacienteId = pacientesExistentes[0].id

      await query(
        `UPDATE pacientes
         SET nombre = ?, apellido = ?, fecha_nacimiento = ?, telefono = ?, email = ?, direccion = ?, genero = ?
         WHERE id = ?`,
        [nombre, apellido, fechaNacimiento, telefono, email, direccion, genero, pacienteId]
      )
    } else {
      pacienteId = crypto.randomUUID()

      await query(
        `INSERT INTO pacientes
         (id, nombre, apellido, cedula, fecha_nacimiento, telefono, email, direccion, genero)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [pacienteId, nombre, apellido, cedula, fechaNacimiento, telefono, email, direccion, genero]
      )
    }

    const citaId = crypto.randomUUID()

    await query(
      `INSERT INTO citas
       (id, paciente_id, doctor_id, fecha, hora, motivo, estado, notas)
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente', '')`,
      [citaId, pacienteId, doctorId, fecha, hora, motivo]
    )

    return NextResponse.json({
      ok: true,
      message: "Cita registrada correctamente",
      pacienteId,
      citaId,
    })
  } catch (error) {
    console.error("Error al registrar cita de cliente:", error)
    return NextResponse.json(
      { error: "Error al registrar la cita" },
      { status: 500 }
    )
  }
}