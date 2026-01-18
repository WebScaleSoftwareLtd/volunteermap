import Mailgun from 'mailgun.js';
import FormData from 'form-data';

const mailgun = new Mailgun(FormData);

const mg = process.env.MAILGUN_API_KEY
  ? mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    })
  : null;

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const FROM_EMAIL = `VolunteerMap <noreply@${MAILGUN_DOMAIN}>`;

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  if (!mg || !MAILGUN_DOMAIN) {
    console.log('Email would be sent (Mailgun not configured):');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Text:', options.text);
    return;
  }

  await mg.messages.create(MAILGUN_DOMAIN, {
    from: FROM_EMAIL,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

export async function sendRegistrationEmail(
  email: string,
  token: string
): Promise<void> {
  const confirmUrl = `${APP_URL}/auth/register/${token}`;

  await sendEmail({
    to: email,
    subject: 'Complete your VolunteerMap registration',
    text: `Welcome to VolunteerMap!

Click the link below to complete your registration:

${confirmUrl}

If you didn't request this, you can safely ignore this email.

- The VolunteerMap Team`,
    html: `
      <h1>Welcome to VolunteerMap!</h1>
      <p>Click the link below to complete your registration:</p>
      <p><a href="${confirmUrl}">${confirmUrl}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>- The VolunteerMap Team</p>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/auth/password-reset/${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset your VolunteerMap password',
    text: `You requested a password reset for your VolunteerMap account.

Click the link below to reset your password:

${resetUrl}

This link expires in 15 minutes.

If you didn't request this, you can safely ignore this email.

- The VolunteerMap Team`,
    html: `
      <h1>Reset your password</h1>
      <p>You requested a password reset for your VolunteerMap account.</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p><strong>This link expires in 15 minutes.</strong></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>- The VolunteerMap Team</p>
    `,
  });
}

export async function sendEmailChangeConfirmation(
  newEmail: string,
  token: string
): Promise<void> {
  const confirmUrl = `${APP_URL}/auth/email-update/${token}`;

  await sendEmail({
    to: newEmail,
    subject: 'Confirm your new email address',
    text: `You requested to change your VolunteerMap email address.

Click the link below to confirm your new email:

${confirmUrl}

If you didn't request this, you can safely ignore this email.

- The VolunteerMap Team`,
    html: `
      <h1>Confirm your new email address</h1>
      <p>You requested to change your VolunteerMap email address.</p>
      <p>Click the link below to confirm your new email:</p>
      <p><a href="${confirmUrl}">${confirmUrl}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>- The VolunteerMap Team</p>
    `,
  });
}
