import { NextResponse } from "next/server"
import { db, testDatabaseConnection } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug

    // First test the database connection
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionTest.error,
        },
        { status: 500 },
      )
    }

    // Get the event by slug
    const result = await db`
      SELECT * FROM "Event" WHERE "shareableSlug" = ${slug}
    `

    if (!result || result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 },
      )
    }

    // Get current registrations count
    const registrationsCount = await db`
      SELECT COUNT(*) as count FROM "EventRegistration" WHERE "eventId" = ${result[0].id}
    `

    const count = Number.parseInt(registrationsCount[0]?.count || "0")
    const event = result[0]

    // Add registration count and availability to the event data
    const eventWithRegistrations = {
      ...event,
      registrationsCount: count,
      isAvailable: event.maxAttendees ? count < event.maxAttendees : true,
      remainingSpots: event.maxAttendees ? event.maxAttendees - count : null,
    }

    return NextResponse.json({
      success: true,
      data: eventWithRegistrations,
    })
  } catch (error) {
    console.error("Error getting event by slug:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error getting event",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
