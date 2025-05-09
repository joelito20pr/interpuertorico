import { sendEmailNotification } from "@/lib/email-service"
import { generateWhatsAppLink } from "@/lib/whatsapp-service"
import { db } from "@/lib/db"

// Tipos para nuestras notificaciones
export type NotificationType = "registration" | "reminder" | "custom"

export interface NotificationRecipient {
  name: string
  guardianName?: string
  email: string
  phone?: string
}

export interface EventDetails {
  id: string
  title: string
  date: string
  location: string
  slug?: string
}

// Función principal para enviar notificaciones
export async function sendFreeNotification(
  type: NotificationType,
  recipient: NotificationRecipient,
  event: EventDetails,
  customMessage?: string,
) {
  try {
    // Formatear fecha del evento
    const formattedDate = new Date(event.date).toLocaleDateString("es-PR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    // Nombre del destinatario (encargado o jugador)
    const recipientName = recipient.guardianName || recipient.name

    // URL del evento
    const eventUrl = event.slug ? `https://www.interprfc.com/eventos/${event.slug}` : ""

    // Contenido según el tipo de notificación
    let whatsappMessage = ""
    let emailSubject = ""
    let emailBody = ""

    if (type === "registration") {
      // Mensaje para nuevo registro
      whatsappMessage = `¡Hola ${recipientName}! Tu registro para el evento "${event.title}" ha sido confirmado.\n\n📅 Fecha: ${formattedDate}\n📍 Ubicación: ${event.location}\n\nGracias por registrarte. Te enviaremos recordatorios antes del evento.`

      emailSubject = `Confirmación de registro: ${event.title}`
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc;">¡Gracias por registrarte!</h2>
          <p>Hola ${recipientName},</p>
          <p>Tu registro para el evento <strong>"${event.title}"</strong> ha sido confirmado.</p>
          <p><strong>Detalles del evento:</strong></p>
          <ul>
            <li><strong>Fecha:</strong> ${formattedDate}</li>
            <li><strong>Ubicación:</strong> ${event.location}</li>
            <li><strong>Jugador:</strong> ${recipient.name}</li>
          </ul>
          ${eventUrl ? `<p>Puedes ver los detalles del evento en: <a href="${eventUrl}">${eventUrl}</a></p>` : ""}
          <p>Te enviaremos recordatorios antes del evento.</p>
          <p>Gracias,<br>Equipo de Inter Puerto Rico</p>
        </div>
      `
    } else if (type === "reminder") {
      // Mensaje para recordatorio
      whatsappMessage = `¡Hola ${recipientName}! Te recordamos que el evento "${event.title}" está programado para mañana.\n\n📅 Fecha: ${formattedDate}\n📍 Ubicación: ${event.location}\n\n¡Esperamos verte allí!`

      emailSubject = `Recordatorio: ${event.title} - Mañana`
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc;">Recordatorio de evento</h2>
          <p>Hola ${recipientName},</p>
          <p>Te recordamos que el evento <strong>"${event.title}"</strong> está programado para mañana.</p>
          <p><strong>Detalles del evento:</strong></p>
          <ul>
            <li><strong>Fecha:</strong> ${formattedDate}</li>
            <li><strong>Ubicación:</strong> ${event.location}</li>
          </ul>
          ${eventUrl ? `<p>Puedes ver los detalles del evento en: <a href="${eventUrl}">${eventUrl}</a></p>` : ""}
          <p>¡Esperamos verte allí!</p>
          <p>Gracias,<br>Equipo de Inter Puerto Rico</p>
        </div>
      `
    } else if (type === "custom" && customMessage) {
      // Mensaje personalizado
      whatsappMessage = `¡Hola ${recipientName}! ${customMessage}\n\nEvento: ${event.title}\n📅 Fecha: ${formattedDate}\n📍 Ubicación: ${event.location}`

      emailSubject = `Mensaje importante: ${event.title}`
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc;">Mensaje importante</h2>
          <p>Hola ${recipientName},</p>
          <p>${customMessage}</p>
          <p><strong>Detalles del evento:</strong></p>
          <ul>
            <li><strong>Evento:</strong> ${event.title}</li>
            <li><strong>Fecha:</strong> ${formattedDate}</li>
            <li><strong>Ubicación:</strong> ${event.location}</li>
          </ul>
          ${eventUrl ? `<p>Puedes ver los detalles del evento en: <a href="${eventUrl}">${eventUrl}</a></p>` : ""}
          <p>Gracias,<br>Equipo de Inter Puerto Rico</p>
        </div>
      `
    } else {
      // Valor por defecto
      whatsappMessage = `Notificación de Inter Puerto Rico: Evento "${event.title}" - ${formattedDate}`
      emailSubject = `Notificación: ${event.title}`
      emailBody = `<p>Notificación de Inter Puerto Rico para el evento "${event.title}" el ${formattedDate}</p>`
    }

    // Enviar correo electrónico
    const emailResult = await sendEmailNotification({
      to: recipient.email,
      subject: emailSubject,
      html: emailBody,
      eventId: event.id,
    })

    // Generar enlace de WhatsApp
    let whatsappLink = null
    if (recipient.phone) {
      whatsappLink = generateWhatsAppLink(recipient.phone, whatsappMessage)
    }

    // Registrar la notificación en la base de datos
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    await db`
      INSERT INTO "Notification" (
        id, type, recipient, "recipientEmail", message, "eventId", status, "createdAt"
      ) VALUES (
        ${notificationId},
        ${type},
        ${recipient.phone || null},
        ${recipient.email},
        ${whatsappMessage},
        ${event.id},
        ${emailResult.success ? "SENT" : "FAILED"},
        NOW()
      )
    `

    return {
      success: emailResult.success,
      message: emailResult.message,
      whatsappLink: whatsappLink,
      notificationId,
    }
  } catch (error) {
    console.error("Error in sendFreeNotification:", error)
    return { success: false, message: `Error sending notification: ${error}` }
  }
}

// Función para enviar notificaciones masivas
export async function sendFreeBulkNotifications(
  type: NotificationType,
  recipients: NotificationRecipient[],
  event: EventDetails,
  customMessage?: string,
) {
  const results = {
    total: recipients.length,
    successful: 0,
    failed: 0,
    details: [] as any[],
  }

  for (const recipient of recipients) {
    try {
      const result = await sendFreeNotification(type, recipient, event, customMessage)

      if (result.success) {
        results.successful++
      } else {
        results.failed++
      }

      results.details.push({
        recipient: recipient.email,
        success: result.success,
        whatsappLink: result.whatsappLink,
      })
    } catch (error) {
      console.error(`Error sending notification to ${recipient.email}:`, error)
      results.failed++
      results.details.push({
        recipient: recipient.email,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return results
}
