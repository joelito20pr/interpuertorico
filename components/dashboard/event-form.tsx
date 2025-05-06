"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEvent, updateEvent } from "@/lib/actions"

interface EventFormProps {
  event?: {
    id: string
    title: string
    description: string
    date: Date
    location: string
    requiresPayment: boolean
    price: string | null
    stripeLink: string | null
  }
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Convertir la fecha a formato YYYY-MM-DD para el input date
  const eventDate = event?.date ? new Date(event.date) : null
  const formattedDate = eventDate ? eventDate.toISOString().split("T")[0] : ""
  const formattedTime = eventDate ? eventDate.toTimeString().split(" ")[0].substring(0, 5) : ""

  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    date: formattedDate,
    time: formattedTime,
    location: event?.location || "",
    requiresPayment: event?.requiresPayment || false,
    price: event?.price || "",
    stripeLink: event?.stripeLink || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // Validar campos requeridos
      if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location) {
        throw new Error("Por favor completa todos los campos requeridos")
      }

      // Validar campos de pago si se requiere
      if (formData.requiresPayment && (!formData.price || !formData.stripeLink)) {
        throw new Error("Si el evento requiere pago, debes especificar el precio y el enlace de Stripe")
      }

      // Combinar fecha y hora
      const dateTime = new Date(`${formData.date}T${formData.time}:00`)

      const eventData = {
        title: formData.title,
        description: formData.description,
        date: dateTime,
        location: formData.location,
        requiresPayment: formData.requiresPayment,
        price: formData.requiresPayment ? formData.price : null,
        stripeLink: formData.requiresPayment ? formData.stripeLink : null,
      }

      let result
      if (event) {
        // Actualizar evento existente
        result = await updateEvent(event.id, eventData)
      } else {
        // Crear nuevo evento
        result = await createEvent(eventData)
      }

      if (result.success) {
        setSuccess(event ? "Evento actualizado con éxito" : "Evento creado con éxito")
        // Redirigir después de un breve retraso
        setTimeout(() => {
          router.push("/dashboard/eventos")
          router.refresh()
        }, 1500)
      } else {
        throw new Error(result.error || "Error al guardar el evento")
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Nombre del Evento *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Fecha *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Hora *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Ubicación *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              />
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="requiresPayment"
                  name="requiresPayment"
                  type="checkbox"
                  checked={formData.requiresPayment}
                  onChange={handleCheckboxChange}
                  className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="requiresPayment" className="font-medium text-gray-700">
                  Requiere pago
                </label>
                <p className="text-gray-500">Activa esta opción si el evento tiene un costo de inscripción.</p>
              </div>
            </div>

            {formData.requiresPayment && (
              <>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Precio *
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="$25.00"
                    required={formData.requiresPayment}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="stripeLink" className="block text-sm font-medium text-gray-700">
                    Enlace de Stripe *
                  </label>
                  <input
                    type="text"
                    id="stripeLink"
                    name="stripeLink"
                    value={formData.stripeLink}
                    onChange={handleChange}
                    placeholder="https://buy.stripe.com/..."
                    required={formData.requiresPayment}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">Enlace de pago de Stripe para este evento.</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/eventos")}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            {isSubmitting ? "Guardando..." : event ? "Actualizar Evento" : "Crear Evento"}
          </button>
        </div>
      </form>
    </div>
  )
}
