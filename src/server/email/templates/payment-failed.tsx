import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';

interface PaymentFailedEmailProps {
  invoiceUrl: string;
}

export function PaymentFailedEmail({ invoiceUrl }: PaymentFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={title}>Payment Failed ⚠️</Text>
          
          <Text style={paragraph}>
            We couldn't process your payment for your Myjoe subscription.
          </Text>

          <Text style={paragraph}>
            Please update your payment method to continue using Myjoe without interruption.
            You have <strong>3 days</strong> before your account is automatically downgraded to the Free tier.
          </Text>

          <Section style={warningBox}>
            <Text style={warningText}>
              ⚠️ Your subscription will be cancelled if payment isn't updated within 3 days.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={invoiceUrl}>
              Update Payment Method
            </Button>
          </Section>

          <Text style={paragraph}>
            If you continue to have issues, please contact support or reply to this email.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            This is an automated message. If you've already updated your payment method, please ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#1a1a1a',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  borderRadius: '8px',
};

const title = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
};

const paragraph = {
  color: '#d1d5db',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const warningBox = {
  backgroundColor: '#7c2d12',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
  border: '1px solid #dc2626',
};

const warningText = {
  color: '#fca5a5',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#374151',
  margin: '32px 0',
};

const footer = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '20px',
  textAlign: 'center' as const,
};
