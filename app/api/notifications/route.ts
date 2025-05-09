import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Función para manejar solicitudes GET
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action") || "unread"

    // Manejar diferentes acciones
    if (action === "unread") {
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

// Función para manejar solicitudes POST
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action") || ""

    // Manejar diferentes acciones
    if (action === "mark-read") {
      // Obtener ID de la notificación
      const id = searchParams.get("id")

      if (id) {
        // Marcar una notificación específica como leída
        await db`
          UPDATE "Notification"
          SET read = true
          WHERE id = ${id}
        `

        return NextResponse.json({
          success: true,
          message: "Notificación marcada como leída",
        })
      } else {
        return NextResponse.json({ success: false, message: "ID de notificación no proporcionado" }, { status: 400 })
      }
    } else if (action === "mark-all-read") {
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
