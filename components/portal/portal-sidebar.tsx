"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarIcon, HomeIcon, MessageSquareIcon, UsersIcon } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface Member {
  id: string
  name: string
  email: string
  team: {
    id: string
    name: string
  } | null
}

interface PortalSidebarProps {
  member: Member
}

export function PortalSidebar({ member }: PortalSidebarProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    {
      title: "Inicio",
      href: "/portal",
      icon: HomeIcon,
    },
    {
      title: "Equipo",
      href: "/portal/equipo",
      icon: UsersIcon,
    },
    {
      title: "Eventos",
      href: "/portal/eventos",
      icon: CalendarIcon,
    },
    {
      title: "Mensajes",
      href: "/portal/mensajes",
      icon: MessageSquareIcon,
    },
  ]

  return (
    <>
      {/* Sidebar para móvil */}
      <div className="md:hidden">
        <button
          type="button"
          className="fixed top-4 left-4 z-50 p-2 text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-cyan-600 to-pink-600">
              <div className="flex items-center h-16 flex-shrink-0 px-4">
                <div className="relative h-10 w-10 mr-3">
                  <Image src="/images/logo.png" alt="Inter Puerto Rico Logo" fill className="object-contain" />
                </div>
                <span className="text-white font-medium">Portal de Equipos</span>
              </div>
              <div className="flex-1 h-0 overflow-y-auto">
                <div className="px-4 py-2">
                  <p className="text-white font-medium">{member.name}</p>
                  <p className="text-cyan-100 text-sm">{member.team?.name || "Sin equipo"}</p>
                </div>
                <nav className="px-2 py-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive ? "bg-cyan-700 text-white" : "text-white hover:bg-cyan-700 hover:bg-opacity-75"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="mr-3 flex-shrink-0 h-6 w-6 text-cyan-200" />
                        {item.title}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar para escritorio */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-gradient-to-b from-cyan-600 to-pink-600">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4">
            <div className="relative h-10 w-10 mr-3">
              <Image src="/images/logo.png" alt="Inter Puerto Rico Logo" fill className="object-contain" />
            </div>
            <span className="text-white font-medium">Portal de Equipos</span>
          </div>
          <div className="px-4 py-2">
            <p className="text-white font-medium">{member.name}</p>
            <p className="text-cyan-100 text-sm">{member.team?.name || "Sin equipo"}</p>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive ? "bg-cyan-700 text-white" : "text-white hover:bg-cyan-700 hover:bg-opacity-75"
                    }`}
                  >
                    <item.icon className="mr-3 flex-shrink-0 h-6 w-6 text-cyan-200" />
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}
