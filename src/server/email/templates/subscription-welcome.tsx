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

interface SubscriptionWelcomeEmailProps {
  plan: 'starter' | 'creator' | 'pro';
}

const PLAN_DETAILS = {
  starter: { blots: 300, storage: '5 GB', price: '$12/month' },
  creator: { blots: 900, storage: '15 GB', price: '$29/month' },
  pro: { blots: 2800, storage: '50 GB', price: '$79/month' },
};

export function SubscriptionWelcomeEmail({ plan }: SubscriptionWelcomeEmailProps) {
  const details = PLAN_DETAILS[plan];

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={title}>Welcome to Myjoe! 🎨</Text>
          
          <Text style={paragraph}>
            Thank you for subscribing to the <strong>{plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> plan!
          </Text>

          <Section style={box}>
            <Text style={heading}>Your Plan Includes:</Text>
            <Text style={detail}>🎨 <strong>{details.blots.toLocaleString()} Blots</strong> per month</Text>
            <Text style={detail}>💾 <strong>{details.storage}</strong> storage</Text>
            <Text style={detail}>✅ <strong>Commercial license</strong> for KDP</Text>
          </Section>

          <Text style={paragraph}>
            Your Blots reset monthly on the 1st. Unused Blots don't roll over, so make the most of them!
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://myjoe.app'}/studio`}>
              Start Creating
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Need help? Reply to this email or visit our{' '}
            <a href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://myjoe.app'}/support`} style={link}>
              support center
            </a>
            .
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

const box = {
  backgroundColor: '#262626',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const heading = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '12px',
};

const detail = {
  color: '#d1d5db',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '4px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
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

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};
