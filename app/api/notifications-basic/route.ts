import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Obtener notificaciones no leídas (sin verificar autenticación por ahora)
    const notifications = await db`
      SELECT * FROM "Notification"
      WHERE read = false OR "createdAt" > NOW() - INTERVAL '24 hours'
      ORDER BY "createdAt" DESC
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
    console.error("Error en la API de notificaciones:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error en la API de notificaciones",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { action, id } = body

    if (action === "mark-read" && id) {
      await db`
        UPDATE "Notification"
        SET read = true
        WHERE id = ${id}
      `

      return NextResponse.json({
        success: true,
        message: "Notificación marcada como leída",
      })
    } else if (action === "mark-all-read") {
      await db`
        UPDATE "Notification"
        SET read = true
        WHERE read = false
      `

      return NextResponse.json({
        success: true,
        message: "Todas las notificaciones marcadas como leídas",
      })
    }

    return NextResponse.json({ success: false, message: "Acción no válida" }, { status: 400 })
  } catch (error) {
    console.error("Error en la API de notificaciones:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error en la API de notificaciones",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
