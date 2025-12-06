import { Resend } from 'resend';

// Lazy initialization to avoid errors during build
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailParams) {
  // Skip sending in development if no API key
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email Skipped - No API Key] To: ${to}, Subject: ${subject}`);
    return { id: 'mock-email-id' };
  }

  const resend = getResend();
  const from = process.env.EMAIL_FROM || 'BookFactory <noreply@bookfactory.ai>';

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''),
  });

  if (error) {
    console.error('Email send error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

// Email templates
export function collaborationInviteEmail(params: {
  inviterName: string;
  bookTitle: string;
  role: string;
  acceptUrl: string;
}) {
  return {
    subject: `${params.inviterName} invited you to collaborate on "${params.bookTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've been invited to collaborate!</h2>
        <p><strong>${params.inviterName}</strong> has invited you to collaborate on <strong>"${params.bookTitle}"</strong> as a <strong>${params.role}</strong>.</p>
        <p style="margin: 24px 0;">
          <a href="${params.acceptUrl}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Accept Invitation
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
      </div>
    `,
  };
}

export function writingReminderEmail(params: {
  userName: string;
  bookTitle: string;
  wordGoal: number;
  currentWords: number;
  dashboardUrl: string;
}) {
  const progress = Math.round((params.currentWords / params.wordGoal) * 100);
  return {
    subject: `📝 Time to write! Continue "${params.bookTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${params.userName}! 👋</h2>
        <p>Ready to continue your writing journey? Your book <strong>"${params.bookTitle}"</strong> is waiting for you.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-size: 14px; color: #666;">Progress: ${params.currentWords.toLocaleString()} / ${params.wordGoal.toLocaleString()} words (${progress}%)</p>
          <div style="background: #e5e7eb; height: 8px; border-radius: 4px; margin-top: 8px;">
            <div style="background: #7c3aed; height: 100%; width: ${Math.min(100, progress)}%; border-radius: 4px;"></div>
          </div>
        </div>
        <p style="margin: 24px 0;">
          <a href="${params.dashboardUrl}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Start Writing
          </a>
        </p>
      </div>
    `,
  };
}

export function welcomeEmail(params: { userName: string; dashboardUrl: string }) {
  return {
    subject: `Welcome to BookFactory! 🎉`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to BookFactory, ${params.userName}! 🎉</h2>
        <p>We're thrilled to have you join our community of authors. Here's what you can do:</p>
        <ul>
          <li>📚 Create and organize your books</li>
          <li>✨ Use AI to enhance your writing</li>
          <li>📱 Export to EPUB, PDF, DOCX & more</li>
          <li>👥 Collaborate with editors and beta readers</li>
        </ul>
        <p style="margin: 24px 0;">
          <a href="${params.dashboardUrl}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Start Your First Book
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">Questions? Reply to this email - we're here to help!</p>
      </div>
    `,
  };
}

export default { sendEmail, collaborationInviteEmail, writingReminderEmail, welcomeEmail };
