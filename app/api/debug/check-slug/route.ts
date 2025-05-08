import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { withCors } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    // Get the slug from the query parameters
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get("slug")

    if (!slug) {
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "No slug provided",
            help: "Add a slug parameter to the URL, e.g., /api/debug/check-slug?slug=your-slug",
          },
          { status: 400 },
        ),
      )
    }

    console.log(`Checking slug: ${slug}`)

    // Check if the Event table exists
    const tableExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Event'
      ) as exists
    `

    if (!tableExists || !tableExists[0]?.exists) {
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "Event table does not exist",
            recommendation: "Visit /api/repair-database to create the necessary tables",
          },
          { status: 500 },
        ),
      )
    }

    // Check if the shareableSlug column exists
    const columnExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'Event' AND column_name = 'shareableSlug'
      ) as exists
    `

    if (!columnExists || !columnExists[0]?.exists) {
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "shareableSlug column does not exist in Event table",
            recommendation: "Visit /api/update-event-schema to add the shareableSlug column",
          },
          { status: 500 },
        ),
      )
    }

    // Try to find the event by slug
    const event = await db`
      SELECT * FROM "Event" WHERE "shareableSlug" = ${slug}
    `

    if (!event || event.length === 0) {
      // If no event is found, list all available slugs
      const allSlugs = await db`
        SELECT id, title, "shareableSlug" FROM "Event" 
        WHERE "shareableSlug" IS NOT NULL
        ORDER BY "createdAt" DESC
      `

      return withCors(
        NextResponse.json(
          {
            success: false,
            message: `No event found with slug: ${slug}`,
            availableSlugs: allSlugs || [],
            recommendation: "Try one of the available slugs listed above",
          },
          { status: 404 },
        ),
      )
    }

    // Event found
    return withCors(
      NextResponse.json({
        success: true,
        message: `Event found with slug: ${slug}`,
        event: event[0],
      }),
    )
  } catch (error) {
    console.error("Error checking slug:", error)
    return withCors(
      NextResponse.json(
        {
          success: false,
          message: "Error checking slug",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      ),
    )
  }
}
