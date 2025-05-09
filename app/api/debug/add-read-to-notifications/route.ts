import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Verificar si la columna ya existe
    const columnExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Notification'
        AND column_name = 'read'
      ) as exists
    `

    if (columnExists[0]?.exists) {
      return NextResponse.json({
        success: true,
        message: "La columna 'read' ya existe en la tabla Notification",
      })
    }

    // Añadir la columna read a la tabla Notification
    await db`
      ALTER TABLE "Notification"
      ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false
    `

    // Actualizar las notificaciones existentes
    await db`
      UPDATE "Notification"
      SET read = false
      WHERE read IS NULL
    `

    return NextResponse.json({
      success: true,
      message: "Columna 'read' añadida a la tabla Notification",
    })
  } catch (error) {
    console.error("Error al añadir columna 'read' a la tabla Notification:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al añadir columna 'read'",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
