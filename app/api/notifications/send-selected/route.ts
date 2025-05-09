import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendFreeBulkNotifications } from "@/lib/free-notification-service"

export async function POST(request: NextRequest) {
  try {
    const { type, eventId, customMessage, subject, recipientIds, sendVia = "both" } = await request.json()

    if (!eventId) {
      return NextResponse.json({ success: false, error: "ID del evento es requerido" }, { status: 400 })
    }

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return NextResponse.json({ success: false, error: "Se requiere al menos un ID de destinatario" }, { status: 400 })
    }

    // Obtener información del evento - Eliminamos la columna slug que no existe
    const eventResult = await db`
      SELECT id, title, date, location FROM "Event" WHERE id = ${eventId}
    `

    if (eventResult.length === 0) {
      return NextResponse.json({ success: false, error: "Evento no encontrado" }, { status: 404 })
    }

    const event = eventResult[0]

    // Obtener información de los destinatarios seleccionados
    const recipientsResult = await db`
      SELECT id, name, "guardianName", email, phone 
      FROM "EventRegistration" 
      WHERE id = ANY(${recipientIds})
    `

    if (recipientsResult.length === 0) {
      return NextResponse.json({ success: false, error: "No se encontraron destinatarios" }, { status: 404 })
    }

    // Filtrar destinatarios según el método de envío
    let filteredRecipients = recipientsResult
    if (sendVia === "whatsapp") {
      filteredRecipients = recipientsResult.filter((r) => r.phone)
    }

    if (filteredRecipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay destinatarios válidos para el método de envío seleccionado",
        },
        { status: 400 },
      )
    }

    // Enviar notificaciones
    const result = await sendFreeBulkNotifications(
      type,
      filteredRecipients,
      {
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location,
        // No incluimos slug porque no existe en la tabla
      },
      customMessage,
    )

    return NextResponse.json({
      success: true,
      message: `Mensajes enviados a ${result.successful} de ${result.total} destinatarios`,
      data: result,
    })
  } catch (error) {
    console.error("Error sending selected notifications:", error)
    return NextResponse.json({ success: false, error: `Error al enviar notificaciones: ${error}` }, { status: 500 })
  }
}
