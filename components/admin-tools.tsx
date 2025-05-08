"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export function AdminTools() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const updateEventSchema = async () => {
    setIsUpdating(true)
    setResult(null)

    try {
      const response = await fetch("/api/update-event-schema")
      const data = await response.json()

      setResult({
        success: data.success,
        message: data.success ? "Esquema actualizado correctamente" : data.error || "Error al actualizar el esquema",
      })
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Herramientas de Administración</CardTitle>
        <CardDescription>Herramientas para administrar la aplicación</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button onClick={updateEventSchema} disabled={isUpdating}>
            {isUpdating ? "Actualizando..." : "Actualizar Esquema de Eventos"}
          </Button>
          <p className="text-sm text-muted-foreground mt-1">
            Actualiza la estructura de la tabla de eventos para añadir las columnas necesarias.
          </p>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Éxito" : "Error"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
