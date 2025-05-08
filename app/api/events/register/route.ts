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
    console.log("Registration data received:", registrationData)

    // Validate required fields
    if (!registrationData.eventId || !registrationData.name || !registrationData.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          details: {
            eventId: !registrationData.eventId ? "Missing eventId" : null,
            name: !registrationData.name ? "Missing name" : null,
            email: !registrationData.email ? "Missing email" : null,
          },
        },
        { status: 400 },
      )
    }

    // Check if the event exists and is available for registration
    let event
    try {
      event = await db`
        SELECT * FROM "Event" WHERE id = ${registrationData.eventId}
      `
      console.log("Event found:", event)
    } catch (error) {
      console.error("Error fetching event:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Error fetching event",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

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
      let registrationsCount
      try {
        registrationsCount = await db`
          SELECT COUNT(*) as count FROM "EventRegistration" WHERE "eventId" = ${registrationData.eventId}
        `
        console.log("Registrations count:", registrationsCount)
      } catch (error) {
        console.error("Error counting registrations:", error)
        return NextResponse.json(
          {
            success: false,
            error: "Error counting registrations",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 },
        )
      }

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

    // Create the registration - using a simplified approach first
    const id = `reg_${Date.now()}`
    let result

    try {
      // First, check if guardianName column exists
      const columnCheck = await db`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'EventRegistration' 
        AND column_name = 'guardianName'
      `

      const hasGuardianNameColumn = columnCheck.length > 0
      console.log("Has guardianName column:", hasGuardianNameColumn)

      if (hasGuardianNameColumn) {
        // Use the column if it exists
        result = await db`
          INSERT INTO "EventRegistration" (
            id, "eventId", name, "guardianName", email, phone, "numberOfAttendees", "paymentStatus", "createdAt", "updatedAt"
          ) VALUES (
            ${id}, 
            ${registrationData.eventId}, 
            ${registrationData.name}, 
            ${registrationData.guardianName || null},
            ${registrationData.email}, 
            ${registrationData.phone || null},
            ${registrationData.numberOfAttendees || 1},
            ${event[0].requiresPayment ? "PENDING" : "CONFIRMED"},
            NOW(), 
            NOW()
          )
          RETURNING *
        `
      } else {
        // Fall back to the original schema without guardianName
        result = await db`
          INSERT INTO "EventRegistration" (
            id, "eventId", name, email, phone, "numberOfAttendees", "paymentStatus", "createdAt", "updatedAt"
          ) VALUES (
            ${id}, 
            ${registrationData.eventId}, 
            ${registrationData.name}, 
            ${registrationData.email}, 
            ${registrationData.phone || null},
            ${registrationData.numberOfAttendees || 1},
            ${event[0].requiresPayment ? "PENDING" : "CONFIRMED"},
            NOW(), 
            NOW()
          )
          RETURNING *
        `
      }

      console.log("Registration created:", result)
    } catch (error) {
      console.error("Error inserting registration:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Error inserting registration",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

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
