import type React from "react"
import { PortalSidebar } from "@/components/portal/portal-sidebar"
import { PortalTopNav } from "@/components/portal/portal-top-nav"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar si hay un miembro autenticado
  const memberIdCookie = cookies().get("member_id")?.value

  if (!memberIdCookie) {
    redirect("/portal/login")
  }

  // Obtener información del miembro
  const member = await db.member.findUnique({
    where: {
      id: memberIdCookie,
    },
    include: {
      team: true,
    },
  })

  if (!member) {
    // Eliminar cookie inválida
    cookies().delete("member_id")
    redirect("/portal/login")
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <PortalSidebar member={member} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <PortalTopNav member={member} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
