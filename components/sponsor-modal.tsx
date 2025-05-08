"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

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
  const [selectedTier, setSelectedTier] = useState<SponsorTier | null>(null)
  const [step, setStep] = useState<"details" | "form">("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
  })

  useEffect(() => {
    if (selectedTierId) {
      const tier = tiers.find((t) => t.id === selectedTierId) || null
      setSelectedTier(tier)
      setStep("details")
    } else {
      setSelectedTier(null)
    }
  }, [selectedTierId, tiers])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProceedToForm = () => {
    setStep("form")
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Error en el formulario",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Submit to FormSpark
      const response = await fetch("https://submit-form.com/Ybp7V89H6", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...formData,
          sponsorshipTier: selectedTier?.name,
          sponsorshipPrice: selectedTier?.price,
        }),
      })

      if (response.ok) {
        toast({
          title: "¡Formulario enviado!",
          description: "Gracias por tu interés. Serás redirigido al pago.",
        })

        // Redirect to Stripe after a short delay
        setTimeout(() => {
          if (selectedTier?.stripeLink) {
            window.open(selectedTier.stripeLink, "_blank")
          }
          onClose()
        }, 1500)
      } else {
        throw new Error("Error al enviar el formulario")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al enviar el formulario. Por favor intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep("details")
    setFormData({
      name: "",
      email: "",
      company: "",
      phone: "",
    })
    onClose()
  }

  if (!selectedTier) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "details" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedTier.name}</DialogTitle>
              <DialogDescription>{selectedTier.description}</DialogDescription>
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Cerrar</span>
              </button>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4">
                <span className="text-2xl font-bold">{selectedTier.price}</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Beneficios incluidos:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedTier.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              {selectedTier.limited && (
                <div className="mt-4 text-sm font-medium text-red-500">{selectedTier.limited}</div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleProceedToForm} className="w-full">
                Continuar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Información de Contacto</DialogTitle>
              <DialogDescription>
                Por favor complete sus datos para proceder con el patrocinio de {selectedTier.name}
              </DialogDescription>
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Cerrar</span>
              </button>
            </DialogHeader>
            <form onSubmit={handleSubmitForm}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Empresa/Organización</Label>
                  <Input id="company" name="company" value={formData.company} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStep("details")} className="mr-2">
                  Atrás
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Proceder al pago"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
