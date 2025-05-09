"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Registration {
  id: string
  eventId: string
  name: string
  email: string
  phone: string
  numberOfAttendees: number
  paymentStatus?: string
  paymentReference?: string
  guardianName?: string
  confirmationStatus: string
  createdAt: string
  updatedAt: string
}

interface RegistrationEditorProps {
  registration: Registration
  onSave: (updatedRegistration: Registration) => void
  onCancel: () => void
}

export function RegistrationEditor({ registration, onSave, onCancel }: RegistrationEditorProps) {
  const [formData, setFormData] = useState<Registration>({ ...registration })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numberValue = Number.parseInt(value)
    if (!isNaN(numberValue) && numberValue > 0) {
      setFormData((prev) => ({
        ...prev,
        [name]: numberValue,
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Log the data being sent
      console.log("Sending data to API:", formData)

      const response = await fetch(`/api/events/registrations/${registration.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      // Log the response status
      console.log("API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API error response:", errorData)
        throw new Error(errorData.message || "Error al actualizar el registro")
      }

      const result = await response.json()
      console.log("API success response:", result)

      if (!result.success) {
        throw new Error(result.error || "Error al actualizar el registro")
      }

      toast({
        title: "Registro actualizado",
        description: "La información del registro ha sido actualizada correctamente.",
      })

      // Call onSave with the updated data from the API response
      onSave(result.data)
    } catch (error) {
      console.error("Error updating registration:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el registro",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Editar Registro</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfAttendees">Número de asistentes</Label>
              <Input
                id="numberOfAttendees"
                name="numberOfAttendees"
                type="number"
                min="1"
                value={formData.numberOfAttendees}
                onChange={handleNumberChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianName">Nombre del encargado</Label>
              <Input
                id="guardianName"
                name="guardianName"
                value={formData.guardianName || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmationStatus">Estado de confirmación</Label>
              <Select
                value={formData.confirmationStatus || "PENDING"}
                onValueChange={(value) => handleSelectChange("confirmationStatus", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                  <SelectItem value="DECLINED">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.paymentStatus && (
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Estado de pago</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) => handleSelectChange("paymentStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="PAID">Pagado</SelectItem>
                    <SelectItem value="FAILED">Fallido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {formData.paymentReference && (
              <div className="space-y-2">
                <Label htmlFor="paymentReference">Referencia de pago</Label>
                <Input
                  id="paymentReference"
                  name="paymentReference"
                  value={formData.paymentReference}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
