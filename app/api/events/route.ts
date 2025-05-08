import { NextResponse } from "next/server"
import { db, testDatabaseConnection } from "@/lib/db"

export async function GET() {
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

    // Get all events
    const events = await db`
      SELECT * FROM "Event"
      ORDER BY date DESC
    `

    return NextResponse.json({
      success: true,
      data: events || [],
    })
  } catch (error) {
    console.error("Error getting events:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error loading events",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

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
    const eventData = await request.json()

    // Validate required fields
    if (!eventData.title || !eventData.date || !eventData.location) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Create the event
    const id = `event_${Date.now()}`
    const result = await db`
      INSERT INTO "Event" (
        id, title, description, date, location, 
        "requiresPayment", price, "stripeLink", "shareableSlug", "maxAttendees", "createdAt", "updatedAt"
      ) VALUES (
        ${id}, 
        ${eventData.title}, 
        ${eventData.description || null}, 
        ${new Date(eventData.date)}, 
        ${eventData.location},
        ${eventData.requiresPayment || false}, 
        ${eventData.price || null}, 
        ${eventData.stripeLink || null},
        ${eventData.shareableSlug || null},
        ${eventData.maxAttendees || null},
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
    console.error("Error creating event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error creating event",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
