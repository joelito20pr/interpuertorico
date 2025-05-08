"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { generateSlug, isValidUrl } from "@/lib/utils"

export default function NuevoEventoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requiresPayment, setRequiresPayment] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: "",
    stripeLink: "",
    maxAttendees: "",
    shareableSlug: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const generateShareableSlug = () => {
    const slug = generateSlug(formData.title)
    setFormData((prev) => ({
      ...prev,
      shareableSlug: slug,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validación básica
      if (!formData.title || !formData.date || !formData.location) {
        setError("Por favor complete todos los campos requeridos")
        setIsSubmitting(false)
        return
      }

      // Si requiere pago, validar precio y enlace de Stripe
      if (requiresPayment && (!formData.price || !formData.stripeLink)) {
        setError("Si el evento requiere pago, debe especificar el precio y el enlace de pago")
        setIsSubmitting(false)
        return
      }

      // Si es público y no tiene slug, generar uno
      let shareableSlug = null
      if (isPublic) {
        shareableSlug = formData.shareableSlug || generateSlug(formData.title)
      }

      // Convertir maxAttendees a número si existe
      let maxAttendees = null
      if (formData.maxAttendees) {
        const parsedValue = Number.parseInt(formData.maxAttendees, 10)
        if (!isNaN(parsedValue)) {
          maxAttendees = parsedValue
        }
      }

      // Preparar los datos para enviar
      const eventDataToSend = {
        title: formData.title,
        description: formData.description || "",
        date: new Date(formData.date).toISOString(),
        location: formData.location,
        requiresPayment,
        price: requiresPayment ? formData.price : null,
        stripeLink: requiresPayment ? formData.stripeLink : null,
        shareableSlug,
        maxAttendees,
      }

      console.log("Sending event data:", eventDataToSend)

      // Use the API endpoint instead of server action
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventDataToSend),
      })

      console.log("Response status:", response.status)

      let result
      try {
        result = await response.json()
        console.log("Response data:", result)
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError)
        throw new Error("Error al procesar la respuesta del servidor")
      }

      if (!response.ok) {
        throw new Error(result?.error || `HTTP error! status: ${response.status}`)
      }

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Evento creado correctamente",
        })
        router.push("/dashboard/eventos")
      } else {
        throw new Error(result.error || "Error al crear el evento. Por favor intente nuevamente.")
      }
    } catch (error) {
      console.error("Error creating event:", error)
      setError(`Error al crear el evento: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo Evento</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información del Evento</CardTitle>
          <CardDescription>Complete los detalles del nuevo evento.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Título del evento *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ej: Torneo de Futsal 2025"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha y hora *</Label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="location">
                  Ubicación *{" "}
                  {isValidUrl(formData.location) && <span className="text-xs text-blue-600 ml-1">(URL detectada)</span>}
                </Label>
                <div className="flex">
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Ej: Centro de Convenciones de Puerto Rico o https://maps.google.com/..."
                    required
                    className={isValidUrl(formData.location) ? "pr-10" : ""}
                  />
                  {isValidUrl(formData.location) && (
                    <a
                      href={formData.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Puede ingresar una dirección física o un enlace a Google Maps, Waze, etc.
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descripción detallada del evento..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttendees">Número máximo de asistentes</Label>
                <Input
                  id="maxAttendees"
                  name="maxAttendees"
                  type="number"
                  value={formData.maxAttendees}
                  onChange={handleInputChange}
                  placeholder="Dejar en blanco si no hay límite"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 h-full pt-6">
                  <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label htmlFor="isPublic">Permitir registro público</Label>
                </div>
              </div>

              {isPublic && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="shareableSlug">
                    Enlace compartible (se generará automáticamente si se deja en blanco)
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="shareableSlug"
                      name="shareableSlug"
                      value={formData.shareableSlug}
                      onChange={handleInputChange}
                      placeholder="Ej: torneo-futsal-2025"
                    />
                    <Button type="button" variant="outline" onClick={generateShareableSlug}>
                      Generar
                    </Button>
                  </div>
                  {formData.shareableSlug && (
                    <p className="text-sm text-muted-foreground mt-1">
                      URL: {window.location.origin}/eventos/{formData.shareableSlug}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center space-x-2">
                  <Switch id="requiresPayment" checked={requiresPayment} onCheckedChange={setRequiresPayment} />
                  <Label htmlFor="requiresPayment">Requiere pago</Label>
                </div>
              </div>

              {requiresPayment && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio *</Label>
                    <Input
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Ej: $25.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stripeLink">Enlace de pago (Stripe) *</Label>
                    <Input
                      id="stripeLink"
                      name="stripeLink"
                      value={formData.stripeLink}
                      onChange={handleInputChange}
                      placeholder="https://buy.stripe.com/..."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear Evento"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
