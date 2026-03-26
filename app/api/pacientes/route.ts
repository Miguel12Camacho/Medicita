import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'
import { v4 as uuidv4 } from 'crypto'
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

export async function GET() {
  try {
    const rows = await query<PacienteRow[]>(
      'SELECT * FROM pacientes ORDER BY created_at DESC'
    )
    const pacientes = rows.map(mapRowToPaciente)
    return NextResponse.json(pacientes)
  } catch (error) {
    console.error('Error fetching pacientes:', error)
    return NextResponse.json({ error: 'Error al obtener pacientes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Verificar cedula unica
    const existing = await query<PacienteRow[]>(
      'SELECT id FROM pacientes WHERE cedula = ?',
      [data.cedula]
    )
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un paciente con esta cedula' },
        { status: 400 }
      )
    }
    
    const id = crypto.randomUUID()
    
    await query(
      `INSERT INTO pacientes (id, nombre, apellido, cedula, fecha_nacimiento, telefono, email, direccion, genero)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.nombre, data.apellido, data.cedula, data.fechaNacimiento, data.telefono, data.email, data.direccion, data.genero]
    )
    
    const [newPaciente] = await query<PacienteRow[]>(
      'SELECT * FROM pacientes WHERE id = ?',
      [id]
    )
    
    return NextResponse.json(mapRowToPaciente(newPaciente), { status: 201 })
  } catch (error) {
    console.error('Error creating paciente:', error)
    return NextResponse.json({ error: 'Error al crear paciente' }, { status: 500 })
  }
}
