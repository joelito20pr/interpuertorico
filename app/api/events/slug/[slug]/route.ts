import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { handleCors, withCors } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  // Handle CORS preflight requests
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  try {
    const { slug } = params

    if (!slug) {
      return withCors(NextResponse.json({ success: false, message: "Slug no proporcionado" }, { status: 400 }))
    }

    console.log(`Fetching event with slug: ${slug}`)

    // Check if the Event table exists
    const tableExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Event'
      ) as exists
    `

    if (!tableExists || !tableExists[0]?.exists) {
      console.error("Event table does not exist")
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "La tabla de eventos no existe",
            error: "Database schema error",
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
      console.error("shareableSlug column does not exist in Event table")
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "La columna de slug no existe en la tabla de eventos",
            error: "Database schema error",
          },
          { status: 500 },
        ),
      )
    }

    // Try to find the event by slug
    const event = await db`
      SELECT e.*, 
        (SELECT COUNT(*) FROM "EventRegistration" er WHERE er."eventId" = e.id) as "registrationsCount"
      FROM "Event" e
      WHERE e."shareableSlug" = ${slug}
    `

    if (!event || event.length === 0) {
      console.error(`No event found with slug: ${slug}`)

      // List all available slugs for debugging
      const allSlugs = await db`
        SELECT "shareableSlug" FROM "Event" 
        WHERE "shareableSlug" IS NOT NULL
        LIMIT 10
      `

      console.log(
        "Available slugs:",
        allSlugs.map((e) => e.shareableSlug),
      )

      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "Evento no encontrado",
            debug: {
              requestedSlug: slug,
              availableSlugs: allSlugs.map((e) => e.shareableSlug),
            },
          },
          { status: 404 },
        ),
      )
    }

    console.log(`Found event with slug ${slug}:`, event[0])

    return withCors(
      NextResponse.json({
        success: true,
        data: event[0],
      }),
    )
  } catch (error) {
    console.error("Error fetching event by slug:", error)
    return withCors(
      NextResponse.json(
        {
          success: false,
          message: "Error al obtener el evento",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      ),
    )
  }
}

// Add OPTIONS method handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
}
