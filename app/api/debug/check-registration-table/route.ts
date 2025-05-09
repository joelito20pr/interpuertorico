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

    if (!tableExists[0].exists) {
      return NextResponse.json({
        success: false,
        message: "La tabla EventRegistration no existe",
        action: "Visita /api/repair-database para crear la tabla",
      })
    }

    // Obtener las columnas de la tabla
    const columns = await db`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'EventRegistration'
    `

    // Verificar si existen las columnas necesarias
    const requiredColumns = [
      "id",
      "eventId",
      "name",
      "email",
      "phone",
      "numberOfAttendees",
      "confirmationStatus",
      "createdAt",
      "updatedAt",
    ]

    const missingColumns = requiredColumns.filter((col) => !columns.some((c) => c.column_name === col))

    // Obtener algunos registros de ejemplo
    const sampleRegistrations = await db`
      SELECT * FROM "EventRegistration" LIMIT 5
    `

    return NextResponse.json({
      success: true,
      data: {
        tableExists: tableExists[0].exists,
        columns,
        missingColumns,
        sampleRegistrations,
      },
    })
  } catch (error) {
    console.error("Error al verificar la tabla de registros:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al verificar la tabla de registros",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
