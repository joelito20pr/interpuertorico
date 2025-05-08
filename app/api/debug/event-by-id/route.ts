import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { addCorsHeaders } from "@/lib/api-utils"

export async function GET(request: Request) {
  try {
    // Get the ID from the URL
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            error: "No ID provided",
            message: "Please provide an event ID as a query parameter: ?id=your_event_id",
          },
          { status: 400 },
        ),
      )
    }

    // Check database connection
    try {
      await db`SELECT 1`
    } catch (dbError) {
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            error: "Database connection failed",
            details: dbError instanceof Error ? dbError.message : String(dbError),
          },
          { status: 500 },
        ),
      )
    }

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

    // Try to get the event
    const event = await db`SELECT * FROM "Event" WHERE id = ${id}`

    if (!event || event.length === 0) {
      // If not found, list all available events to help debugging
      const allEvents = await db`SELECT id, title FROM "Event" LIMIT 10`

      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            error: `Event with ID ${id} not found`,
            availableEvents: allEvents,
            recommendation: "Check the ID or create a new event",
          },
          { status: 404 },
        ),
      )
    }

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        event: event[0],
      }),
    )
  } catch (error) {
    console.error("Error in event-by-id debug endpoint:", error)
    return addCorsHeaders(
      NextResponse.json(
        {
          success: false,
          error: "Error retrieving event",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      ),
    )
  }
}
