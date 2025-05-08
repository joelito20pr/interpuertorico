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
      console.error("Database connection failed:", connectionTest.error)
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
    console.log("Received event data:", JSON.stringify(eventData, null, 2))

    // Validate required fields
    if (!eventData.title || !eventData.date || !eventData.location) {
      console.error("Missing required fields:", {
        title: !!eventData.title,
        date: !!eventData.date,
        location: !!eventData.location,
      })
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Ensure date is properly formatted
    let eventDate
    try {
      eventDate = new Date(eventData.date)
      if (isNaN(eventDate.getTime())) {
        throw new Error("Invalid date format")
      }
    } catch (error) {
      console.error("Invalid date format:", eventData.date, error)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date format",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 400 },
      )
    }

    // Create the event
    const id = `event_${Date.now()}`

    try {
      console.log("Inserting event with data:", {
        id,
        title: eventData.title,
        description: eventData.description || null,
        date: eventDate,
        location: eventData.location,
        requiresPayment: eventData.requiresPayment || false,
        price: eventData.price || null,
        stripeLink: eventData.stripeLink || null,
        shareableSlug: eventData.shareableSlug || null,
        maxAttendees: eventData.maxAttendees || null,
      })

      const result = await db`
        INSERT INTO "Event" (
          id, title, description, date, location, 
          "requiresPayment", price, "stripeLink", "shareableSlug", "maxAttendees", "createdAt", "updatedAt"
        ) VALUES (
          ${id}, 
          ${eventData.title}, 
          ${eventData.description || null}, 
          ${eventDate}, 
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

      console.log("Event created successfully:", result[0])

      return NextResponse.json({
        success: true,
        data: result[0],
      })
    } catch (dbError) {
      console.error("Database error creating event:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Error creating event in database",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }
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
