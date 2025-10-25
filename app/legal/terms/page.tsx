import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 mb-8 inline-block"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-blue max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using SmartHVACAnalytics ("Service"), you agree to be bound by these Terms of Service ("Terms").
              If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              SmartHVACAnalytics provides HVAC business management and analytics software as a service (SaaS), including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Job tracking and management</li>
              <li>Technician performance analytics</li>
              <li>Business intelligence and recommendations</li>
              <li>KPI monitoring and reporting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
            <p>
              To use the Service, you must:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be at least 18 years old or have parental consent</li>
              <li>Represent a legitimate business entity</li>
            </ul>
            <p className="mt-4">
              You are responsible for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Subscription and Billing</h2>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.1 Subscription Plans</h3>
            <p>We offer multiple subscription tiers:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Starter Plan:</strong> $49/month - Up to 3 technicians</li>
              <li><strong>Growth Plan:</strong> $99/month - Up to 10 technicians</li>
              <li><strong>Pro Plan:</strong> $199/month - Unlimited technicians</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.2 Free Trial</h3>
            <p>
              The Starter Plan includes a 14-day free trial. You will not be charged until the trial period ends.
              You may cancel at any time during the trial without charge.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.3 Billing</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subscriptions are billed monthly in advance</li>
              <li>All payments are processed securely through Stripe</li>
              <li>Prices are in USD unless otherwise stated</li>
              <li>You authorize us to charge your payment method on file</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.4 Auto-Renewal</h3>
            <p>
              Your subscription will automatically renew each month unless you cancel before the renewal date.
              You can cancel at any time through your account settings or by contacting support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Cancellation and Refunds</h2>

            <h3 className="text-xl font-semibold mb-2 mt-4">5.1 Cancellation</h3>
            <p>
              You may cancel your subscription at any time. Upon cancellation:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You will retain access until the end of your current billing period</li>
              <li>Your account will not be charged again</li>
              <li>Your data will be retained for 30 days before deletion</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">5.2 Refund Policy</h3>
            <p>
              We offer refunds under the following conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Full refund within 7 days of first payment</li>
              <li>Prorated refunds for annual plans upon request</li>
              <li>No refunds for partial months or trial cancellations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use</h2>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Share your account credentials with others</li>
              <li>Reverse engineer or copy any features or functionality</li>
              <li>Upload malicious code or viruses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data and Privacy</h2>
            <p>
              Your use of the Service is also governed by our Privacy Policy. We collect, use, and protect your
              data as described in that policy. You retain all rights to your business data, and we will never
              sell your information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>
            <p>
              We strive to provide 99.9% uptime, but cannot guarantee uninterrupted access. We may perform
              maintenance or updates that temporarily affect availability. We are not liable for any damages
              resulting from service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Intellectual Property</h2>
            <p>
              The Service, including all software, designs, and content, is owned by SmartHVACAnalytics and
              protected by copyright, trademark, and other intellectual property laws. You may not copy, modify,
              or create derivative works without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SMARTHVACANALYTICS SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES,
              WHETHER INCURRED DIRECTLY OR INDIRECTLY.
            </p>
            <p className="mt-4">
              Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify you of material changes via email or through
              the Service. Your continued use after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
            <p>
              We may suspend or terminate your account if you violate these Terms or engage in fraudulent activity.
              Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at:
            </p>
            <p className="mt-2">
              Email: support@smarthvacanalytics.com<br />
              Address: [Your Business Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
