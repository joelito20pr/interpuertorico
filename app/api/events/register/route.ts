import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendFreeNotification } from "@/lib/free-notification-service"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, guardianName, email, phone, eventId, numberOfAttendees = 1 } = data

    // Validar datos requeridos
    if (!name || !email || !eventId) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan datos requeridos",
        },
        { status: 400 },
      )
    }

    // Verificar si el evento existe y está disponible para registro
    const eventResult = await db`
      SELECT id, title, date, location, "maxAttendees", "shareableSlug" as slug
      FROM "Event"
      WHERE id = ${eventId} AND "isPublic" = true
    `

    if (!eventResult || eventResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Evento no encontrado o no disponible para registro público",
        },
        { status: 404 },
      )
    }

    const event = eventResult[0]

    // Verificar si hay cupo disponible
    if (event.maxAttendees) {
      const registrationsCount = await db`
        SELECT COUNT(*) as count
        FROM "EventRegistration"
        WHERE "eventId" = ${eventId}
      `

      const currentCount = Number.parseInt(registrationsCount[0].count)

      if (currentCount + numberOfAttendees > event.maxAttendees) {
        return NextResponse.json(
          {
            success: false,
            error: "No hay suficientes cupos disponibles para este evento",
          },
          { status: 400 },
        )
      }
    }

    // Verificar si el correo ya está registrado para este evento
    const existingRegistration = await db`
      SELECT id FROM "EventRegistration"
      WHERE "eventId" = ${eventId} AND email = ${email}
    `

    if (existingRegistration && existingRegistration.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Este correo electrónico ya está registrado para este evento",
        },
        { status: 400 },
      )
    }

    // Crear el registro
    try {
      // Intentar insertar con guardianName
      const registrationId = `reg_${Date.now()}`
      const result = await db`
        INSERT INTO "EventRegistration" (
          id, name, "guardianName", email, phone, "eventId", "numberOfAttendees", "paymentStatus", "createdAt"
        ) VALUES (
          ${registrationId},
          ${name},
          ${guardianName || null},
          ${email},
          ${phone || null},
          ${eventId},
          ${numberOfAttendees},
          'PENDING',
          NOW()
        )
        RETURNING id
      `

      // Enviar notificación de confirmación
      const notificationResult = await sendFreeNotification(
        "registration",
        {
          name,
          guardianName,
          email,
          phone,
        },
        {
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
          slug: event.slug,
        },
      )

      return NextResponse.json({
        success: true,
        message: "Registro completado con éxito",
        data: {
          id: result[0].id,
          name,
          email,
        },
        notification: {
          emailSent: notificationResult.success,
          whatsappLink: notificationResult.whatsappLink,
        },
      })
    } catch (error) {
      console.error("Error creating registration:", error)

      // Si falla, puede ser porque la columna guardianName no existe
      // Intentar sin guardianName
      if (error instanceof Error && error.message.includes("guardianName")) {
        const registrationId = `reg_${Date.now()}`
        const result = await db`
          INSERT INTO "EventRegistration" (
            id, name, email, phone, "eventId", "numberOfAttendees", "paymentStatus", "createdAt"
          ) VALUES (
            ${registrationId},
            ${name},
            ${email},
            ${phone || null},
            ${eventId},
            ${numberOfAttendees},
            'PENDING',
            NOW()
          )
          RETURNING id
        `

        // Enviar notificación de confirmación
        const notificationResult = await sendFreeNotification(
          "registration",
          {
            name,
            email,
            phone,
          },
          {
            id: event.id,
            title: event.title,
            date: event.date,
            location: event.location,
            slug: event.slug,
          },
        )

        return NextResponse.json({
          success: true,
          message: "Registro completado con éxito",
          data: {
            id: result[0].id,
            name,
            email,
          },
          notification: {
            emailSent: notificationResult.success,
            whatsappLink: notificationResult.whatsappLink,
          },
        })
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error("Error in event registration:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al procesar el registro",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
