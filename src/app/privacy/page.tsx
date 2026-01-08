import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Myjoe Privacy Policy - How we collect, use, and protect your data',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-white mb-4">Privacy Policy</h1>

        <p className="text-zinc-400 text-lg mb-8">
          Last updated: January 2026
        </p>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8">

          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="text-zinc-400">
              Myjoe (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our AI-powered coloring book creation service.
            </p>
            <p className="text-zinc-400 mt-4">
              We comply with the UK General Data Protection Regulation (UK GDPR), the EU General
              Data Protection Regulation (EU GDPR), and the Data Protection Act 2018.
            </p>
          </section>

          {/* Data Controller */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Data Controller</h2>
            <p className="text-zinc-400">
              The data controller responsible for your personal data is:
            </p>
            <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg text-zinc-300">
              <p><strong>Myjoe</strong></p>
              <p>United Kingdom</p>
              <p>Email: privacy@myjoe.app</p>
            </div>
            <p className="text-zinc-400 mt-4">
              For any questions about this Privacy Policy or our data practices, please contact us
              at the email address above.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Information We Collect</h2>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">3.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-zinc-400 space-y-2">
              <li><strong>Account Information:</strong> Email address, name (if provided via Google OAuth)</li>
              <li><strong>Payment Information:</strong> Processed securely by Stripe; we do not store card details</li>
              <li><strong>Content:</strong> Project data, hero characters, and coloring book pages you create</li>
              <li><strong>Communications:</strong> Any messages you send to our support team</li>
              <li><strong>Survey Responses:</strong> How you heard about us, marketing preferences</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">3.2 Information Collected Automatically</h3>
            <ul className="list-disc list-inside text-zinc-400 space-y-2">
              <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent (with your consent)</li>
              <li><strong>Location Data:</strong> Country detected via IP address for compliance purposes</li>
              <li><strong>Cookies:</strong> See Section 8 for our Cookie Policy</li>
            </ul>
          </section>

          {/* Legal Basis for Processing */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Legal Basis for Processing</h2>
            <p className="text-zinc-400 mb-4">
              Under UK GDPR, we process your personal data on the following legal bases:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-zinc-400">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-3 pr-4 text-zinc-300">Purpose</th>
                    <th className="text-left py-3 text-zinc-300">Legal Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3 pr-4">Providing the Service</td>
                    <td className="py-3">Contract performance</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3 pr-4">Processing payments</td>
                    <td className="py-3">Contract performance</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3 pr-4">Account security</td>
                    <td className="py-3">Legitimate interests</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3 pr-4">Analytics (with consent)</td>
                    <td className="py-3">Consent</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3 pr-4">Marketing emails</td>
                    <td className="py-3">Consent</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3 pr-4">Legal compliance</td>
                    <td className="py-3">Legal obligation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. How We Use Your Information</h2>
            <p className="text-zinc-400 mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyse usage patterns to improve user experience (with consent)</li>
              <li>Send marketing communications (with consent)</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* AI and Automated Decision-Making */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. AI and Automated Processing</h2>
            <p className="text-zinc-400">
              Our Service uses artificial intelligence to generate coloring book images based on
              your inputs. This involves:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 mt-4">
              <li><strong>Image Generation:</strong> Your text prompts are processed by AI models to create images</li>
              <li><strong>Content Safety:</strong> Automated systems check content for policy compliance</li>
              <li><strong>Quality Assessment:</strong> AI evaluates generated images for quality</li>
            </ul>
            <p className="text-zinc-400 mt-4">
              These automated processes do not make decisions that significantly affect you legally
              or similarly. If content is blocked by safety systems, you can contact us for human review.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Data Sharing and Third Parties</h2>
            <p className="text-zinc-400 mb-4">
              We share your data with the following third-party service providers:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-zinc-400">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-3 pr-4 text-zinc-300">Provider</th>
                    <th className="text-left py-3 pr-4 text-zinc-300">Purpose</th>
                    <th className="text-left py-3 text-zinc-300">Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3 pr-4">Supabase</td>
                    <td className="py-3 pr-4">Database and authentication</td>
                    <td className="py-3">EU (Frankfurt)</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3 pr-4">Cloudflare R2</td>
                    <td className="py-3 pr-4">Image storage</td>
                    <td className="py-3">Global (EU primary)</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3 pr-4">Stripe</td>
                    <td className="py-3 pr-4">Payment processing</td>
                    <td className="py-3">US (with EU SCCs)</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3 pr-4">PostHog</td>
                    <td className="py-3 pr-4">Analytics (with consent)</td>
                    <td className="py-3">EU</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3 pr-4">OpenAI</td>
                    <td className="py-3 pr-4">AI image generation</td>
                    <td className="py-3">US (with DPA)</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3 pr-4">Resend</td>
                    <td className="py-3 pr-4">Transactional emails</td>
                    <td className="py-3">US (with EU SCCs)</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3 pr-4">Sentry</td>
                    <td className="py-3 pr-4">Error tracking</td>
                    <td className="py-3">EU</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-zinc-400 mt-4">
              Where data is transferred outside the UK/EEA, we ensure appropriate safeguards are in
              place, including Standard Contractual Clauses (SCCs) and Data Processing Agreements (DPAs).
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Cookies and Tracking</h2>
            <p className="text-zinc-400 mb-4">
              We use cookies and similar technologies to provide and improve our Service:
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <h4 className="font-medium text-white">Essential Cookies</h4>
                <p className="text-sm text-zinc-400 mt-1">
                  Required for the site to function. Include authentication and security cookies.
                  These cannot be disabled.
                </p>
              </div>
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <h4 className="font-medium text-white">Analytics Cookies</h4>
                <p className="text-sm text-zinc-400 mt-1">
                  Help us understand how visitors use our site. Only enabled with your consent.
                  Provider: PostHog (EU-hosted).
                </p>
              </div>
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <h4 className="font-medium text-white">Marketing Cookies</h4>
                <p className="text-sm text-zinc-400 mt-1">
                  Used for targeted advertising. Only enabled with your consent. Currently not in use.
                </p>
              </div>
            </div>
            <p className="text-zinc-400 mt-4">
              You can manage your cookie preferences at any time using the cookie settings banner
              or by clearing cookies in your browser settings.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Data Retention</h2>
            <p className="text-zinc-400 mb-4">
              We retain your data for the following periods:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2">
              <li><strong>Account Data:</strong> Until you delete your account</li>
              <li><strong>Generated Content:</strong> Until you delete it or your account</li>
              <li><strong>Payment Records:</strong> 7 years (legal requirement for tax purposes)</li>
              <li><strong>Analytics Data:</strong> 26 months (then anonymised)</li>
              <li><strong>Support Communications:</strong> 3 years from resolution</li>
            </ul>
            <p className="text-zinc-400 mt-4">
              When you delete your account, we remove your personal data within 30 days, except
              where we are legally required to retain it.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Your Rights</h2>
            <p className="text-zinc-400 mb-4">
              Under UK GDPR, you have the following rights:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2">
              <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="text-zinc-400 mt-4">
              To exercise these rights, please contact us at{' '}
              <a href="mailto:privacy@myjoe.app" className="text-purple-400 hover:underline">
                privacy@myjoe.app
              </a>
              . We will respond within one month.
            </p>
            <p className="text-zinc-400 mt-4">
              You can also delete your account directly from your account settings, which will
              permanently remove all your data.
            </p>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">11. Security</h2>
            <p className="text-zinc-400">
              We implement appropriate technical and organisational measures to protect your data:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 mt-4">
              <li>Encryption in transit (TLS 1.3) and at rest</li>
              <li>Secure authentication via OAuth 2.0</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and audit logging</li>
              <li>Incident response procedures</li>
            </ul>
          </section>

          {/* Children */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">12. Children&apos;s Privacy</h2>
            <p className="text-zinc-400">
              Our Service is not directed to children under 16. We do not knowingly collect
              personal data from children under 16. If you believe we have collected data from a
              child under 16, please contact us immediately.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">13. International Data Transfers</h2>
            <p className="text-zinc-400">
              Some of our service providers are located outside the UK/EEA. When we transfer your
              data internationally, we ensure appropriate safeguards are in place:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 mt-4">
              <li>Standard Contractual Clauses (SCCs) approved by the UK ICO</li>
              <li>Data Processing Agreements with all processors</li>
              <li>Adequacy decisions where applicable</li>
            </ul>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">14. Changes to This Policy</h2>
            <p className="text-zinc-400">
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by email or through a prominent notice on our Service. Your
              continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Complaints */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">15. Complaints</h2>
            <p className="text-zinc-400">
              If you have concerns about how we handle your data, please contact us first at{' '}
              <a href="mailto:privacy@myjoe.app" className="text-purple-400 hover:underline">
                privacy@myjoe.app
              </a>
              .
            </p>
            <p className="text-zinc-400 mt-4">
              You also have the right to lodge a complaint with a supervisory authority. In the UK,
              this is the Information Commissioner&apos;s Office (ICO):
            </p>
            <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg text-zinc-300">
              <p><strong>Information Commissioner&apos;s Office</strong></p>
              <p>Wycliffe House, Water Lane</p>
              <p>Wilmslow, Cheshire, SK9 5AF</p>
              <p>Website:{' '}
                <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                  ico.org.uk
                </a>
              </p>
              <p>Phone: 0303 123 1113</p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">16. Contact Us</h2>
            <p className="text-zinc-400">
              For any questions or concerns about this Privacy Policy or our data practices:
            </p>
            <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg text-zinc-300">
              <p><strong>Email:</strong>{' '}
                <a href="mailto:privacy@myjoe.app" className="text-purple-400 hover:underline">
                  privacy@myjoe.app
                </a>
              </p>
              <p className="mt-2"><strong>Data Subject Requests:</strong>{' '}
                <a href="mailto:privacy@myjoe.app" className="text-purple-400 hover:underline">
                  privacy@myjoe.app
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
