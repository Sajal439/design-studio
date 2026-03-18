import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const adminEmail = process.env.ADMIN_EMAIL;

// Resend uses "resend" as the SMTP_USER, but requires a valid email in the "from" field
// The free tier requires sending from onboarding@resend.dev
const fromAddress = smtpUser === "resend" ? "onboarding@resend.dev" : smtpUser;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

interface EmailData {
  name: string;
  email?: string | null;
  phone: string;
  location: string;
  projectType: string;
  consultationType?: string | null;
  message?: string | null;
  details?: string | null;
  preferredDate?: string | Date | null;
  designSlug?: string | null;
  productSlug?: string | null;
}

export async function sendQuoteNotification(quoteData: EmailData) {
  if (!smtpHost || !smtpUser || !smtpPass || !adminEmail) {
    console.warn("⚠️ Email configuration missing. Skipping quote notification.");
    return;
  }

  const html = `
    <h2>New Quote Request Received</h2>
    <p><strong>Name:</strong> ${quoteData.name}</p>
    <p><strong>Email:</strong> ${quoteData.email || "Not provided"}</p>
    <p><strong>Phone:</strong> ${quoteData.phone}</p>
    <p><strong>Location:</strong> ${quoteData.location}</p>
    <p><strong>Project Type:</strong> ${quoteData.projectType}</p>
    ${quoteData.designSlug ? `<p><strong>Source Design:</strong> ${quoteData.designSlug}</p>` : ""}
    ${quoteData.productSlug ? `<p><strong>Source Product:</strong> ${quoteData.productSlug}</p>` : ""}
    ${quoteData.message ? `<p><strong>Message:</strong> ${quoteData.message}</p>` : ""}
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Goel Traders Design Studio" <${fromAddress}>`,
      to: adminEmail,
      subject: `New Quote Request from ${quoteData.name}`,
      html,
    });
    console.log("Quote notification email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending quote notification email:", error);
    // We don't throw here to avoid failing the main API request if email fails
  }
}

export async function sendConsultationNotification(consultationData: EmailData) {
  if (!smtpHost || !smtpUser || !smtpPass || !adminEmail) {
    console.warn("Email configuration missing. Skipping consultation notification.");
    return;
  }

  const html = `
    <h2>New Consultation Booking</h2>
    <p><strong>Name:</strong> ${consultationData.name}</p>
    ${consultationData.email ? `<p><strong>Email:</strong> ${consultationData.email}</p>` : ""}
    <p><strong>Phone:</strong> ${consultationData.phone}</p>
    <p><strong>Location:</strong> ${consultationData.location}</p>
    <p><strong>Project Type:</strong> ${consultationData.projectType}</p>
    <p><strong>Consultation Type:</strong> ${consultationData.consultationType}</p>
    ${consultationData.preferredDate ? `<p><strong>Preferred Date:</strong> ${new Date(consultationData.preferredDate).toLocaleDateString()}</p>` : ""}
  `;


  try {
    const info = await transporter.sendMail({
      from: `"Goel Traders Design Studio" <${fromAddress}>`,
      to: adminEmail,
      subject: `New Consultation Booking from ${consultationData.name}`,
      html,
    });
    console.log("Consultation notification email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending consultation notification email:", error);
  }
}

// ── WhatsApp Admin Notifications ──────────────────────────────────────────────

const WHATSAPP_API_URL = "https://api.whatsapp.com/send";

/**
 * Send a WhatsApp message to the admin using the WhatsApp Business API
 * (via CallMeBot free gateway or similar).
 * Requires WHATSAPP_API_KEY and ADMIN_WHATSAPP_NUMBER in env.
 *
 * If not configured, silently skips (non-breaking).
 */
async function sendAdminWhatsApp(message: string): Promise<void> {
  const apiKey = process.env.WHATSAPP_API_KEY;
  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER; // e.g. "919876543210"

  if (!apiKey || !adminNumber) {
    // Optional integration — skip gracefully when not configured
    return;
  }

  try {
    const params = new URLSearchParams({
      phone: adminNumber,
      text: message,
      apikey: apiKey,
    });
    await fetch(`https://api.callmebot.com/whatsapp.php?${params.toString()}`);
  } catch (err) {
    console.error("Non-fatal: Failed to send admin WhatsApp notification", err);
  }
}

export async function notifyAdminQuote(data: {
  name: string;
  phone: string;
  projectType: string;
  location: string;
  source?: string | null;
}): Promise<void> {
  const message =
    `🆕 *New Quote Request*\n` +
    `👤 *Name:* ${data.name}\n` +
    `📞 *Phone:* ${data.phone}\n` +
    `🏠 *Project:* ${data.projectType}\n` +
    `📍 *Location:* ${data.location}\n` +
    (data.source ? `🔗 *Source:* ${data.source}\n` : "") +
    `\n_Reply to this message to follow up._`;
  await sendAdminWhatsApp(message);
}

export async function notifyAdminConsultation(data: {
  name: string;
  phone: string;
  consultationType: string;
  projectType: string;
  source?: string | null;
}): Promise<void> {
  const typeLabel: Record<string, string> = {
    showroom: "Showroom Visit",
    video: "Video Call",
    "site-visit": "Site Visit",
  };
  const message =
    `📅 *New Consultation Booked*\n` +
    `👤 *Name:* ${data.name}\n` +
    `📞 *Phone:* ${data.phone}\n` +
    `📋 *Type:* ${typeLabel[data.consultationType] ?? data.consultationType}\n` +
    `🏠 *Project:* ${data.projectType}\n` +
    (data.source ? `🔗 *Source:* ${data.source}\n` : "") +
    `\n_Reply to confirm the booking._`;
  await sendAdminWhatsApp(message);
}

export async function notifyAdminEstimate(data: {
  name: string;
  phone: string;
  city: string;
  projectType: string;
  costMin: number;
  costMax: number;
}): Promise<void> {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  const message =
    `📊 *Estimate Saved*\n` +
    `👤 *Name:* ${data.name}\n` +
    `📞 *Phone:* ${data.phone}\n` +
    `📍 *City:* ${data.city}\n` +
    `🏠 *Project:* ${data.projectType}\n` +
    `💰 *Est. Range:* ${fmt(data.costMin)} – ${fmt(data.costMax)}\n` +
    `\n_High-intent lead — follow up promptly!_`;
  await sendAdminWhatsApp(message);
}

