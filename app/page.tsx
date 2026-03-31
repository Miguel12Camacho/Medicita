"use client"

import Link from "next/link"
import { HeartPulse, ShieldCheck, UserRound } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-5xl space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <HeartPulse className="size-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">MediCitas</h1>
          <p className="mt-2 text-muted-foreground">
            Selecciona cómo deseas ingresar al sistema
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <UserRound className="size-6" />
              </div>
              <CardTitle>Cliente</CardTitle>
              <CardDescription>
                Agenda una cita médica de forma rápida y sencilla.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/cliente">
                <Button className="w-full">Ir a registro de cita</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ShieldCheck className="size-6" />
              </div>
              <CardTitle>Administrador</CardTitle>
              <CardDescription>
                Accede al panel administrativo con contraseña.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/login">
                <Button className="w-full" variant="outline">
                  Ir a acceso admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}