"use client"

import { signOut } from "next-auth/react"
import { BellIcon, UserCircleIcon, LogOutIcon } from "lucide-react"
import { useState } from "react"

interface TopNavProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function TopNav({ user }: TopNavProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end h-16 items-center">
          <div className="flex items-center space-x-4">
            <button type="button" className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
              <span className="sr-only">Ver notificaciones</span>
              <BellIcon className="h-6 w-6" />
            </button>

            <div className="relative">
              <button
                type="button"
                className="flex items-center space-x-2 text-sm focus:outline-none"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <span className="sr-only">Abrir menú de usuario</span>
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <span className="hidden md:block font-medium text-gray-700">
                  {user.name || user.email || "Usuario"}
                </span>
              </button>

              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
