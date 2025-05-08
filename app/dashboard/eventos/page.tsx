"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Plus, Users, RefreshCw, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function EventosPage() {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/events")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setEvents(result.data || [])
      } else {
        setError(result.error || "Error al cargar los eventos")
      }
    } catch (error) {
      console.error("Error loading events:", error)
      setError(`Error al cargar los eventos: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadEvents()
  }

  if (isLoading && !isRefreshing) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Opciones de diagnóstico</CardTitle>
            <CardDescription>Herramientas para solucionar problemas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Intentar de nuevo
                  </>
                )}
              </Button>

              <Button variant="outline" asChild>
                <Link href="/api/debug/list-events">Ver todos los eventos</Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/api/debug/fix-event-ids">Reparar IDs de eventos</Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/api/repair-database">Reparar base de datos</Link>
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/eventos/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Crear nuevo evento
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Eventos</h1>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </>
            )}
          </Button>
          <Button asChild>
            <Link href="/dashboard/eventos/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Evento
            </Link>
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No hay eventos registrados.</p>
            <Button asChild>
              <Link href="/dashboard/eventos/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Crear nuevo evento
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Link key={event.id} href={`/dashboard/eventos/${event.id}`} className="block">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(event.date)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start mb-2">
                    <MapPin className="h-4 w-4 mr-1 mt-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground line-clamp-1">{event.location}</p>
                  </div>
                  {event.description && <p className="text-sm line-clamp-2">{event.description}</p>}
                </CardContent>
                <CardFooter>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {event.registrationCount || 0} {event.registrationCount === 1 ? "participante" : "participantes"}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
