import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendFreeBulkNotifications, type NotificationType } from "@/lib/free-notification-service"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { type, eventId, customMessage } = data

    // Validar datos requeridos
    if (!type || !eventId) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan datos requeridos (type, eventId)",
        },
        { status: 400 },
      )
    }

    // Obtener información del evento
    const eventResult = await db`
      SELECT id, title, date, location, "shareableSlug" as slug
      FROM "Event"
      WHERE id = ${eventId}
    `

    if (!eventResult || eventResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Evento no encontrado",
        },
        { status: 404 },
      )
    }

    const event = eventResult[0]

    // Obtener todos los registros para este evento
    const registrations = await db`
      SELECT id, name, "guardianName", email, phone
      FROM "EventRegistration"
      WHERE "eventId" = ${eventId}
    `

    if (!registrations || registrations.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No hay registros para este evento",
      })
    }

    // Preparar los destinatarios
    const recipients = registrations.map((reg) => ({
      name: reg.name,
      guardianName: reg.guardianName,
      email: reg.email,
      phone: reg.phone,
    }))

    // Enviar notificaciones masivas
    const results = await sendFreeBulkNotifications(
      type as NotificationType,
      recipients,
      {
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location,
        slug: event.slug,
      },
      customMessage,
    )

    return NextResponse.json({
      success: results.successful > 0,
      message: `Se enviaron ${results.successful} de ${results.total} notificaciones correctamente`,
      results,
    })
  } catch (error) {
    console.error("Error sending bulk notifications:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al enviar notificaciones masivas",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
