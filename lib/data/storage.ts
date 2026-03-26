const STORAGE_KEYS = {
  pacientes: "citas_medicas_pacientes",
  doctores: "citas_medicas_doctores",
  citas: "citas_medicas_citas",
  seeded: "citas_medicas_seeded",
} as const

export type StorageKey = keyof typeof STORAGE_KEYS

function getStorageKey(key: StorageKey): string {
  return STORAGE_KEYS[key]
}

export function getAll<T>(key: StorageKey): T[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(getStorageKey(key))
  return data ? JSON.parse(data) : []
}

export function getById<T extends { id: string }>(key: StorageKey, id: string): T | undefined {
  const items = getAll<T>(key)
  return items.find((item) => item.id === id)
}

export function create<T extends { id: string }>(key: StorageKey, item: T): T {
  const items = getAll<T>(key)
  items.push(item)
  localStorage.setItem(getStorageKey(key), JSON.stringify(items))
  return item
}

export function update<T extends { id: string }>(key: StorageKey, id: string, updates: Partial<T>): T | undefined {
  const items = getAll<T>(key)
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) return undefined
  items[index] = { ...items[index], ...updates }
  localStorage.setItem(getStorageKey(key), JSON.stringify(items))
  return items[index]
}

export function remove<T extends { id: string }>(key: StorageKey, id: string): boolean {
  const items = getAll<T>(key)
  const filtered = items.filter((item) => item.id !== id)
  if (filtered.length === items.length) return false
  localStorage.setItem(getStorageKey(key), JSON.stringify(filtered))
  return true
}

export function setAll<T>(key: StorageKey, items: T[]): void {
  localStorage.setItem(getStorageKey(key), JSON.stringify(items))
}

export function isSeeded(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(getStorageKey("seeded")) === "true"
}

export function markSeeded(): void {
  localStorage.setItem(getStorageKey("seeded"), "true")
}
