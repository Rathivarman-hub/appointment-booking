import { google } from 'googleapis';

const isProduction = process.env.NODE_ENV === 'production';

let auth = null;

const initializeAuth = async () => {
  if (auth) return auth;

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error(
        'OAuth2 credentials missing. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN env vars'
      );
    }

    auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ refresh_token: refreshToken });

    return auth;
  } catch (err) {
    console.error('❌ Gmail API initialization failed:', err.message);
    throw err;
  }
};

/**
 * Send email via Gmail API using OAuth2
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const authClient = await initializeAuth();
    const gmail = google.gmail({ version: 'v1', auth: authClient });

    const fromEmail = process.env.GMAIL_USER;
    if (!fromEmail) {
      throw new Error('GMAIL_USER environment variable must be set');
    }

    // Create email in RFC 2822 format
    const emailLines = [
      `From: "Hackathon Booking" <${fromEmail}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset="UTF-8"',
      '',
      html,
    ];

    const message = emailLines.join('\r\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    if (!isProduction) {
      console.log(`✅ [Gmail API] Email sent to ${to}`);
    }
  } catch (err) {
    if (!isProduction) {
      console.warn('⚠️ Email send failed (dev – request continues):', err.message);
      return;
    }
    throw err;
  }
};

/**
 * Send OTP verification email
 */
const sendOTPEmail = (to, otp) => {
  if (!isProduction) {
    console.log(`🔑 [dev] OTP for ${to}: ${otp}`);
  }
  return sendEmail({
    to,
    subject: 'Verify Your Account – OTP',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h2>Welcome to Hackathon Booking 🎉</h2>
        <p>Your OTP to verify your account:</p>
        <h1 style="letter-spacing:8px;color:#4f46e5;">${otp}</h1>
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
      </div>
    `,
  });
};

/**
 * Send booking confirmation email
 */
const sendBookingConfirmationEmail = (to, booking) =>
  sendEmail({
    to,
    subject: 'Booking Confirmed ✅',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h2>Your Booking is Confirmed!</h2>
        <p><strong>Date:</strong> ${new Date(booking.date).toDateString()}</p>
        <p><strong>Time:</strong> ${booking.slotTime.start} – ${booking.slotTime.end}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
      </div>
    `,
  });

/**
 * Send password reset email
 */
const sendPasswordResetEmail = (to, resetLink) =>
  sendEmail({
    to,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password (expires in 1 hour):</p>
        <a href="${resetLink}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a>
      </div>
    `,
  });

export { sendOTPEmail, sendBookingConfirmationEmail, sendPasswordResetEmail };


