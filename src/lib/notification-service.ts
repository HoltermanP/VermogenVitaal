import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface AlertNotification {
  symbol: string
  name: string
  changePercent: number
  currentPrice: number
  previousPrice: number
  type: "gain" | "loss"
  userEmail: string
  userName?: string
}

/**
 * Verstuur een email notificatie voor een portfolio alert
 */
export async function sendEmailAlert(alert: AlertNotification): Promise<boolean> {
  if (!resend) {
    console.error("RESEND_API_KEY niet geconfigureerd")
    return false
  }

  try {
    const direction = alert.type === "gain" ? "gestegen" : "gedaald"
    const emoji = alert.type === "gain" ? "📈" : "📉"
    const color = alert.type === "gain" ? "green" : "red"

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: white; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .price-info { display: flex; justify-content: space-between; margin: 15px 0; }
            .price-label { font-weight: bold; color: #666; }
            .price-value { font-size: 1.2em; color: ${color}; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${emoji} Portfolio Alert</h1>
            </div>
            <div class="content">
              <h2>Hallo ${alert.userName || "gebruiker"},</h2>
              <p>Je portfolio alert is geactiveerd!</p>
              
              <div class="alert-box">
                <h3>${alert.name} (${alert.symbol})</h3>
                <p>De koers is <strong>${Math.abs(alert.changePercent).toFixed(2)}%</strong> ${direction}</p>
                
                <div class="price-info">
                  <span class="price-label">Vorige prijs:</span>
                  <span class="price-value">€${alert.previousPrice.toFixed(2)}</span>
                </div>
                <div class="price-info">
                  <span class="price-label">Huidige prijs:</span>
                  <span class="price-value">€${alert.currentPrice.toFixed(2)}</span>
                </div>
                <div class="price-info">
                  <span class="price-label">Verandering:</span>
                  <span class="price-value" style="color: ${color}">
                    ${alert.changePercent > 0 ? "+" : ""}${alert.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <p>Log in op je account om je volledige portfolio te bekijken.</p>
              
              <div class="footer">
                <p>Deze melding is automatisch gegenereerd door Tax & Wealth Hub</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Tax & Wealth Hub <onboarding@resend.dev>", // Vervang met je geverifieerde domain
      to: alert.userEmail,
      subject: `${emoji} Alert: ${alert.symbol} is ${Math.abs(alert.changePercent).toFixed(2)}% ${direction}`,
      html: htmlContent,
    })

    if (result.error) {
      console.error("Fout bij verzenden email:", result.error)
      return false
    }

    console.log("Email alert verzonden naar:", alert.userEmail)
    return true
  } catch (error) {
    console.error("Error sending email alert:", error)
    return false
  }
}

/**
 * Verstuur een WhatsApp notificatie voor een portfolio alert
 * Gebruikt Twilio WhatsApp API
 */
export async function sendWhatsAppAlert(
  alert: AlertNotification,
  whatsappNumber: string
): Promise<boolean> {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
  const twilioWhatsAppFrom = process.env.TWILIO_WHATSAPP_FROM // Format: whatsapp:+14155238886

  if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppFrom) {
    console.error("Twilio credentials niet geconfigureerd")
    return false
  }

  try {
    // Format WhatsApp nummer (verwijder spaties, voeg + toe indien nodig)
    const formattedNumber = whatsappNumber.startsWith("+")
      ? whatsappNumber
      : `+${whatsappNumber.replace(/\s/g, "")}`
    const toNumber = `whatsapp:${formattedNumber}`

    const direction = alert.type === "gain" ? "gestegen" : "gedaald"
    const emoji = alert.type === "gain" ? "📈" : "📉"

    const message = `${emoji} *Portfolio Alert*

${alert.name} (${alert.symbol})

De koers is *${Math.abs(alert.changePercent).toFixed(2)}%* ${direction}

Vorige prijs: €${alert.previousPrice.toFixed(2)}
Huidige prijs: €${alert.currentPrice.toFixed(2)}
Verandering: ${alert.changePercent > 0 ? "+" : ""}${alert.changePercent.toFixed(2)}%

Log in op je account voor meer details.

Tax & Wealth Hub`

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          From: twilioWhatsAppFrom,
          To: toNumber,
          Body: message,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("Fout bij verzenden WhatsApp:", error)
      return false
    }

    console.log("WhatsApp alert verzonden naar:", formattedNumber)
    return true
  } catch (error) {
    console.error("Error sending WhatsApp alert:", error)
    return false
  }
}

/**
 * Verstuur notificaties op basis van het gekozen type
 */
export async function sendAlertNotifications(
  alert: AlertNotification,
  notificationType: "EMAIL" | "WHATSAPP" | "BOTH",
  whatsappNumber?: string | null
): Promise<{ emailSent: boolean; whatsappSent: boolean }> {
  const result = {
    emailSent: false,
    whatsappSent: false,
  }

  if (notificationType === "EMAIL" || notificationType === "BOTH") {
    result.emailSent = await sendEmailAlert(alert)
  }

  if ((notificationType === "WHATSAPP" || notificationType === "BOTH") && whatsappNumber) {
    result.whatsappSent = await sendWhatsAppAlert(alert, whatsappNumber)
  }

  return result
}

