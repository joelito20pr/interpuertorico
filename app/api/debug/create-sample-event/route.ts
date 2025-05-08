import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { addCorsHeaders } from "@/lib/api-utils"

export async function GET(request: Request) {
  try {
    // Check if Event table exists
    const tableCheck = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Event'
      ) as exists
    `

    if (!tableCheck[0]?.exists) {
      // Create Event table if it doesn't exist
      await db`
        CREATE TABLE IF NOT EXISTS "Event" (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          date TIMESTAMP NOT NULL,
          location TEXT NOT NULL,
          "requiresPayment" BOOLEAN DEFAULT false,
          price TEXT,
          "stripeLink" TEXT,
          "shareableSlug" TEXT,
          "maxAttendees" INTEGER,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        )
      `
    }

    // Create a sample event
    const eventId = `event_${Date.now()}`
    const eventTitle = "Evento de Prueba"
    const eventDate = new Date()
    eventDate.setDate(eventDate.getDate() + 7) // Set date to 7 days from now

    const slug = `evento-de-prueba-${Math.floor(Math.random() * 10000)}`

    const result = await db`
      INSERT INTO "Event" (
        id, 
        title, 
        description, 
        date, 
        location, 
        "requiresPayment", 
        "shareableSlug",
        "createdAt", 
        "updatedAt"
      ) VALUES (
        ${eventId}, 
        ${eventTitle}, 
        ${"Este es un evento de prueba creado para diagnóstico."}, 
        ${eventDate}, 
        ${"San Juan, Puerto Rico"}, 
        ${false}, 
        ${slug},
        ${new Date()}, 
        ${new Date()}
      )
      RETURNING *
    `

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        message: "Sample event created successfully",
        event: result[0],
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
