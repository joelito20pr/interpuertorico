import fetch from "node-fetch"

// Configuración de Formspark
const formsparkConfig = {
  formId: process.env.FORMSPARK_FORM_ID,
  apiKey: process.env.FORMSPARK_API_KEY,
}

// Verificar si Formspark está configurado
export const isFormsparkConfigured = (): boolean => {
  return !!(formsparkConfig.formId && formsparkConfig.apiKey)
}

// Enviar correo electrónico a través de Formspark
export async function sendFormsparkEmail({
  to,
  subject,
  message,
  name,
  eventTitle,
  eventDate,
  eventLocation,
  confirmationUrl,
  declineUrl,
}: {
  to: string
  subject: string
  message: string
  name: string
  eventTitle?: string
  eventDate?: string | Date
  eventLocation?: string
  confirmationUrl?: string
  declineUrl?: string
}) {
  if (!isFormsparkConfigured()) {
    console.warn("Formspark not configured. Check environment variables.")
    return { success: false, message: "Formspark not configured" }
  }

  try {
    // Formatear fecha del evento si existe
    let formattedDate = ""
    if (eventDate) {
      formattedDate = new Date(eventDate).toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    // Construir el payload para Formspark
    const payload = {
      _email: to,
      _subject: subject,
      message,
      name,
      eventTitle,
      eventDate: formattedDate,
      eventLocation,
      confirmationUrl,
      declineUrl,
      _template: "confirmation", // Plantilla personalizada en Formspark
    }

    // Eliminar campos undefined
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key]
      }
    })

    // Enviar solicitud a Formspark
    const response = await fetch(`https://submit-form.com/${formsparkConfig.formId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${formsparkConfig.apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Formspark error: ${response.status} ${errorText}`)
    }

    return { success: true, message: "Email sent successfully via Formspark" }
  } catch (error) {
    console.error("Error sending email via Formspark:", error)
    return {
      success: false,
      message: `Error sending email via Formspark: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
