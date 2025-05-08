import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { addCorsHeaders, handleCors } from "@/lib/api-utils"
import { sendEventRegistrationEmail } from "@/lib/free-notification-service"

export async function POST(request: NextRequest) {
  // Handle CORS preflight request
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  console.log("Procesando solicitud de registro de evento...")

  try {
    // Verificar conexión a la base de datos
    try {
      console.log("Verificando conexión a la base de datos...")
      await sql`SELECT NOW()`
      console.log("Conexión a la base de datos exitosa")
    } catch (dbError: any) {
      console.error("Error de conexión a la base de datos:", dbError)
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            message: "Error de conexión a la base de datos",
            error: dbError.message,
            step: "database_connection",
          },
          { status: 500 },
        ),
      )
    }

    // Verificar si la tabla EventRegistration existe
    try {
      console.log("Verificando si la tabla EventRegistration existe...")
      const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'eventregistration'
        );
      `

      if (!tableExists.rows[0].exists) {
        console.error("La tabla EventRegistration no existe")
        return addCorsHeaders(
          NextResponse.json(
            {
              success: false,
              message: "La tabla de registros no existe. Por favor, ejecute la reparación de la base de datos primero.",
              error: "Table not found",
              step: "table_check",
              repairUrl: "/api/debug/database-repair",
            },
            { status: 500 },
          ),
        )
      }
      console.log("Tabla EventRegistration encontrada")
    } catch (tableError: any) {
      console.error("Error al verificar la tabla EventRegistration:", tableError)
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            message: "Error al verificar la tabla de registros",
            error: tableError.message,
            step: "table_check",
          },
          { status: 500 },
        ),
      )
    }

    // Parsear el cuerpo de la solicitud
    let body
    try {
      console.log("Parseando cuerpo de la solicitud...")
      body = await request.json()
      console.log("Datos recibidos:", JSON.stringify(body))
    } catch (parseError: any) {
      console.error("Error al parsear el cuerpo de la solicitud:", parseError)
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            message: "Error al parsear el cuerpo de la solicitud",
            error: parseError.message,
            step: "request_parsing",
          },
          { status: 400 },
        ),
      )
    }

    // Validar datos requeridos
    if (!body.eventId || !body.name || !body.email) {
      console.error("Datos requeridos faltantes:", {
        hasEventId: !!body.eventId,
        hasName: !!body.name,
        hasEmail: !!body.email,
      })
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            message: "Faltan datos requeridos (eventId, name, email)",
            error: "Missing required fields",
            step: "data_validation",
            receivedData: {
              hasEventId: !!body.eventId,
              hasName: !!body.name,
              hasEmail: !!body.email,
            },
          },
          { status: 400 },
        ),
      )
    }

    // Verificar si el evento existe
    try {
      console.log(`Verificando si el evento ${body.eventId} existe...`)
      const eventExists = await sql`
        SELECT EXISTS (
          SELECT 1 FROM events WHERE id = ${body.eventId}
        );
      `

      if (!eventExists.rows[0].exists) {
        console.error(`El evento con ID ${body.eventId} no existe`)
        return addCorsHeaders(
          NextResponse.json(
            {
              success: false,
              message: `El evento con ID ${body.eventId} no existe`,
              error: "Event not found",
              step: "event_check",
            },
            { status: 404 },
          ),
        )
      }
      console.log(`Evento ${body.eventId} encontrado`)
    } catch (eventError: any) {
      console.error("Error al verificar el evento:", eventError)
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            message: "Error al verificar el evento",
            error: eventError.message,
            step: "event_check",
          },
          { status: 500 },
        ),
      )
    }

    // Verificar si el usuario ya está registrado
    try {
      console.log(`Verificando si ${body.email} ya está registrado para el evento ${body.eventId}...`)
      const existingRegistration = await sql`
        SELECT id FROM EventRegistration 
        WHERE eventId = ${body.eventId} AND email = ${body.email};
      `

      if (existingRegistration.rowCount > 0) {
        console.log(`El usuario ${body.email} ya está registrado para el evento ${body.eventId}`)
        return addCorsHeaders(
          NextResponse.json(
            {
              success: false,
              message: "Ya estás registrado para este evento",
              error: "Already registered",
              step: "duplicate_check",
              registrationId: existingRegistration.rows[0].id,
            },
            { status: 409 },
          ),
        )
      }
      console.log(`El usuario ${body.email} no está registrado para el evento ${body.eventId}`)
    } catch (duplicateError: any) {
      console.error("Error al verificar registro duplicado:", duplicateError)
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            message: "Error al verificar registro duplicado",
            error: duplicateError.message,
            step: "duplicate_check",
          },
          { status: 500 },
        ),
      )
    }

    // Registrar al usuario
    let registrationId
    try {
      console.log("Registrando al usuario...")
      const result = await sql`
        INSERT INTO EventRegistration (
          eventId, name, email, phone, team, registrationDate
        ) VALUES (
          ${body.eventId}, 
          ${body.name}, 
          ${body.email}, 
          ${body.phone || null}, 
          ${body.team || null}, 
          ${new Date().toISOString()}
        ) RETURNING id;
      `
      registrationId = result.rows[0].id
      console.log(`Usuario registrado con ID: ${registrationId}`)
    } catch (insertError: any) {
      console.error("Error al registrar al usuario:", insertError)
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            message: "Error al registrar al usuario",
            error: insertError.message,
            step: "registration_insert",
          },
          { status: 500 },
        ),
      )
    }

    // Obtener detalles del evento para la notificación
    let eventDetails
    try {
      console.log(`Obteniendo detalles del evento ${body.eventId}...`)
      const eventResult = await sql`
        SELECT title, date, location FROM events WHERE id = ${body.eventId};
      `

      if (eventResult.rowCount === 0) {
        console.error(`No se encontraron detalles para el evento ${body.eventId}`)
        eventDetails = { title: "Evento", date: new Date(), location: "Por confirmar" }
      } else {
        eventDetails = eventResult.rows[0]
        console.log("Detalles del evento obtenidos:", eventDetails)
      }
    } catch (eventDetailsError: any) {
      console.error("Error al obtener detalles del evento:", eventDetailsError)
      eventDetails = { title: "Evento", date: new Date(), location: "Por confirmar" }
    }

    // Enviar notificación por correo electrónico
    let notificationResult = { success: false, message: "No se intentó enviar notificación" }
    try {
      console.log(`Enviando notificación por correo electrónico a ${body.email}...`)
      notificationResult = await sendEventRegistrationEmail({
        to: body.email,
        name: body.name,
        eventTitle: eventDetails.title,
        eventDate: eventDetails.date,
        eventLocation: eventDetails.location,
      })
      console.log("Resultado de la notificación:", notificationResult)
    } catch (notificationError: any) {
      console.error("Error al enviar notificación:", notificationError)
      notificationResult = {
        success: false,
        message: `Error al enviar notificación: ${notificationError.message}`,
      }
    }

    // Devolver respuesta exitosa
    return addCorsHeaders(
      NextResponse.json({
        success: true,
        message: "Registro exitoso",
        registrationId,
        notification: notificationResult,
        timestamp: new Date().toISOString(),
      }),
    )
  } catch (error: any) {
    console.error("Error general en el registro de evento:", error)

    return addCorsHeaders(
      NextResponse.json(
        {
          success: false,
          message: "Error en el registro de evento",
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      ),
    )
  }
}

// Manejar solicitudes OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
}
