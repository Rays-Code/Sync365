import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SESClient, SendEmailCommand } from "npm:@aws-sdk/client-ses"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BRAND_EMAIL = "hello@sync365.app"
const BRAND_FOOTER = `Need help? Contact us at <a href="mailto:${BRAND_EMAIL}" style="color: #d4a574;">${BRAND_EMAIL}</a><br/>© ${new Date().getFullYear()} sync365.app. All rights reserved.`

const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to sync365! Your cycle companion awaits 🌙',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1625 0%, #0f0d12 100%); color: #f5f2f0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #d4a574 0%, #8b5cf6 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; line-height: 60px;">
            <span style="font-size: 28px; font-weight: bold; color: #0f0d12; font-family: sans-serif;">f</span>
          </div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #f5f2f0;">Welcome to sync365!</h1>
        </div>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">Hi <strong style="color: #f5f2f0;">{{customer_name}}</strong>,</p>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">Welcome to the sync365 family! We're thrilled to have you join women who are taking control of their wellness journey.</p>
        <div style="background: rgba(212, 165, 116, 0.1); border: 1px solid rgba(212, 165, 116, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #d4a574; font-size: 16px;">Getting Started</h3>
          <ol style="margin: 0; padding: 0 0 0 20px; color: #a8a29e; line-height: 2;">
            <li>Download the sync365 app</li>
            <li>Log your last period start date</li>
            <li>Set up symptom tracking preferences</li>
            <li>Explore your personalized insights</li>
          </ol>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{{app_url}}" style="display: inline-block; background: linear-gradient(135deg, #d4a574 0%, #8b5cf6 100%); color: #0f0d12; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600;">Get Started</a>
        </div>
        <p style="color: #6b6b6b; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px;">{{BRAND_FOOTER}}</p>
      </div>
    `
  },
  orderConfirmation: {
    subject: 'Your sync365 order has been confirmed! 🌙',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1625 0%, #0f0d12 100%); color: #f5f2f0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #d4a574 0%, #8b5cf6 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; line-height: 60px;">
            <span style="font-size: 28px; font-weight: bold; color: #0f0d12; font-family: sans-serif;">f</span>
          </div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #f5f2f0;">Order Confirmed!</h1>
        </div>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">Hi <strong style="color: #f5f2f0;">{{customer_name}}</strong>,</p>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">Thank you for your purchase! Your order has been successfully processed.</p>
        <div style="background: rgba(212, 165, 116, 0.1); border: 1px solid rgba(212, 165, 116, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #d4a574; font-size: 16px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #a8a29e;">Order Number:</td><td style="padding: 8px 0; color: #f5f2f0; text-align: right; font-family: monospace;">{{order_number}}</td></tr>
            <tr><td style="padding: 8px 0; color: #a8a29e;">Product:</td><td style="padding: 8px 0; color: #f5f2f0; text-align: right;">{{product_name}}</td></tr>
            <tr><td style="padding: 8px 0; color: #a8a29e;">Amount:</td><td style="padding: 8px 0; color: #d4a574; text-align: right; font-weight: 600;">{{amount}}</td></tr>
            <tr><td style="padding: 8px 0; color: #a8a29e;">Date:</td><td style="padding: 8px 0; color: #f5f2f0; text-align: right;">{{date}}</td></tr>
          </table>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{{app_url}}" style="display: inline-block; background: linear-gradient(135deg, #d4a574 0%, #8b5cf6 100%); color: #0f0d12; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600;">Open sync365 App</a>
        </div>
        <p style="color: #6b6b6b; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px;">{{BRAND_FOOTER}}</p>
      </div>
    `
  },
  subscriptionWelcome: {
    subject: 'Welcome to {{plan_name}}! Your wellness journey begins ✨',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1625 0%, #0f0d12 100%); color: #f5f2f0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #d4a574 0%, #8b5cf6 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; line-height: 60px;">
            <span style="font-size: 28px; font-weight: bold; color: #0f0d12; font-family: sans-serif;">f</span>
          </div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #f5f2f0;">Welcome to {{plan_name}}!</h1>
        </div>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">Hi <strong style="color: #f5f2f0;">{{customer_name}}</strong>,</p>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">You've unlocked the full power of sync365! Your premium features are now active.</p>
        <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #8b5cf6; font-size: 16px;">Your {{plan_name}} Features</h3>
          <ul style="margin: 0; padding: 0 0 0 20px; color: #a8a29e; line-height: 2;">
            <li>AI-powered cycle predictions</li>
            <li>50+ symptom tracking options</li>
            <li>Fertility window predictions</li>
            <li>Trend analysis & insights</li>
            <li>Partner sharing</li>
            <li>Priority support</li>
          </ul>
        </div>
        <div style="background: rgba(212, 165, 116, 0.1); border: 1px solid rgba(212, 165, 116, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #d4a574; font-size: 16px;">Billing Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #a8a29e;">Plan:</td><td style="padding: 8px 0; color: #f5f2f0; text-align: right;">{{plan_name}}</td></tr>
            <tr><td style="padding: 8px 0; color: #d4a574; text-align: right; font-weight: 600;">{{amount}}/{{billing_cycle}}</td></tr>
            <tr><td style="padding: 8px 0; color: #a8a29e;">Next Billing:</td><td style="padding: 8px 0; color: #f5f2f0; text-align: right;">{{next_billing_date}}</td></tr>
          </table>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{{app_url}}" style="display: inline-block; background: linear-gradient(135deg, #d4a574 0%, #8b5cf6 100%); color: #0f0d12; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600;">Start Exploring</a>
        </div>
        <p style="color: #6b6b6b; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px;">{{BRAND_FOOTER}}</p>
      </div>
    `
  },
  redemption: {
    subject: 'Code redeemed! You now have {{product_name}} ✨',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1625 0%, #0f0d12 100%); color: #f5f2f0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #d4a574 0%, #8b5cf6 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; line-height: 60px;">
            <span style="font-size: 28px; font-weight: bold; color: #0f0d12; font-family: sans-serif;">f</span>
          </div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #f5f2f0;">Code Redeemed!</h1>
        </div>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">Hi <strong style="color: #f5f2f0;">{{customer_name}}</strong>,</p>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">Your redemption code has been successfully applied. Your premium features are now active!</p>
        <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #8b5cf6; font-size: 16px;">Redemption Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #a8a29e;">Code:</td><td style="padding: 8px 0; color: #f5f2f0; text-align: right; font-family: monospace;">{{code}}</td></tr>
            <tr><td style="padding: 8px 0; color: #a8a29e;">Plan Activated:</td><td style="padding: 8px 0; color: #8b5cf6; text-align: right; font-weight: 600;">{{product_name}}</td></tr>
            <tr><td style="padding: 8px 0; color: #a8a29e;">Status:</td><td style="padding: 8px 0; color: #2dd4bf; text-align: right;">✓ Active</td></tr>
          </table>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{{app_url}}" style="display: inline-block; background: linear-gradient(135deg, #d4a574 0%, #8b5cf6 100%); color: #0f0d12; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600;">Go to Dashboard</a>
        </div>
        <p style="color: #6b6b6b; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px;">{{BRAND_FOOTER}}</p>
      </div>
    `
  },
  refundProcessed: {
    subject: 'Your refund has been processed',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1625 0%, #0f0d12 100%); color: #f5f2f0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #d4a574 0%, #8b5cf6 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; line-height: 60px;">
            <span style="font-size: 28px; font-weight: bold; color: #0f0d12; font-family: sans-serif;">f</span>
          </div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #f5f2f0;">Refund Processed</h1>
        </div>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">Hi <strong style="color: #f5f2f0;">{{customer_name}}</strong>,</p>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">We've processed your refund. The funds should appear in your account within 5-10 business days.</p>
        <div style="background: rgba(45, 212, 191, 0.1); border: 1px solid rgba(45, 212, 191, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #2dd4bf; font-size: 16px;">Refund Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #a8a29e;">Reference:</td><td style="padding: 8px 0; color: #f5f2f0; text-align: right; font-family: monospace;">{{order_number}}</td></tr>
            <tr><td style="padding: 8px 0; color: #a8a29e;">Refund Amount:</td><td style="padding: 8px 0; color: #2dd4bf; text-align: right; font-weight: 600;">{{amount}}</td></tr>
            <tr><td style="padding: 8px 0; color: #a8a29e;">Status:</td><td style="padding: 8px 0; color: #2dd4bf; text-align: right;">✓ Approved</td></tr>
            <tr><td style="padding: 8px 0; color: #a8a29e;">Processed On:</td><td style="padding: 8px 0; color: #f5f2f0; text-align: right;">{{date}}</td></tr>
          </table>
        </div>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">If you have any questions, contact us at <a href="mailto:{{BRAND_EMAIL}}" style="color: #d4a574;">{{BRAND_EMAIL}}</a>.</p>
        <p style="color: #6b6b6b; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px;">{{BRAND_FOOTER}}</p>
      </div>
    `
  },
  suspension: {
    subject: 'Important: Your sync365 account has been suspended',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1625 0%, #0f0d12 100%); color: #f5f2f0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #d4a574 0%, #8b5cf6 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; line-height: 60px;">
            <span style="font-size: 28px; font-weight: bold; color: #0f0d12; font-family: sans-serif;">f</span>
          </div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #f5f2f0;">Account Suspended</h1>
        </div>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">Hi <strong style="color: #f5f2f0;">{{customer_name}}</strong>,</p>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">Your sync365 account has been temporarily suspended due to: <strong style="color: #f5f2f0;">{{reason}}</strong>.</p>
        <div style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #f97316; font-size: 16px;">What this means</h3>
          <ul style="margin: 0; padding: 0 0 0 20px; color: #a8a29e; line-height: 2;">
            <li>Your premium features have been temporarily disabled</li>
            <li>Your data is safe and preserved</li>
            <li>Contact us to resolve this matter</li>
          </ul>
        </div>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">If you believe this was done in error, please contact us at <a href="mailto:{{BRAND_EMAIL}}" style="color: #d4a574;">{{BRAND_EMAIL}}</a>.</p>
        <p style="color: #6b6b6b; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px;">{{BRAND_FOOTER}}</p>
      </div>
    `
  },
  partnerCodes: {
    subject: '{{quantity}} redemption codes for {{partner_name}}',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1625 0%, #0f0d12 100%); color: #f5f2f0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #d4a574 0%, #8b5cf6 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; line-height: 60px;">
            <span style="font-size: 28px; font-weight: bold; color: #0f0d12; font-family: sans-serif;">f</span>
          </div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #f5f2f0;">Your Redemption Codes</h1>
        </div>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">Hi <strong style="color: #f5f2f0;">{{contact_name}}</strong>,</p>
        <p style="color: #a8a29e; line-height: 1.6; margin-bottom: 24px;">Here are your {{quantity}} redemption codes for the <strong style="color: #8b5cf6;">{{product_name}}</strong> plan.</p>
        <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #8b5cf6; font-size: 16px;">Redemption Codes</h3>
          <div style="font-family: monospace; font-size: 14px; line-height: 2; color: #f5f2f0;">{{codes_list}}</div>
        </div>
        <div style="background: rgba(212, 165, 116, 0.1); border: 1px solid rgba(212, 165, 116, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #d4a574; font-size: 16px;">How to Redeem</h3>
          <ol style="margin: 0; padding: 0 0 0 20px; color: #a8a29e; line-height: 1.8;">
            <li>Download sync365 from the App Store or Google Play</li>
            <li>Create an account or sign in</li>
            <li>Go to Settings → Redeem Code</li>
            <li>Enter the code and tap "Redeem"</li>
          </ol>
        </div>
        <p style="color: #6b6b6b; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px;">{{BRAND_FOOTER}}</p>
      </div>
    `
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const { to, templateId, variables, subject: subjectOverride, html: htmlOverride } = payload

    if (!to) {
      throw new Error("Missing recipient 'to' in request body")
    }

    let finalSubject = subjectOverride || ""
    let finalHtml = htmlOverride || ""

    if (templateId) {
      const template = EMAIL_TEMPLATES[templateId as keyof typeof EMAIL_TEMPLATES]
      if (!template) {
        throw new Error(`Template not found: ${templateId}`)
      }

      finalSubject = template.subject
      finalHtml = template.html

      const vars = variables || {}
      const allVars = {
        ...vars,
        BRAND_EMAIL,
        BRAND_FOOTER,
        app_url: vars.app_url || Deno.env.get("SITE_URL") || "https://sync365.app"
      }

      for (const [key, value] of Object.entries(allVars)) {
        const stringVal = String(value)
        finalHtml = finalHtml.replaceAll(`{{${key}}}`, stringVal)
        finalSubject = finalSubject.replaceAll(`{{${key}}}`, stringVal)
      }
    }

    // Fallback if neither templateId nor html override is valid
    if (!finalHtml) {
      throw new Error("No email content provided: must set either templateId or html in request body")
    }
    if (!finalSubject) {
      finalSubject = "Notification from sync365"
    }

    // Apply any late custom overrides
    if (subjectOverride) {
      finalSubject = subjectOverride
    }

    const accessKeyId = Deno.env.get("AWS_SES_ACCESS_KEY_ID")
    const secretAccessKey = Deno.env.get("AWS_SES_SECRET_ACCESS_KEY")
    const region = Deno.env.get("AWS_SES_REGION") || "us-east-1"
    const fromEmail = Deno.env.get("AWS_SES_FROM_EMAIL") || "hello@sync365.app"

    if (!accessKeyId || !secretAccessKey) {
      console.warn("AWS SES credentials not configured. Logging payload and skipping send:", { to, subject: finalSubject })
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Email logged (AWS SES credentials not configured)",
        subject: finalSubject,
        html: finalHtml
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
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: finalHtml,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: finalSubject,
        },
      },
      Source: fromEmail,
    })

    const response = await sesClient.send(command)
    console.log(`Email successfully sent to ${to} using template: ${templateId || 'custom'}. MessageId: ${response.MessageId}`)

    return new Response(JSON.stringify({ success: true, messageId: response.MessageId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error sending notification email:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
