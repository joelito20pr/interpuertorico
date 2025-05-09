// URL base para enlaces y recursos
const getBaseUrl = () => process.env.NEXT_PUBLIC_APP_URL || "https://www.interprfc.com"

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
  const baseUrl = getBaseUrl()

  // Nombre del destinatario (encargado o jugador)
  const recipientName = guardianName || name

  // URL del logo
  const logoUrl = `${baseUrl}/logo.png`

  // Crear contenido del correo electrónico
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Confirmación de Registro - Inter Puerto Rico FC</title>
    </head>
    <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
      <div style="border: 1px solid #dddddd; border-radius: 5px; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="Inter Puerto Rico FC Logo" style="max-width: 150px; height: auto;">
        </div>
        
        <h2 style="color: #0066cc; text-align: center; margin-bottom: 20px;">¡Registro Confirmado!</h2>
        
        <p style="font-size: 16px; margin-bottom: 10px;">Hola ${recipientName},</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">Tu registro para el evento <strong>"${eventTitle}"</strong> ha sido confirmado.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Evento:</strong> ${eventTitle}</p>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;"><strong>Ubicación:</strong> ${eventLocation}</p>
          <p style="margin: 5px 0;"><strong>Jugador:</strong> ${name}</p>
        </div>
        
        <div style="margin: 25px 0; text-align: center;">
          <p style="font-size: 16px; margin-bottom: 15px;">¿Confirmas tu asistencia al evento?</p>
          
          <a href="${baseUrl}/api/events/confirm/${eventId}?email=${encodeURIComponent(email)}&confirm=yes" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-right: 10px; font-weight: bold; font-size: 16px;">Sí, asistiré</a>
          
          <a href="${baseUrl}/api/events/confirm/${eventId}?email=${encodeURIComponent(email)}&confirm=no" style="display: inline-block; background-color: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">No podré asistir</a>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;">Gracias por registrarte. ¡Esperamos verte pronto!</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee; color: #666666; font-size: 14px;">
          <p style="margin-bottom: 10px;">Este es un correo electrónico automático, por favor no respondas a este mensaje.</p>
          <p style="margin-bottom: 10px;">Si no solicitaste este registro, puedes ignorar este mensaje.</p>
          <p style="margin-bottom: 10px;">Inter Puerto Rico FC &copy; ${new Date().getFullYear()}</p>
          <p style="margin-bottom: 10px;">
            <a href="${baseUrl}" style="color: #0066cc; text-decoration: underline;">Visitar sitio web</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generar contenido HTML para correo de recordatorio
export function generateReminderEmailContent({
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
  const baseUrl = getBaseUrl()

  // Nombre del destinatario (encargado o jugador)
  const recipientName = guardianName || name

  // URL del logo
  const logoUrl = `${baseUrl}/logo.png`

  // Crear contenido del correo electrónico
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Recordatorio de Evento - Inter Puerto Rico FC</title>
    </head>
    <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
      <div style="border: 1px solid #dddddd; border-radius: 5px; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="Inter Puerto Rico FC Logo" style="max-width: 150px; height: auto;">
        </div>
        
        <h2 style="color: #0066cc; text-align: center; margin-bottom: 20px;">¡Recordatorio de Evento!</h2>
        
        <p style="font-size: 16px; margin-bottom: 10px;">Hola ${recipientName},</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">Te recordamos que el evento <strong>"${eventTitle}"</strong> está próximo a realizarse.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Evento:</strong> ${eventTitle}</p>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;"><strong>Ubicación:</strong> ${eventLocation}</p>
          <p style="margin: 5px 0;"><strong>Jugador:</strong> ${name}</p>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;">¡Esperamos verte pronto!</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee; color: #666666; font-size: 14px;">
          <p style="margin-bottom: 10px;">Este es un correo electrónico automático, por favor no respondas a este mensaje.</p>
          <p style="margin-bottom: 10px;">Inter Puerto Rico FC &copy; ${new Date().getFullYear()}</p>
          <p style="margin-bottom: 10px;">
            <a href="${baseUrl}" style="color: #0066cc; text-decoration: underline;">Visitar sitio web</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generar contenido HTML para correo de notificación general
export function generateNotificationEmailContent({
  name,
  subject,
  message,
  guardianName,
}: {
  name: string
  subject: string
  message: string
  guardianName?: string
}): string {
  // URL base para enlaces
  const baseUrl = getBaseUrl()

  // Nombre del destinatario (encargado o jugador)
  const recipientName = guardianName || name

  // URL del logo
  const logoUrl = `${baseUrl}/logo.png`

  // Crear contenido del correo electrónico
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${subject} - Inter Puerto Rico FC</title>
    </head>
    <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
      <div style="border: 1px solid #dddddd; border-radius: 5px; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="Inter Puerto Rico FC Logo" style="max-width: 150px; height: auto;">
        </div>
        
        <h2 style="color: #0066cc; text-align: center; margin-bottom: 20px;">${subject}</h2>
        
        <p style="font-size: 16px; margin-bottom: 10px;">Hola ${recipientName},</p>
        
        <div style="font-size: 16px; margin: 20px 0; line-height: 1.6;">
          ${message.replace(/\n/g, "<br>")}
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;">Saludos,<br>Equipo de Inter Puerto Rico FC</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee; color: #666666; font-size: 14px;">
          <p style="margin-bottom: 10px;">Este es un correo electrónico automático, por favor no respondas a este mensaje.</p>
          <p style="margin-bottom: 10px;">Inter Puerto Rico FC &copy; ${new Date().getFullYear()}</p>
          <p style="margin-bottom: 10px;">
            <a href="${baseUrl}" style="color: #0066cc; text-decoration: underline;">Visitar sitio web</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
