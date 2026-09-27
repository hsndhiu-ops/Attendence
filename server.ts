import express from 'express';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route for sending email via Nodemailer & Gmail SMTP (App password)
app.post('/api/send-email', async (req, res) => {
  const { to, cc, subject, html, text, triggerType, requestId } = req.body;

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  const isConfigured = Boolean(
    gmailUser &&
    gmailPass &&
    gmailUser !== 'your-college-clearance@gmail.com' &&
    gmailPass !== 'your-16-char-app-password'
  );

  if (!isConfigured) {
    console.log(`[Email Dispatch - Simulation Mode] Trigger: ${triggerType}`);
    console.log(`To: ${to} | CC: ${cc || 'None'}`);
    console.log(`Subject: ${subject}`);
    return res.json({
      success: true,
      status: 'simulated',
      message: 'Notification recorded (simulation mode: credentials not configured in environment)',
      details: `Simulated delivery record for ${to}`
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const mailOptions = {
      from: `"Attendance Clearance System" <${gmailUser}>`,
      to,
      ...(cc ? { cc } : {}),
      subject,
      text: text || subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Notification Sent] MessageId: ${info.messageId} to ${to}`);
    return res.json({
      success: true,
      status: 'sent',
      message: `Delivered to ${to}`,
      details: `Message-ID: ${info.messageId}`
    });
  } catch (error: any) {
    console.error('[Gmail SMTP Error]', error);
    return res.status(500).json({
      success: false,
      status: 'failed',
      message: error?.message || 'Failed to dispatch email via Gmail SMTP',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Attendance Clearance System server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
