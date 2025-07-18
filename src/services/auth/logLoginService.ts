import { db } from '@/app/lib/prisma';
import * as UAParserLib from 'ua-parser-js';

interface LogLoginData {
  userId: string;
  action: string;
  userAgent: string;
  ipAddress: string;
}

export async function logLogin({ userId, action, userAgent, ipAddress }: LogLoginData) {
  // Parse user-agent
  const parser = new UAParserLib.UAParser(userAgent);
  const os = parser.getOS().name ?? 'unknown';
  const browser = parser.getBrowser().name ?? 'unknown';
  const device = `${os} - ${browser}`;

  // Create login history record
  await db.loginHistory.create({
    data: {
      userId,
      action,
      timestamp: new Date(),
      device,
      country: ipAddress.toString(), // Note: Consider using a proper geo-IP service for accurate country data
    },
  });
}