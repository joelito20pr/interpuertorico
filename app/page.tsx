"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin, Trophy, Users, Check, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import SponsorModal from "@/components/sponsor-modal"

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  // Datos de los niveles de patrocinio
  const sponsorshipTiers = [
    {
      id: "tier1",
      name: "Patrocinador Principal",
      price: "$600",
      description: "Patrocinio exclusivo con máxima visibilidad",
      features: [
        "Logo grande al frente del uniforme",
        "Mención destacada en redes sociales",
        "Fotos del equipo con su logo",
      ],
      highlighted: true,
      limited: "Solo para 1 auspiciador",
      buttonText: "Seleccionar",
      stripeLink: "https://buy.stripe.com/3cs6q7cSsfXS7JK28b",
    },
    {
      id: "tier2",
      name: "Patrocinador Oro",
      price: "$300",
      description: "Patrocinio con alta visibilidad",
      features: [
        "Logo mediano en parte trasera del uniforme",
        "Mención en redes sociales",
        "Fotos del equipo con su logo",
      ],
      highlighted: false,
      limited: "Máximo 2 auspiciadores",
      buttonText: "Seleccionar",
      stripeLink: "https://buy.stripe.com/28obKr5q06ni2pq9AC",
    },
    {
      id: "tier3",
      name: "Patrocinador Plata",
      price: "$150",
      description: "Patrocinio con reconocimiento especial",
      features: ["Mención especial de agradecimiento", "No incluye logo en uniforme"],
      highlighted: false,
      limited: "",
      buttonText: "Seleccionar",
      stripeLink: "https://buy.stripe.com/aEUdSz6u43b69RS6op",
    },
    {
      id: "tier4",
      name: "Donación Libre",
      price: "Cualquier monto",
      description: "Apoya al equipo con la cantidad que desees",
      features: ["Agradecimiento en nuestras redes sociales", "Satisfacción de apoyar a jóvenes deportistas"],
      highlighted: false,
      limited: "",
      buttonText: "Donar",
      stripeLink: "https://buy.stripe.com/3csaGnf0Ah1WfccaEE",
    },
  ]

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId)
    setIsModalOpen(true)
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center">
          <div className="w-48 h-48 relative mb-8">
            <Image src="/images/logo.png" alt="Inter Puerto Rico Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Inter Puerto Rico Futsal</h1>
          <p className="text-xl mb-8 text-center max-w-3xl">
            Apoya a nuestro equipo de futsal de niños de 11 años en su camino al Futsal International Championship 2025
          </p>
          <Button
            size="lg"
            className="bg-white text-cyan-700 hover:bg-gray-100"
            onClick={() => document.getElementById("patrocinio")?.scrollIntoView({ behavior: "smooth" })}
          >
            Conviértete en Patrocinador
          </Button>
        </div>
      </section>

      {/* Información del Evento */}
      <section className="w-full bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="bg-gray-50 rounded-xl p-6 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center text-center">
                <CalendarDays className="h-10 w-10 text-cyan-600 mb-2" />
                <h3 className="text-lg font-semibold">Fecha del Evento</h3>
                <p>31 julio - 3 agosto, 2025</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <MapPin className="h-10 w-10 text-cyan-600 mb-2" />
                <h3 className="text-lg font-semibold">Ubicación</h3>
                <p>Centro de Convenciones de Puerto Rico</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Trophy className="h-10 w-10 text-cyan-600 mb-2" />
                <h3 className="text-lg font-semibold">Campeonato</h3>
                <p>Futsal International Championship</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Users className="h-10 w-10 text-cyan-600 mb-2" />
                <h3 className="text-lg font-semibold">Nuestro Equipo</h3>
                <p>Niños de 11 años con grandes sueños</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre Nosotros */}
      <section className="w-full py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 flex justify-center">
              <div className="w-64 h-64 relative">
                <Image src="/images/logo.png" alt="Inter Puerto Rico Logo" fill className="object-contain" />
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Sobre Nosotros</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Inter Puerto Rico es un equipo de futsal compuesto por niños de 11 años. Nuestro objetivo es
                  representar con orgullo a nuestra comunidad en un prestigioso torneo internacional que se celebrará
                  del 31 de julio al 3 de agosto en el Centro de Convenciones de Puerto Rico.
                </p>
                <p>
                  Somos una organización sin fines de lucro, cuyo único propósito es el desarrollo deportivo, educativo
                  y emocional de los jóvenes participantes. No buscamos beneficios económicos, sino brindarles una
                  experiencia de vida enriquecedora a través del deporte.
                </p>
                <p>
                  Estamos buscando auspiciadores que nos ayuden a cubrir los costos de participación del equipo y se
                  unan a esta iniciativa de impacto comunitario.
                </p>
              </div>
              <div className="mt-8">
                <Button
                  className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white"
                  onClick={() => document.getElementById("patrocinio")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Ver Opciones de Patrocinio
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Niveles de Patrocinio */}
      <section id="patrocinio" className="w-full py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Opciones de Patrocinio</h2>
          <p className="text-xl mb-10 text-center max-w-3xl mx-auto">
            Elige el nivel de patrocinio que mejor se adapte a ti y ayúdanos a llevar a nuestro equipo al Futsal
            International Championship
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sponsorshipTiers.map((tier) => (
              <Card
                key={tier.id}
                className={`flex flex-col h-full ${
                  tier.highlighted ? "border-cyan-500 shadow-lg shadow-cyan-100" : ""
                }`}
              >
                <CardHeader className={tier.highlighted ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-white" : ""}>
                  {tier.highlighted && (
                    <div className="flex justify-center mb-2">
                      <Star className="h-6 w-6 fill-white text-white" />
                    </div>
                  )}
                  <CardTitle className="text-center text-xl">{tier.name}</CardTitle>
                  <div className="text-center">
                    <span className="text-3xl font-bold">{tier.price}</span>
                  </div>
                  <CardDescription className={`text-center ${tier.highlighted ? "text-gray-100" : ""}`}>
                    {tier.description}
                  </CardDescription>
                  {tier.limited && (
                    <p
                      className={`text-center text-sm mt-2 font-medium ${tier.highlighted ? "text-white" : "text-red-500"}`}
                    >
                      {tier.limited}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${tier.highlighted ? "bg-gradient-to-r from-cyan-500 to-pink-500" : ""}`}
                    onClick={() => handleTierSelect(tier.id)}
                  >
                    {tier.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Llamado a la Acción */}
      <section className="w-full py-16 bg-gradient-to-r from-cyan-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">¡Sé parte de nuestro equipo!</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Tu apoyo no solo ayuda a estos jóvenes a participar en un torneo internacional, sino que también contribuye
            a su desarrollo personal y deportivo.
          </p>
          <Button
            size="lg"
            className="bg-white text-cyan-700 hover:bg-gray-100"
            onClick={() => document.getElementById("patrocinio")?.scrollIntoView({ behavior: "smooth" })}
          >
            Conviértete en Patrocinador
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 relative">
              <Image src="/images/logo.png" alt="Inter Puerto Rico Logo" fill className="object-contain" />
            </div>
          </div>
          <p>© 2025 Inter Puerto Rico Futsal. Todos los derechos reservados.</p>
          <p className="mt-2 text-sm text-gray-400">
          </p>
        </div>
      </footer>

      {/* Modal de Patrocinio */}
      <SponsorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedTierId={selectedTier}
        tiers={sponsorshipTiers}
      />
    </main>
  )
}
