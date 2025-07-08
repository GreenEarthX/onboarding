import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

(async () => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'maryem.hadjwannes@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email from your Next.js app.',
    });
    console.log('Email sent successfully');
  } catch (err) {
    console.log('Error sending email:', err);
  }
})();