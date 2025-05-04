/* app/page.tsx
   Landing de patrocinio – Inter Puerto Rico
   Incluye héroe con imagen + stats e integra SponsorForm.
*/

"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  CalendarDays,
  MapPin,
  Trophy,
  Users,
  Check,
  Star,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import SponsorForm from "@/components/sponsor-form"

/* ----------  Tiers  ---------- */
const tiers = [
  {
    id: "tier1",
    name: "Oro",
    price: "$500",
    description: "Logo al frente del uniforme y banner en redes",
    features: [],
    highlighted: true,
    limited: "",
    buttonText: "Patrocinar nivel Oro",
    stripeLink: "https://buy.stripe.com/oro_12345",
  },
  {
    id: "tier2",
    name: "Plata",
    price: "$300",
    description: "Logo en manga y mención en redes",
    features: [],
    highlighted: false,
    limited: "",
    buttonText: "Patrocinar nivel Plata",
    stripeLink: "https://buy.stripe.com/plata_67890",
  },
  {
    id: "tier3",
    name: "Bronce",
    price: "$150",
    description: "Mención en nuestras redes",
    features: [],
    highlighted: false,
    limited: "",
    buttonText: "Patrocinar nivel Bronce",
    stripeLink: "https://buy.stripe.com/bronce_11111",
  },
  {
    id: "tier4",
    name: "Donación libre",
    price: "Cualquier monto",
    description: "Contribuye con lo que desees",
    features: [],
    highlighted: false,
    limited: "",
    buttonText: "Donar",
    stripeLink: "https://buy.stripe.com/donacion_libre",
  },
]

export default function HomePage() {
  /* Permite hacer scroll al form al pulsar el CTA. */
  const [formRef, setFormRef] = useState<HTMLDivElement | null>(null)

  const scrollToForm = () => {
    formRef?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12 space-y-20">
      {/* ----------  Héroe  ---------- */}
      <section className="grid md:grid-cols-2 gap-10 items-center">
        {/* Imagen del equipo */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
          <Image
            src="/images/team-hero.jpg" // coloca tu imagen en /public/images/
            alt="Inter Puerto Rico Sub‑11"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Texto + CTA */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            ¡Ayúdanos a llegar al Torneo Internacional de Futsal Sub‑11!
          </h1>
          <p className="text-lg text-muted-foreground">
            Con tu patrocinio cubriremos uniformes, inscripción y viáticos para
            representar a Puerto Rico del&nbsp;31&nbsp;de&nbsp;julio al&nbsp;3&nbsp;de&nbsp;agosto.
          </p>
          <Button size="lg" onClick={scrollToForm}>
            Quiero ser patrocinador
          </Button>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 gap-4 pt-6">
            <StatCard
              icon={Users}
              label="11 Jugadores"
              desc="Categoría Sub‑11"
            />
            <StatCard
              icon={CalendarDays}
              label="31 Jul → 3 Ago"
              desc="Fechas del torneo"
            />
            <StatCard
              icon={MapPin}
              label="San Juan, PR"
              desc="Centro de Convenciones"
            />
            <StatCard
              icon={Trophy}
              label="1er Torneo Int’l"
              desc="Sueño en camino"
            />
          </div>
        </div>
      </section>

      {/* ----------  Formulario  ---------- */}
      <section ref={setFormRef}>
        <SponsorForm tiers={tiers} />
      </section>
    </main>
  )
}

/* ----------  Pequeño componente de tarjeta de stats  ---------- */
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  desc: string
}
function StatCard({ icon: Icon, label, desc }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="rounded-full bg-primary/10 p-3">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </Card>
  )
}
