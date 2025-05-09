import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id

    // Verificar si la tabla tiene la columna confirmationStatus
    let hasConfirmationStatus = true
    try {
      await db`SELECT "confirmationStatus" FROM "EventRegistration" LIMIT 1`
    } catch (error) {
      console.log("La tabla no tiene la columna confirmationStatus:", error)
      hasConfirmationStatus = false
    }

    // Obtener registros para un evento específico
    let registrations
    if (hasConfirmationStatus) {
      registrations = await db`
        SELECT 
          er.id, 
          er."eventId", 
          er.name, 
          er.email, 
          er.phone, 
          er."guardianName",
          er."numberOfAttendees",
          er."confirmationStatus",
          er."paymentStatus",
          er."createdAt",
          er."updatedAt"
        FROM "EventRegistration" er
        WHERE er."eventId" = ${eventId}
        ORDER BY er."createdAt" DESC
      `
    } else {
      registrations = await db`
        SELECT 
          er.id, 
          er."eventId", 
          er.name, 
          er.email, 
          er.phone, 
          er."guardianName",
          er."numberOfAttendees",
          er."paymentStatus",
          er."createdAt",
          er."updatedAt"
        FROM "EventRegistration" er
        WHERE er."eventId" = ${eventId}
        ORDER BY er."createdAt" DESC
      `
    }

    // Procesar los registros para asegurar que tengan un estado de confirmación
    const processedRegistrations = registrations.map((reg) => {
      // Si tiene confirmationStatus, usarlo; si no, usar paymentStatus
      const confirmationStatus = reg.confirmationStatus || reg.paymentStatus || "PENDING"
      return {
        ...reg,
        confirmationStatus,
      }
    })

    // Obtener detalles del evento
    const event = await db`
      SELECT 
        id, 
        title, 
        date, 
        location, 
        "maxAttendees", 
        "shareableSlug"
      FROM "Event"
      WHERE id = ${eventId}
    `

    if (event.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        event: event[0],
        registrations: processedRegistrations,
        totalRegistrations: processedRegistrations.length,
      },
    })
  } catch (error) {
    console.error("Error fetching event registrations:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching event registrations",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
