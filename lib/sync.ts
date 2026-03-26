// lib/sync.ts
// ─────────────────────────────────────────────────────────────────────────────
// Capa de sincronización entre localStorage (caché) y Supabase (fuente de verdad).
//
// Estrategia:
//   • Lecturas  → Supabase primero; si falla o hay sin conexión → localStorage.
//   • Escrituras → Supabase primero; si tiene éxito → actualiza localStorage.
//                  Si falla → guarda solo en localStorage y marca como "dirty"
//                  para reintentarlo más tarde (cola pendiente).
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase"
import { setAll, getAll } from "./data/storage"
import type { StorageKey } from "./data/storage"

// ── Mapeo de claves lógicas → nombres de tabla en Supabase ──────────────────

const TABLE_MAP: Record<StorageKey, string> = {
  pacientes: "pacientes",
  doctores: "doctores",
  citas: "citas",
  seeded: "",          // no existe como tabla; se gestiona solo en localStorage
}

// ── Cola de operaciones pendientes (offline) ─────────────────────────────────

type PendingOp =
  | { type: "upsert"; table: string; row: Record<string, unknown> }
  | { type: "delete"; table: string; id: string }

const PENDING_KEY = "citas_medicas_pending_ops"

function getPendingOps(): PendingOp[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(PENDING_KEY)
  return raw ? JSON.parse(raw) : []
}

function savePendingOps(ops: PendingOp[]): void {
  localStorage.setItem(PENDING_KEY, JSON.stringify(ops))
}

function enqueuePendingOp(op: PendingOp): void {
  const ops = getPendingOps()
  ops.push(op)
  savePendingOps(ops)
}

// ── Flush: reenvía las operaciones pendientes cuando vuelve la conexión ──────

export async function flushPendingOps(): Promise<void> {
  const ops = getPendingOps()
  if (ops.length === 0) return

  const remaining: PendingOp[] = []

  for (const op of ops) {
    try {
      if (op.type === "upsert") {
        const { error } = await supabase.from(op.table).upsert(op.row)
        if (error) throw error
      } else if (op.type === "delete") {
        const { error } = await supabase.from(op.table).delete().eq("id", op.id)
        if (error) throw error
      }
    } catch {
      remaining.push(op) // reintentará en el próximo flush
    }
  }

  savePendingOps(remaining)
}

// ── Registro automático para flush al recuperar conexión ─────────────────────

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    flushPendingOps()
  })
}

// ── Lectura: Supabase → caché local ──────────────────────────────────────────

export async function fetchAll<T>(key: StorageKey): Promise<T[]> {
  const table = TABLE_MAP[key]
  if (!table) return getAll<T>(key)

  try {
    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: true })
    if (error) throw error

    const rows = (data ?? []) as T[]
    setAll(key, rows)          // actualiza caché local
    return rows
  } catch {
    // Sin conexión o error → usa caché local
    return getAll<T>(key)
  }
}

// ── Escritura: Supabase + caché local ────────────────────────────────────────

export async function upsertRow<T extends { id: string }>(
  key: StorageKey,
  row: T,
): Promise<void> {
  const table = TABLE_MAP[key]
  if (!table) return

  try {
    const { error } = await supabase.from(table).upsert(row as Record<string, unknown>)
    if (error) throw error
  } catch {
    // Guardar en cola para reintento posterior
    enqueuePendingOp({ type: "upsert", table, row: row as Record<string, unknown> })
  }
}

export async function deleteRow(key: StorageKey, id: string): Promise<void> {
  const table = TABLE_MAP[key]
  if (!table) return

  try {
    const { error } = await supabase.from(table).delete().eq("id", id)
    if (error) throw error
  } catch {
    enqueuePendingOp({ type: "delete", table, id })
  }
}

// ── Sincronización completa (útil al montar la app) ──────────────────────────

export async function syncAll(): Promise<void> {
  await Promise.all([
    fetchAll("pacientes"),
    fetchAll("doctores"),
    fetchAll("citas"),
  ])
  await flushPendingOps()
}