import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Obtener ID de la notificación de la URL
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get("id")

    if (notificationId) {
      // Marcar una notificación específica como leída
      await db`
        UPDATE "Notification"
        SET read = true
        WHERE id = ${notificationId}
      `
    } else {
      // Marcar todas las notificaciones como leídas
      await db`
        UPDATE "Notification"
        SET read = true
        WHERE read = false
      `
    }

    return NextResponse.json({
      success: true,
      message: notificationId ? "Notificación marcada como leída" : "Todas las notificaciones marcadas como leídas",
    })
  } catch (error) {
    console.error("Error al marcar notificaciones como leídas:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al marcar notificaciones como leídas",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
