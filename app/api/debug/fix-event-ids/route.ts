import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    // Check if Event table exists
    const tableCheck = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Event'
      ) as exists
    `

    const tableExists = tableCheck[0]?.exists || false

    if (!tableExists) {
      return NextResponse.json(
        {
          success: false,
          error: "Event table does not exist",
          suggestion: "Visit /api/repair-database to create the necessary tables",
        },
        { status: 404 },
      )
    }

    // Check for events with invalid IDs
    const events = await db`SELECT id FROM "Event"`

    const results = {
      success: true,
      eventsChecked: events.length,
      eventsFixed: 0,
      operations: [] as { id: string; action: string; success: boolean }[],
    }

    // If there are no events, create a sample event
    if (events.length === 0) {
      const newId = uuidv4()
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Generate a slug
      const slug = `evento-ejemplo-${Math.floor(Math.random() * 10000)}`

      await db`
        INSERT INTO "Event" (
          id, title, description, date, location, "shareableSlug", "createdAt", "updatedAt"
        ) VALUES (
          ${newId}, 
          'Evento de Ejemplo', 
          'Este es un evento de ejemplo creado automáticamente para probar el sistema.', 
          ${tomorrow}, 
          'San Juan, Puerto Rico', 
          ${slug}, 
          ${now}, 
          ${now}
        )
      `

      results.operations.push({
        id: newId,
        action: "Created sample event",
        success: true,
      })

      results.eventsFixed++
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fixing event IDs:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error fixing event IDs",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
