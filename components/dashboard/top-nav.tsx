"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Bell } from "lucide-react"
import { logoutAction } from "@/lib/auth-actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface TopNavProps {
  userId: string
}

interface Notification {
  id: string
  type: string
  message: string
  eventId: string
  eventTitle?: string
  createdAt: string
  read: boolean
}

export function TopNav({ userId }: TopNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const [userData, setUserData] = useState({ name: "Usuario", email: "usuario@ejemplo.com" })

  // Función para cargar notificaciones
  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/unread")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNotifications(data.notifications)
          setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length)
        }
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Función para marcar notificaciones como leídas
  const markAsRead = async (notificationId?: string) => {
    try {
      const endpoint = notificationId
        ? `/api/notifications/mark-read?id=${notificationId}`
        : "/api/notifications/mark-all-read"

      const response = await fetch(endpoint, {
        method: "POST",
      })

      if (response.ok) {
        await loadNotifications()
      }
    } catch (error) {
      console.error("Error al marcar notificaciones como leídas:", error)
    }
  }

  // Iniciar polling para notificaciones
  useEffect(() => {
    // Cargar notificaciones iniciales
    loadNotifications()

    // Configurar polling cada 30 segundos
    pollingInterval.current = setInterval(() => {
      loadNotifications()
    }, 30000)

    // Limpiar intervalo al desmontar
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
      }
    }
  }, [])

  useEffect(() => {
    // In a real app, you would fetch user data here
    // For now, we'll just use placeholder data
    setUserData({ name: "Administrador", email: "admin@interpr.com" })
  }, [userId])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLogout = async () => {
    await logoutAction()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Función para navegar a la página de detalles del registro
  const goToRegistration = (eventId: string) => {
    router.push(`/dashboard/eventos/${eventId}/registros`)
  }

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Abrir menú principal</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
          <div className="flex-1 flex items-center justify-end">
            <div className="flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
                    onClick={() => loadNotifications()}
                  >
                    <span className="sr-only">Ver notificaciones</span>
                    <Bell className="h-6 w-6" aria-hidden="true" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-medium">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <button onClick={() => markAsRead()} className="text-xs text-blue-600 hover:text-blue-800">
                        Marcar todas como leídas
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {isLoading ? (
                      <div className="p-4 text-center text-gray-500">Cargando...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No hay notificaciones nuevas</div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                          onClick={() => {
                            markAsRead(notification.id)
                            if (notification.eventId) {
                              goToRegistration(notification.eventId)
                            }
                          }}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                              <div
                                className={`w-2 h-2 rounded-full ${!notification.read ? "bg-blue-600" : "bg-gray-300"}`}
                              ></div>
                            </div>
                            <div className="ml-2 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.type === "registration" ? "Nuevo registro" : notification.type}
                              </p>
                              <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                              {notification.eventTitle && (
                                <p className="text-xs text-gray-500 mt-1">Evento: {notification.eventTitle}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: es,
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t text-center">
                    <Link href="/dashboard/notificaciones" className="text-sm text-blue-600 hover:text-blue-800">
                      Ver todas las notificaciones
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="ml-3 relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <span className="sr-only">Abrir menú de usuario</span>
                      <Avatar className="h-8 w-8 rounded-full">
                        <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <span>{userData.name}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>{userData.email}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/dashboard/configuracion">Configuración</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>Cerrar sesión</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/dashboard"
              className="bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/eventos"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Eventos
            </Link>
            <Link
              href="/dashboard/equipos"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Equipos
            </Link>
            <Link
              href="/dashboard/mensajes"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Mensajes
            </Link>
            <Link
              href="/dashboard/configuracion"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Configuración
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10 rounded-full">
                  <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{userData.name}</div>
                <div className="text-sm font-medium text-gray-500">{userData.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
