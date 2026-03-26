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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rows = await query<CitaConDetallesRow[]>(`
      SELECT c.*, 
             p.nombre as paciente_nombre, p.apellido as paciente_apellido,
             d.nombre as doctor_nombre, d.apellido as doctor_apellido, d.especialidad
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN doctores d ON c.doctor_id = d.id
      WHERE c.id = ?
    `, [id])
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }
    
    return NextResponse.json(mapRowToCitaConDetalles(rows[0]))
  } catch (error) {
    console.error('Error fetching cita:', error)
    return NextResponse.json({ error: 'Error al obtener cita' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    // Verificar conflicto de horario (excluyendo la cita actual)
    const conflicto = await query<CitaRow[]>(
      `SELECT id FROM citas 
       WHERE doctor_id = ? AND fecha = ? AND hora = ? AND estado != 'cancelada' AND id != ?`,
      [data.doctorId, data.fecha, data.hora, id]
    )
    
    if (conflicto.length > 0) {
      return NextResponse.json(
        { error: 'El doctor ya tiene una cita programada en ese horario' },
        { status: 400 }
      )
    }
    
    await query(
      `UPDATE citas SET paciente_id = ?, doctor_id = ?, fecha = ?, hora = ?, motivo = ?, notas = ?
       WHERE id = ?`,
      [data.pacienteId, data.doctorId, data.fecha, data.hora, data.motivo, data.notas || '', id]
    )
    
    const [updated] = await query<CitaConDetallesRow[]>(`
      SELECT c.*, 
             p.nombre as paciente_nombre, p.apellido as paciente_apellido,
             d.nombre as doctor_nombre, d.apellido as doctor_apellido, d.especialidad
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN doctores d ON c.doctor_id = d.id
      WHERE c.id = ?
    `, [id])
    
    return NextResponse.json(mapRowToCitaConDetalles(updated))
  } catch (error) {
    console.error('Error updating cita:', error)
    return NextResponse.json({ error: 'Error al actualizar cita' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await query('DELETE FROM citas WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting cita:', error)
    return NextResponse.json({ error: 'Error al eliminar cita' }, { status: 500 })
  }
}
