import { db } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import { CalendarIcon, MapPinIcon, UsersIcon, DollarSignIcon, PencilIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CopyLinkButton } from "@/components/dashboard/copy-link-button"

interface EventPageProps {
  params: {
    id: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await db.event.findUnique({
    where: {
      id: params.id,
    },
    include: {
      registrations: {
        include: {
          member: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!event) {
    notFound()
  }

  // Generar enlace de registro
  const registrationLink = `${process.env.NEXT_PUBLIC_APP_URL}/registro/${event.id}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/eventos/${event.id}/editar`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Detalles del evento */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium">Detalles del Evento</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <span>{event.location}</span>
              </div>
              {event.requiresPayment && (
                <div className="flex items-center space-x-2">
                  <DollarSignIcon className="h-5 w-5 text-gray-400" />
                  <span>Precio: {event.price}</span>
                </div>
              )}
              <div className="pt-4">
                <h3 className="font-medium mb-2">Descripción</h3>
                <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
              </div>
            </div>
          </div>

          {/* Enlace de registro */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium">Enlace de Registro</h2>
              <p className="text-sm text-gray-500 mt-1">
                Comparte este enlace para que los interesados puedan registrarse al evento
              </p>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={registrationLink}
                  className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                />
                <CopyLinkButton link={registrationLink} />
              </div>
            </div>
          </div>
        </div>

        {/* Registros */}
        <div>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium">Registros</h2>
              <span className="text-2xl font-bold">{event.registrations.length}</span>
            </div>
            <div className="px-6 py-5">
              {event.registrations.length === 0 ? (
                <p className="text-gray-500 text-sm">Aún no hay registros para este evento.</p>
              ) : (
                <div className="space-y-4">
                  {event.registrations.map((registration) => (
                    <div key={registration.id} className="flex items-center space-x-3">
                      <div className="bg-cyan-100 p-2 rounded-full">
                        <UsersIcon className="h-4 w-4 text-cyan-600" />
                      </div>
                      <div>
                        <p className="font-medium">{registration.member.name}</p>
                        <p className="text-xs text-gray-500">{registration.member.email}</p>
                        <p className="text-xs text-gray-400">{formatDate(registration.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
