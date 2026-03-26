'use client'

import { useEffect } from 'react'
import { syncAll } from '@/lib/sync'

export function SyncProvider() {
  useEffect(() => {
    syncAll().catch((err) =>
      console.warn('Sincronización con Supabase falló:', err)
    )
  }, [])

  return null
}
