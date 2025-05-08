"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DollarSign, Users, Calendar, TrendingUp, ArrowRight, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSponsors: 0,
    totalAmount: 0,
    goalAmount: 5000,
    recentSponsors: [],
    upcomingEvents: [],
  })

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setStats({
        totalSponsors: 12,
        totalAmount: 2400,
        goalAmount: 5000,
        recentSponsors: [
          { id: 1, name: "Empresa ABC", amount: "$600", date: "2023-05-01" },
          { id: 2, name: "Juan Pérez", amount: "$150", date: "2023-04-28" },
          { id: 3, name: "Compañía XYZ", amount: "$300", date: "2023-04-25" },
        ],
        upcomingEvents: [
          { id: 1, title: "Entrenamiento especial", date: "2023-05-15", location: "Cancha Municipal" },
          { id: 2, title: "Partido amistoso", date: "2023-05-22", location: "Centro Deportivo" },
        ],
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const progressPercentage = (stats.totalAmount / stats.goalAmount) * 100

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
            <CardTitle className="text-sm font-medium">Patrocinadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSponsors}</div>
            <p className="text-xs text-muted-foreground">+3 este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">Próximo: 15 de mayo</p>
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
            ) : (
              <div className="space-y-2">
                {stats.recentSponsors.map((sponsor) => (
                  <div key={sponsor.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                    <div className="font-medium">{sponsor.name}</div>
                    <div className="text-sm text-muted-foreground">{sponsor.date}</div>
                    <div className="font-medium text-green-600">{sponsor.amount}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/patrocinadores" className="text-sm text-blue-600 hover:underline flex items-center">
              Ver todos los patrocinadores
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
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
            ) : (
              <div className="space-y-4">
                {stats.upcomingEvents.map((event) => (
                  <div key={event.id} className="space-y-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">Fecha: {event.date}</div>
                    <div className="text-sm text-muted-foreground">Lugar: {event.location}</div>
                  </div>
                ))}
              </div>
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
          <Button className="w-full justify-start" variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Añadir Patrocinador
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Crear Evento
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <DollarSign className="mr-2 h-4 w-4" />
            Registrar Pago
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <ArrowRight className="mr-2 h-4 w-4" />
            Ver Sitio Web
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
