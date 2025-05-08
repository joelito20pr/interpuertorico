"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Calendar, MapPin, DollarSign, Users, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatLocation } from "@/lib/utils"

export default function EventoPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [event, setEvent] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    guardianName: "",
    email: "",
    phone: "",
    numberOfAttendees: 1,
    paymentReference: "",
  })

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/slug/${params.slug}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          setEvent(result.data)
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
  }, [params.slug])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "EEEE d 'de' MMMM, yyyy 'a las' h:mm a", { locale: es })
    } catch (e) {
      return dateString
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfAttendees" ? Number.parseInt(value) || 1 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      console.log("Submitting form data:", {
        eventId: event.id,
        ...formData,
      })

      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          ...formData,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setFormData({
          name: "",
          guardianName: "",
          email: "",
          phone: "",
          numberOfAttendees: 1,
          paymentReference: "",
        })
      } else {
        console.error("Registration error:", result)
        setError(result.error || "Error al registrarse para el evento")
      }
    } catch (error) {
      console.error("Error submitting registration:", error)
      setError(`Error al registrarse: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "No se encontró el evento solicitado."}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/")}>Volver al inicio</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">{event.title}</CardTitle>
          <CardDescription className="text-base">
            <div className="flex items-center mt-2">
              <Calendar className="h-5 w-5 mr-2 text-gray-500" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center mt-2">
              <MapPin className="h-5 w-5 mr-2 text-gray-500" />
              <span>{formatLocation(event.location)}</span>
            </div>
            {event.requiresPayment && (
              <div className="flex items-center mt-2">
                <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
                <span>Precio: ${event.price}</span>
              </div>
            )}
            {event.maxAttendees && (
              <div className="flex items-center mt-2">
                <Users className="h-5 w-5 mr-2 text-gray-500" />
                <span>Capacidad máxima: {event.maxAttendees} participantes</span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{event.description}</p>
          </div>
        </CardContent>
      </Card>

      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-green-600">¡Registro completado!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Tu registro para el evento ha sido recibido correctamente.</p>
            {event.requiresPayment && (
              <div className="mb-4">
                <Alert>
                  <AlertTitle>Información de pago</AlertTitle>
                  <AlertDescription>
                    Para completar tu registro, realiza el pago según las instrucciones proporcionadas.
                    {event.stripeLink && (
                      <div className="mt-2">
                        <Button asChild>
                          <a href={event.stripeLink} target="_blank" rel="noopener noreferrer">
                            Pagar ahora <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            )}
            <Button onClick={() => setSuccess(false)}>Registrar otra persona</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Registro para el evento</CardTitle>
            <CardDescription>Completa el formulario para registrarte en este evento.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo jugador *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardianName">Nombre completo Encargado *</Label>
                <Input
                  id="guardianName"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfAttendees">Cantidad de jugadores</Label>
                <Input
                  id="numberOfAttendees"
                  name="numberOfAttendees"
                  type="number"
                  min="1"
                  value={formData.numberOfAttendees}
                  onChange={handleChange}
                />
              </div>

              {event.requiresPayment && (
                <div className="space-y-2">
                  <Label htmlFor="paymentReference">Referencia de pago</Label>
                  <Input
                    id="paymentReference"
                    name="paymentReference"
                    value={formData.paymentReference}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-gray-500">Si ya realizaste el pago, ingresa la referencia aquí.</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Registrarse"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
