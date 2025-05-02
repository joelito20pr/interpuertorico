"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

export default function DonationForm() {
  const [amount, setAmount] = useState<string>("100")
  const [customAmount, setCustomAmount] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Aquí iría la lógica para procesar el pago
    // Simulamos una espera
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "¡Donación recibida!",
      description: `Gracias ${name} por tu generosa donación de $${amount === "custom" ? customAmount : amount}.`,
    })

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="donation-amount" className="text-lg font-medium">
          Selecciona un monto para donar
        </Label>

        <RadioGroup value={amount} onValueChange={setAmount} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <RadioGroupItem value="50" id="amount-50" className="peer sr-only" />
            <Label
              htmlFor="amount-50"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-100 hover:text-gray-900 peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:text-red-600 cursor-pointer"
            >
              $50
            </Label>
          </div>

          <div>
            <RadioGroupItem value="100" id="amount-100" className="peer sr-only" />
            <Label
              htmlFor="amount-100"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-100 hover:text-gray-900 peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:text-red-600 cursor-pointer"
            >
              $100
            </Label>
          </div>

          <div>
            <RadioGroupItem value="250" id="amount-250" className="peer sr-only" />
            <Label
              htmlFor="amount-250"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-100 hover:text-gray-900 peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:text-red-600 cursor-pointer"
            >
              $250
            </Label>
          </div>

          <div>
            <RadioGroupItem value="custom" id="amount-custom" className="peer sr-only" />
            <Label
              htmlFor="amount-custom"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-100 hover:text-gray-900 peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:text-red-600 cursor-pointer"
            >
              Otro
            </Label>
          </div>
        </RadioGroup>

        {amount === "custom" && (
          <div className="mt-3">
            <Label htmlFor="custom-amount">Monto personalizado ($)</Label>
            <Input
              id="custom-amount"
              type="number"
              min="1"
              step="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Ingresa el monto"
              required={amount === "custom"}
              className="mt-1"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" required />
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
          <Label htmlFor="message">Mensaje (opcional)</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Deja un mensaje de apoyo para el equipo"
            className="resize-none"
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-lg py-6" disabled={isSubmitting}>
        {isSubmitting ? "Procesando..." : "Donar Ahora"}
      </Button>

      <p className="text-sm text-gray-500 text-center">
        Tu donación ayudará a cubrir gastos de viaje, alojamiento, uniformes y más para nuestro equipo.
      </p>
    </form>
  )
}
