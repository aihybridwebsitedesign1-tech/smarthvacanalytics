import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 mb-8 inline-block"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-blue max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              SmartHVACAnalytics ("we," "our," or "us") respects your privacy and is committed to protecting your
              personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-2 mt-4">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email address, company name, password</li>
              <li><strong>Profile Data:</strong> Business details, technician count, preferences</li>
              <li><strong>Business Data:</strong> Job records, technician information, customer data, KPIs</li>
              <li><strong>Payment Information:</strong> Processed and stored by Stripe (we do not store credit card details)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage Data:</strong> Pages viewed, features used, time spent</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong>Cookies:</strong> Session cookies for authentication and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the Service</li>
              <li>Process your transactions and manage subscriptions</li>
              <li>Send you important updates and notifications</li>
              <li>Respond to your support requests</li>
              <li>Analyze usage patterns to improve the Service</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.1 Third-Party Service Providers</h3>
            <p>We share data with trusted partners who help us operate:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase:</strong> Database and authentication services</li>
              <li><strong>Stripe:</strong> Payment processing and subscription management</li>
              <li><strong>Hosting Provider:</strong> Application hosting and delivery</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.2 We Do NOT Share Your Data With:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Advertisers or marketing companies</li>
              <li>Data brokers or aggregators</li>
              <li>Social media platforms</li>
              <li>Any third party for their own purposes</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.3 Legal Requirements</h3>
            <p>
              We may disclose your information if required by law, court order, or governmental request, or to
              protect our rights, property, or safety.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p>We implement industry-standard security measures:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All data transmitted over HTTPS encryption</li>
              <li>Passwords hashed using bcrypt</li>
              <li>Database protected with Row Level Security (RLS)</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
            </ul>
            <p className="mt-4">
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute
              security but will notify you of any breach affecting your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p>We retain your data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Active Accounts:</strong> Throughout your subscription period</li>
              <li><strong>Cancelled Accounts:</strong> 30 days after cancellation (then permanently deleted)</li>
              <li><strong>Financial Records:</strong> 7 years for tax and legal compliance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Privacy Rights</h2>

            <h3 className="text-xl font-semibold mb-2 mt-4">7.1 Access and Portability</h3>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data at any time</li>
              <li>Export your business data in standard formats</li>
              <li>Receive a copy of all data we have about you</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">7.2 Correction and Deletion</h3>
            <p>You can:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Update your account information at any time</li>
              <li>Request deletion of your account and all associated data</li>
              <li>Correct inaccurate information</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">7.3 Opt-Out</h3>
            <p>You can opt-out of:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Marketing emails (via unsubscribe link)</li>
              <li>Non-essential cookies (in browser settings)</li>
            </ul>
            <p className="mt-2">
              Note: You cannot opt-out of transactional emails (receipts, account notifications).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. GDPR Compliance (EU Users)</h2>
            <p>If you are in the European Union, you have additional rights under GDPR:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Right to be forgotten (complete data deletion)</li>
              <li>Right to data portability</li>
              <li>Right to restrict processing</li>
              <li>Right to object to automated decision-making</li>
            </ul>
            <p className="mt-4">
              Our legal basis for processing: Contract performance and legitimate business interests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. CCPA Compliance (California Users)</h2>
            <p>California residents have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Know what personal information is collected</li>
              <li>Know whether personal information is sold or disclosed</li>
              <li>Opt-out of the sale of personal information (we do not sell your data)</li>
              <li>Request deletion of personal information</li>
              <li>Non-discrimination for exercising privacy rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p>
              Our Service is not intended for users under 18. We do not knowingly collect data from children.
              If you believe a child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Cookies</h2>
            <p>We use the following types of cookies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential:</strong> Required for authentication and security</li>
              <li><strong>Functional:</strong> Remember your preferences and settings</li>
              <li><strong>Analytics:</strong> Help us understand how you use the Service (optional)</li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings, but disabling essential cookies may affect
              functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries other than your own. We ensure adequate
              safeguards are in place, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Standard contractual clauses</li>
              <li>Secure data transfer protocols</li>
              <li>Compliance with applicable data protection laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes via
              email or through the Service. Your continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <p>
              For privacy questions, data requests, or concerns:
            </p>
            <p className="mt-2">
              Email: privacy@smarthvacanalytics.com<br />
              Data Protection Officer: dpo@smarthvacanalytics.com<br />
              Address: [Your Business Address]
            </p>
          </section>

          <section className="border-t pt-6 mt-8">
            <h3 className="text-xl font-semibold mb-4">Quick Summary</h3>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="font-semibold mb-2">What we collect:</p>
              <p className="mb-4">Your email, company info, and business data you enter</p>

              <p className="font-semibold mb-2">How we use it:</p>
              <p className="mb-4">To provide the Service and improve your experience</p>

              <p className="font-semibold mb-2">Who we share with:</p>
              <p className="mb-4">Only essential service providers (Stripe for payments, Supabase for hosting)</p>

              <p className="font-semibold mb-2">Your control:</p>
              <p>You can access, export, update, or delete your data anytime</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
