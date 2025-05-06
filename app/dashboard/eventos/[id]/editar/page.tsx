import { EventForm } from "@/components/dashboard/event-form"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

interface EditEventPageProps {
  params: {
    id: string
  }
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const event = await db.event.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!event) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Evento</h1>
      <EventForm event={event} />
    </div>
  )
}
