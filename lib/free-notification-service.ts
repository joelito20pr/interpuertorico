import nodemailer from "nodemailer"
import { generateWhatsAppLink } from "@/lib/utils"
import { db } from "@/lib/db"

// Configuración del servicio de correo electrónico
const emailConfig = {
  service: process.env.FREE_EMAIL_SERVICE || "gmail",
  user: process.env.FREE_EMAIL_USER,
  pass: process.env.FREE_EMAIL_PASS,
  from: process.env.FREE_EMAIL_FROM || "noreply@example.com",
}

// Verificar si el servicio de correo electrónico está configurado
const isEmailConfigured = () => {
  return !!(emailConfig.user && emailConfig.pass)
}

// Crear transportador de correo electrónico
const createTransporter = () => {
  if (!isEmailConfigured()) {
    console.warn("Email service not configured. Check environment variables.")
    return null
  }

  return nodemailer.createTransport({
    service: emailConfig.service,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  })
}

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

// Enviar correo electrónico de registro de evento
export async function sendEventRegistrationEmail({
  to,
  name,
  eventTitle,
  eventDate,
  eventLocation,
  eventId,
  guardianName,
}: {
  to: string
  name: string
  eventTitle: string
  eventDate: Date | string
  eventLocation: string
  eventId: string
  guardianName?: string
}) {
  console.log("Intentando enviar correo de registro de evento...")

  // Verificar si el servicio de correo electrónico está habilitado
  const enableEmail = process.env.ENABLE_EMAIL !== "false"
  if (!enableEmail) {
    console.log("El servicio de correo electrónico está deshabilitado")
    return { success: false, message: "Email service is disabled" }
  }

  // Verificar si el servicio de correo electrónico está configurado
  if (!isEmailConfigured()) {
    console.warn("Email service not configured. Check environment variables.")
    return { success: false, message: "Email service not configured" }
  }

  try {
    const transporter = createTransporter()
    if (!transporter) {
      return { success: false, message: "Could not create email transporter" }
    }

    // Formatear fecha del evento
    const formattedDate = new Date(eventDate).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    // URL base para enlaces
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.interprfc.com"

    // Nombre del destinatario (encargado o jugador)
    const recipientName = guardianName || name

    // Crear contenido del correo electrónico
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <img src="${baseUrl}/icon.png" alt="Logo" style="display: block; margin: 0 auto; max-width: 100px; margin-bottom: 20px;">
        <h2 style="color: #333; text-align: center;">¡Registro Confirmado!</h2>
        <p style="color: #666; font-size: 16px;">Hola ${recipientName},</p>
        <p style="color: #666; font-size: 16px;">Tu registro para el evento <strong>"${eventTitle}"</strong> ha sido confirmado.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Evento:</strong> ${eventTitle}</p>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;"><strong>Ubicación:</strong> ${eventLocation}</p>
          <p style="margin: 5px 0;"><strong>Jugador:</strong> ${name}</p>
        </div>
        
        <div style="margin: 20px 0; text-align: center;">
          <p>¿Confirmas tu asistencia al evento?</p>
          <a href="${baseUrl}/api/events/confirm/${eventId}?email=${encodeURIComponent(to)}&confirm=yes" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Sí, asistiré</a>
          <a href="${baseUrl}/api/events/confirm/${eventId}?email=${encodeURIComponent(to)}&confirm=no" style="display: inline-block; background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">No podré asistir</a>
        </div>
        
        <p style="color: #666; font-size: 16px;">Gracias por registrarte. ¡Esperamos verte pronto!</p>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 14px;">
          <p>Este es un correo electrónico automático, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    `

    // Enviar correo electrónico
    console.log(`Enviando correo a ${to}...`)
    const info = await transporter.sendMail({
      from: `"Inter Puerto Rico FC" <${emailConfig.from}>`,
      to,
      subject: `Confirmación de Registro: ${eventTitle}`,
      html: emailContent,
    })

    console.log("Correo enviado:", info.messageId)
    return { success: true, message: "Email sent successfully", messageId: info.messageId }
  } catch (error: any) {
    console.error("Error al enviar correo electrónico:", error)
    return { success: false, message: `Error sending email: ${error.message}` }
  }
}

// Generar enlace de WhatsApp
export function generateWhatsAppMessage({
  name,
  eventTitle,
  eventDate,
  eventLocation,
  guardianName,
}: {
  name: string
  eventTitle: string
  eventDate: Date | string
  eventLocation: string
  guardianName?: string
}) {
  // Formatear fecha del evento
  const formattedDate = new Date(eventDate).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  // Nombre del destinatario (encargado o jugador)
  const recipientName = guardianName || name

  // Crear mensaje de WhatsApp
  return `¡Hola ${recipientName}! Tu registro para el evento *${eventTitle}* ha sido confirmado.

*Fecha:* ${formattedDate}
*Ubicación:* ${eventLocation}
*Jugador:* ${name}

Gracias por registrarte. ¡Esperamos verte pronto!`
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
      emailResult = await sendEventRegistrationEmail({
        to: recipient.email,
        name: recipient.name,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        eventId: event.id,
        guardianName: recipient.guardianName,
      })
    } catch (error) {
      console.error("Error sending Email:", error)
      emailResult = { success: false, error }
    }

    // Generar enlace de WhatsApp si hay número de teléfono
    if (recipient.phone && process.env.ENABLE_WHATSAPP_LINKS === "true") {
      try {
        const whatsappMessage = generateWhatsAppMessage({
          name: recipient.name,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          guardianName: recipient.guardianName,
        })

        whatsappLink = generateWhatsAppLink(recipient.phone, whatsappMessage)

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
