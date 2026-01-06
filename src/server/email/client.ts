import { resend, FROM_EMAIL } from '@/lib/resend';
import { render } from '@react-email/render';
import type { ReactElement } from 'react';

export interface SendEmailParams {
  to: string;
  subject: string;
  component: ReactElement;
  from?: string;
}

export async function sendEmail({ to, subject, component, from = FROM_EMAIL }: SendEmailParams) {
  try {
    const html = await render(component);
    
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
