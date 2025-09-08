// src/app/lib/test-email.js
import { send2FACode } from './email';

async function testEmail() {
  try {
    await send2FACode('maryem.hadjwannes@gmail.com', '123456');
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

testEmail();