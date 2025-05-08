// Configuración para servicios de notificación
export const notificationConfig = {
  // Twilio para WhatsApp
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || "", // Formato: "whatsapp:+1234567890"
  },

  // SendGrid para Email
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || "",
    fromEmail: process.env.SENDGRID_FROM_EMAIL || "noreply@interpuertorico.com",
    fromName: process.env.SENDGRID_FROM_NAME || "Inter Puerto Rico",
  },

  // Configuración general
  enabled: {
    whatsapp: process.env.ENABLE_WHATSAPP === "true",
    email: process.env.ENABLE_EMAIL === "true",
  },
}
