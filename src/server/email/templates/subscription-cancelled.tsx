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

export function SubscriptionCancelledEmail() {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={title}>Subscription Cancelled</Text>
          
          <Text style={paragraph}>
            Your Myjoe subscription has been cancelled. We're sorry to see you go!
          </Text>

          <Text style={paragraph}>
            Your account has been downgraded to the <strong>Free tier</strong>, which includes:
          </Text>

          <Section style={box}>
            <Text style={detail}>🎨 <strong>50 Blots</strong> per month</Text>
            <Text style={detail}>💾 <strong>1 GB</strong> storage</Text>
            <Text style={detail}>❌ <strong>No commercial license</strong></Text>
          </Section>

          <Text style={paragraph}>
            You can continue using Myjoe with the Free tier, or resubscribe anytime to unlock more features.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/studio/settings?tab=billing`}>
              Resubscribe
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            We'd love to hear your feedback. Reply to this email to let us know how we can improve.
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
