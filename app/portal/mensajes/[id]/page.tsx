import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"
import { PortalCommentForm } from "@/components/portal/portal-comment-form"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

interface PostPageProps {
  params: {
    id: string
  }
}

export default async function PortalPostPage({ params }: PostPageProps) {
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

  if (!member) {
    return null
  }

  const post = await db.post.findUnique({
    where: {
      id: params.id,
      OR: [{ teamId: member.team?.id }, { isPublic: true }],
    },
    include: {
      author: true,
      team: true,
      comments: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Link href="/portal/mensajes" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Volver a mensajes
      </Link>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-medium">{post.title}</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1 mb-4">
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
          <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <h2 className="text-lg font-medium mb-4">Comentarios ({post.comments.length})</h2>

          {post.comments.length > 0 ? (
            <div className="space-y-4 mb-6">
              {post.comments.map((comment) => (
                <div key={comment.id} className="bg-white p-4 rounded-md shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{comment.author.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                  <p className="mt-2">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-6">No hay comentarios todavía. Sé el primero en comentar.</p>
          )}

          <PortalCommentForm postId={post.id} memberId={member.id} />
        </div>
      </div>
    </div>
  )
}
