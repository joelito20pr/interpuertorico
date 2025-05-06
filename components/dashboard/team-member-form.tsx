"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addTeamMember } from "@/lib/actions"

interface TeamMemberFormProps {
  teamId: string
  member?: {
    id: string
    name: string
    parentName: string
    email: string
    phone: string
    isPlayer: boolean
    isParent: boolean
    relatedMemberId: string | null
  }
}

export function TeamMemberForm({ teamId, member }: TeamMemberFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: member?.name || "",
    parentName: member?.parentName || "",
    email: member?.email || "",
    phone: member?.phone || "",
    isPlayer: member?.isPlayer ?? true,
    isParent: member?.isParent ?? false,
    relatedMemberId: member?.relatedMemberId || "",
    createAccount: false,
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // Validar campos requeridos
      if (!formData.name || !formData.email || !formData.phone) {
        throw new Error("Por favor completa todos los campos requeridos")
      }

      // Si es jugador, el nombre del padre es obligatorio
      if (formData.isPlayer && !formData.parentName) {
        throw new Error("El nombre del padre/encargado es obligatorio para jugadores")
      }

      // Si se va a crear una cuenta, la contraseña es obligatoria
      if (formData.createAccount && !formData.password) {
        throw new Error("La contraseña es obligatoria para crear una cuenta")
      }

      const memberData = {
        teamId,
        name: formData.name,
        parentName: formData.parentName,
        email: formData.email,
        phone: formData.phone,
        isPlayer: formData.isPlayer,
        isParent: formData.isParent,
        relatedMemberId: formData.relatedMemberId || null,
        createAccount: formData.createAccount,
        password: formData.password,
      }

      const result = await addTeamMember(memberData)

      if (result.success) {
        setSuccess("Miembro añadido con éxito")
        // Redirigir después de un breve retraso
        setTimeout(() => {
          router.push(`/dashboard/equipos/${teamId}`)
          router.refresh()
        }, 1500)
      } else {
        throw new Error(result.error || "Error al añadir miembro")
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
    <div className="bg-white shadow-sm rounded-lg p-6">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">{error}</div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                id="isPlayer"
                name="isPlayer"
                type="checkbox"
                checked={formData.isPlayer}
                onChange={handleChange}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label htmlFor="isPlayer" className="ml-2 block text-sm text-gray-700">
                Jugador
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="isParent"
                name="isParent"
                type="checkbox"
                checked={formData.isParent}
                onChange={handleChange}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label htmlFor="isParent" className="ml-2 block text-sm text-gray-700">
                Padre/Encargado
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            />
          </div>

          {formData.isPlayer && (
            <div>
              <label htmlFor="parentName" className="block text-sm font-medium text-gray-700">
                Nombre del padre/encargado *
              </label>
              <input
                type="text"
                id="parentName"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                required={formData.isPlayer}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Teléfono *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            />
          </div>

          <div className="flex items-center">
            <input
              id="createAccount"
              name="createAccount"
              type="checkbox"
              checked={formData.createAccount}
              onChange={handleChange}
              className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
            />
            <label htmlFor="createAccount" className="ml-2 block text-sm text-gray-700">
              Crear cuenta para acceso al portal
            </label>
          </div>

          {formData.createAccount && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={formData.createAccount}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Esta contraseña permitirá al miembro acceder al portal de equipos.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/equipos/${teamId}`)}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            {isSubmitting ? "Guardando..." : "Añadir Miembro"}
          </button>
        </div>
      </form>
    </div>
  )
}
