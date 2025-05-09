import { db } from "./db"
import { sendEmail, generateRegistrationEmailContent } from "./email-service"
import { generateWhatsAppLink, generateWhatsAppLinks } from "./whatsapp-service"

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
    console.log("Sending notification:", { type, recipient, event })

    // Resultados de los envíos
    let whatsappLink = null
    let emailResult = null

    // Enviar Email
    try {
      // Generar contenido del correo según el tipo
      let emailContent = ""
      let emailSubject = ""

      if (type === "registration") {
        emailContent = generateRegistrationEmailContent({
          name: recipient.name,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          eventId: event.id,
          email: recipient.email,
          guardianName: recipient.guardianName,
        })
        emailSubject = `Confirmación de Registro: ${event.title}`
      } else if (type === "reminder") {
        // Contenido para recordatorio
        emailContent = generateRegistrationEmailContent({
          name: recipient.name,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          eventId: event.id,
          email: recipient.email,
          guardianName: recipient.guardianName,
        }).replace("¡Registro Confirmado!", "Recordatorio de Evento")
        emailSubject = `Recordatorio: ${event.title}`
      } else if (type === "custom" && customMessage) {
        // Contenido para mensaje personalizado
        emailContent = generateRegistrationEmailContent({
          name: recipient.name,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          eventId: event.id,
          email: recipient.email,
          guardianName: recipient.guardianName,
        }).replace("¡Registro Confirmado!", "Mensaje Importante")

        // Insertar mensaje personalizado
        emailContent = emailContent.replace(
          "Tu registro para el evento",
          `${customMessage}<br><br>Información del evento`,
        )

        emailSubject = `Mensaje Importante: ${event.title}`
      }

      // Enviar el correo
      emailResult = await sendEmail({
        to: recipient.email,
        subject: emailSubject,
        html: emailContent,
        eventId: event.id,
      })
    } catch (error) {
      console.error("Error sending Email:", error)
      emailResult = { success: false, error }
    }

    // Generar enlace de WhatsApp si hay número de teléfono
    if (recipient.phone && process.env.ENABLE_WHATSAPP_LINKS === "true") {
      try {
        // Crear mensaje según el tipo
        let message = ""

        // Nombre del destinatario (encargado o jugador)
        const recipientName = recipient.guardianName || recipient.name

        // Formatear fecha del evento
        const formattedDate = new Date(event.date).toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })

        if (type === "registration") {
          message = `¡Hola ${recipientName}! Tu registro para el evento *${event.title}* ha sido confirmado.

*Fecha:* ${formattedDate}
*Ubicación:* ${event.location}
*Jugador:* ${recipient.name}

Gracias por registrarte. ¡Esperamos verte pronto!`
        } else if (type === "reminder") {
          message = `¡Hola ${recipientName}! Te recordamos que el evento *${event.title}* está programado para pronto.

*Fecha:* ${formattedDate}
*Ubicación:* ${event.location}
*Jugador:* ${recipient.name}

¡Esperamos verte allí!`
        } else if (type === "custom" && customMessage) {
          message = `¡Hola ${recipientName}! ${customMessage}

*Evento:* ${event.title}
*Fecha:* ${formattedDate}
*Ubicación:* ${event.location}
*Jugador:* ${recipient.name}`
        }

        whatsappLink = generateWhatsAppLink(recipient.phone, message)
        console.log("WhatsApp link generated:", whatsappLink)
      } catch (error) {
        console.error("Error generating WhatsApp link:", error)
      }
    }

    // Registrar la notificación en la base de datos
    try {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

      await db`
        INSERT INTO "Notification" (
          id, type, recipient, "recipientEmail", message, "eventId", status, "createdAt"
        ) VALUES (
          ${notificationId},
          ${type},
          ${recipient.phone || null},
          ${recipient.email},
          ${customMessage || `Notificación de ${type} para el evento ${event.title}`},
          ${event.id},
          ${emailResult?.success ? "SENT" : "FAILED"},
          NOW()
        )
      `.catch((err) => {
        console.error("Error inserting notification record:", err)
        // Continue even if DB insert fails
      })
    } catch (error) {
      console.error("Error logging notification to database:", error)
      // Continue even if DB logging fails
    }

    return {
      success: emailResult?.success,
      whatsappLink,
      email: emailResult,
    }
  } catch (error) {
    console.error("Error in sendFreeNotification:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
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
    whatsappLinks: [] as { name: string; phone: string; link: string }[],
  }

  // Generar enlaces de WhatsApp en masa si es posible
  if (type === "reminder" || type === "custom") {
    try {
      const links = await generateWhatsAppLinks(event.id, customMessage)
      results.whatsappLinks = links
    } catch (error) {
      console.error("Error generating bulk WhatsApp links:", error)
    }
  }

  // Enviar notificaciones individuales
  for (const recipient of recipients) {
    try {
      const result = await sendFreeNotification(type, recipient, event, customMessage)

      if (result.success) {
        results.successful++
      } else {
        results.failed++
      }

      if (result.whatsappLink && recipient.phone) {
        // Solo añadir si no está ya en la lista
        const exists = results.whatsappLinks.some((link) => link.phone === recipient.phone)
        if (!exists) {
          results.whatsappLinks.push({
            name: recipient.name,
            phone: recipient.phone,
            link: result.whatsappLink,
          })
        }
      }

      results.details.push({
        recipient: recipient.email,
        success: result.success,
        whatsappLink: result.whatsappLink,
        emailSent: result.email?.success || false,
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
