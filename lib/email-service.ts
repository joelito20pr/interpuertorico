import nodemailer from "nodemailer"
import { db } from "./db"

// Configuración del servicio de correo electrónico
const emailConfig = {
  service: process.env.FREE_EMAIL_SERVICE || "gmail",
  user: process.env.FREE_EMAIL_USER,
  pass: process.env.FREE_EMAIL_PASS,
  from: process.env.FREE_EMAIL_FROM || "noreply@example.com",
  fromName: "Inter Puerto Rico FC",
  domain: process.env.EMAIL_DOMAIN || "interprfc.com",
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

  // Usar SMTP directo si se proporcionan los detalles
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
    })
  }

  // Usar servicio predefinido como alternativa
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

// Generar un ID único para el mensaje
function generateMessageId(to: string): string {
  const domain = emailConfig.domain
  const random = Math.random().toString(36).substring(2, 15)
  const timestamp = Date.now()
  return `${random}.${timestamp}@${domain}`
}

// Enviar correo electrónico con mejoras anti-spam
export async function sendEmailNotification({
  to,
  subject,
  html,
  text,
  eventId,
}: {
  to: string
  subject: string
  html: string
  text?: string
  eventId?: string
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

    // Generar un ID único para el mensaje
    const messageId = generateMessageId(to)

    // Fecha actual en formato RFC 2822
    const date = new Date().toUTCString()

    // Dominio del remitente
    const domain = emailConfig.domain

    // Crear un ID único para el feedback
    const feedbackId = eventId ? `${eventId}:${Date.now()}` : `general:${Date.now()}`

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
      messageId: `<${messageId}>`,
      date,
      headers: {
        // Cabeceras estándar
        "MIME-Version": "1.0",
        "Content-Type": "text/html; charset=UTF-8",
        "Content-Transfer-Encoding": "quoted-printable",

        // Cabeceras para mejorar la entrega
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "High",
        "X-Mailer": "Inter Puerto Rico FC Notification System",

        // Cabeceras para autenticación y reputación
        "List-Unsubscribe": `<mailto:${emailConfig.from}?subject=unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        "Feedback-ID": feedbackId,

        // Cabeceras para prevenir spam
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        "Auto-Submitted": "auto-generated",
        Precedence: "bulk",
      },
      dsn: {
        id: messageId,
        return: "headers",
        notify: ["failure", "delay"],
        recipient: emailConfig.from,
      },
    })

    console.log("Correo enviado:", info.messageId)

    // Registrar el correo en la base de datos
    if (eventId) {
      await logEmailSent(to, subject, eventId, info.messageId)
    }

    return { success: true, message: "Email sent successfully", messageId: info.messageId }
  } catch (error: any) {
    console.error("Error al enviar correo electrónico:", error)
    return { success: false, message: `Error sending email: ${error.message}` }
  }
}
