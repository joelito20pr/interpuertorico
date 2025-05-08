import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendFreeNotification } from "@/lib/free-notification-service"
import { handleCors, withCors } from "@/lib/api-utils"

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper function to check if a table exists
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      ) as exists
    `
    return result[0]?.exists || false
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

// Helper function to check if a column exists in a table
async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    const result = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
        AND column_name = ${columnName}
      ) as exists
    `
    return result[0]?.exists || false
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, error)
    return false
  }
}

export async function POST(request: NextRequest) {
  console.log("Registration endpoint called")

  // Handle CORS preflight requests
  const corsResponse = handleCors(request)
  if (corsResponse) {
    console.log("Handling CORS preflight request")
    return corsResponse
  }

  try {
    console.log("Processing registration request")

    // Parse request body
    let data
    try {
      data = await request.json()
      console.log("Registration data received:", JSON.stringify(data))
    } catch (error) {
      console.error("Error parsing request body:", error)
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "Error al procesar la solicitud: formato JSON inválido",
            error: error instanceof Error ? error.message : String(error),
          },
          { status: 400 },
        ),
      )
    }

    // Validate required fields
    if (!data.eventId || !data.name || !data.email) {
      console.error("Missing required fields:", {
        hasEventId: !!data.eventId,
        hasName: !!data.name,
        hasEmail: !!data.email,
      })
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "Se requieren los campos: ID del evento, nombre y correo electrónico",
            debug: {
              receivedData: {
                eventId: data.eventId || null,
                name: data.name || null,
                email: data.email || null,
              },
            },
          },
          { status: 400 },
        ),
      )
    }

    // Validate email format
    if (!isValidEmail(data.email)) {
      console.error("Invalid email format:", data.email)
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "El formato del correo electrónico no es válido",
          },
          { status: 400 },
        ),
      )
    }

    // Check if Event table exists
    const eventTableExists = await tableExists("Event")
    if (!eventTableExists) {
      console.error("Event table does not exist")
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "Error en la base de datos: la tabla de eventos no existe",
            debug: {
              missingTable: "Event",
              recommendation: "Visit /api/repair-database to create missing tables",
            },
          },
          { status: 500 },
        ),
      )
    }

    // Check if EventRegistration table exists
    const registrationTableExists = await tableExists("EventRegistration")
    if (!registrationTableExists) {
      console.error("EventRegistration table does not exist")
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "Error en la base de datos: la tabla de registros no existe",
            debug: {
              missingTable: "EventRegistration",
              recommendation: "Visit /api/repair-database to create missing tables",
            },
          },
          { status: 500 },
        ),
      )
    }

    // Check if event exists and is open for registration
    console.log("Checking if event exists:", data.eventId)
    const event = await db`
      SELECT id, title, date, location, "maxAttendees", "isPublic", "shareableSlug"
      FROM "Event"
      WHERE id = ${data.eventId}
    `

    if (event.length === 0) {
      console.error("Event not found:", data.eventId)
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "Evento no encontrado",
            debug: {
              requestedEventId: data.eventId,
            },
          },
          { status: 404 },
        ),
      )
    }

    const selectedEvent = event[0]
    console.log("Event found:", selectedEvent)

    // Check if event is public
    if (!selectedEvent.isPublic) {
      console.error("Attempted registration for private event:", data.eventId)
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "Este evento no está abierto para registro público",
            debug: {
              eventId: data.eventId,
              isPublic: selectedEvent.isPublic,
            },
          },
          { status: 403 },
        ),
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
        return withCors(
          NextResponse.json(
            {
              success: false,
              message: "El evento ha alcanzado el número máximo de participantes",
              debug: {
                eventId: data.eventId,
                maxAttendees: selectedEvent.maxAttendees,
                currentCount: currentAttendees[0].count,
              },
            },
            { status: 409 },
          ),
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
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "Este correo electrónico ya está registrado para este evento",
            debug: {
              eventId: data.eventId,
              email: data.email,
              registrationId: existingRegistration[0].id,
            },
          },
          { status: 409 },
        ),
      )
    }

    // Generate a unique ID for the registration
    const registrationId = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    // Check if the table has guardianName column before attempting to insert
    const hasGuardianNameColumn = await columnExists("EventRegistration", "guardianName")
    console.log("Has guardianName column:", hasGuardianNameColumn)

    // Insert registration data with conditional handling of guardianName
    try {
      if (hasGuardianNameColumn) {
        // If guardianName column exists
        console.log("Inserting registration with guardianName")
        await db`
          INSERT INTO "EventRegistration" (
            id, "eventId", name, email, phone, "guardianName", "registrationDate", status, "numberOfAttendees"
          ) VALUES (
            ${registrationId},
            ${data.eventId},
            ${data.name},
            ${data.email},
            ${data.phone || null},
            ${data.guardianName || null},
            NOW(),
            'REGISTERED',
            ${data.numberOfAttendees || 1}
          )
        `
      } else {
        // If guardianName column doesn't exist
        console.log("Inserting registration without guardianName")
        await db`
          INSERT INTO "EventRegistration" (
            id, "eventId", name, email, phone, "registrationDate", status, "numberOfAttendees"
          ) VALUES (
            ${registrationId},
            ${data.eventId},
            ${data.name},
            ${data.email},
            ${data.phone || null},
            NOW(),
            'REGISTERED',
            ${data.numberOfAttendees || 1}
          )
        `
      }
      console.log("Registration successful:", registrationId)
    } catch (error) {
      console.error("Error inserting registration:", error)
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "Error al guardar el registro",
            error: error instanceof Error ? error.message : String(error),
            debug: {
              registrationId,
              eventId: data.eventId,
              hasGuardianNameColumn,
            },
          },
          { status: 500 },
        ),
      )
    }

    // Send confirmation notification
    let notificationResult
    try {
      console.log("Sending confirmation notification")
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

    // At the end, wrap the response with CORS headers
    console.log("Returning success response")
    return withCors(
      NextResponse.json({
        success: true,
        message: "Registro completado con éxito",
        registrationId,
        notificationSent: notificationResult?.success || false,
        whatsappLink: notificationResult?.whatsappLink || null,
      }),
    )
  } catch (error) {
    console.error("Registration error:", error)
    return withCors(
      NextResponse.json(
        {
          success: false,
          message: "Error en el proceso de registro",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      ),
    )
  }
}

// Add OPTIONS method handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  console.log("OPTIONS request received for registration endpoint")
  return handleCors(request) || new NextResponse(null, { status: 200 })
}
