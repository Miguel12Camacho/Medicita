// lib/repositories/citas.repository.ts
import type { Cita } from "@/lib/types"
import { getAll, getById, create, update, remove } from "./storage"
import { fetchAll, upsertRow, deleteRow } from "../sync"

const KEY = "citas" as const

// ── Lecturas ─────────────────────────────────────────────────────────────────

/** Devuelve todas las citas. Intenta Supabase; cae en caché si falla. */
export async function getAllCitas(): Promise<Cita[]> {
  return fetchAll<Cita>(KEY)
}

/** Versión síncrona para compatibilidad con código que no puede ser async. */
export function getAllCitasSync(): Cita[] {
  return getAll<Cita>(KEY)
}

export function getCitaById(id: string): Cita | undefined {
  return getById<Cita>(KEY, id)
}

export function getCitasByPaciente(pacienteId: string): Cita[] {
  return getAllCitasSync().filter((c) => c.pacienteId === pacienteId)
}

export function getCitasByDoctor(doctorId: string): Cita[] {
  return getAllCitasSync().filter((c) => c.doctorId === doctorId)
}

export function getCitasByFecha(fecha: string): Cita[] {
  return getAllCitasSync().filter((c) => c.fecha === fecha)
}

// ── Escrituras ────────────────────────────────────────────────────────────────

export async function createCita(cita: Omit<Cita, "id" | "createdAt">): Promise<Cita> {
  const newCita: Cita = {
    ...cita,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  create<Cita>(KEY, newCita)          // caché local inmediato
  await upsertRow<Cita>(KEY, newCita) // sincroniza con Supabase
  return newCita
}

export async function updateCita(
  id: string,
  updates: Partial<Cita>,
): Promise<Cita | undefined> {
  const updated = update<Cita>(KEY, id, updates)   // caché local inmediato
  if (updated) await upsertRow<Cita>(KEY, updated)  // sincroniza con Supabase
  return updated
}

export async function deleteCita(id: string): Promise<boolean> {
  const ok = remove<Cita>(KEY, id)   // caché local inmediato
  if (ok) await deleteRow(KEY, id)   // sincroniza con Supabase
  return ok
}
