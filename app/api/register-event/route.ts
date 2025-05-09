import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  console.log("New registration endpoint called")

  try {
    // Parse request body
    const body = await request.json()
    console.log("Registration data:", body)

    // Validate required fields
    if (!body.eventId || !body.name || !body.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: eventId, name, email",
        },
        { status: 400 },
      )
    }

    // Check if event exists
    const event = await db`
      SELECT * FROM "Event" WHERE id = ${body.eventId}
    `

    if (!event || event.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found",
          eventId: body.eventId,
        },
        { status: 404 },
      )
    }

    // Generate registration ID
    const registrationId = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    // Insert registration using the correct column names
    await db`
      INSERT INTO "EventRegistration" (
        id, "eventId", name, email, phone, "guardianName", "createdAt", "updatedAt", "numberOfAttendees", "paymentStatus"
      ) VALUES (
        ${registrationId},
        ${body.eventId},
        ${body.name},
        ${body.email},
        ${body.phone || null},
        ${body.guardianName || null},
        NOW(),
        NOW(),
        ${body.numberOfAttendees || 1},
        'PENDING'
      )
    `

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      registrationId: registrationId,
    })
  } catch (error) {
    console.error("Error in registration:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Registration failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
