// Servicio de correo electrónico alternativo usando un endpoint externo
export async function sendEmailViaExternalService({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  try {
    console.log(`Intentando enviar correo a ${to} via servicio externo...`)

    // Usar un servicio externo como alternativa
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_USER_ID,
        template_params: {
          to_email: to,
          subject: subject,
          message_html: html,
          message_text: text || html.replace(/<[^>]*>?/gm, ""),
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error en servicio externo: ${response.status} - ${errorText}`)
    }

    console.log("Correo enviado via servicio externo")
    return { success: true, message: "Email sent successfully via external service" }
  } catch (error: any) {
    console.error("Error al enviar correo via servicio externo:", error)
    return { success: false, message: `Error sending email via external service: ${error.message}` }
  }
}
