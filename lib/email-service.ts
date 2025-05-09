import nodemailer from "nodemailer"
import { db } from "@/lib/db"

// Configuración del servicio de correo electrónico
const emailConfig = {
  service: process.env.FREE_EMAIL_SERVICE || "gmail",
  user: process.env.FREE_EMAIL_USER,
  pass: process.env.FREE_EMAIL_PASS,
  from: process.env.FREE_EMAIL_FROM || "noreply@example.com",
  fromName: "Inter Puerto Rico FC",
}

// Verificar si el servicio de correo electrónico está configurado
export const isEmailConfigured = (): boolean => {
  return !!(emailConfig.user && emailConfig.pass)
}

// Crear transportador de correo electrónico
export const createTransporter = () => {
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

// Registrar un correo electrónico en la base de datos
export async function logEmailSent(to: string, subject: string, eventId: string, messageId?: string): Promise<void> {
  try {
    const emailId = `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    await db`
      INSERT INTO "EmailLog" (
        id, 
        recipient, 
        subject, 
        "eventId", 
        "messageId", 
        "createdAt"
      ) VALUES (
        ${emailId},
        ${to},
        ${subject},
        ${eventId},
        ${messageId || null},
        NOW()
      )
    `.catch((err) => {
      // Si la tabla no existe, la creamos
      if (err.message.includes('relation "EmailLog" does not exist')) {
        return db`
          CREATE TABLE "EmailLog" (
            id TEXT PRIMARY KEY,
            recipient TEXT NOT NULL,
            subject TEXT NOT NULL,
            "eventId" TEXT NOT NULL,
            "messageId" TEXT,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            "status" TEXT DEFAULT 'SENT'
          )
        `.then(() => logEmailSent(to, subject, eventId, messageId))
      }
      throw err
    })
  } catch (error) {
    console.error("Error logging email:", error)
  }
}

// Enviar correo electrónico con mejoras para evitar spam
export async function sendEmail({
  to,
  subject,
  html,
  eventId,
  text,
}: {
  to: string
  subject: string
  html: string
  eventId: string
  text?: string
}) {
  console.log(`Intentando enviar correo a ${to}...`)

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

    // Generar texto plano a partir del HTML si no se proporciona
    const plainText = text || html.replace(/<[^>]*>?/gm, "")

    // Enviar correo con configuraciones para evitar spam
    const info = await transporter.sendMail({
      from: {
        name: emailConfig.fromName,
        address: emailConfig.from,
      },
      to,
      subject,
      html,
      text: plainText,
      headers: {
        // Cabeceras para mejorar la entrega
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "High",
        "X-Mailer": "Inter Puerto Rico FC Notification System",
        // Cabeceras para autenticación
        "List-Unsubscribe": `<mailto:${emailConfig.from}?subject=unsubscribe>`,
        "Feedback-ID": `${eventId}:interprfc:${Date.now()}`,
      },
    })

    console.log("Correo enviado:", info.messageId)

    // Registrar el correo en la base de datos
    await logEmailSent(to, subject, eventId, info.messageId)

    return { success: true, message: "Email sent successfully", messageId: info.messageId }
  } catch (error: any) {
    console.error("Error al enviar correo electrónico:", error)
    return { success: false, message: `Error sending email: ${error.message}` }
  }
}

// Generar contenido HTML para correo de confirmación de registro
export function generateRegistrationEmailContent({
  name,
  eventTitle,
  eventDate,
  eventLocation,
  eventId,
  email,
  guardianName,
}: {
  name: string
  eventTitle: string
  eventDate: Date | string
  eventLocation: string
  eventId: string
  email: string
  guardianName?: string
}): string {
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
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Registro</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="border: 1px solid #eee; border-radius: 5px; padding: 20px;">
        <img src="${baseUrl}/icon.png" alt="Logo" style="display: block; margin: 0 auto; max-width: 100px; margin-bottom: 20px;">
        <h2 style="color: #0066cc; text-align: center;">¡Registro Confirmado!</h2>
        <p style="color: #333; font-size: 16px;">Hola ${recipientName},</p>
        <p style="color: #333; font-size: 16px;">Tu registro para el evento <strong>"${eventTitle}"</strong> ha sido confirmado.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Evento:</strong> ${eventTitle}</p>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;"><strong>Ubicación:</strong> ${eventLocation}</p>
          <p style="margin: 5px 0;"><strong>Jugador:</strong> ${name}</p>
        </div>
        
        <div style="margin: 20px 0; text-align: center;">
          <p style="color: #333;">¿Confirmas tu asistencia al evento?</p>
          <a href="${baseUrl}/api/events/confirm/${eventId}?email=${encodeURIComponent(email)}&confirm=yes" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px; font-weight: bold;">Sí, asistiré</a>
          <a href="${baseUrl}/api/events/confirm/${eventId}?email=${encodeURIComponent(email)}&confirm=no" style="display: inline-block; background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">No podré asistir</a>
        </div>
        
        <p style="color: #333; font-size: 16px;">Gracias por registrarte. ¡Esperamos verte pronto!</p>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
          <p>Este es un correo electrónico automático, por favor no respondas a este mensaje.</p>
          <p>Inter Puerto Rico FC &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `
}
