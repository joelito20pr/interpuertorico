import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Verificar si la tabla Notification existe
    const tableExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Notification'
      ) as exists
    `

    if (!tableExists[0].exists) {
      // Crear la tabla Notification si no existe
      await db`
        CREATE TABLE "Notification" (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          recipient TEXT,
          "recipientEmail" TEXT NOT NULL,
          message TEXT NOT NULL,
          "eventId" TEXT,
          status TEXT NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          FOREIGN KEY ("eventId") REFERENCES "Event"(id) ON DELETE CASCADE
        )
      `

      console.log("Tabla Notification creada correctamente")
    } else {
      console.log("La tabla Notification ya existe")
    }

    // Verificar si la columna guardianName existe en EventRegistration
    const guardianNameExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'EventRegistration' AND column_name = 'guardianName'
      ) as exists
    `

    if (!guardianNameExists[0].exists) {
      // Añadir la columna guardianName a EventRegistration
      await db`
        ALTER TABLE "EventRegistration" 
        ADD COLUMN "guardianName" TEXT
      `

      console.log("Columna guardianName añadida a EventRegistration")
    } else {
      console.log("La columna guardianName ya existe en EventRegistration")
    }

    return NextResponse.json({
      success: true,
      message: "Esquema de notificaciones actualizado correctamente",
    })
  } catch (error) {
    console.error("Error updating notification schema:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar el esquema de notificaciones",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
