import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendFreeNotification } from "@/lib/free-notification-service"

export async function POST(request: NextRequest) {
  try {
    console.log("Processing registration request")
    const data = await request.json()

    // Log registration attempt
    console.log("Registration data:", JSON.stringify(data))

    // Validate required fields
    if (!data.eventId || !data.name || !data.email) {
      console.error("Missing required fields:", {
        hasEventId: !!data.eventId,
        hasName: !!data.name,
        hasEmail: !!data.email,
      })
      return NextResponse.json(
        {
          success: false,
          message: "Se requieren los campos: ID del evento, nombre y correo electrónico",
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      console.error("Invalid email format:", data.email)
      return NextResponse.json(
        {
          success: false,
          message: "El formato del correo electrónico no es válido",
        },
        { status: 400 },
      )
    }

    // Check if event exists and is open for registration
    const event = await db`
      SELECT id, title, date, location, "maxAttendees", "isPublic", "shareableSlug"
      FROM "Event"
      WHERE id = ${data.eventId}
    `

    if (event.length === 0) {
      console.error("Event not found:", data.eventId)
      return NextResponse.json(
        {
          success: false,
          message: "Evento no encontrado",
        },
        { status: 404 },
      )
    }

    const selectedEvent = event[0]

    // Check if event is public
    if (!selectedEvent.isPublic) {
      console.error("Attempted registration for private event:", data.eventId)
      return NextResponse.json(
        {
          success: false,
          message: "Este evento no está abierto para registro público",
        },
        { status: 403 },
      )
    }

    // Check if event has reached max attendees
    if (selectedEvent.maxAttendees) {
      const currentAttendees = await db`
        SELECT COUNT(*) as count
        FROM "EventRegistration"
        WHERE "eventId" = ${data.eventId}
      `

      if (currentAttendees[0].count >= selectedEvent.maxAttendees) {
        console.error("Event has reached maximum attendees:", {
          eventId: data.eventId,
          maxAttendees: selectedEvent.maxAttendees,
          currentCount: currentAttendees[0].count,
        })
        return NextResponse.json(
          {
            success: false,
            message: "El evento ha alcanzado el número máximo de participantes",
          },
          { status: 409 },
        )
      }
    }

    // Check if this email is already registered for this event
    const existingRegistration = await db`
      SELECT id
      FROM "EventRegistration"
      WHERE "eventId" = ${data.eventId}
      AND email = ${data.email}
    `

    if (existingRegistration.length > 0) {
      console.error("Email already registered for this event:", {
        eventId: data.eventId,
        email: data.email,
      })
      return NextResponse.json(
        {
          success: false,
          message: "Este correo electrónico ya está registrado para este evento",
        },
        { status: 409 },
      )
    }

    // Generate a unique ID for the registration
    const registrationId = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    // Check if the table has guardianName column before attempting to insert
    const hasGuardianNameColumn = await db`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'EventRegistration'
      AND column_name = 'guardianName'
    `.catch((e) => {
      console.error("Error checking guardianName column:", e)
      return []
    })

    // Insert registration data with conditional handling of guardianName
    try {
      if (hasGuardianNameColumn.length > 0) {
        // If guardianName column exists
        await db`
          INSERT INTO "EventRegistration" (
            id, "eventId", name, email, phone, "guardianName", "registrationDate", status
          ) VALUES (
            ${registrationId},
            ${data.eventId},
            ${data.name},
            ${data.email},
            ${data.phone || null},
            ${data.guardianName || null},
            NOW(),
            'REGISTERED'
          )
        `
      } else {
        // If guardianName column doesn't exist
        await db`
          INSERT INTO "EventRegistration" (
            id, "eventId", name, email, phone, "registrationDate", status
          ) VALUES (
            ${registrationId},
            ${data.eventId},
            ${data.name},
            ${data.email},
            ${data.phone || null},
            NOW(),
            'REGISTERED'
          )
        `
      }
      console.log("Registration successful:", registrationId)
    } catch (error) {
      console.error("Error inserting registration:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error al guardar el registro",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

    // Send confirmation notification
    let notificationResult
    try {
      notificationResult = await sendFreeNotification(
        "registration",
        {
          name: data.name,
          guardianName: data.guardianName,
          email: data.email,
          phone: data.phone,
        },
        {
          id: selectedEvent.id,
          title: selectedEvent.title,
          date: selectedEvent.date,
          location: selectedEvent.location,
          slug: selectedEvent.shareableSlug,
        },
      )
      console.log("Notification sent:", notificationResult)
    } catch (error) {
      console.error("Error sending notification:", error)
      // Continue even if notification fails
      notificationResult = { success: false, error: String(error) }
    }

    return NextResponse.json({
      success: true,
      message: "Registro completado con éxito",
      registrationId,
      notificationSent: notificationResult?.success || false,
      whatsappLink: notificationResult?.whatsappLink || null,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error en el proceso de registro",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
