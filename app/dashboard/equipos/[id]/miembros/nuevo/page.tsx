import { TeamMemberForm } from "@/components/dashboard/team-member-form"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

interface NewTeamMemberPageProps {
  params: {
    id: string
  }
}

export default async function NewTeamMemberPage({ params }: NewTeamMemberPageProps) {
  const team = await db.team.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!team) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Añadir Miembro al Equipo</h1>
      <p className="text-gray-500">Equipo: {team.name}</p>
      <TeamMemberForm teamId={team.id} />
    </div>
  )
}
