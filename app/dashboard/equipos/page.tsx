import { db } from "@/lib/db"
import { PlusIcon, UsersIcon } from "lucide-react"
import Link from "next/link"

export default async function TeamsPage() {
  const teams = await db.team.findMany({
    include: {
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Equipos</h1>
        <Link
          href="/dashboard/equipos/nuevo"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Equipo
        </Link>
      </div>

      {teams.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay equipos</h3>
          <p className="text-gray-500 mb-4">Crea tu primer equipo para organizar a los jugadores y padres.</p>
          <Link
            href="/dashboard/equipos/nuevo"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Crear Equipo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Link key={team.id} href={`/dashboard/equipos/${team.id}`} className="block">
              <div className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-cyan-500 to-pink-500">
                  <h3 className="text-lg font-medium text-white">{team.name}</h3>
                  <p className="text-cyan-50">{team.category}</p>
                </div>
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600">{team._count.members} miembros</span>
                    </div>
                    <span className="text-sm text-cyan-600">Ver detalles →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
