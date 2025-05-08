import { NextResponse } from "next/server"
import { db, testDatabaseConnection } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import { corsHeaders, handleCors } from "@/lib/api-utils"

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function GET(request: Request) {
  // Handle CORS preflight
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  try {
    console.log("Fetching all events")

    // Test database connection
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      console.error("Database connection failed:", connectionTest.error)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionTest.error,
        },
        { status: 500, headers: corsHeaders },
      )
    }

    // Check if Event table exists
    try {
      const tableCheck = await db`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'Event'
        ) as exists
      `

      const tableExists = tableCheck[0]?.exists || false

      if (!tableExists) {
        console.error("Event table does not exist")
        return NextResponse.json(
          {
            success: false,
            error: "Event table does not exist",
            suggestion: "Visit /api/repair-database to create the necessary tables",
          },
          { status: 404, headers: corsHeaders },
        )
      }
    } catch (error) {
      console.error("Error checking Event table:", error)
    }

    // Get all events with registration counts
    const events = await db`
      SELECT e.*, 
        (SELECT COUNT(*) FROM "EventRegistration" er WHERE er."eventId" = e.id) as "registrationCount"
      FROM "Event" e
      ORDER BY e.date DESC
    `

    console.log(`Successfully fetched ${events.length} events`)
    return NextResponse.json(
      {
        success: true,
        data: events,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching events",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function POST(request: Request) {
  // Handle CORS preflight
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  try {
    // Test database connection
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      console.error("Database connection failed:", connectionTest.error)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionTest.error,
        },
        { status: 500, headers: corsHeaders },
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
        { status: 400, headers: corsHeaders },
      )
    }

    // Generate a unique ID
    const id = uuidv4()

    // Generate a slug from the title if not provided
    let shareableSlug = eventData.shareableSlug
    if (!shareableSlug && eventData.isPublic) {
      const baseSlug = eventData.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")

      // Add a random suffix to ensure uniqueness
      const randomSuffix = Math.floor(Math.random() * 10000)
      shareableSlug = `${baseSlug}-${randomSuffix}`
    }

    // Create the event
    const result = await db`
      INSERT INTO "Event" (
        id, 
        title, 
        description, 
        date, 
        location, 
        "requiresPayment", 
        price, 
        "stripeLink", 
        "shareableSlug", 
        "maxAttendees", 
        "createdAt", 
        "updatedAt"
      ) VALUES (
        ${id}, 
        ${eventData.title}, 
        ${eventData.description || null}, 
        ${new Date(eventData.date)}, 
        ${eventData.location}, 
        ${eventData.requiresPayment || false}, 
        ${eventData.price || null}, 
        ${eventData.stripeLink || null}, 
        ${shareableSlug || null}, 
        ${eventData.maxAttendees || null}, 
        NOW(), 
        NOW()
      ) RETURNING *
    `

    console.log("Event created successfully:", result[0])
    return NextResponse.json(
      {
        success: true,
        data: result[0],
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error creating event",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders },
    )
  }
}
