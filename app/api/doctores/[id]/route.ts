import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'
import type { Doctor } from '@/lib/types'

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

function mapRowToDoctor(row: DoctorRow): Doctor {
  return {
    id: row.id,
    nombre: row.nombre,
    apellido: row.apellido,
    especialidad: row.especialidad,
    telefono: row.telefono,
    email: row.email,
    horarioInicio: row.horario_inicio,
    horarioFin: row.horario_fin,
    createdAt: row.created_at,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rows = await query<DoctorRow[]>(
      'SELECT * FROM doctores WHERE id = ?',
      [id]
    )
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Doctor no encontrado' }, { status: 404 })
    }
    
    return NextResponse.json(mapRowToDoctor(rows[0]))
  } catch (error) {
    console.error('Error fetching doctor:', error)
    return NextResponse.json({ error: 'Error al obtener doctor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    await query(
      `UPDATE doctores SET nombre = ?, apellido = ?, especialidad = ?, telefono = ?, 
       email = ?, horario_inicio = ?, horario_fin = ? WHERE id = ?`,
      [data.nombre, data.apellido, data.especialidad, data.telefono, data.email, data.horarioInicio, data.horarioFin, id]
    )
    
    const [updated] = await query<DoctorRow[]>(
      'SELECT * FROM doctores WHERE id = ?',
      [id]
    )
    
    return NextResponse.json(mapRowToDoctor(updated))
  } catch (error) {
    console.error('Error updating doctor:', error)
    return NextResponse.json({ error: 'Error al actualizar doctor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verificar si tiene citas pendientes
    const citasPendientes = await query<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM citas WHERE doctor_id = ? AND estado = 'pendiente'`,
      [id]
    )
    
    if (citasPendientes[0].count > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un doctor con citas pendientes' },
        { status: 400 }
      )
    }
    
    await query('DELETE FROM doctores WHERE id = ?', [id])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting doctor:', error)
    return NextResponse.json({ error: 'Error al eliminar doctor' }, { status: 500 })
  }
}
