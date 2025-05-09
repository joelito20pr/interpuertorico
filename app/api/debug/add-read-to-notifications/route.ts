import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Verificar si la columna ya existe
    const checkColumnExists = await db`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Notification'
      AND column_name = 'read'
    `

    if (checkColumnExists.length > 0) {
      return NextResponse.json({
        success: true,
        message: "La columna 'read' ya existe en la tabla Notification",
      })
    }

    // Añadir la columna 'read' a la tabla Notification
    await db`
      ALTER TABLE "Notification"
      ADD COLUMN read BOOLEAN NOT NULL DEFAULT false
    `

    return NextResponse.json({
      success: true,
      message: "Columna 'read' añadida correctamente a la tabla Notification",
    })
  } catch (error) {
    console.error("Error al añadir columna 'read' a la tabla Notification:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al añadir columna 'read' a la tabla Notification",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
