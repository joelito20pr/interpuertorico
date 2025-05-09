import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Añadimos la función GET para manejar solicitudes GET
export async function GET() {
  return NextResponse.json({ success: false, message: "Método no permitido" }, { status: 405 })
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Obtener el ID de la notificación del cuerpo de la solicitud
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, message: "ID de notificación no proporcionado" }, { status: 400 })
    }

    // Marcar la notificación como leída
    await db`
      UPDATE "Notification"
      SET read = true
      WHERE id = ${id}
    `

    return NextResponse.json({
      success: true,
      message: "Notificación marcada como leída",
    })
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al marcar notificación como leída",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
