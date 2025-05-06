import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { formatDate } from "@/lib/utils"
import { CalendarIcon, MessageSquareIcon } from "lucide-react"
import Link from "next/link"

export default async function PortalHomePage() {
  const memberId = cookies().get("member_id")?.value

  if (!memberId) {
    return null
  }

  const member = await db.member.findUnique({
    where: {
      id: memberId,
    },
    include: {
      team: true,
    },
  })

  if (!member || !member.team) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Bienvenido al Portal de Equipos</h1>
        <p className="text-gray-600">
          No estás asignado a ningún equipo actualmente. Por favor contacta al administrador para más información.
        </p>
      </div>
    )
  }

  // Obtener publicaciones del equipo
  const posts = await db.post.findMany({
    where: {
      OR: [{ teamId: member.team.id }, { isPublic: true }],
    },
    include: {
      author: true,
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

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
    take: 3,
  })

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Bienvenido, {member.name}</h1>
        <p className="text-gray-600">
          Equipo: <span className="font-medium">{member.team.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Últimas publicaciones */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Últimas Publicaciones</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {posts.length === 0 ? (
                <div className="px-6 py-4 text-gray-500">No hay publicaciones recientes.</div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="px-6 py-4">
                    <h3 className="font-medium text-lg">{post.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1 mb-2">
                      <span>{post.author.name}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(post.createdAt)}</span>
                      {post.isPublic && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="bg-cyan-100 text-cyan-800 text-xs px-2 py-0.5 rounded">Público</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-600 line-clamp-2">{post.content}</p>
                    <div className="mt-2 flex items-center text-sm">
                      <MessageSquareIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-500">{post._count.comments} comentarios</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50 text-right">
              <Link href="/portal/mensajes" className="text-sm text-cyan-600 hover:text-cyan-800">
                Ver todas las publicaciones →
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Próximos eventos */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Próximos Eventos</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {upcomingEvents.length === 0 ? (
                <div className="px-6 py-4 text-gray-500">No hay eventos próximos.</div>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="bg-cyan-100 rounded-md p-2 text-cyan-600 mr-3">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(event.date)}</p>
                        <p className="text-sm text-gray-500">{event.location}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50 text-right">
              <Link href="/portal/eventos" className="text-sm text-cyan-600 hover:text-cyan-800">
                Ver todos los eventos →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
