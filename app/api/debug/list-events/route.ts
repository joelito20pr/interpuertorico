import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { addCorsHeaders, handleCors } from "@/lib/api-utils"

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

    // Get all events
    const events = await db`
      SELECT * FROM "Event" 
      ORDER BY "date" DESC
    `

    // Count registrations for each event
    const eventsWithRegistrations = await Promise.all(
      events.map(async (event) => {
        try {
          const registrations = await db`
            SELECT COUNT(*) as count 
            FROM "EventRegistration" 
            WHERE "eventId" = ${event.id}
          `

          return {
            ...event,
            registrationCount: Number.parseInt(registrations[0]?.count || "0"),
          }
        } catch (error) {
          console.error(`Error counting registrations for event ${event.id}:`, error)
          return {
            ...event,
            registrationCount: 0,
            error: "Failed to count registrations",
          }
        }
      }),
    )

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        count: events.length,
        events: eventsWithRegistrations,
      }),
    )
  } catch (error) {
    console.error("Error listing events:", error)
    return addCorsHeaders(
      NextResponse.json(
        {
          success: false,
          error: "Error listing events",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      ),
    )
  }
}
