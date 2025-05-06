import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { PencilIcon, PlusIcon, UsersIcon } from "lucide-react"
import Link from "next/link"
import { TeamMembersList } from "@/components/dashboard/team-members-list"
import { TeamWall } from "@/components/dashboard/team-wall"

interface TeamPageProps {
  params: {
    id: string
  }
}

export default async function TeamPage({ params }: TeamPageProps) {
  const team = await db.team.findUnique({
    where: {
      id: params.id,
    },
    include: {
      members: {
        where: {
          isPlayer: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
  })

  if (!team) {
    notFound()
  }

  // Obtener publicaciones del equipo
  const posts = await db.post.findMany({
    where: {
      teamId: team.id,
    },
    include: {
      author: true,
      comments: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-gray-500">{team.category}</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/equipos/${team.id}/editar`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Editar
          </Link>
          <Link
            href={`/dashboard/equipos/${team.id}/miembros/nuevo`}
            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Añadir Miembro
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del equipo */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium">Información del Equipo</h2>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center mb-4">
                <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600">{team.members.length} jugadores</span>
              </div>
              {team.description && (
                <div>
                  <h3 className="font-medium mb-2">Descripción</h3>
                  <p className="text-gray-700 whitespace-pre-line">{team.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Lista de miembros */}
          <TeamMembersList teamId={team.id} />
        </div>

        {/* Muro del equipo */}
        <div className="lg:col-span-2">
          <TeamWall teamId={team.id} posts={posts} />
        </div>
      </div>
    </div>
  )
}
