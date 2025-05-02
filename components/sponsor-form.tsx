"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SponsorTier {
  id: string
  name: string
  price: string
  description: string
  features: string[]
  highlighted: boolean
  limited: string
  buttonText: string
  stripeLink: string
}

interface SponsorFormProps {
  tiers: SponsorTier[]
}

export default function SponsorForm({ tiers }: SponsorFormProps) {
  const [selectedTier, setSelectedTier] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [companyName, setCompanyName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [step, setStep] = useState<number>(1)

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId)
    // Si es donación libre, mostrar campo de monto
    if (tierId === "tier4") {
      setStep(1.5)
    } else {
      setStep(2)
    }
  }

  // Simplificar la función handleSubmit para evitar errores
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const selectedTierObj = tiers.find((tier) => tier.id === selectedTier)
    const tierName = selectedTierObj ? selectedTierObj.name : "Donación"
    const tierAmount = selectedTier === "tier4" ? amount : selectedTierObj?.price

    // Crear un objeto FormData para enviar a Formspree
    const formData = new FormData()
    formData.append("Nivel de Patrocinio", tierName)
    formData.append("Monto", tierAmount || "")
    formData.append("Nombre", name)
    formData.append("Empresa", companyName)
    formData.append("Email", email)
    formData.append("Teléfono", phone)
    formData.append("Mensaje", message)

    try {
      // Enviar datos a Formspree
      const response = await fetch("https://formspree.io/f/mblogjoz", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        toast({
          title: "¡Formulario enviado!",
          description: `Gracias ${name || "por tu patrocinio"}. Te redirigiremos al pago.`,
        })

        // Redirigir a Stripe después de un breve retraso
        setTimeout(() => {
          // Redirigir al enlace de Stripe correspondiente
          window.location.href = selectedTierObj?.stripeLink || ""
        }, 1500)
      } else {
        throw new Error("Error al enviar el formulario")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al enviar el formulario. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  // Función para ir directamente a Stripe sin enviar el formulario
  const goDirectlyToStripe = () => {
    const selectedTierObj = tiers.find((tier) => tier.id === selectedTier)
    if (selectedTierObj) {
      window.location.href = selectedTierObj.stripeLink
    }
  }

  const goBack = () => {
    if (step === 1.5) {
      setStep(1)
    } else if (step === 2) {
      if (selectedTier === "tier4") {
        setStep(1.5)
      } else {
        setStep(1)
      }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Formulario de Patrocinio</CardTitle>
        <CardDescription>Completa la información para procesar tu patrocinio</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tier-select">Selecciona tu nivel de patrocinio</Label>
              <RadioGroup value={selectedTier} onValueChange={handleTierSelect} className="mt-2 space-y-3">
                {tiers.map((tier) => (
                  <div key={tier.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={tier.id} id={tier.id} />
                    <Label htmlFor={tier.id} className="flex flex-col cursor-pointer">
                      <span className="font-medium">
                        {tier.name} - {tier.price}
                      </span>
                      <span className="text-sm text-gray-500">{tier.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        {step === 1.5 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="donation-amount">Monto de tu donación ($)</Label>
              <Input
                id="donation-amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ingresa el monto de tu donación"
                required
                className="mt-1"
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={goBack}>
                Atrás
              </Button>
              <Button onClick={() => setStep(2)} disabled={!amount}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {(selectedTier === "tier1" || selectedTier === "tier2") && (
              <Alert className="bg-blue-50 border-blue-200 mb-4">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Por favor, envía tu logo en alta calidad a <strong>interprfc@gmail.com</strong> para incluirlo en el
                  uniforme.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <Label htmlFor="company">Nombre de la empresa/organización</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nombre de tu empresa u organización"
              />
            </div>

            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Tu número de teléfono"
              />
            </div>

            <div>
              <Label htmlFor="message">Mensaje (opcional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="¿Algo que quieras compartir con el equipo?"
                className="resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <Button type="button" variant="outline" onClick={goBack}>
                Atrás
              </Button>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goDirectlyToStripe}
                  className="border-cyan-500 text-cyan-700 hover:bg-cyan-50"
                >
                  Ir directamente al pago
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Procesando..." : "Completar Patrocinio"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold text-green-600 mb-4">¡Gracias por tu patrocinio!</h3>
            <p className="mb-6">Hemos recibido tu información y serás redirigido al proceso de pago.</p>
            <Button
              onClick={() => {
                // Redirigir al enlace de Stripe correspondiente
                const selectedTierObj = tiers.find((tier) => tier.id === selectedTier)
                window.location.href = selectedTierObj?.stripeLink || ""
              }}
            >
              Proceder al Pago
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
