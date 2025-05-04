/* SponsorForm.tsx
   Inter Puerto Rico – formulario de patrocinio
   Versión actualizada para enviar a Formspark (JSON) y redirigir a Stripe
*/
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

const FORMSPARK_ENDPOINT = "https://submit-form.com/Ybp7V89H6"

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

  /* ---------- helpers ---------- */

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId)
    // “Donación libre” (tier4) muestra el input de monto
    setStep(tierId === "tier4" ? 1.5 : 2)
  }

  const goBack = () => {
    if (step === 1.5) setStep(1)
    else if (step === 2) setStep(selectedTier === "tier4" ? 1.5 : 1)
  }

  const goDirectlyToStripe = () => {
    const tier = tiers.find((t) => t.id === selectedTier)
    if (tier) window.location.href = tier.stripeLink
  }

  /* ---------- submit ---------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const tierObj = tiers.find((t) => t.id === selectedTier)
    const tierName = tierObj ? tierObj.name : "Donación"
    const tierAmount = selectedTier === "tier4" ? amount : tierObj?.price

    try {
      const res = await fetch(FORMSPARK_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          // Formspark reconoce “email” y “message”
          email,
          message,
          tier: tierName,
          amount: tierAmount,
          name,
          companyName,
          phone,
        }),
      })

      if (!res.ok) throw new Error("Formspark error")

      toast({
        title: "¡Formulario enviado!",
        description: `Gracias ${name || "por tu patrocinio"}. Te redirigiremos al pago.`,
      })

      setStep(3)

      setTimeout(() => {
        window.location.href = tierObj?.stripeLink || "/"
      }, 1500)
    } catch {
      toast({
        title: "Error",
        description:
          "Hubo un problema al enviar el formulario. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  /* ---------- UI ---------- */

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Formulario de Patrocinio</CardTitle>
        <CardDescription>
          Completa la información para procesar tu patrocinio
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Paso 1 – elegir tier */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tier-select">
                Selecciona tu nivel de patrocinio
              </Label>
              <RadioGroup
                value={selectedTier}
                onValueChange={handleTierSelect}
                className="mt-2 space-y-3"
              >
                {tiers.map((tier) => (
                  <div key={tier.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={tier.id} id={tier.id} />
                    <Label htmlFor={tier.id} className="flex flex-col cursor-pointer">
                      <span className="font-medium">
                        {tier.name} - {tier.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        {tier.description}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Paso 1.5 – monto libre */}
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

        {/* Paso 2 – datos del patrocinador */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {(selectedTier === "tier1" || selectedTier === "tier2") && (
              <Alert className="bg-blue-50 border-blue-200 mb-4">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Por favor, envía tu logo en alta calidad a{" "}
                  <strong>interprfc@gmail.com</strong> para incluirlo en el
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
                required
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
                required
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

        {/* Paso 3 – agradecimiento */}
        {step === 3 && (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold text-green-600 mb-4">
              ¡Gracias por tu patrocinio!
            </h3>
            <p className="mb-6">
              Hemos recibido tu información y serás redirigido al proceso de
              pago.
            </p>
            <Button onClick={goDirectlyToStripe}>Proceder al Pago</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
