import { RegistrationForm } from "@/components/registration-form"
import { db } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import { CalendarIcon, MapPinIcon } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"

interface RegistrationPageProps {
  params: {
    id: string
  }
}

export default async function RegistrationPage({ params }: RegistrationPageProps) {
  const event = await db.event.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!event) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <div className="relative h-10 w-10 mr-3">
            <Image src="/images/logo.png" alt="Inter Puerto Rico Logo" fill className="object-contain" />
          </div>
          <h1 className="text-xl font-bold">Inter Puerto Rico Futsal</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white p-6">
              <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
              <div className="flex flex-col sm:flex-row sm:space-x-6">
                <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                  <CalendarIcon className="h-5 w-5" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 whitespace-pre-line mb-6">{event.description}</p>
              {event.requiresPayment && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                  <h3 className="font-medium text-amber-800 mb-1">Evento con costo</h3>
                  <p className="text-amber-700">
                    Este evento tiene un costo de {event.price}. Después de completar el registro, serás redirigido a la
                    página de pago.
                  </p>
                </div>
              )}
              <RegistrationForm
                eventId={event.id}
                requiresPayment={event.requiresPayment}
                stripeLink={event.stripeLink}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 Inter Puerto Rico Futsal. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
