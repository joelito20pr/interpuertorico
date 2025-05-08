import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendFreeNotification, type NotificationType } from "@/lib/free-notification-service"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { type, recipientId, eventId, customMessage } = data

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

    // Si se proporciona un recipientId, enviar solo a ese destinatario
    if (recipientId) {
      const recipientResult = await db`
        SELECT id, name, "guardianName", email, phone
        FROM "EventRegistration"
        WHERE id = ${recipientId} AND "eventId" = ${eventId}
      `

      if (!recipientResult || recipientResult.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Destinatario no encontrado",
          },
          { status: 404 },
        )
      }

      const recipient = recipientResult[0]

      const result = await sendFreeNotification(
        type as NotificationType,
        {
          name: recipient.name,
          guardianName: recipient.guardianName,
          email: recipient.email,
          phone: recipient.phone,
        },
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
        success: result.success,
        message: result.success ? "Notificación enviada correctamente" : "Error al enviar la notificación",
        details: result,
      })
    } else {
      // Si no se proporciona recipientId, devolver error
      return NextResponse.json(
        {
          success: false,
          error: "Se requiere recipientId para enviar una notificación individual",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al enviar la notificación",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
