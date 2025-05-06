"use client"

import type React from "react"

import { useState } from "react"
import { createMemberComment } from "@/lib/actions"
import { useRouter } from "next/navigation"

interface PortalCommentFormProps {
  postId: string
  memberId: string
}

export function PortalCommentForm({ postId, memberId }: PortalCommentFormProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      if (!content.trim()) {
        throw new Error("El comentario no puede estar vacío")
      }

      const result = await createMemberComment({
        postId,
        memberId,
        content,
      })

      if (result.success) {
        setContent("")
        router.refresh()
      } else {
        throw new Error(result.error || "Error al crear el comentario")
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

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">{error}</div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Añadir un comentario
          </label>
          <textarea
            id="comment"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            placeholder="Escribe tu comentario..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
          >
            {isSubmitting ? "Enviando..." : "Comentar"}
          </button>
        </div>
      </div>
    </form>
  )
}
