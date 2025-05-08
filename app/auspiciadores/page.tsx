import Image from "next/image"
import Link from "next/link"

export default function AuspiciadoresPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              Inter Puerto Rico Futsal
            </Link>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/" className="hover:underline">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/auspiciadores" className="hover:underline font-bold">
                    Auspiciadores
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:underline">
                    Iniciar Sesión
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Nuestros Auspiciadores</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Ejemplo de auspiciador */}
          <div className="border rounded-lg p-6 shadow-md flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4">
              <Image src="/generic-company-logo.png" alt="Logo de Auspiciador" fill className="object-contain" />
            </div>
            <h2 className="text-xl font-bold mb-2">Nombre del Auspiciador</h2>
            <p className="text-gray-600 text-center mb-4">Descripción breve del auspiciador y su apoyo al equipo.</p>
            <a
              href="https://ejemplo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Visitar sitio web
            </a>
          </div>

          {/* Puedes duplicar este bloque para más auspiciadores */}
          <div className="border rounded-lg p-6 shadow-md flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4">
              <Image src="/placeholder.svg?key=2mhyo" alt="Logo de Auspiciador" fill className="object-contain" />
            </div>
            <h2 className="text-xl font-bold mb-2">Otro Auspiciador</h2>
            <p className="text-gray-600 text-center mb-4">
              Descripción breve del auspiciador y su contribución al desarrollo del equipo.
            </p>
            <a
              href="https://ejemplo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Visitar sitio web
            </a>
          </div>

          <div className="border rounded-lg p-6 shadow-md flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4">
              <Image src="/local-business-logo.png" alt="Logo de Auspiciador" fill className="object-contain" />
            </div>
            <h2 className="text-xl font-bold mb-2">Tercer Auspiciador</h2>
            <p className="text-gray-600 text-center mb-4">
              Descripción breve del auspiciador y cómo apoya al equipo de futsal.
            </p>
            <a
              href="https://ejemplo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Visitar sitio web
            </a>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">¿Quieres ser auspiciador?</h2>
          <p className="max-w-2xl mx-auto mb-6">
            Únete a nuestro equipo de auspiciadores y apoya el desarrollo del futsal en Puerto Rico. Ofrecemos
            diferentes paquetes de patrocinio adaptados a tus necesidades.
          </p>
          <Link
            href="/contacto"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Contáctanos
          </Link>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Inter Puerto Rico Futsal</h3>
              <p>Desarrollando el futsal en Puerto Rico</p>
            </div>
            <div>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/" className="hover:underline">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/auspiciadores" className="hover:underline">
                    Auspiciadores
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="hover:underline">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Inter Puerto Rico Futsal. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
