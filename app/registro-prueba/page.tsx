"use client"

import type React from "react"

import { useState } from "react"

export default function RegistroPrueba() {
  const [formData, setFormData] = useState({
    eventId: "",
    name: "",
    email: "",
    phone: "",
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Intentar con el nuevo endpoint
      const response = await fetch("/api/events/register-new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(`Error: ${data.message || response.statusText}`)
        setResult(data) // Mostrar también los detalles del error
      }
    } catch (err) {
      setError(`Error de red: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Formulario de Registro de Prueba</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="eventId" className="block mb-1">
            ID del Evento:
          </label>
          <input
            type="text"
            id="eventId"
            name="eventId"
            value={formData.eventId}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="name" className="block mb-1">
            Nombre:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-1">
            Correo Electrónico:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block mb-1">
            Teléfono:
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Enviando..." : "Registrarse"}
        </button>
      </form>

      {error && <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">{error}</div>}

      {result && (
        <div className="mt-4 p-3 bg-gray-100 border rounded">
          <h2 className="font-bold mb-2">Resultado:</h2>
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h2 className="font-bold mb-2">Información de Depuración:</h2>
        <p className="mb-2">Si tienes problemas con el registro, prueba estos enlaces:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <a href="/api/debug/route-test" target="_blank" className="text-blue-500 hover:underline" rel="noreferrer">
              Probar rutas API
            </a>
          </li>
          <li>
            <a
              href="/api/debug/database-repair"
              target="_blank"
              className="text-blue-500 hover:underline"
              rel="noreferrer"
            >
              Reparar base de datos
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
