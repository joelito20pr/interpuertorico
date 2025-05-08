"use client"

import { useState, useEffect } from "react"
import { Plus, Search, MessageSquare, Trash2, Edit, MoreHorizontal, Eye } from "lucide-react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

// Mock data for posts
const mockPosts = [
  {
    id: 1,
    title: "Información sobre el torneo",
    teamName: "Inter Puerto Rico Sub-11",
    authorName: "Administrador",
    content: "Detalles importantes sobre el próximo torneo...",
    isPublic: true,
    createdAt: "2023-05-01T10:00:00Z",
  },
  {
    id: 2,
    title: "Horarios de entrenamiento",
    teamName: "Inter Puerto Rico Sub-13",
    authorName: "Entrenador",
    content: "Los horarios de entrenamiento para la próxima semana...",
    isPublic: false,
    createdAt: "2023-04-28T14:30:00Z",
  },
  {
    id: 3,
    title: "Recordatorio de pago",
    teamName: "General",
    authorName: "Administrador",
    content: "Recordatorio sobre los pagos pendientes...",
    isPublic: true,
    createdAt: "2023-04-25T09:15:00Z",
  },
]

export default function MensajesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setPosts(mockPosts)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredPosts = posts.filter(
    (post: any) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.teamName && post.teamName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "d 'de' MMMM, yyyy", { locale: es })
    } catch (e) {
      return dateString
    }
  }

  const handleDeletePost = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este mensaje?")) {
      // Simulate deletion
      setPosts(posts.filter((post: any) => post.id !== id))
      toast({
        title: "Éxito",
        description: "Mensaje eliminado correctamente",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Mensajes</h1>
        <Button onClick={() => router.push("/dashboard/mensajes/nuevo")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Mensaje
        </Button>
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
          <CardTitle>Gestión de Mensajes</CardTitle>
          <CardDescription>Administra los mensajes y comunicaciones del equipo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar mensaje..."
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
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post: any) => (
                <div
                  key={post.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      <Badge
                        className={`ml-2 ${post.isPublic ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {post.isPublic ? "Público" : "Privado"}
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Equipo: {post.teamName || "General"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Por: {post.authorName || "Administrador"} • {formatDate(post.createdAt)}
                      </div>
                      {post.content && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.content}</p>}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-start">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => router.push(`/dashboard/mensajes/${post.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver
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
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/mensajes/${post.id}/editar`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="text-red-600">
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
              {searchTerm
                ? "No se encontraron mensajes que coincidan con la búsqueda."
                : "No hay mensajes registrados."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
