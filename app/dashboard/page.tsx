"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Users, ArrowRight, ChevronRight, AlertCircle, Clock, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { isValidUrl } from "@/lib/utils"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    eventCount: 0,
    teamCount: 0,
    memberCount: 0,
    upcomingEvents: [],
    recentRegistrations: [],
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        console.log("Fetching dashboard data...")

        // First, test the database connection
        const testResponse = await fetch("/api/test-db")
        const testResult = await testResponse.json()

        if (!testResult.success) {
          setError(`Database connection error: ${testResult.error || "Unknown error"}`)
          setIsLoading(false)
          return
        }

        // If connection is successful, fetch dashboard data
        const response = await fetch("/api/dashboard")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success && result.data) {
          setStats(result.data)
        } else {
          setError(result.error || "Error al cargar los datos")
        }

        // Fetch recent registrations
        const registrationsResponse = await fetch("/api/events/registrations")
        if (registrationsResponse.ok) {
          const registrationsResult = await registrationsResponse.json()
          if (registrationsResult.success) {
            setStats((prev) => ({
              ...prev,
              recentRegistrations: registrationsResult.data.slice(0, 5), // Get only the 5 most recent
            }))
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err)
        setError(`Error al conectar con el servidor: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

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

  const isPastEvent = (dateString: string) => {
    const eventDate = new Date(dateString)
    const today = new Date()
    return eventDate < today
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/eventos/nuevo">Nuevo Evento</Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.eventCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingEvents && stats.upcomingEvents.length > 0
                ? `Próximo: ${formatDate(stats.upcomingEvents[0]?.date)}`
                : "No hay eventos próximos"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.teamCount}</div>
            <p className="text-xs text-muted-foreground">Total de equipos registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.memberCount}</div>
            <p className="text-xs text-muted-foreground">Jugadores y personal</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Wall and Upcoming Events */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Activity Wall */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos registros a eventos</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="w-3/4 h-5 bg-gray-200 rounded"></div>
                    <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : stats.recentRegistrations && stats.recentRegistrations.length > 0 ? (
              <div className="space-y-4">
                {stats.recentRegistrations.map((registration: any) => (
                  <div key={registration.id} className="border-l-2 border-blue-500 pl-4 py-1">
                    <div className="font-medium">{registration.name}</div>
                    <div className="text-sm text-muted-foreground">Se registró para {registration.eventTitle}</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDateTime(registration.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">No hay registros recientes.</div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Eventos programados para el equipo</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="w-3/4 h-5 bg-gray-200 rounded"></div>
                    <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                    <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : stats.upcomingEvents && stats.upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {stats.upcomingEvents.map((event: any) => (
                  <div key={event.id} className="border rounded-md p-3 hover:bg-gray-50">
                    <div className="font-medium">{event.title}</div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {isValidUrl(event.location) ? (
                        <a
                          href={event.location}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Ver ubicación
                        </a>
                      ) : (
                        event.location
                      )}
                    </div>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href={`/dashboard/eventos/${event.id}`}>Ver detalles</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">No hay eventos próximos programados.</div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/eventos" className="text-sm text-blue-600 hover:underline flex items-center">
              Ver todos los eventos
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/eventos/nuevo">
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Crear Evento
            </Button>
          </Link>
          <Link href="/dashboard/equipos">
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Gestionar Equipos
            </Button>
          </Link>
          <Link href="/dashboard/eventos">
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Gestionar Eventos
            </Button>
          </Link>
          <Link href="/" target="_blank">
            <Button className="w-full justify-start" variant="outline">
              <ArrowRight className="mr-2 h-4 w-4" />
              Ver Sitio Web
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
