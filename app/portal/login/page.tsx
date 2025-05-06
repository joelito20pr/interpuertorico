import { PortalLoginForm } from "@/components/portal/portal-login-form"
import Image from "next/image"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function PortalLoginPage() {
  // Verificar si ya hay un miembro autenticado
  const memberIdCookie = cookies().get("member_id")?.value

  if (memberIdCookie) {
    redirect("/portal")
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative h-20 w-20 mb-4">
            <Image src="/images/logo.png" alt="Inter Puerto Rico Logo" fill className="object-contain" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Portal de Equipos</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accede para ver información de tu equipo y comunicarte con los entrenadores
          </p>
        </div>
        <PortalLoginForm />
      </div>
    </div>
  )
}
