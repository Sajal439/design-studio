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
