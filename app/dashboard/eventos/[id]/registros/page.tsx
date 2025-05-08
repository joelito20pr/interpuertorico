"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Download, AlertCircle, Users } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function EventoRegistrosPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    event: any
    registrations: any[]
    totalRegistrations: number
  }>({
    event: null,
    registrations: [],
    totalRegistrations: 0,
  })

  useEffect(() => {
    async function loadRegistrations() {
      try {
        const response = await fetch(`/api/events/${params.id}/registrations`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error || "Error al cargar los registros")
        }
      } catch (error) {
        console.error("Error loading registrations:", error)
        setError(`Error al cargar los registros: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadRegistrations()
  }, [params.id])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "d 'de' MMMM, yyyy", { locale: es })
    } catch (e) {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "d MMM yyyy, HH:mm", { locale: es })
    } catch (e) {
      return dateString
    }
  }

  const downloadCSV = () => {
    if (!data.registrations.length) return

    // Create CSV content
    const headers = ["Jugador", "Encargado", "Email", "Teléfono", "Fecha de Registro"]
    const csvContent = [
      headers.join(","),
      ...data.registrations.map((reg) =>
        [
          `"${reg.name}"`,
          `"${reg.guardianName || "-"}"`,
          `"${reg.email}"`,
          `"${reg.phone}"`,
          `"${formatDateTime(reg.createdAt)}"`,
        ].join(","),
      ),
    ].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `registros-${data.event?.title.replace(/\s+/g, "-").toLowerCase()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Registros de Evento</h1>
        </div>
        {data.registrations.length > 0 && (
          <Button onClick={downloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{data.event?.title}</CardTitle>
          <CardDescription>
            Fecha: {formatDate(data.event?.date)} | Registros: {data.totalRegistrations}
            {data.event?.maxAttendees && ` / ${data.event.maxAttendees} (máximo)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.registrations.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No hay registros para este evento.</p>
              {data.event?.shareableSlug && (
                <p className="mt-2">
                  Comparte el enlace público para que las personas puedan registrarse:
                  <br />
                  <span className="text-blue-600">
                    {window.location.origin}/eventos/{data.event.shareableSlug}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jugador</TableHead>
                  <TableHead>Encargado</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">{registration.name}</TableCell>
                    <TableCell>{registration.guardianName || "-"}</TableCell>
                    <TableCell>{registration.email}</TableCell>
                    <TableCell>{registration.phone}</TableCell>
                    <TableCell>{formatDateTime(registration.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
