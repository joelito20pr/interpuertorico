"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Calendar, MapPin, Edit, LinkIcon, ExternalLink, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { isValidUrl } from "@/lib/utils"

export default function EventosPage() {
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch("/api/events")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (data.success) {
          setEvents(data.data)
        } else {
          console.error("Error loading events:", data.error)
        }
      } catch (error) {
        console.error("Error loading events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "d 'de' MMMM, yyyy", { locale: es })
    } catch (e) {
      return dateString
    }
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
        <h1 className="text-2xl font-bold tracking-tight">Eventos</h1>
        <Button onClick={() => router.push("/dashboard/eventos/nuevo")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-center text-muted-foreground mb-4">No hay eventos registrados.</p>
            <Button onClick={() => router.push("/dashboard/eventos/nuevo")}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Crear Primer Evento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <div className="flex gap-1">
                    {event.shareableSlug && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        Público
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Calendar className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
                    <div className="flex-1">
                      {isValidUrl(event.location) ? (
                        <div className="flex items-center">
                          <a
                            href={event.location}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate max-w-[200px]"
                          >
                            {event.location}
                          </a>
                          <ExternalLink className="h-3 w-3 ml-1 text-blue-600" />
                        </div>
                      ) : (
                        <span className="truncate max-w-[250px] block">{event.location}</span>
                      )}
                    </div>
                  </div>
                  {event.shareableSlug && (
                    <div className="pt-2">
                      <Link
                        href={`/eventos/${event.shareableSlug}`}
                        target="_blank"
                        className="text-sm text-blue-600 hover:underline flex items-center"
                      >
                        Ver página pública
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  {event.shareableSlug && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/eventos/${event.id}/registros`)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Registros
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/eventos/${event.id}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
