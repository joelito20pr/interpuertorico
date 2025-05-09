import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Función para manejar solicitudes GET
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { success: false, message: "Método no permitido. Use POST para marcar notificaciones como leídas." },
    { status: 405 },
  )
}

// Función para manejar solicitudes POST
export async function POST(request: NextRequest) {
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
