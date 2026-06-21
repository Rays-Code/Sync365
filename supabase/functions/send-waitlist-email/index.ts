import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SESClient, SendEmailCommand } from "npm:@aws-sdk/client-ses"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BRAND_EMAIL = "hello@sync365.app"
const BRAND_FOOTER = `Need help? Contact us at <a href="mailto:${BRAND_EMAIL}" style="color: #d4a574;">${BRAND_EMAIL}</a><br/>© ${new Date().getFullYear()} sync365.app. All rights reserved.`

function wrapEmail(body: string): string {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1625 0%, #0f0d12 100%); color: #f5f2f0; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #d4a574 0%, #8b5cf6 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; line-height: 60px;">
          <span style="font-size: 28px; font-weight: bold; color: #0f0d12; font-family: sans-serif;">f</span>
        </div>
      </div>
      ${body}
      <p style="color: #6b6b6b; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px;">
        ${BRAND_FOOTER}
      </p>
    </div>
  `
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name } = await req.json()

    if (!email) {
      throw new Error("Missing email in request body")
    }

    const recipientName = name || "Future Member"
    const subject = "You're on the list! Welcome to sync365 early access 🌙"

    const html = wrapEmail(`
      <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 600; text-align: center; color: #f5f2f0;">Welcome to early access! 🌙</h1>
      <p style="color: #a8a29e; line-height: 1.6;">Hi <strong style="color: #f5f2f0;">${recipientName}</strong>,</p>
      <p style="color: #a8a29e; line-height: 1.6;">Thank you for joining the sync365 early access waitlist. We are thrilled to have you with us!</p>
      <p style="color: #a8a29e; line-height: 1.6;">Our team is working hard to bring you the ultimate AI-powered menstrual health companion. You've secured your spot in line, and we will contact you as soon as spots open up.</p>
      
      <div style="background: rgba(212, 165, 116, 0.1); border: 1px solid rgba(212, 165, 116, 0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px 0; color: #d4a574; font-size: 16px;">Early Access Perks</h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #a8a29e; line-height: 1.8;">
          <li>Priority invitation to the beta app</li>
          <li>Exclusive discounts on premium memberships</li>
          <li>Direct line for feedback and feature requests</li>
        </ul>
      </div>
      
      <p style="color: #a8a29e; line-height: 1.6;">Stay tuned for more updates, and welcome to the future of wellness tracking!</p>
    `)

    const accessKeyId = Deno.env.get("AWS_SES_ACCESS_KEY_ID")
    const secretAccessKey = Deno.env.get("AWS_SES_SECRET_ACCESS_KEY")
    const region = Deno.env.get("AWS_SES_REGION") || "us-east-1"
    const fromEmail = Deno.env.get("AWS_SES_FROM_EMAIL") || "hello@sync365.app"

    if (!accessKeyId || !secretAccessKey) {
      console.warn("AWS SES credentials not configured. Logging waitlist payload and skipping send:", { email, recipientName })
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Waitlist email logged (AWS SES credentials not configured)" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: html,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: fromEmail,
    })

    const response = await sesClient.send(command)
    console.log(`Waitlist email successfully sent to ${email}. MessageId: ${response.MessageId}`)

    return new Response(JSON.stringify({ success: true, messageId: response.MessageId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error sending waitlist email:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

