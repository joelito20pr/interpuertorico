import { NextResponse } from "next/server"
import { db, testDatabaseConnection } from "@/lib/db"

export async function POST(request: Request) {
  try {
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

    // Parse the request body
    const registrationData = await request.json()

    // Validate required fields
    if (!registrationData.eventId || !registrationData.name || !registrationData.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Check if the event exists and is available for registration
    const event = await db`
      SELECT * FROM "Event" WHERE id = ${registrationData.eventId}
    `

    if (!event || event.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 },
      )
    }

    // Check if the event has a shareable slug (is public)
    if (!event[0].shareableSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "This event is not open for public registration",
        },
        { status: 403 },
      )
    }

    // Check if the event has reached its maximum capacity
    if (event[0].maxAttendees) {
      const registrationsCount = await db`
        SELECT COUNT(*) as count FROM "EventRegistration" WHERE "eventId" = ${registrationData.eventId}
      `

      const count = Number.parseInt(registrationsCount[0]?.count || "0")
      const numberOfAttendees = registrationData.numberOfAttendees || 1

      if (count + numberOfAttendees > event[0].maxAttendees) {
        return NextResponse.json(
          {
            success: false,
            error: "Event has reached maximum capacity",
          },
          { status: 400 },
        )
      }
    }

    // Create the registration
    const id = `reg_${Date.now()}`
    const result = await db`
      INSERT INTO "EventRegistration" (
        id, "eventId", name, email, phone, "numberOfAttendees", "paymentStatus", "paymentReference", "createdAt", "updatedAt"
      ) VALUES (
        ${id}, 
        ${registrationData.eventId}, 
        ${registrationData.name}, 
        ${registrationData.email}, 
        ${registrationData.phone || null},
        ${registrationData.numberOfAttendees || 1},
        ${event[0].requiresPayment ? "PENDING" : "CONFIRMED"},
        ${registrationData.paymentReference || null},
        NOW(), 
        NOW()
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("Error registering for event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error registering for event",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
