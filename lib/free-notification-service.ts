import { db } from "./db"
import nodemailer from "nodemailer"

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

// Configuración para servicios gratuitos
const freeConfig = {
  // Email gratuito usando Gmail o similar
  email: {
    service: process.env.FREE_EMAIL_SERVICE || "gmail", // gmail, outlook, etc.
    user: process.env.FREE_EMAIL_USER || "",
    pass: process.env.FREE_EMAIL_PASS || "",
    from: process.env.FREE_EMAIL_FROM || "",
  },
  // URL para generar enlaces de WhatsApp
  whatsapp: {
    enabled: process.env.ENABLE_WHATSAPP_LINKS === "true",
  },
}

// Función para generar un enlace de WhatsApp
export function generateWhatsAppLink(phone: string, message: string): string {
  // Formatear el número de teléfono (eliminar espacios, guiones, etc.)
  const formattedPhone = phone.replace(/[\s-$$$$]/g, "")

  // Codificar el mensaje para URL
  const encodedMessage = encodeURIComponent(message)

  // Generar el enlace
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
}

// Función para enviar Email usando Nodemailer con cuenta gratuita
async function sendFreeEmail(to: string, subject: string, htmlContent: string) {
  const { service, user, pass, from } = freeConfig.email

  if (!user || !pass) {
    console.log("[EMAIL DISABLED] Would send to:", to, "Subject:", subject)
    return { success: false, error: "Email configuration is incomplete" }
  }

  try {
    // Crear transportador de Nodemailer
    const transporter = nodemailer.createTransport({
      service,
      auth: {
        user,
        pass,
      },
    })

    // Enviar el email
    const info = await transporter.sendMail({
      from: from || user,
      to,
      subject,
      html: htmlContent,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

// Función para crear el contenido de las notificaciones
function createNotificationContent(
  type: NotificationType,
  recipient: NotificationRecipient,
  event: EventDetails,
  customMessage?: string,
) {
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
  const eventUrl = event.slug ? `${process.env.NEXT_PUBLIC_APP_URL}/eventos/${event.slug}` : ""

  // Contenido según el tipo de notificación
  if (type === "registration") {
    // Mensaje para nuevo registro
    const whatsappMessage = `¡Hola ${recipientName}! Tu registro para el evento "${event.title}" ha sido confirmado.\n\n📅 Fecha: ${formattedDate}\n📍 Ubicación: ${event.location}\n\nGracias por registrarte. Te enviaremos recordatorios antes del evento.`

    const emailSubject = `Confirmación de registro: ${event.title}`
    const emailBody = `
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

    return { whatsappMessage, emailSubject, emailBody }
  } else if (type === "reminder") {
    // Mensaje para recordatorio
    const whatsappMessage = `¡Hola ${recipientName}! Te recordamos que el evento "${event.title}" está programado para mañana.\n\n📅 Fecha: ${formattedDate}\n📍 Ubicación: ${event.location}\n\n¡Esperamos verte allí!`

    const emailSubject = `Recordatorio: ${event.title} - Mañana`
    const emailBody = `
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

    return { whatsappMessage, emailSubject, emailBody }
  } else if (type === "custom" && customMessage) {
    // Mensaje personalizado
    const whatsappMessage = `¡Hola ${recipientName}! ${customMessage}\n\nEvento: ${event.title}\n📅 Fecha: ${formattedDate}\n📍 Ubicación: ${event.location}`

    const emailSubject = `Mensaje importante: ${event.title}`
    const emailBody = `
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

    return { whatsappMessage, emailSubject, emailBody }
  }

  // Valor por defecto
  return {
    whatsappMessage: `Notificación de Inter Puerto Rico: Evento "${event.title}" - ${formattedDate}`,
    emailSubject: `Notificación: ${event.title}`,
    emailBody: `<p>Notificación de Inter Puerto Rico para el evento "${event.title}" el ${formattedDate}</p>`,
  }
}

// Función principal para enviar notificaciones
export async function sendFreeNotification(
  type: NotificationType,
  recipient: NotificationRecipient,
  event: EventDetails,
  customMessage?: string,
) {
  try {
    // Crear contenido de la notificación
    const { whatsappMessage, emailSubject, emailBody } = createNotificationContent(
      type,
      recipient,
      event,
      customMessage,
    )

    // Resultados de los envíos
    let whatsappLink = null
    let emailResult = null

    // Generar enlace de WhatsApp si hay número de teléfono
    if (recipient.phone && freeConfig.whatsapp.enabled) {
      whatsappLink = generateWhatsAppLink(recipient.phone, whatsappMessage)
    }

    // Enviar Email
    try {
      emailResult = await sendFreeEmail(recipient.email, emailSubject, emailBody)
    } catch (error) {
      console.error("Error sending Email:", error)
      emailResult = { success: false, error }
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
        ${emailResult?.success ? "SENT" : "FAILED"},
        NOW()
      )
    `

    return {
      success: emailResult?.success,
      whatsappLink,
      email: emailResult,
      notificationId,
    }
  } catch (error) {
    console.error("Error in sendFreeNotification:", error)
    throw error
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

  for (const recipient of recipients) {
    try {
      const result = await sendFreeNotification(type, recipient, event, customMessage)

      if (result.success) {
        results.successful++
      } else {
        results.failed++
      }

      if (result.whatsappLink && recipient.phone) {
        results.whatsappLinks.push({
          name: recipient.name,
          phone: recipient.phone,
          link: result.whatsappLink,
        })
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
