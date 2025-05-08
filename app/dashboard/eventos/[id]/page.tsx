"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Trash2, LinkIcon, Copy, ExternalLink, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { generateSlug, isValidUrl } from "@/lib/utils"

export default function EditarEventoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
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

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/${params.id}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success && result.data) {
          const event = result.data
          setRequiresPayment(event.requiresPayment)
          setIsPublic(!!event.shareableSlug)

          // Format date for datetime-local input
          const eventDate = new Date(event.date)
          const formattedDate = format(eventDate, "yyyy-MM-dd'T'HH:mm")

          setFormData({
            title: event.title,
            description: event.description || "",
            date: formattedDate,
            location: event.location,
            price: event.price || "",
            stripeLink: event.stripeLink || "",
            maxAttendees: event.maxAttendees ? String(event.maxAttendees) : "",
            shareableSlug: event.shareableSlug || "",
          })
        } else {
          toast({
            title: "Error",
            description: "No se pudo cargar la información del evento",
            variant: "destructive",
          })
          router.push("/dashboard/eventos")
        }
      } catch (error) {
        console.error("Error loading event:", error)
        toast({
          title: "Error",
          description: `Error al cargar el evento: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
        })
        router.push("/dashboard/eventos")
      } finally {
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [params.id, router, toast])

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

  const copyShareableLink = () => {
    const link = `${window.location.origin}/eventos/${formData.shareableSlug}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Enlace copiado",
      description: "El enlace ha sido copiado al portapapeles",
    })
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

      // Preparar los datos para enviar
      const eventDataToSend = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        location: formData.location,
        requiresPayment,
        price: requiresPayment ? formData.price : null,
        stripeLink: requiresPayment ? formData.stripeLink : null,
        shareableSlug,
        maxAttendees: formData.maxAttendees ? Number.parseInt(formData.maxAttendees, 10) : null,
      }

      console.log("Sending data:", eventDataToSend)

      // Use the API endpoint instead of server action
      const response = await fetch(`/api/events/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventDataToSend),
      })

      const responseText = await response.text()
      console.log("Response text:", responseText)

      let result
      try {
        result = JSON.parse(responseText)
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`)
      }

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Evento actualizado correctamente",
        })
        router.push("/dashboard/eventos")
      } else {
        throw new Error(result.error || "Error al actualizar el evento. Por favor intente nuevamente.")
      }
    } catch (error) {
      console.error("Error updating event:", error)
      setError(`Error al actualizar el evento: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("¿Está seguro que desea eliminar este evento? Esta acción no se puede deshacer.")) {
      try {
        const response = await fetch(`/api/events/${params.id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          toast({
            title: "Éxito",
            description: "Evento eliminado correctamente",
          })
          router.push("/dashboard/eventos")
        } else {
          throw new Error(result.error || "Error al eliminar el evento")
        }
      } catch (error) {
        console.error("Error deleting event:", error)
        setError(`Error al eliminar el evento: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Editar Evento</h1>
        </div>
        <div className="flex gap-2">
          {isPublic && formData.shareableSlug && (
            <Button variant="outline" onClick={() => router.push(`/dashboard/eventos/${params.id}/registros`)}>
              <Users className="h-4 w-4 mr-2" />
              Ver Registros
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isPublic && formData.shareableSlug && (
        <Alert>
          <LinkIcon className="h-4 w-4" />
          <AlertTitle>Enlace compartible</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {window.location.origin}/eventos/{formData.shareableSlug}
            </span>
            <Button variant="outline" size="sm" onClick={copyShareableLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información del Evento</CardTitle>
          <CardDescription>Actualice los detalles del evento.</CardDescription>
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
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
