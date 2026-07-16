// @tz-police/notifications — Push notification, SMS, and email helpers
// Mock implementations — replace with real providers in production

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  tokens?: string[]; // FCM tokens
}

export interface SMSPayload {
  to: string;
  message: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

// ===== Push Notification (FCM) =====
export async function sendPushNotification(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string }> {
  console.log("[Notification] Push (mock):", payload.title);
  return { success: true, messageId: `mock-${Date.now()}` };
}

// ===== SMS (Africa's Talking / Twilio) =====
export async function sendSMS(payload: SMSPayload): Promise<{ success: boolean; messageId?: string }> {
  console.log("[SMS] (mock) To:", payload.to, "Message:", payload.message);
  return { success: true, messageId: `sms-${Date.now()}` };
}

// ===== Email (Resend / SendGrid) =====
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string }> {
  console.log("[Email] (mock) To:", payload.to, "Subject:", payload.subject);
  return { success: true, messageId: `email-${Date.now()}` };
}

// ===== OTP SMS =====
export async function sendOTP(phone: string, code: string): Promise<{ success: boolean }> {
  return sendSMS({
    to: phone,
    message: `Msimbo wako wa OTP wa TZ Police ni: ${code}. Usishiriki na mtu.`,
  });
}

// ===== Broadcast Alert =====
export async function broadcastAlert(
  title: string,
  message: string,
  recipients: string[]
): Promise<{ success: number; failed: number }> {
  const results = await Promise.all(
    recipients.map((token) =>
      sendPushNotification({ title, body: message, tokens: [token] })
    )
  );
  return {
    success: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
  };
}
