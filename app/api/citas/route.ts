import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'
import type { Cita, CitaConDetalles } from '@/lib/types'

interface CitaRow {
  id: string
  paciente_id: string
  doctor_id: string
  fecha: string
  hora: string
  motivo: string
  estado: 'pendiente' | 'completada' | 'cancelada'
  notas: string
  created_at: string
}

interface CitaConDetallesRow extends CitaRow {
  paciente_nombre: string
  paciente_apellido: string
  doctor_nombre: string
  doctor_apellido: string
  especialidad: string
}

function mapRowToCita(row: CitaRow): Cita {
  return {
    id: row.id,
    pacienteId: row.paciente_id,
    doctorId: row.doctor_id,
    fecha: row.fecha,
    hora: row.hora,
    motivo: row.motivo,
    estado: row.estado,
    notas: row.notas || '',
    createdAt: row.created_at,
  }
}

function mapRowToCitaConDetalles(row: CitaConDetallesRow): CitaConDetalles {
  return {
    ...mapRowToCita(row),
    pacienteNombre: `${row.paciente_nombre} ${row.paciente_apellido}`,
    doctorNombre: `${row.doctor_nombre} ${row.doctor_apellido}`,
    especialidad: row.especialidad,
  }
}

export async function GET() {
  try {
    const rows = await query<CitaConDetallesRow[]>(`
      SELECT c.*, 
             p.nombre as paciente_nombre, p.apellido as paciente_apellido,
             d.nombre as doctor_nombre, d.apellido as doctor_apellido, d.especialidad
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN doctores d ON c.doctor_id = d.id
      ORDER BY c.fecha DESC, c.hora DESC
    `)
    const citas = rows.map(mapRowToCitaConDetalles)
    return NextResponse.json(citas)
  } catch (error) {
    console.error('Error fetching citas:', error)
    return NextResponse.json({ error: 'Error al obtener citas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Verificar conflicto de horario
    const conflicto = await query<CitaRow[]>(
      `SELECT id FROM citas 
       WHERE doctor_id = ? AND fecha = ? AND hora = ? AND estado != 'cancelada'`,
      [data.doctorId, data.fecha, data.hora]
    )
    
    if (conflicto.length > 0) {
      return NextResponse.json(
        { error: 'El doctor ya tiene una cita programada en ese horario' },
        { status: 400 }
      )
    }
    
    const id = crypto.randomUUID()
    
    await query(
      `INSERT INTO citas (id, paciente_id, doctor_id, fecha, hora, motivo, estado, notas)
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente', ?)`,
      [id, data.pacienteId, data.doctorId, data.fecha, data.hora, data.motivo, data.notas || '']
    )
    
    const [newCita] = await query<CitaConDetallesRow[]>(`
      SELECT c.*, 
             p.nombre as paciente_nombre, p.apellido as paciente_apellido,
             d.nombre as doctor_nombre, d.apellido as doctor_apellido, d.especialidad
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN doctores d ON c.doctor_id = d.id
      WHERE c.id = ?
    `, [id])
    
    return NextResponse.json(mapRowToCitaConDetalles(newCita), { status: 201 })
  } catch (error) {
    console.error('Error creating cita:', error)
    return NextResponse.json({ error: 'Error al crear cita' }, { status: 500 })
  }
}
