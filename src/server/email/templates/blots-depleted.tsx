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

interface BlotsDepletedEmailProps {
  plan: string;
}

export function BlotsDepletedEmail({ plan }: BlotsDepletedEmailProps) {
  const isFree = plan === 'free';
  const upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/billing`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={title}>Out of Blots! 🎨</Text>
          
          <Text style={paragraph}>
            You've used all your Blots for this month. Your balance is now <strong>0 Blots</strong>.
          </Text>

          {isFree ? (
            <>
              <Text style={paragraph}>
                Upgrade to a paid plan to continue creating coloring books and unlock commercial licensing for KDP publishing.
              </Text>
              <Section style={highlightBox}>
                <Text style={highlightText}>
                  🎁 New subscribers get their Blots immediately!
                </Text>
              </Section>
            </>
          ) : (
            <Text style={paragraph}>
              Your Blots will reset on the 1st of next month. Upgrade to a higher tier to get more Blots each month.
            </Text>
          )}

          <Section style={box}>
            <Text style={heading}>Upgrade Options:</Text>
            <Text style={detail}>🚀 <strong>Starter:</strong> 300 Blots/month - $12/month</Text>
            <Text style={detail}>⭐ <strong>Creator:</strong> 900 Blots/month - $29/month</Text>
            <Text style={detail}>💎 <strong>Pro:</strong> 2,800 Blots/month - $79/month</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={upgradeUrl}>
              {isFree ? 'Upgrade Now' : 'View Plans'}
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            {isFree 
              ? 'Your Blots reset monthly. Upgrade to get more Blots and unlock commercial features!'
              : 'Your Blots will automatically reset on the 1st of next month.'
            }
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

const highlightBox = {
  backgroundColor: '#1e3a8a',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
  border: '1px solid #3b82f6',
};

const highlightText = {
  color: '#93c5fd',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  fontWeight: 'bold',
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
