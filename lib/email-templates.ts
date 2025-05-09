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
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .email-wrapper {
          border: 1px solid #dddddd;
          border-radius: 5px;
          padding: 20px;
          background-color: #ffffff;
        }
        .logo-container {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .header {
          color: #0066cc;
          text-align: center;
          margin-bottom: 20px;
          font-size: 24px;
          font-weight: bold;
        }
        .content {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .event-details {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .event-details p {
          margin: 5px 0;
        }
        .button-container {
          margin: 25px 0;
          text-align: center;
        }
        .button-container p {
          font-size: 16px;
          margin-bottom: 15px;
        }
        .button {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          margin-right: 10px;
          font-weight: bold;
          font-size: 16px;
        }
        .button-decline {
          background-color: #f44336;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eeeeee;
          color: #666666;
          font-size: 14px;
        }
        .footer p {
          margin-bottom: 10px;
        }
        .footer a {
          color: #0066cc;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="logo-container">
            <img src="${logoUrl}" alt="Inter Puerto Rico FC Logo" class="logo">
          </div>
          
          <h2 class="header">¡Registro Confirmado!</h2>
          
          <div class="content">
            <p>Hola ${recipientName},</p>
            
            <p>Tu registro para el evento <strong>"${eventTitle}"</strong> ha sido confirmado.</p>
            
            <div class="event-details">
              <p><strong>Evento:</strong> ${eventTitle}</p>
              <p><strong>Fecha:</strong> ${formattedDate}</p>
              <p><strong>Ubicación:</strong> ${eventLocation}</p>
              <p><strong>Jugador:</strong> ${name}</p>
            </div>
            
            <div class="button-container">
              <p>¿Confirmas tu asistencia al evento?</p>
              
              <a href="${baseUrl}/api/events/confirm/${eventId}?email=${encodeURIComponent(email)}&confirm=yes" class="button">Sí, asistiré</a>
              
              <a href="${baseUrl}/api/events/confirm/${eventId}?email=${encodeURIComponent(email)}&confirm=no" class="button button-decline">No podré asistir</a>
            </div>
            
            <p>Gracias por registrarte. ¡Esperamos verte pronto!</p>
          </div>
          
          <div class="footer">
            <p>Este es un correo electrónico automático, por favor no respondas a este mensaje.</p>
            <p>Si no solicitaste este registro, puedes ignorar este mensaje.</p>
            <p>Inter Puerto Rico FC &copy; ${new Date().getFullYear()}</p>
            <p>
              <a href="${baseUrl}">Visitar sitio web</a>
            </p>
          </div>
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
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .email-wrapper {
          border: 1px solid #dddddd;
          border-radius: 5px;
          padding: 20px;
          background-color: #ffffff;
        }
        .logo-container {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .header {
          color: #0066cc;
          text-align: center;
          margin-bottom: 20px;
          font-size: 24px;
          font-weight: bold;
        }
        .content {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .event-details {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .event-details p {
          margin: 5px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eeeeee;
          color: #666666;
          font-size: 14px;
        }
        .footer p {
          margin-bottom: 10px;
        }
        .footer a {
          color: #0066cc;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="logo-container">
            <img src="${logoUrl}" alt="Inter Puerto Rico FC Logo" class="logo">
          </div>
          
          <h2 class="header">¡Recordatorio de Evento!</h2>
          
          <div class="content">
            <p>Hola ${recipientName},</p>
            
            <p>Te recordamos que el evento <strong>"${eventTitle}"</strong> está próximo a realizarse.</p>
            
            <div class="event-details">
              <p><strong>Evento:</strong> ${eventTitle}</p>
              <p><strong>Fecha:</strong> ${formattedDate}</p>
              <p><strong>Ubicación:</strong> ${eventLocation}</p>
              <p><strong>Jugador:</strong> ${name}</p>
            </div>
            
            <p>¡Esperamos verte pronto!</p>
          </div>
          
          <div class="footer">
            <p>Este es un correo electrónico automático, por favor no respondas a este mensaje.</p>
            <p>Inter Puerto Rico FC &copy; ${new Date().getFullYear()}</p>
            <p>
              <a href="${baseUrl}">Visitar sitio web</a>
            </p>
          </div>
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
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .email-wrapper {
          border: 1px solid #dddddd;
          border-radius: 5px;
          padding: 20px;
          background-color: #ffffff;
        }
        .logo-container {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .header {
          color: #0066cc;
          text-align: center;
          margin-bottom: 20px;
          font-size: 24px;
          font-weight: bold;
        }
        .content {
          font-size: 16px;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eeeeee;
          color: #666666;
          font-size: 14px;
        }
        .footer p {
          margin-bottom: 10px;
        }
        .footer a {
          color: #0066cc;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="logo-container">
            <img src="${logoUrl}" alt="Inter Puerto Rico FC Logo" class="logo">
          </div>
          
          <h2 class="header">${subject}</h2>
          
          <div class="content">
            <p>Hola ${recipientName},</p>
            
            <div style="margin: 20px 0;">
              ${message.replace(/\n/g, "<br>")}
            </div>
            
            <p>Saludos,<br>Equipo de Inter Puerto Rico FC</p>
          </div>
          
          <div class="footer">
            <p>Este es un correo electrónico automático, por favor no respondas a este mensaje.</p>
            <p>Inter Puerto Rico FC &copy; ${new Date().getFullYear()}</p>
            <p>
              <a href="${baseUrl}">Visitar sitio web</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
