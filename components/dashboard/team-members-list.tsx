import { db } from "@/lib/db"
import Link from "next/link"
import { PlusIcon } from "lucide-react"

interface TeamMembersListProps {
  teamId: string
}

export async function TeamMembersList({ teamId }: TeamMembersListProps) {
  const members = await db.member.findMany({
    where: {
      teamId: teamId,
    },
    orderBy: {
      name: "asc",
    },
  })

  const players = members.filter((member) => member.isPlayer)
  const parents = members.filter((member) => member.isParent)

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium">Miembros del Equipo</h2>
        <Link
          href={`/dashboard/equipos/${teamId}/miembros/nuevo`}
          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-cyan-700 bg-cyan-100 hover:bg-cyan-200"
        >
          <PlusIcon className="h-3 w-3 mr-1" />
          Añadir
        </Link>
      </div>
      <div className="px-6 py-5">
        {members.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay miembros en este equipo.</p>
        ) : (
          <div className="space-y-6">
            {/* Jugadores */}
            <div>
              <h3 className="font-medium mb-3 text-sm text-gray-500">JUGADORES</h3>
              <ul className="space-y-3">
                {players.map((player) => (
                  <li key={player.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-xs text-gray-500">{player.email}</p>
                    </div>
                    <Link
                      href={`/dashboard/miembros/${player.id}`}
                      className="text-xs text-cyan-600 hover:text-cyan-800"
                    >
                      Ver
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Padres */}
            {parents.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 text-sm text-gray-500">PADRES/ENCARGADOS</h3>
                <ul className="space-y-3">
                  {parents.map((parent) => (
                    <li key={parent.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{parent.name}</p>
                        <p className="text-xs text-gray-500">{parent.email}</p>
                      </div>
                      <Link
                        href={`/dashboard/miembros/${parent.id}`}
                        className="text-xs text-cyan-600 hover:text-cyan-800"
                      >
                        Ver
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
