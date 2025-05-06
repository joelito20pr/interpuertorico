import { TeamForm } from "@/components/dashboard/team-form"

export default function NewTeamPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Crear Nuevo Equipo</h1>
      <TeamForm />
    </div>
  )
}
