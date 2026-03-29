import { createClient } from "@supabase/supabase-js"
import type { Paciente, Doctor, Cita } from "@/lib/types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Tipos que mapean exactamente las tablas de Supabase ──────────────────────

export type PacienteRow = Paciente   // columnas: id, nombre, apellido, cedula,
                                     //   fecha_nacimiento, telefono, email,
                                     //   direccion, genero, created_at
export type DoctorRow  = Doctor      // columnas: id, nombre, apellido, especialidad,
                                     //   telefono, email, horario_inicio,
                                     //   horario_fin, created_at
export type CitaRow    = Cita        // columnas: id, paciente_id, doctor_id,
                                     //   fecha, hora, motivo, estado, notas,
                                     //   created_at
