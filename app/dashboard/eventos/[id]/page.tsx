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
import { getEventById, updateEvent, deleteEvent } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Trash2 } from "lucide-react"
import { format } from "date-fns"

export default function EditarEventoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requiresPayment, setRequiresPayment] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: "",
    stripeLink: "",
  })

  useEffect(() => {
    async function loadEvent() {
      try {
        const result = await getEventById(params.id)

        if (result.success && result.data) {
          const event = result.data
          setRequiresPayment(event.requiresPayment)

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
          description: "Ocurrió un error al cargar el evento",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validación básica
      if (!formData.title || !formData.date || !formData.location) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Si requiere pago, validar precio y enlace de Stripe
      if (requiresPayment && (!formData.price || !formData.stripeLink)) {
        toast({
          title: "Error",
          description: "Si el evento requiere pago, debe especificar el precio y el enlace de pago",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const result = await updateEvent(params.id, {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date),
        location: formData.location,
        requiresPayment,
        price: requiresPayment ? formData.price : null,
        stripeLink: requiresPayment ? formData.stripeLink : null,
      })

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Evento actualizado correctamente",
        })
        router.push("/dashboard/eventos")
      } else {
        throw new Error(result.error || "Error al actualizar el evento")
      }
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el evento. Por favor intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("¿Está seguro que desea eliminar este evento? Esta acción no se puede deshacer.")) {
      try {
        const result = await deleteEvent(params.id)

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
        toast({
          title: "Error",
          description: "Ocurrió un error al eliminar el evento",
          variant: "destructive",
        })
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
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </Button>
      </div>

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
                <Label htmlFor="location">Ubicación *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ej: Centro de Convenciones de Puerto Rico"
                  required
                />
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
