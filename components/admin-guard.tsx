"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

const ADMIN_AUTH_KEY = "medicitas_admin_auth"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (pathname === "/admin/login") {
      setAuthorized(true)
      setChecking(false)
      return
    }

    const isAuth = localStorage.getItem(ADMIN_AUTH_KEY) === "true"

    if (!isAuth) {
      router.replace("/admin/login")
      return
    }

    setAuthorized(true)
    setChecking(false)
  }, [pathname, router])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Verificando acceso...</p>
      </div>
    )
  }

  if (!authorized) return null

  return <>{children}</>
}