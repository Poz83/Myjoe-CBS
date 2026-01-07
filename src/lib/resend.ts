import { Resend } from 'resend';

let _resend: Resend | null = null;

export function getResendClient(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// Legacy export for backwards compatibility
export const resend = new Proxy({} as Resend, {
  get(_, prop) {
    return (getResendClient() as any)[prop];
  },
});

// Default from email - update this to your verified domain
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
