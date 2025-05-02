"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

interface SponsorModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTierId: string | null
  tiers: SponsorTier[]
}

export default function SponsorModal({ isOpen, onClose, selectedTierId, tiers }: SponsorModalProps) {
  const [name, setName] = useState<string>("")
  const [companyName, setCompanyName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const selectedTier = tiers.find((tier) => tier.id === selectedTierId) || null
  const isDonationTier = selectedTierId === "tier4"

  const resetForm = () => {
    setName("")
    setCompanyName("")
    setEmail("")
    setPhone("")
    setMessage("")
    setAmount("")
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Función para ir directamente a Stripe
  const goToStripe = () => {
    if (selectedTier) {
      window.location.href = selectedTier.stripeLink
    }
  }

  // Función simplificada que solo recopila datos y redirige a Stripe
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTier) return

    setIsSubmitting(true)

    // Mostrar mensaje de redirección
    toast({
      title: "Procesando tu patrocinio",
      description: "Redirigiendo al proceso de pago...",
    })

    // Redirigir a Stripe después de un breve retraso
    setTimeout(() => {
      goToStripe()
    }, 1000)
  }

  // Renderizar un formulario diferente según el tier seleccionado
  if (isDonationTier) {
    // Formulario simplificado para donación libre (Tier 4)
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Donación Libre</DialogTitle>
            <DialogDescription>
              Gracias por tu interés en apoyar a nuestro equipo. Por favor, proporciona la siguiente información.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
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

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Procesando..." : "Continuar al Pago"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  // Formulario completo para los otros tiers
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>{selectedTier?.name || "Patrocinio"}</DialogTitle>
          <DialogDescription>
            {selectedTier?.description || "Completa la información para procesar tu patrocinio"}
          </DialogDescription>
        </DialogHeader>

        {selectedTier && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {(selectedTierId === "tier1" || selectedTierId === "tier2") && (
              <Alert className="bg-blue-50 border-blue-200">
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

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Procesando..." : "Continuar al Pago"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
