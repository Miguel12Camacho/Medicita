// lib/repositories/pacientes.repository.ts
import type { Paciente } from "@/lib/types"
import { getAll, getById, create, update, remove } from "./storage"
import { fetchAll, upsertRow, deleteRow } from "../sync"

const KEY = "pacientes" as const

// ── Lecturas ──────────────────────────────────────────────────────────────────

export async function getAllPacientes(): Promise<Paciente[]> {
  return fetchAll<Paciente>(KEY)
}

export function getAllPacientesSync(): Paciente[] {
  return getAll<Paciente>(KEY)
}

export function getPacienteById(id: string): Paciente | undefined {
  return getById<Paciente>(KEY, id)
}

// ── Escrituras ────────────────────────────────────────────────────────────────

export async function createPaciente(
  paciente: Omit<Paciente, "id" | "createdAt">,
): Promise<Paciente> {
  const newPaciente: Paciente = {
    ...paciente,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  create<Paciente>(KEY, newPaciente)
  await upsertRow<Paciente>(KEY, newPaciente)
  return newPaciente
}

export async function updatePaciente(
  id: string,
  updates: Partial<Paciente>,
): Promise<Paciente | undefined> {
  const updated = update<Paciente>(KEY, id, updates)
  if (updated) await upsertRow<Paciente>(KEY, updated)
  return updated
}

export async function deletePaciente(id: string): Promise<boolean> {
  const ok = remove<Paciente>(KEY, id)
  if (ok) await deleteRow(KEY, id)
  return ok
}
