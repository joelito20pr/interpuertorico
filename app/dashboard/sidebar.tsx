"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarIcon, UsersIcon, ClipboardListIcon, HomeIcon } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    title: "Eventos",
    href: "/dashboard/eventos",
    icon: CalendarIcon,
  },
  {
    title: "Equipos",
    href: "/dashboard/equipos",
    icon: UsersIcon,
  },
  {
    title: "Miembros",
    href: "/dashboard/miembros",
    icon: UsersIcon,
  },
  {
    title: "Registros",
    href: "/dashboard/registros",
    icon: ClipboardListIcon,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-900">
              <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-800">
                <div className="relative h-10 w-10 mr-3">
                  <Image src="/images/logo.png" alt="Inter Puerto Rico Logo" fill className="object-contain" />
                </div>
                <span className="text-white font-medium">Inter PR Admin</span>
              </div>
              <div className="flex-1 h-0 overflow-y-auto">
                <nav className="px-2 py-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon
                          className={`mr-3 flex-shrink-0 h-6 w-6 ${
                            isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                          }`}
                        />
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
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-800">
            <div className="relative h-10 w-10 mr-3">
              <Image src="/images/logo.png" alt="Inter Puerto Rico Logo" fill className="object-contain" />
            </div>
            <span className="text-white font-medium">Inter PR Admin</span>
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
                      isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                      }`}
                    />
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
