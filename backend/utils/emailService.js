import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const isProduction = process.env.NODE_ENV === 'production';

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Hackathon Booking" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    if (!isProduction) {
      console.warn('⚠️ Email send failed (dev – request continues):', err.message);
      return;
    }
    throw err;
  }
};

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
