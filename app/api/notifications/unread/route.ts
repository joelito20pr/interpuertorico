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

    // Obtener notificaciones no leídas
    const notifications = await db`
      SELECT n.id, n.type, n.message, n."eventId", n.status, n."createdAt", n.read,
             e.title as "eventTitle"
      FROM "Notification" n
      LEFT JOIN "Event" e ON n."eventId" = e.id
      WHERE n.read = false OR n."createdAt" > NOW() - INTERVAL '24 hours'
      ORDER BY n."createdAt" DESC
      LIMIT 10
    `

    return NextResponse.json({
      success: true,
      notifications: notifications.map((n) => ({
        ...n,
        read: n.read || false,
      })),
    })
  } catch (error) {
    console.error("Error al obtener notificaciones no leídas:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener notificaciones",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
