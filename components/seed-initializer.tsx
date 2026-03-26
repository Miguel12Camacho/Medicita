"use client"

import { useEffect } from "react"
import { seedDatabase } from "@/lib/data/seed"

export function SeedInitializer() {
  useEffect(() => {
    seedDatabase()
  }, [])
  return null
}
