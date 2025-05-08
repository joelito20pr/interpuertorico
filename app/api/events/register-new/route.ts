import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { corsHeaders } from "@/lib/api-utils"

// Función simple para registrar un evento
export async function POST(request: NextRequest) {
  console.log("Nuevo endpoint de registro llamado")

  // Agregar encabezados CORS a todas las respuestas
  const response = (data: any, status = 200) => {
    return new NextResponse(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    })
  }

  // Manejar solicitudes OPTIONS para CORS
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Parsear el cuerpo de la solicitud
    let data
    try {
      data = await request.json()
      console.log("Datos recibidos:", JSON.stringify(data))
    } catch (error) {
      console.error("Error al parsear JSON:", error)
      return response(
        {
          success: false,
          message: "Error al parsear la solicitud",
          error: "Invalid JSON",
        },
        400,
      )
    }

    // Validar datos requeridos
    if (!data.eventId || !data.name || !data.email) {
      console.error("Datos requeridos faltantes")
      return response(
        {
          success: false,
          message: "Faltan datos requeridos (eventId, name, email)",
          received: {
            eventId: data.eventId || null,
            name: data.name || null,
            email: data.email || null,
          },
        },
        400,
      )
    }

    // Verificar si el evento existe
    console.log(`Verificando evento con ID: ${data.eventId}`)
    const event = await db`
      SELECT id, title, date, location FROM "Event" WHERE id = ${data.eventId}
    `

    if (event.length === 0) {
      console.error(`Evento no encontrado: ${data.eventId}`)
      return response(
        {
          success: false,
          message: "Evento no encontrado",
          eventId: data.eventId,
        },
        404,
      )
    }

    console.log("Evento encontrado:", event[0])

    // Verificar si el usuario ya está registrado
    console.log(`Verificando si ${data.email} ya está registrado para el evento ${data.eventId}`)
    const existingRegistration = await db`
      SELECT id FROM "EventRegistration" 
      WHERE "eventId" = ${data.eventId} AND email = ${data.email}
    `

    if (existingRegistration.length > 0) {
      console.log(`Usuario ya registrado: ${data.email}`)
      return response(
        {
          success: false,
          message: "Ya estás registrado para este evento",
          registrationId: existingRegistration[0].id,
        },
        409,
      )
    }

    // Registrar al usuario
    console.log("Registrando usuario...")
    const registrationId = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

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

    console.log(`Usuario registrado con ID: ${registrationId}`)

    // Devolver respuesta exitosa
    return response({
      success: true,
      message: "Registro exitoso",
      registrationId,
      eventDetails: {
        title: event[0].title,
        date: event[0].date,
        location: event[0].location,
      },
    })
  } catch (error) {
    console.error("Error en el registro:", error)
    return response(
      {
        success: false,
        message: "Error en el proceso de registro",
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    )
  }
}

// Manejar solicitudes OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}
