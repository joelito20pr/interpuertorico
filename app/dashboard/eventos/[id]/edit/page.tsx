"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function EditarEventoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [event, setEvent] = useState<any>(null)

  // Estados para los campos del formulario
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [location, setLocation] = useState("")
  const [requiresPayment, setRequiresPayment] = useState(false)
  const [price, setPrice] = useState("")
  const [stripeLink, setStripeLink] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [shareableSlug, setShareableSlug] = useState("")
  const [maxAttendees, setMaxAttendees] = useState("")

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/${params.id}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          setEvent(result.data)

          // Inicializar los campos del formulario con los datos del evento
          setTitle(result.data.title || "")
          setDescription(result.data.description || "")

          // Formatear la fecha para el input type="datetime-local"
          const eventDate = new Date(result.data.date)
          const formattedDate = eventDate.toISOString().slice(0, 16) // formato YYYY-MM-DDThh:mm
          setDate(formattedDate)

          setLocation(result.data.location || "")
          setRequiresPayment(result.data.requiresPayment || false)
          setPrice(result.data.price || "")
          setStripeLink(result.data.stripeLink || "")
          setIsPublic(result.data.isPublic || false)
          setShareableSlug(result.data.shareableSlug || "")
          setMaxAttendees(result.data.maxAttendees?.toString() || "")
        } else {
          setError(result.error || "Error al cargar el evento")
        }
      } catch (error) {
        console.error("Error loading event:", error)
        setError(`Error al cargar el evento: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validar campos requeridos
      if (!title || !date || !location) {
        throw new Error("Por favor completa todos los campos requeridos")
      }

      // Construir el objeto de datos del evento
      const eventData = {
        title,
        description,
        date: new Date(date),
        location,
        requiresPayment,
        price: price || null,
        stripeLink: stripeLink || null,
        isPublic,
        shareableSlug: shareableSlug || null,
        maxAttendees: maxAttendees ? Number(maxAttendees) : null,
      }

      // Enviar la solicitud PUT a la API
      const response = await fetch(`/api/events/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar el evento")
      }

      // Mostrar mensaje de éxito
      toast({
        title: "Evento actualizado",
        description: "El evento ha sido actualizado correctamente.",
      })

      // Redirigir a la página de detalles del evento
      router.push(`/dashboard/eventos/${params.id}`)
    } catch (error) {
      console.error("Error updating event:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generar un slug a partir del título
  const generateSlug = () => {
    if (!title) return

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
      .substring(0, 50)

    // Añadir un identificador único al final
    const uniqueId = Math.random().toString(36).substring(2, 8)
    const uniqueSlug = `${slug}-${uniqueId}`

    setShareableSlug(uniqueSlug)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Evento</CardTitle>
            <CardDescription>Actualiza los detalles del evento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del evento *</Label>
                  <Input
                    id="title"
                    placeholder="Título del evento"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Descripción del evento"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Fecha y hora *</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación *</Label>
                  <Input
                    id="location"
                    placeholder="Ubicación del evento"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-4">Opciones de pago</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requires-payment" className="flex items-center gap-2">
                      Requiere pago
                    </Label>
                    <Switch id="requires-payment" checked={requiresPayment} onCheckedChange={setRequiresPayment} />
                  </div>

                  {requiresPayment && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="price">Precio</Label>
                        <Input
                          id="price"
                          placeholder="Precio del evento"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stripe-link">Enlace de pago (Stripe)</Label>
                        <Input
                          id="stripe-link"
                          placeholder="Enlace de pago de Stripe"
                          value={stripeLink}
                          onChange={(e) => setStripeLink(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-4">Opciones de registro</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is-public" className="flex items-center gap-2">
                      Evento público
                      <span className="text-xs text-muted-foreground">(Permite que cualquier persona se registre)</span>
                    </Label>
                    <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>

                  {isPublic && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="shareable-slug">Enlace compartible</Label>
                          <Button type="button" variant="outline" size="sm" onClick={generateSlug} className="h-8">
                            Generar
                          </Button>
                        </div>
                        <Input
                          id="shareable-slug"
                          placeholder="Identificador único para el enlace público"
                          value={shareableSlug}
                          onChange={(e) => setShareableSlug(e.target.value)}
                        />
                        {shareableSlug && (
                          <p className="text-xs text-muted-foreground mt-1">
                            URL: {window.location.origin}/eventos/{shareableSlug}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-attendees">Número máximo de participantes</Label>
                        <Input
                          id="max-attendees"
                          type="number"
                          placeholder="Dejar en blanco para ilimitado"
                          value={maxAttendees}
                          onChange={(e) => setMaxAttendees(e.target.value)}
                          min="1"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
