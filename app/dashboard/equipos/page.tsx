"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Users, Trash2, Edit, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getTeams, deleteTeam, getMembersByTeam } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function EquiposPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [teams, setTeams] = useState([])
  const [teamMembers, setTeamMembers] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadTeams()
  }, [])

  async function loadTeams() {
    setIsLoading(true)
    try {
      const result = await getTeams()
      if (result.success) {
        setTeams(result.data)

        // Cargar miembros para cada equipo
        const membersData = {}
        for (const team of result.data) {
          const membersResult = await getMembersByTeam(team.id)
          if (membersResult.success) {
            membersData[team.id] = membersResult.data.length
          }
        }
        setTeamMembers(membersData)
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudieron cargar los equipos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading teams:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los equipos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTeam = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este equipo?")) {
      try {
        const result = await deleteTeam(id)
        if (result.success) {
          toast({
            title: "Éxito",
            description: "Equipo eliminado correctamente",
          })
          loadTeams()
        } else {
          toast({
            title: "Error",
            description: result.error || "No se pudo eliminar el equipo",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting team:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al eliminar el equipo",
          variant: "destructive",
        })
      }
    }
  }

  const filteredTeams = teams.filter(
    (team: any) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.category && team.category.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Equipos</h1>
        <Button onClick={() => router.push("/dashboard/equipos/nuevo")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Equipo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Equipos</CardTitle>
          <CardDescription>Administra los equipos y sus miembros.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar equipo..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-md">
                  <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
                  <div className="w-1/5 h-5 bg-gray-200 rounded"></div>
                  <div className="w-1/6 h-5 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredTeams.length > 0 ? (
            <div className="space-y-4">
              {filteredTeams.map((team: any) => (
                <div
                  key={team.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold">{team.name}</h3>
                      {team.category && <Badge className="ml-2 bg-blue-100 text-blue-800">{team.category}</Badge>}
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="mr-2 h-4 w-4" />
                        {teamMembers[team.id] || 0} miembros
                      </div>
                      {team.description && <p className="text-sm text-gray-500 mt-1">{team.description}</p>}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-start">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => router.push(`/dashboard/equipos/${team.id}`)}
                    >
                      Ver Detalles
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/equipos/${team.id}/editar`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteTeam(team.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              {searchTerm ? "No se encontraron equipos que coincidan con la búsqueda." : "No hay equipos registrados."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
