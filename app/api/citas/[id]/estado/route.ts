import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/mysql'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { estado } = await request.json()
    
    if (!['pendiente', 'completada', 'cancelada'].includes(estado)) {
      return NextResponse.json(
        { error: 'Estado no valido' },
        { status: 400 }
      )
    }
    
    await query(
      'UPDATE citas SET estado = ? WHERE id = ?',
      [estado, id]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating cita status:', error)
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 })
  }
}
