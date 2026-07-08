const sections = [
  {
    title: '1. Information we collect',
    body: `We collect information you provide directly when you create an account, make a booking, or contact us — including your name, email address, phone number, and payment details. When you use our platform, we also automatically collect usage data such as pages visited, search queries, device type, IP address, and browser type. Hosts who list properties provide additional information including property details, bank account information, and identity documents for verification.`,
  },
  {
    title: '2. How we use your information',
    body: `We use your information to process bookings and payments, communicate with you about your reservations, verify the identity of hosts, personalise your experience and search results, improve our products and services, send promotional offers (only with your consent), comply with legal obligations, and detect and prevent fraud. We do not sell your personal information to third parties.`,
  },
  {
    title: '3. Information sharing',
    body: `We share your information only as necessary: with hosts to fulfil bookings (guests receive host contact details; hosts receive guest names and booking details), with payment processors to complete transactions, with service providers who help us operate the platform (subject to confidentiality obligations), and with law enforcement or regulatory authorities when required by law. When you make a booking, your name and stay dates are shared with the host.`,
  },
  {
    title: '4. Cookies and tracking',
    body: `We use cookies and similar technologies to keep you signed in, remember your preferences, understand how you use Travolish, and deliver relevant content. You can manage cookie preferences through your browser settings. Disabling cookies may affect some features of the platform.`,
  },
  {
    title: '5. Data retention',
    body: `We retain your account information for as long as your account is active. Booking records are retained for seven years to comply with tax and legal requirements. You may request deletion of your account at any time; we will remove your personal data within 30 days except where retention is legally required.`,
  },
  {
    title: '6. Your rights',
    body: `Under applicable data protection laws, you have the right to access, correct, or delete your personal information. You may also object to or restrict certain processing, and request a portable copy of your data. To exercise any of these rights, contact us at privacy@travolish.com. We will respond within 30 days.`,
  },
  {
    title: '7. Security',
    body: `We implement industry-standard security measures including TLS encryption for data in transit, encrypted storage for sensitive fields, access controls, and regular security audits. No method of transmission over the internet is 100% secure; we encourage you to use a strong, unique password and to sign out of shared devices.`,
  },
  {
    title: '8. Changes to this policy',
    body: `We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or via a prominent notice on our platform at least 14 days before the change takes effect. Continued use of Travolish after the effective date constitutes acceptance of the updated policy.`,
  },
  {
    title: '9. Contact us',
    body: `For privacy-related questions or requests, contact our Data Protection team at privacy@travolish.com or write to Travolish Inc., 4th Floor, Brigade Gateway, Bengaluru 560055, India.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-rose-100">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark">Privacy Policy</h1>
          <p className="mt-4 text-sm text-gray-400">Last updated: 1 June 2026</p>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed max-w-2xl">
            This policy explains what information Travolish collects, how we use it, and the choices you have.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title} className="rounded-[28px] border border-gray-200 bg-[#fcfcfb] p-6 md:p-8">
              <h2 className="text-base font-bold text-dark mb-3">{s.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
