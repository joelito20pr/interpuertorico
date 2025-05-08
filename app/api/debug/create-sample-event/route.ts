import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { addCorsHeaders, handleCors } from "@/lib/api-utils"
import { generateSlug } from "@/lib/utils"

export async function GET(request: Request) {
  // Handle CORS preflight
  const corsResponse = handleCors(request as any)
  if (corsResponse) return corsResponse

  try {
    // Check if Event table exists
    const tableCheck = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Event'
      ) as exists
    `

    if (!tableCheck[0]?.exists) {
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            error: "Event table does not exist",
            recommendation: "Run /api/repair-database to create required tables",
          },
          { status: 404 },
        ),
      )
    }

    // Create a sample event
    const title = "Evento de Prueba"
    const slug = await generateSlug(title)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const newEvent = await db`
      INSERT INTO "Event" (
        "title", 
        "description", 
        "date", 
        "location", 
        "maxParticipants", 
        "shareableSlug",
        "createdAt",
        "updatedAt"
      ) VALUES (
        ${title}, 
        ${"Este es un evento de prueba creado automáticamente para diagnosticar problemas."}, 
        ${tomorrow.toISOString()}, 
        ${"San Juan, Puerto Rico"}, 
        ${100}, 
        ${slug},
        ${new Date().toISOString()},
        ${new Date().toISOString()}
      ) RETURNING *
    `

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        message: "Sample event created successfully",
        event: newEvent[0],
      }),
    )
  } catch (error) {
    console.error("Error creating sample event:", error)
    return addCorsHeaders(
      NextResponse.json(
        {
          success: false,
          error: "Error creating sample event",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      ),
    )
  }
}
