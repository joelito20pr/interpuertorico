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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function NuevoMensajePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teams, setTeams] = useState([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    teamId: "",
  })

  useEffect(() => {
    async function loadTeams() {
      try {
        const response = await fetch("/api/teams")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        if (result.success) {
          setTeams(result.data)
        } else {
          console.error("Error loading teams:", result.error)
        }
      } catch (error) {
        console.error("Error loading teams:", error)
      } finally {
        setIsLoadingTeams(false)
      }
    }

    loadTeams()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      teamId: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validación básica
      if (!formData.title || !formData.content) {
        setError("Por favor complete todos los campos requeridos")
        setIsSubmitting(false)
        return
      }

      // Simulate API call - in a real app, you would call your API endpoint
      // For now, we'll just simulate success
      setTimeout(() => {
        toast({
          title: "Éxito",
          description: "Mensaje creado correctamente",
        })
        router.push("/dashboard/mensajes")
      }, 1000)
    } catch (error) {
      console.error("Error creating message:", error)
      setError(`Error al crear el mensaje: ${error instanceof Error ? error.message : String(error)}`)
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
        <h1 className="text-2xl font-bold tracking-tight">Crear Nuevo Mensaje</h1>
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
          <CardTitle>Información del Mensaje</CardTitle>
          <CardDescription>Ingrese los detalles del nuevo mensaje.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Título del mensaje *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ej: Información importante sobre el torneo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamId">Equipo</Label>
                <Select disabled={isLoadingTeams} value={formData.teamId} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">General (Todos los equipos)</SelectItem>
                    {teams.map((team: any) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 h-full pt-6">
                  <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label htmlFor="isPublic">Mensaje público</Label>
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="content">Contenido del mensaje *</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Escriba el contenido del mensaje aquí..."
                  rows={8}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
