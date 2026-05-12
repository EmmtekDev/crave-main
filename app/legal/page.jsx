'use client'

import Link from 'next/link'

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-3xl p-10 sm:p-14">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Legal & Privacy</h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            Learn how CraveStore protects your privacy, the rules for using our services, and what you agree to when placing an order or booking a dispatch.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Privacy Policy</h2>
          <p className="text-slate-600 mb-4">
            We collect only the information needed to fulfill orders and dispatch requests, including your name, contact details, delivery address, and payment information. We do not sell your personal data to third parties.
          </p>
          <p className="text-slate-600 mb-4">
            We use your email and phone number to send order updates, delivery notifications, and support messages. We may also use anonymized usage data to improve the service.
          </p>
          <p className="text-slate-600">
            If you provide sensitive data during checkout or delivery booking, we protect it in transit and do not store unnecessary details outside of what is required to complete your request.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Terms of Use</h2>
          <p className="text-slate-600 mb-4">
            By using CraveStore and placing orders or dispatch requests, you agree to provide accurate information and to comply with all applicable laws. You accept responsibility for the contents of your shipments and the delivery instructions you provide.
          </p>
          <p className="text-slate-600 mb-4">
            CraveStore reserves the right to refuse or cancel any order or dispatch request that violates our policies, contains prohibited items, or appears fraudulent.
          </p>
          <p className="text-slate-600">
            You must not use our platform to send illegal goods, infringing materials, or anything that violates local, national, or international laws.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Data & Compliance</h2>
          <p className="text-slate-600 mb-4">
            We comply with data protection principles by limiting the information we collect, securing it appropriately, and retaining it only as long as necessary for service delivery and support.
          </p>
          <p className="text-slate-600 mb-4">
            We store legal consent for orders and dispatch bookings so we can demonstrate that users agreed to these terms before payment or shipment.
          </p>
          <p className="text-slate-600">
            If you request data deletion, we will remove personal data where legal obligations and service requirements allow, while preserving any records necessary for compliance or dispute resolution.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Intellectual Property</h2>
          <p className="text-slate-600 mb-4">
            All content on CraveStore, including text, images, logos, and designs, is protected by intellectual property law. You may not copy, distribute, or reuse our content without express permission.
          </p>
          <p className="text-slate-600 mb-4">
            If you believe your intellectual property has been used without authorization, please contact us immediately at <a href="mailto:craveaccessories647@gmail.com" className="text-orange-600 underline">craveaccessories647@gmail.com</a> and provide details so we can investigate.
          </p>
          <p className="text-slate-600">
            We will respond promptly to legitimate takedown requests and cooperate with rights holders as required by law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Your Acceptance</h2>
          <p className="text-slate-600 mb-4">
            When you place an order or book a dispatch service on CraveStore, you must explicitly accept these terms before your request can be submitted. Acceptance is recorded in our system so we can verify compliance.
          </p>
          <p className="text-slate-600">
            If you do not agree with these terms, please do not use our ordering or dispatch services.
          </p>
        </section>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-7 py-3 text-sm font-semibold hover:bg-slate-800 transition">
            Back to Store
          </Link>
        </div>
      </div>
    </main>
  )
}
