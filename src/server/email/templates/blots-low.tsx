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

interface BlotsLowEmailProps {
  blots: number;
  plan: string;
}

export function BlotsLowEmail({ blots, plan }: BlotsLowEmailProps) {
  const isFree = plan === 'free';
  const upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/studio/settings?tab=billing`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={title}>Low Blot Balance ⚠️</Text>
          
          <Text style={paragraph}>
            You're running low on Blots! You currently have <strong>{blots} Blots</strong> remaining.
          </Text>

          <Text style={paragraph}>
            {isFree 
              ? 'Upgrade to a paid plan to get more Blots and unlock commercial licensing for your coloring books.'
              : 'Consider upgrading to a higher tier to get more Blots each month.'
            }
          </Text>

          <Section style={box}>
            <Text style={heading}>Plan Comparison:</Text>
            <Text style={detail}>Starter: 300 Blots/month - $12/month</Text>
            <Text style={detail}>Creator: 900 Blots/month - $29/month</Text>
            <Text style={detail}>Pro: 2,800 Blots/month - $79/month</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={upgradeUrl}>
              {isFree ? 'Upgrade Now' : 'View Plans'}
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Your Blots reset monthly. Unused Blots don't roll over, so use them while you can!
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
  backgroundColor: '#f59e0b',
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
