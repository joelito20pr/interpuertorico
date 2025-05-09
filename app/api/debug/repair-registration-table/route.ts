import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Verificar si la tabla EventRegistration existe
    const tableExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'EventRegistration'
      ) as exists
    `

    const actions = []

    // Si la tabla no existe, crearla
    if (!tableExists[0].exists) {
      await db`
        CREATE TABLE "EventRegistration" (
          id TEXT PRIMARY KEY,
          "eventId" TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          "numberOfAttendees" INTEGER DEFAULT 1,
          "paymentStatus" TEXT,
          "paymentReference" TEXT,
          "guardianName" TEXT,
          "confirmationStatus" TEXT DEFAULT 'PENDING',
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
      actions.push("Tabla EventRegistration creada")
    } else {
      // Verificar si existen las columnas necesarias
      const columns = await db`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'EventRegistration'
      `

      const columnNames = columns.map((c) => c.column_name)

      // Verificar y añadir columna confirmationStatus si no existe
      if (!columnNames.includes("confirmationStatus")) {
        await db`
          ALTER TABLE "EventRegistration" 
          ADD COLUMN "confirmationStatus" TEXT DEFAULT 'PENDING'
        `
        actions.push("Columna confirmationStatus añadida")
      }

      // Verificar y añadir columna guardianName si no existe
      if (!columnNames.includes("guardianName")) {
        await db`
          ALTER TABLE "EventRegistration" 
          ADD COLUMN "guardianName" TEXT
        `
        actions.push("Columna guardianName añadida")
      }

      // Verificar y añadir columna numberOfAttendees si no existe
      if (!columnNames.includes("numberOfAttendees")) {
        await db`
          ALTER TABLE "EventRegistration" 
          ADD COLUMN "numberOfAttendees" INTEGER DEFAULT 1
        `
        actions.push("Columna numberOfAttendees añadida")
      }

      // Verificar y añadir columna updatedAt si no existe
      if (!columnNames.includes("updatedAt")) {
        await db`
          ALTER TABLE "EventRegistration" 
          ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        `
        actions.push("Columna updatedAt añadida")
      }

      // Si no se realizaron acciones, la tabla ya está correcta
      if (actions.length === 0) {
        actions.push("La tabla EventRegistration ya tiene la estructura correcta")
      }
    }

    // Obtener las columnas actualizadas
    const updatedColumns = await db`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'EventRegistration'
    `

    return NextResponse.json({
      success: true,
      message: "Verificación y reparación de la tabla EventRegistration completada",
      actions,
      columns: updatedColumns,
    })
  } catch (error) {
    console.error("Error al reparar la tabla de registros:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al reparar la tabla de registros",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
