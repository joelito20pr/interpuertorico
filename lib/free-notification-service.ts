import nodemailer from "nodemailer"

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
}: {
  to: string
  name: string
  eventTitle: string
  eventDate: Date
  eventLocation: string
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

    // Crear contenido del correo electrónico
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <img src="https://interprfc.com/icon.png" alt="Logo" style="display: block; margin: 0 auto; max-width: 100px; margin-bottom: 20px;">
        <h2 style="color: #333; text-align: center;">¡Registro Confirmado!</h2>
        <p style="color: #666; font-size: 16px;">Hola ${name},</p>
        <p style="color: #666; font-size: 16px;">Tu registro para el evento <strong>${eventTitle}</strong> ha sido confirmado.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Evento:</strong> ${eventTitle}</p>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;"><strong>Ubicación:</strong> ${eventLocation}</p>
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

// Enviar mensaje de WhatsApp (simulado)
export async function sendWhatsAppMessage({
  to,
  name,
  eventTitle,
  eventDate,
  eventLocation,
}: {
  to: string
  name: string
  eventTitle: string
  eventDate: Date
  eventLocation: string
}) {
  console.log("Intentando enviar mensaje de WhatsApp...")

  // Verificar si el servicio de WhatsApp está habilitado
  const enableWhatsApp = process.env.ENABLE_WHATSAPP_LINKS === "true"
  if (!enableWhatsApp) {
    console.log("El servicio de WhatsApp está deshabilitado")
    return { success: false, message: "WhatsApp service is disabled" }
  }

  try {
    // Formatear fecha del evento
    const formattedDate = new Date(eventDate).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    // Crear mensaje de WhatsApp
    const message = `¡Hola ${name}! Tu registro para el evento *${eventTitle}* ha sido confirmado.\n\n*Fecha:* ${formattedDate}\n*Ubicación:* ${eventLocation}\n\nGracias por registrarte. ¡Esperamos verte pronto!`

    // Simular envío de mensaje
    console.log(`Mensaje de WhatsApp para ${to}:`, message)

    // En un entorno real, aquí se integraría con la API de WhatsApp Business o Twilio
    return { success: true, message: "WhatsApp message would be sent in production", simulatedMessage: message }
  } catch (error: any) {
    console.error("Error al enviar mensaje de WhatsApp:", error)
    return { success: false, message: `Error sending WhatsApp message: ${error.message}` }
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
    // Enviar correo electrónico
    let emailResult = null
    try {
      emailResult = await sendEventRegistrationEmail({
        to: recipient.email,
        name: recipient.name,
        eventTitle: event.title,
        eventDate: new Date(event.date),
        eventLocation: event.location,
      })
    } catch (error) {
      console.error("Error sending Email:", error)
      emailResult = { success: false, error }
    }

    // Enviar WhatsApp (simulado)
    let whatsappResult = null
    try {
      if (recipient.phone) {
        whatsappResult = await sendWhatsAppMessage({
          to: recipient.phone,
          name: recipient.name,
          eventTitle: event.title,
          eventDate: new Date(event.date),
          eventLocation: event.location,
        })
      }
    } catch (error) {
      console.error("Error sending WhatsApp:", error)
      whatsappResult = { success: false, error }
    }

    return {
      success: emailResult?.success || whatsappResult?.success || false,
      email: emailResult,
      whatsapp: whatsappResult,
    }
  } catch (error) {
    console.error("Error in sendNotification:", error)
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
        whatsappSent: result.whatsapp?.success || false,
        emailSent: result.email?.success || false,
      })
    } catch (error: any) {
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
