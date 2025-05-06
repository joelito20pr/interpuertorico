import { db } from "@/lib/db"
import { CalendarIcon, UsersIcon, ClipboardListIcon } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { createAdminUser } from "@/lib/actions"

export default async function DashboardPage() {
  // Crear usuario administrador si no existe
  await createAdminUser()

  // Obtener estadísticas
  const eventsCount = await db.event.count()
  const registrationsCount = await db.registration.count()
  const membersCount = await db.member.count()

  // Obtener próximos eventos
  const upcomingEvents = await db.event.findMany({
    where: {
      date: {
        gte: new Date(),
      },
    },
    orderBy: {
      date: "asc",
    },
    take: 5,
  })

  // Obtener registros recientes
  const recentRegistrations = await db.registration.findMany({
    include: {
      event: true,
      member: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">Total de Eventos</h2>
            <CalendarIcon className="h-5 w-5 text-cyan-500" />
          </div>
          <p className="mt-2 text-3xl font-bold">{eventsCount}</p>
          <p className="mt-1 text-sm text-gray-500">Eventos creados</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">Registros</h2>
            <ClipboardListIcon className="h-5 w-5 text-pink-500" />
          </div>
          <p className="mt-2 text-3xl font-bold">{registrationsCount}</p>
          <p className="mt-1 text-sm text-gray-500">Inscripciones a eventos</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">Miembros</h2>
            <UsersIcon className="h-5 w-5 text-cyan-500" />
          </div>
          <p className="mt-2 text-3xl font-bold">{membersCount}</p>
          <p className="mt-1 text-sm text-gray-500">Jugadores registrados</p>
        </div>
      </div>

      {/* Próximos eventos y registros recientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Próximos eventos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Próximos Eventos</h2>
            <Link href="/dashboard/eventos" className="text-sm text-cyan-600 hover:text-cyan-800">
              Ver todos
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay eventos próximos programados.</p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-4">
                  <div className="bg-cyan-100 rounded-md p-2 text-cyan-600">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <Link href={`/dashboard/eventos/${event.id}`} className="font-medium hover:text-cyan-600">
                      {event.title}
                    </Link>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(event.date)} • {event.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Registros recientes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Registros Recientes</h2>
            <Link href="/dashboard/registros" className="text-sm text-cyan-600 hover:text-cyan-800">
              Ver todos
            </Link>
          </div>

          {recentRegistrations.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay registros recientes.</p>
          ) : (
            <div className="space-y-4">
              {recentRegistrations.map((registration) => (
                <div key={registration.id} className="flex items-start space-x-4">
                  <div className="bg-pink-100 rounded-md p-2 text-pink-600">
                    <UsersIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{registration.member.name}</p>
                    <p className="text-sm text-gray-500">
                      Registrado para{" "}
                      <Link
                        href={`/dashboard/eventos/${registration.event.id}`}
                        className="text-cyan-600 hover:underline"
                      >
                        {registration.event.title}
                      </Link>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(registration.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
