"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DollarSign, Users, Calendar, TrendingUp, ArrowRight, ChevronRight, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    eventCount: 0,
    teamCount: 0,
    memberCount: 0,
    sponsorCount: 0,
    totalAmount: 0,
    goalAmount: 5000,
    recentSponsors: [],
    upcomingEvents: [],
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
      } catch (err) {
        console.error("Error loading dashboard data:", err)
        setError(`Error al conectar con el servidor: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const progressPercentage = (stats.totalAmount / stats.goalAmount) * 100

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Exportar datos
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount}</div>
            <div className="mt-4">
              <Progress value={progressPercentage} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                ${stats.totalAmount} de ${stats.goalAmount} meta
              </p>
            </div>
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
            <CardTitle className="text-sm font-medium">Progreso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Hacia la meta de financiamiento</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sponsors */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Patrocinadores Recientes</CardTitle>
            <CardDescription>Últimos patrocinadores que han apoyado al equipo.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md animate-pulse">
                    <div className="w-1/3 h-5 bg-gray-200 rounded"></div>
                    <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
                    <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : stats.recentSponsors && stats.recentSponsors.length > 0 ? (
              <div className="space-y-2">
                {stats.recentSponsors.map((sponsor: any) => (
                  <div key={sponsor.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                    <div className="font-medium">{sponsor.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {sponsor.paymentDate ? formatDate(sponsor.paymentDate) : "N/A"}
                    </div>
                    <div className="font-medium text-green-600">${sponsor.amount}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No hay patrocinadores registrados aún.</div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Eventos programados para el equipo.</CardDescription>
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
                  <div key={event.id} className="space-y-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">Fecha: {formatDate(event.date)}</div>
                    <div className="text-sm text-muted-foreground">Lugar: {event.location}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No hay eventos próximos programados.</div>
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
          <Link href="/dashboard/mensajes">
            <Button className="w-full justify-start" variant="outline">
              <ArrowRight className="mr-2 h-4 w-4" />
              Ver Mensajes
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
