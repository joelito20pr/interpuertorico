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
import { createEvent } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function NuevoEventoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requiresPayment, setRequiresPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: "",
    stripeLink: "",
  })

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

      const result = await createEvent({
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
          description: "Evento creado correctamente",
        })
        router.push("/dashboard/eventos")
      } else {
        setError(result.error || "Error al crear el evento. Por favor intente nuevamente.")
        console.error("Detalles del error:", result.details)
      }
    } catch (error) {
      console.error("Error creating event:", error)
      setError("Ocurrió un error al crear el evento. Por favor intente nuevamente.")
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
        <h1 className="text-2xl font-bold tracking-tight">Crear Nuevo Evento</h1>
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
          <CardDescription>Ingrese los detalles del nuevo evento.</CardDescription>
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
                {isSubmitting ? "Creando..." : "Crear Evento"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
