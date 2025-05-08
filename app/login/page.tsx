import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative h-20 w-20 mb-4">
            <Image src="/images/logo.png" alt="Inter Puerto Rico Logo" fill className="object-contain" priority />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Iniciar sesión</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accede al panel de administración de Inter Puerto Rico Futsal
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
