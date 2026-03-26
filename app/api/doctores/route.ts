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

export async function GET() {
  try {
    const rows = await query<DoctorRow[]>(
      'SELECT * FROM doctores ORDER BY especialidad, apellido'
    )
    const doctores = rows.map(mapRowToDoctor)
    return NextResponse.json(doctores)
  } catch (error) {
    console.error('Error fetching doctores:', error)
    return NextResponse.json({ error: 'Error al obtener doctores' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const id = crypto.randomUUID()
    
    await query(
      `INSERT INTO doctores (id, nombre, apellido, especialidad, telefono, email, horario_inicio, horario_fin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.nombre, data.apellido, data.especialidad, data.telefono, data.email, data.horarioInicio, data.horarioFin]
    )
    
    const [newDoctor] = await query<DoctorRow[]>(
      'SELECT * FROM doctores WHERE id = ?',
      [id]
    )
    
    return NextResponse.json(mapRowToDoctor(newDoctor), { status: 201 })
  } catch (error) {
    console.error('Error creating doctor:', error)
    return NextResponse.json({ error: 'Error al crear doctor' }, { status: 500 })
  }
}
