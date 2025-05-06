import { EventForm } from "@/components/dashboard/event-form"

export default function NuevoEventoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Crear Nuevo Evento</h1>
      <EventForm />
    </div>
  )
}
