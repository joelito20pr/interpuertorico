"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

// Datos de ejemplo para los jugadores
const players = [
  { id: 1, name: "Carlos Rodríguez", position: "Portero", image: "/placeholder.svg?height=300&width=300" },
  { id: 2, name: "Miguel Hernández", position: "Ala", image: "/placeholder.svg?height=300&width=300" },
  { id: 3, name: "Javier López", position: "Pívot", image: "/placeholder.svg?height=300&width=300" },
  { id: 4, name: "Alejandro Martínez", position: "Cierre", image: "/placeholder.svg?height=300&width=300" },
  { id: 5, name: "Daniel González", position: "Ala", image: "/placeholder.svg?height=300&width=300" },
  { id: 6, name: "Roberto Sánchez", position: "Portero", image: "/placeholder.svg?height=300&width=300" },
]

export default function TeamGallery() {
  const [activePlayer, setActivePlayer] = useState<number | null>(null)

  return (
    <div className="w-full">
      <Carousel className="w-full max-w-5xl mx-auto">
        <CarouselContent>
          {players.map((player) => (
            <CarouselItem key={player.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-2">
                <Card
                  className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
                  onClick={() => setActivePlayer(player.id)}
                >
                  <div className="relative h-64 w-full">
                    <Image src={player.image || "/placeholder.svg"} alt={player.name} fill className="object-cover" />
                  </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-bold text-lg">{player.name}</h3>
                    <p className="text-gray-600">{player.position}</p>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>

      {activePlayer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setActivePlayer(null)}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex mb-4">
              <div className="relative h-48 w-48 flex-shrink-0 mr-6">
                <Image
                  src={players.find((p) => p.id === activePlayer)?.image || ""}
                  alt={players.find((p) => p.id === activePlayer)?.name || ""}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{players.find((p) => p.id === activePlayer)?.name}</h3>
                <p className="text-gray-600 mb-2">{players.find((p) => p.id === activePlayer)?.position}</p>
                <p className="text-gray-700">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Sed euismod, nisl vel
                  ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.
                </p>
              </div>
            </div>
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
              onClick={() => setActivePlayer(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
