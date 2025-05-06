import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { formatDate } from "@/lib/utils"
import { MessageSquareIcon } from "lucide-react"
import Link from "next/link"

export default async function PortalMessagesPage() {
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
        <h1 className="text-2xl font-bold mb-4">Mensajes</h1>
        <p className="text-gray-600">
          No estás asignado a ningún equipo actualmente. Por favor contacta al administrador para más información.
        </p>
      </div>
    )
  }

  // Obtener todas las publicaciones del equipo
  const posts = await db.post.findMany({
    where: {
      OR: [{ teamId: member.team.id }, { isPublic: true }],
    },
    include: {
      author: true,
      team: true,
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mensajes y Anuncios</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {posts.length === 0 ? (
            <div className="px-6 py-4 text-gray-500">No hay publicaciones disponibles.</div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="px-6 py-6">
                <h2 className="text-xl font-medium">{post.title}</h2>
                <div className="flex items-center text-sm text-gray-500 mt-1 mb-3">
                  <span className="font-medium">{post.author.name}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(post.createdAt)}</span>
                  {post.team && post.team.id !== member.team?.id && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="text-cyan-600">{post.team.name}</span>
                    </>
                  )}
                  {post.isPublic && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="bg-cyan-100 text-cyan-800 text-xs px-2 py-0.5 rounded">Público</span>
                    </>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-line mb-4">{post.content}</p>
                <Link
                  href={`/portal/mensajes/${post.id}`}
                  className="inline-flex items-center text-sm text-cyan-600 hover:text-cyan-800"
                >
                  <MessageSquareIcon className="h-4 w-4 mr-1" />
                  {post._count.comments} comentarios - Ver y comentar
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
