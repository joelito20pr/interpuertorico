import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendFreeNotification } from "@/lib/free-notification-service"

export async function POST(request: Request) {
  console.log("Registration request received")

  try {
    const data = await request.json()
    console.log("Registration data:", JSON.stringify(data))

    const { name, guardianName, email, phone, eventId, numberOfAttendees = 1 } = data

    // Validar datos requeridos
    if (!name || !email || !eventId) {
      console.log("Missing required fields:", { name, email, eventId })
      return NextResponse.json(
        {
          success: false,
          error: "Faltan datos requeridos",
          details: { name: !name, email: !email, eventId: !eventId },
        },
        { status: 400 },
      )
    }

    // Verificar si el evento existe y está disponible para registro
    console.log("Checking event existence:", eventId)
    const eventResult = await db`
      SELECT id, title, date, location, "maxAttendees", "shareableSlug" as slug, "isPublic"
      FROM "Event"
      WHERE id = ${eventId}
    `
    console.log("Event query result:", JSON.stringify(eventResult))

    if (!eventResult || eventResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Evento no encontrado",
        },
        { status: 404 },
      )
    }

    // Check if event is public
    const event = eventResult[0]
    if (event.isPublic !== true) {
      return NextResponse.json(
        {
          success: false,
          error: "Este evento no está disponible para registro público",
        },
        { status: 403 },
      )
    }

    // Verificar si hay cupo disponible
    if (event.maxAttendees) {
      console.log("Checking available spots. Max:", event.maxAttendees)
      const registrationsCount = await db`
        SELECT COUNT(*) as count
        FROM "EventRegistration"
        WHERE "eventId" = ${eventId}
      `
      console.log("Current registrations:", registrationsCount)

      const currentCount = Number.parseInt(registrationsCount[0]?.count || "0")

      if (currentCount + numberOfAttendees > event.maxAttendees) {
        return NextResponse.json(
          {
            success: false,
            error: "No hay suficientes cupos disponibles para este evento",
            details: { current: currentCount, requested: numberOfAttendees, max: event.maxAttendees },
          },
          { status: 400 },
        )
      }
    }

    // Verificar si el correo ya está registrado para este evento
    console.log("Checking for existing registration", { email, eventId })
    const existingRegistration = await db`
      SELECT id FROM "EventRegistration"
      WHERE "eventId" = ${eventId} AND email = ${email}
    `
    console.log("Existing registration check result:", existingRegistration)

    if (existingRegistration && existingRegistration.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Este correo electrónico ya está registrado para este evento",
        },
        { status: 400 },
      )
    }

    // Obtener esquema de la tabla para verificar columnas
    console.log("Checking table schema")
    const tableInfo = await db`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'EventRegistration'
    `
    const columns = tableInfo.map((col) => col.column_name)
    console.log("Table columns:", columns)

    const hasGuardianNameColumn = columns.includes("guardianName")
    console.log("Has guardianName column:", hasGuardianNameColumn)

    // Crear el registro
    const registrationId = `reg_${Date.now()}`

    let registrationResult
    if (hasGuardianNameColumn) {
      console.log("Inserting registration with guardianName")
      registrationResult = await db`
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
    } else {
      console.log("Inserting registration without guardianName")
      registrationResult = await db`
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
    }

    console.log("Registration created:", registrationResult)

    // Enviar notificación de confirmación
    console.log("Sending confirmation notification")
    try {
      const notificationResult = await sendFreeNotification(
        "registration",
        {
          name,
          guardianName: guardianName || undefined,
          email,
          phone: phone || undefined,
        },
        {
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
          slug: event.slug,
        },
      )
      console.log("Notification result:", notificationResult)

      return NextResponse.json({
        success: true,
        message: "Registro completado con éxito",
        data: {
          id: registrationResult[0].id,
          name,
          email,
        },
        notification: {
          emailSent: notificationResult.success,
          whatsappLink: notificationResult.whatsappLink,
        },
      })
    } catch (notificationError) {
      // Continue even if notification fails
      console.error("Error sending notification:", notificationError)

      return NextResponse.json({
        success: true,
        message: "Registro completado con éxito, pero hubo un problema al enviar la notificación",
        data: {
          id: registrationResult[0].id,
          name,
          email,
        },
        notification: {
          emailSent: false,
          error: notificationError instanceof Error ? notificationError.message : String(notificationError),
        },
      })
    }
  } catch (error) {
    console.error("Error in event registration:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al procesar el registro",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
