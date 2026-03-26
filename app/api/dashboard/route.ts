import { NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'

interface CountResult {
  count: number
}

interface CitasPorMes {
  mes: string
  total: number
}

interface CitasPorEspecialidad {
  especialidad: string
  total: number
}

interface ProximaCita {
  id: string
  fecha: string
  hora: string
  paciente_nombre: string
  paciente_apellido: string
  doctor_nombre: string
  doctor_apellido: string
  especialidad: string
  motivo: string
}

export async function GET() {
  try {
    // Estadisticas generales
    const [totalPacientes] = await query<CountResult[]>('SELECT COUNT(*) as count FROM pacientes')
    const [totalDoctores] = await query<CountResult[]>('SELECT COUNT(*) as count FROM doctores')
    const [citasPendientes] = await query<CountResult[]>(`SELECT COUNT(*) as count FROM citas WHERE estado = 'pendiente'`)
    const [citasCompletadas] = await query<CountResult[]>(`SELECT COUNT(*) as count FROM citas WHERE estado = 'completada'`)
    
    // Citas por mes (ultimos 6 meses)
    const citasPorMes = await query<CitasPorMes[]>(`
      SELECT DATE_FORMAT(fecha, '%Y-%m') as mes, COUNT(*) as total
      FROM citas
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(fecha, '%Y-%m')
      ORDER BY mes
    `)
    
    // Citas por especialidad
    const citasPorEspecialidad = await query<CitasPorEspecialidad[]>(`
      SELECT d.especialidad, COUNT(*) as total
      FROM citas c
      JOIN doctores d ON c.doctor_id = d.id
      GROUP BY d.especialidad
      ORDER BY total DESC
    `)
    
    // Proximas citas
    const proximasCitas = await query<ProximaCita[]>(`
      SELECT c.id, c.fecha, c.hora, c.motivo,
             p.nombre as paciente_nombre, p.apellido as paciente_apellido,
             d.nombre as doctor_nombre, d.apellido as doctor_apellido, d.especialidad
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN doctores d ON c.doctor_id = d.id
      WHERE c.estado = 'pendiente' AND c.fecha >= CURDATE()
      ORDER BY c.fecha, c.hora
      LIMIT 5
    `)
    
    return NextResponse.json({
      estadisticas: {
        totalPacientes: totalPacientes.count,
        totalDoctores: totalDoctores.count,
        citasPendientes: citasPendientes.count,
        citasCompletadas: citasCompletadas.count,
      },
      citasPorMes: citasPorMes.map(row => ({
        mes: row.mes,
        total: row.total,
      })),
      citasPorEspecialidad: citasPorEspecialidad.map(row => ({
        especialidad: row.especialidad,
        total: row.total,
      })),
      proximasCitas: proximasCitas.map(row => ({
        id: row.id,
        fecha: row.fecha,
        hora: row.hora,
        pacienteNombre: `${row.paciente_nombre} ${row.paciente_apellido}`,
        doctorNombre: `${row.doctor_nombre} ${row.doctor_apellido}`,
        especialidad: row.especialidad,
        motivo: row.motivo,
      })),
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Error al obtener datos del dashboard' }, { status: 500 })
  }
}
