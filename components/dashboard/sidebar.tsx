"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, Home, Users, MessageSquare, Settings, LogOut } from "lucide-react"
import { logoutAction } from "@/lib/auth-actions"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Eventos",
    href: "/dashboard/eventos",
    icon: Calendar,
  },
  {
    name: "Equipos",
    href: "/dashboard/equipos",
    icon: Users,
  },
  {
    name: "Mensajes",
    href: "/dashboard/mensajes",
    icon: MessageSquare,
  },
  {
    name: "Configuración",
    href: "/dashboard/configuracion",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logoutAction()
  }

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r">
        <div className="flex items-center flex-shrink-0 px-4">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            Inter Puerto Rico
          </Link>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500",
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
