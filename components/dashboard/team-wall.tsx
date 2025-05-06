"use client"

import type React from "react"

import { useState } from "react"
import { formatDate } from "@/lib/utils"
import { createPost, createComment } from "@/lib/actions"
import { useRouter } from "next/navigation"

interface Author {
  id: string
  name: string
  email?: string
}

interface Comment {
  id: string
  content: string
  createdAt: Date
  author: Author
}

interface Post {
  id: string
  title: string
  content: string
  createdAt: Date
  author: Author
  comments: Comment[]
}

interface TeamWallProps {
  teamId: string
  posts: Post[]
}

export function TeamWall({ teamId, posts }: TeamWallProps) {
  const router = useRouter()
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [commentContent, setCommentContent] = useState<Record<string, string>>({})
  const [expandedPost, setExpandedPost] = useState<string | null>(null)

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      if (!newPostTitle.trim() || !newPostContent.trim()) {
        throw new Error("El título y el contenido son obligatorios")
      }

      const result = await createPost({
        teamId,
        title: newPostTitle,
        content: newPostContent,
        isPublic,
      })

      if (result.success) {
        setNewPostTitle("")
        setNewPostContent("")
        setIsPublic(false)
        router.refresh()
      } else {
        throw new Error(result.error || "Error al crear la publicación")
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Ocurrió un error inesperado")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitComment = async (postId: string) => {
    const content = commentContent[postId]
    if (!content?.trim()) return

    try {
      const result = await createComment({
        postId,
        content,
      })

      if (result.success) {
        setCommentContent((prev) => ({ ...prev, [postId]: "" }))
        router.refresh()
      }
    } catch (error) {
      console.error("Error al crear comentario:", error)
    }
  }

  const toggleExpandPost = (postId: string) => {
    setExpandedPost(expandedPost === postId ? null : postId)
  }

  return (
    <div className="space-y-6">
      {/* Formulario para nueva publicación */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium">Publicar en el Muro del Equipo</h2>
        </div>
        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">{error}</div>
          )}

          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div>
              <label htmlFor="post-title" className="block text-sm font-medium text-gray-700">
                Título
              </label>
              <input
                type="text"
                id="post-title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                placeholder="Título de la publicación"
              />
            </div>

            <div>
              <label htmlFor="post-content" className="block text-sm font-medium text-gray-700">
                Contenido
              </label>
              <textarea
                id="post-content"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                placeholder="Escribe tu mensaje para el equipo..."
              />
            </div>

            <div className="flex items-center">
              <input
                id="is-public"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label htmlFor="is-public" className="ml-2 block text-sm text-gray-700">
                Publicación pública (visible para todos los equipos)
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                {isSubmitting ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lista de publicaciones */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-6 text-center">
            <p className="text-gray-500">No hay publicaciones en este equipo todavía.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium">{post.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span className="font-medium text-gray-700">{post.author.name}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(post.createdAt)}</span>
                  {post.isPublic && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="bg-cyan-100 text-cyan-800 text-xs px-2 py-0.5 rounded">Público</span>
                    </>
                  )}
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="whitespace-pre-line">{post.content}</p>

                {/* Comentarios */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Comentarios ({post.comments.length})</h4>

                  {post.comments.length > 0 && (
                    <div className="space-y-4 mb-4">
                      {(expandedPost === post.id || post.comments.length <= 3
                        ? post.comments
                        : post.comments.slice(0, 3)
                      ).map((comment) => (
                        <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium">{comment.author.name}</p>
                              <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                            </div>
                          </div>
                          <p className="mt-2 text-sm">{comment.content}</p>
                        </div>
                      ))}

                      {post.comments.length > 3 && (
                        <button
                          onClick={() => toggleExpandPost(post.id)}
                          className="text-sm text-cyan-600 hover:text-cyan-800"
                        >
                          {expandedPost === post.id
                            ? "Ver menos comentarios"
                            : `Ver ${post.comments.length - 3} comentarios más`}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Formulario de comentario */}
                  <div className="flex items-start space-x-2 mt-3">
                    <textarea
                      value={commentContent[post.id] || ""}
                      onChange={(e) => setCommentContent({ ...commentContent, [post.id]: e.target.value })}
                      placeholder="Escribe un comentario..."
                      className="flex-1 min-h-[60px] border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                    />
                    <button
                      onClick={() => handleSubmitComment(post.id)}
                      disabled={!commentContent[post.id]?.trim()}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                      Comentar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
