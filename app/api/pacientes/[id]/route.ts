import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'
import type { Paciente } from '@/lib/types'

interface PacienteRow {
  id: string
  nombre: string
  apellido: string
  cedula: string
  fecha_nacimiento: string
  telefono: string
  email: string
  direccion: string
  genero: 'masculino' | 'femenino' | 'otro'
  created_at: string
}

function mapRowToPaciente(row: PacienteRow): Paciente {
  return {
    id: row.id,
    nombre: row.nombre,
    apellido: row.apellido,
    cedula: row.cedula,
    fechaNacimiento: row.fecha_nacimiento,
    telefono: row.telefono,
    email: row.email,
    direccion: row.direccion,
    genero: row.genero,
    createdAt: row.created_at,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rows = await query<PacienteRow[]>(
      'SELECT * FROM pacientes WHERE id = ?',
      [id]
    )
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 })
    }
    
    return NextResponse.json(mapRowToPaciente(rows[0]))
  } catch (error) {
    console.error('Error fetching paciente:', error)
    return NextResponse.json({ error: 'Error al obtener paciente' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    // Verificar cedula unica (excluyendo el paciente actual)
    const existing = await query<PacienteRow[]>(
      'SELECT id FROM pacientes WHERE cedula = ? AND id != ?',
      [data.cedula, id]
    )
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe otro paciente con esta cedula' },
        { status: 400 }
      )
    }
    
    await query(
      `UPDATE pacientes SET nombre = ?, apellido = ?, cedula = ?, fecha_nacimiento = ?, 
       telefono = ?, email = ?, direccion = ?, genero = ? WHERE id = ?`,
      [data.nombre, data.apellido, data.cedula, data.fechaNacimiento, data.telefono, data.email, data.direccion, data.genero, id]
    )
    
    const [updated] = await query<PacienteRow[]>(
      'SELECT * FROM pacientes WHERE id = ?',
      [id]
    )
    
    return NextResponse.json(mapRowToPaciente(updated))
  } catch (error) {
    console.error('Error updating paciente:', error)
    return NextResponse.json({ error: 'Error al actualizar paciente' }, { status: 500 })
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
      `SELECT COUNT(*) as count FROM citas WHERE paciente_id = ? AND estado = 'pendiente'`,
      [id]
    )
    
    if (citasPendientes[0].count > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un paciente con citas pendientes' },
        { status: 400 }
      )
    }
    
    await query('DELETE FROM pacientes WHERE id = ?', [id])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting paciente:', error)
    return NextResponse.json({ error: 'Error al eliminar paciente' }, { status: 500 })
  }
}
