import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Obtener el número de notificaciones no leídas
    const result = await db`
      SELECT COUNT(*) as count
      FROM "Notification"
      WHERE read = false
    `

    const unreadCount = Number.parseInt(result[0]?.count || "0")

    // Obtener las últimas 5 notificaciones no leídas
    const notifications = await db`
      SELECT n.*, e.title as "eventTitle"
      FROM "Notification" n
      LEFT JOIN "Event" e ON n."eventId" = e.id
      WHERE n.read = false
      ORDER BY n."createdAt" DESC
      LIMIT 5
    `

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications: notifications || [],
    })
  } catch (error) {
    console.error("Error al obtener notificaciones no leídas:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener notificaciones no leídas",
        error: error instanceof Error ? error.message : String(error),
        unreadCount: 0,
        notifications: [],
      },
      { status: 500 },
    )
  }
}
