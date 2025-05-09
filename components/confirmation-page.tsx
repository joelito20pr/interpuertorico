import { Logo } from "./logo"

interface ConfirmationPageProps {
  eventTitle: string
  eventDate: string
  eventLocation: string
  name: string
  email: string
  confirmed: boolean
  declined: boolean
  error?: string
}

export function ConfirmationPage({
  eventTitle,
  eventDate,
  eventLocation,
  name,
  email,
  confirmed,
  declined,
  error,
}: ConfirmationPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo width={150} height={150} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {confirmed ? "¡Asistencia Confirmada!" : declined ? "Asistencia Cancelada" : "Confirmación de Asistencia"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error ? (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : confirmed || declined ? (
            <>
              <div className="rounded-md bg-blue-50 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      {confirmed ? "Has confirmado tu asistencia al evento." : "Has cancelado tu asistencia al evento."}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">{eventTitle}</h4>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Fecha:</strong> {eventDate}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Ubicación:</strong> {eventLocation}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Participante:</strong> {name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {email}
                </p>
              </div>

              <div className="mt-6">
                <a
                  href="/"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Volver al inicio
                </a>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Por favor, confirma si asistirás al evento:</p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <a
                  href={`?confirm=yes&email=${encodeURIComponent(email)}`}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Sí, asistiré
                </a>
                <a
                  href={`?confirm=no&email=${encodeURIComponent(email)}`}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  No podré asistir
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
