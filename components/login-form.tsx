"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginAction } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setIsLoading(true)

    try {
      const result = await loginAction(formData)

      if (result.success) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(result.error || "Error al iniciar sesión")
      }
    } catch (error) {
      console.error("Error de inicio de sesión:", error)
      setError("Ocurrió un error al iniciar sesión. Por favor intente de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md shadow-sm -space-y-px">
        <div className="mb-4">
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="correo@ejemplo.com"
          />
        </div>
        <div>
          <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
      </div>
    </form>
  )
}
