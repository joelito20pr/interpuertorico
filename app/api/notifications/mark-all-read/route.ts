import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Marcar todas las notificaciones como leídas
    await db`
      UPDATE "Notification"
      SET read = true
      WHERE read = false
    `

    return NextResponse.json({
      success: true,
      message: "Todas las notificaciones marcadas como leídas",
    })
  } catch (error) {
    console.error("Error al marcar todas las notificaciones como leídas:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al marcar todas las notificaciones como leídas",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
