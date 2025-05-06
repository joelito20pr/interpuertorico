"use client"

import type React from "react"

import { useState } from "react"
import { registerForEvent } from "@/lib/actions"

interface RegistrationFormProps {
  eventId: string
  requiresPayment: boolean
  stripeLink: string | null
}

export function RegistrationForm({ eventId, requiresPayment, stripeLink }: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    playerName: "",
    parentName: "",
    phone: "",
    email: "",
    previousClub: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // Validar campos requeridos
      if (!formData.playerName || !formData.parentName || !formData.phone || !formData.email) {
        throw new Error("Por favor completa todos los campos requeridos")
      }

      const result = await registerForEvent({
        eventId,
        playerName: formData.playerName,
        parentName: formData.parentName,
        phone: formData.phone,
        email: formData.email,
        previousClub: formData.previousClub,
      })

      setSuccess("¡Registro completado con éxito!")

      // Si requiere pago, redirigir a Stripe después de un breve retraso
      if (requiresPayment && stripeLink) {
        setTimeout(() => {
          window.location.href = stripeLink
        }, 1500)
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Ocurrió un error inesperado al procesar tu registro")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">{error}</div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-700">
            Nombre del jugador *
          </label>
          <input
            type="text"
            id="playerName"
            name="playerName"
            value={formData.playerName}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
          />
        </div>

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
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Número de teléfono *
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
        </div>

        <div>
          <label htmlFor="previousClub" className="block text-sm font-medium text-gray-700">
            Club anterior (opcional)
          </label>
          <textarea
            id="previousClub"
            name="previousClub"
            value={formData.previousClub}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            placeholder="Si has jugado en algún club anteriormente, indícalo aquí"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
        >
          {isSubmitting ? "Procesando..." : requiresPayment ? "Registrarme y proceder al pago" : "Completar registro"}
        </button>
      </form>
    </div>
  )
}
