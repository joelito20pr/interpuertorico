import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Get all events with their slugs
    const events = await db`
      SELECT id, title, "shareableSlug", "isPublic" FROM "Event"
      ORDER BY date DESC
    `

    return NextResponse.json({
      success: true,
      events: events || [],
    })
  } catch (error) {
    console.error("Error getting event slugs:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error getting event slugs",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
