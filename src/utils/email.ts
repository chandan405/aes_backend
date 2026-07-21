import nodemailer from 'nodemailer';
import logger from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false'; // defaults to true unless set to false (e.g. for port 587)
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = createTransporter();
  if (!transporter) {
    logger.warn('⚠️  Email not sent - SMTP not configured');
    return;
  }
  try {
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    await transporter.sendMail({
      from: `"AES - Abinash Engineering Services" <${user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    logger.info(`📧 Email sent to ${options.to}`);
  } catch (error) {
    logger.error('Email send error:', error);
  }
};

// ── Email Templates ──────────────────────────────────────────────────────────

export const trainingRegistrationUserEmail = (name: string, courseName: string): string => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0A1628, #1E3A5F); padding: 30px; text-align: center; }
    .header h1 { color: #F5A623; margin: 0; font-size: 24px; }
    .header p { color: #8EA8C3; margin: 5px 0 0; }
    .body { padding: 30px; }
    .body h2 { color: #0A1628; }
    .body p { color: #555; line-height: 1.6; }
    .highlight { background: #f0f7ff; border-left: 4px solid #F5A623; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .footer { background: #0A1628; padding: 20px; text-align: center; }
    .footer p { color: #8EA8C3; margin: 0; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.aesndt.in/companylogo.png" alt="AES Logo" style="height: 60px; width: auto; display: block; margin: 0 auto 15px auto;" />
      <h1>AES Training</h1>
      <p>Abinash Engineering Services</p>
    </div>
    <div class="body">
      <h2>Dear ${name},</h2>
      <p>Thank you for registering for our training program. We have received your application and our team will review it shortly.</p>
      <div class="highlight">
        <strong>Course Registered:</strong> ${courseName}<br>
        <strong>Status:</strong> Pending Review
      </div>
      <p>Our team will contact you within 2-3 business days with further details regarding the training schedule and confirmation.</p>
      <p>For any queries, contact us at: <strong>abinash.ndtservices@gmail.com</strong> or call <strong>+91 82493 52281</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 Abinash Engineering Services | Pipili, Odisha | Gandhinagar, Gujarat</p>
    </div>
  </div>
</body>
</html>
`;

export const trainingRegistrationAdminEmail = (student: Record<string, string>): string => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f9; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #0A1628; padding: 20px 30px; text-align: center; }
    .header h1 { color: #F5A623; margin: 0; font-size: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    td { padding: 10px 30px; border-bottom: 1px solid #eee; }
    td:first-child { font-weight: bold; color: #0A1628; width: 40%; background: #f9f9f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.aesndt.in/companylogo.png" alt="AES Logo" style="height: 50px; width: auto; display: block; margin: 0 auto 10px auto;" />
      <h1>🔔 New Training Registration</h1>
    </div>
    <table>
      <tr><td>Name</td><td>${student.name}</td></tr>
      <tr><td>Email</td><td>${student.email}</td></tr>
      <tr><td>Phone</td><td>${student.phone}</td></tr>
      <tr><td>Company</td><td>${student.company}</td></tr>
      <tr><td>Qualification</td><td>${student.qualification}</td></tr>
      <tr><td>Experience</td><td>${student.experience}</td></tr>
      <tr><td>Course</td><td>${student.course}</td></tr>
      <tr><td>Message</td><td>${student.message || 'N/A'}</td></tr>
    </table>
  </div>
</body>
</html>
`;

export const contactEnquiryAdminEmail = (data: Record<string, string>): string => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f9; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #0A1628; padding: 20px 30px; text-align: center; }
    .header h1 { color: #F5A623; margin: 0; font-size: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    td { padding: 10px 30px; border-bottom: 1px solid #eee; }
    td:first-child { font-weight: bold; color: #0A1628; width: 40%; background: #f9f9f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.aesndt.in/companylogo.png" alt="AES Logo" style="height: 50px; width: auto; display: block; margin: 0 auto 10px auto;" />
      <h1>📩 New Contact Enquiry</h1>
    </div>
    <table>
      <tr><td>Name</td><td>${data.name}</td></tr>
      <tr><td>Email</td><td>${data.email}</td></tr>
      <tr><td>Phone</td><td>${data.phone}</td></tr>
      <tr><td>Service Required</td><td>${data.serviceRequired}</td></tr>
      <tr><td>Message</td><td>${data.message}</td></tr>
    </table>
  </div>
</body>
</html>
`;

export const passwordResetEmail = (name: string, resetUrl: string): string => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0A1628, #1E3A5F); padding: 30px; text-align: center; }
    .header h1 { color: #F5A623; margin: 0; font-size: 24px; }
    .header p { color: #8EA8C3; margin: 5px 0 0; }
    .body { padding: 30px; }
    .body h2 { color: #0A1628; }
    .body p { color: #555; line-height: 1.6; }
    .button-container { text-align: center; margin: 30px 0; }
    .button { background-color: #F5A623; color: #0A1628 !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 10px rgba(245, 166, 35, 0.2); }
    .note { background: #fff8eb; border-left: 4px solid #F5A623; padding: 15px; border-radius: 4px; margin: 20px 0; color: #666; font-size: 14px; }
    .footer { background: #0A1628; padding: 20px; text-align: center; }
    .footer p { color: #8EA8C3; margin: 0; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.aesndt.in/companylogo.png" alt="AES Logo" style="height: 60px; width: auto; display: block; margin: 0 auto 15px auto;" />
      <h1>AES Admin Portal</h1>
      <p>Abinash Engineering Services</p>
    </div>
    <div class="body">
      <h2>Hello ${name},</h2>
      <p>You are receiving this email because you (or someone else) have requested the reset of the password for your administrator account.</p>
      <p>Please click on the button below to complete the process. This link is valid for 15 minutes:</p>
      <div class="button-container">
        <a href="${resetUrl}" class="button" target="_blank">Reset Password</a>
      </div>
      <div class="note">
        <strong>If you did not request this:</strong> Please ignore this email and your password will remain unchanged.
      </div>
      <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
      <p style="word-break: break-all; font-size: 12px; color: #0A1628;"><a href="${resetUrl}">${resetUrl}</a></p>
    </div>
    <div class="footer">
      <p>© 2026 Abinash Engineering Services | Pipili, Odisha | Gandhinagar, Gujarat</p>
    </div>
  </div>
</body>
</html>
`;
