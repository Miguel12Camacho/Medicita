// lib/repositories/doctores.repository.ts
import type { Doctor } from "@/lib/types"
import { getAll, getById, create, update, remove } from "./storage"
import { fetchAll, upsertRow, deleteRow } from "../sync"

const KEY = "doctores" as const

// ── Lecturas ──────────────────────────────────────────────────────────────────

export async function getAllDoctores(): Promise<Doctor[]> {
  return fetchAll<Doctor>(KEY)
}

export function getAllDoctoresSync(): Doctor[] {
  return getAll<Doctor>(KEY)
}

export function getDoctorById(id: string): Doctor | undefined {
  return getById<Doctor>(KEY, id)
}

// ── Escrituras ────────────────────────────────────────────────────────────────

export async function createDoctor(
  doctor: Omit<Doctor, "id" | "createdAt">,
): Promise<Doctor> {
  const newDoctor: Doctor = {
    ...doctor,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  create<Doctor>(KEY, newDoctor)
  await upsertRow<Doctor>(KEY, newDoctor)
  return newDoctor
}

export async function updateDoctor(
  id: string,
  updates: Partial<Doctor>,
): Promise<Doctor | undefined> {
  const updated = update<Doctor>(KEY, id, updates)
  if (updated) await upsertRow<Doctor>(KEY, updated)
  return updated
}

export async function deleteDoctor(id: string): Promise<boolean> {
  const ok = remove<Doctor>(KEY, id)
  if (ok) await deleteRow(KEY, id)
  return ok
}
