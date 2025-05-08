"use client"

import { useState, useEffect } from "react"
import { Search, Plus, MoreHorizontal, Trash2, Edit, MapPin, DollarSign, Calendar, LinkIcon, Copy } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function EventosPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    setIsLoading(true)
    try {
      // First test the database connection
      const testResponse = await fetch("/api/test-db")
      const testResult = await testResponse.json()

      if (!testResult.success) {
        setError(`Database connection error: ${testResult.error || "Unknown error"}`)
        setIsLoading(false)
        return
      }

      // If connection is successful, fetch events
      const response = await fetch("/api/events")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setEvents(result.data)
      } else {
        setError(result.error || "No se pudieron cargar los eventos")
      }
    } catch (error) {
      console.error("Error loading events:", error)
      setError(`Error al cargar los eventos: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      try {
        const response = await fetch(`/api/events/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          toast({
            title: "Éxito",
            description: "Evento eliminado correctamente",
          })
          loadEvents()
        } else {
          setError(result.error || "No se pudo eliminar el evento")
        }
      } catch (error) {
        console.error("Error deleting event:", error)
        setError(`Error al eliminar el evento: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  const copyShareableLink = (slug: string) => {
    const link = `${window.location.origin}/eventos/${slug}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Enlace copiado",
      description: "El enlace ha sido copiado al portapapeles",
    })
  }

  const filteredEvents = events.filter(
    (event: any) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("es", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  const isPastEvent = (dateString: string) => {
    const eventDate = new Date(dateString)
    const today = new Date()
    return eventDate < today
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Eventos</h1>
        <Button onClick={() => router.push("/dashboard/eventos/nuevo")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Evento
        </Button>
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
          <CardTitle>Gestión de Eventos</CardTitle>
          <CardDescription>Administra los eventos del equipo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar evento..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-md">
                  <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
                  <div className="w-1/5 h-5 bg-gray-200 rounded"></div>
                  <div className="w-1/6 h-5 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredEvents.map((event: any) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <Badge
                        className={`ml-2 ${
                          isPastEvent(event.date) ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {isPastEvent(event.date) ? "Pasado" : "Próximo"}
                      </Badge>
                      {event.shareableSlug && <Badge className="ml-2 bg-blue-100 text-blue-800">Público</Badge>}
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="mr-2 h-4 w-4" />
                        {event.location}
                      </div>
                      {event.requiresPayment && (
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Precio: {event.price}
                        </div>
                      )}
                      {event.shareableSlug && (
                        <div className="flex items-center text-sm text-blue-600 mt-2">
                          <LinkIcon className="mr-2 h-4 w-4" />
                          <span className="mr-2">Enlace compartible</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 p-0"
                            onClick={() => copyShareableLink(event.shareableSlug)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-start">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/eventos/${event.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        {event.shareableSlug && (
                          <DropdownMenuItem onClick={() => copyShareableLink(event.shareableSlug)}>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            <span>Copiar enlace</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              {searchTerm ? "No se encontraron eventos que coincidan con la búsqueda." : "No hay eventos registrados."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
