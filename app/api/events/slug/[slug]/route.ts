// Add CORS headers to the slug endpoint
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

    const event = await db`
      SELECT id, title, description, date, location, "maxAttendees", "isPublic", "shareableSlug"
      FROM "Event"
      WHERE "shareableSlug" = ${slug} AND "isPublic" = true
    `

    if (!event || event.length === 0) {
      return withCors(NextResponse.json({ success: false, message: "Evento no encontrado" }, { status: 404 }))
    }

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
