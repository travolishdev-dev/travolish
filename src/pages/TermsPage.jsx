const sections = [
  {
    title: '1. Acceptance of terms',
    body: `By accessing or using Travolish ("the Platform"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the Platform. These terms apply to all users, including guests, hosts, and visitors.`,
  },
  {
    title: '2. The Travolish platform',
    body: `Travolish provides an online marketplace that connects travellers ("Guests") with property owners and managers ("Hosts"). Travolish is not a party to the accommodation agreement between Guests and Hosts; we facilitate the booking and payment. Hosts are independent service providers and not employees or agents of Travolish.`,
  },
  {
    title: '3. Account registration',
    body: `You must be at least 18 years old to create an account. You agree to provide accurate, current, and complete information during registration and to update it as necessary. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. Notify us immediately if you suspect unauthorised access.`,
  },
  {
    title: '4. Bookings and payments',
    body: `When you make a booking, you enter into a direct agreement with the Host. Travolish collects payment on behalf of the Host and remits it minus our service fee. All prices displayed include applicable taxes unless stated otherwise. Payments are processed securely and are subject to our Payments Terms. Bookings are confirmed only upon receipt of full payment or authorised payment hold.`,
  },
  {
    title: '5. Cancellations and refunds',
    body: `Cancellation policies are set by individual Hosts and are displayed on each listing before you book. Travolish service fees are generally non-refundable unless the cancellation is due to a Host fault or extenuating circumstances as defined in our Cancellation Policy. In the event of a significant discrepancy between the listing and the actual property, Guests may be eligible for a rebooking or refund under our Guest Guarantee.`,
  },
  {
    title: '6. Host obligations',
    body: `Hosts must ensure that their listings are accurate, that properties meet the standards described, and that they hold all necessary permissions to rent. Hosts must comply with local laws including registration, safety, and tax requirements. Travolish reserves the right to remove listings that do not meet our quality or legal standards.`,
  },
  {
    title: '7. Guest obligations',
    body: `Guests must treat properties and their contents with care. Guests are responsible for any damage caused during their stay and may be charged via the security deposit or by Travolish on behalf of the Host. Guests must comply with House Rules set by the Host and must not use the property for illegal or disruptive purposes.`,
  },
  {
    title: '8. Prohibited content and conduct',
    body: `You must not post false or misleading reviews, use the Platform for commercial purposes without authorisation, attempt to circumvent Travolish payments by arranging direct transactions, harass or discriminate against other users, or use the Platform to conduct illegal activities. Violations may result in account suspension or termination.`,
  },
  {
    title: '9. Limitation of liability',
    body: `To the maximum extent permitted by law, Travolish is not liable for the actions or omissions of Guests or Hosts, the quality or fitness for purpose of any property, indirect or consequential losses, or losses arising from events beyond our reasonable control. Our total liability to you in any 12-month period shall not exceed the fees paid by you to Travolish during that period.`,
  },
  {
    title: '10. Governing law',
    body: `These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka. For consumer complaints, you may also approach the applicable consumer forum.`,
  },
  {
    title: '11. Changes to these terms',
    body: `We may revise these Terms of Service at any time. We will provide at least 14 days' notice of material changes via email or a banner on the Platform. Continued use after the effective date constitutes acceptance.`,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 border-b border-rose-100">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand mb-3">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-dark">Terms of Service</h1>
          <p className="mt-4 text-sm text-gray-400">Last updated: 1 June 2026</p>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed max-w-2xl">
            Please read these terms carefully before using Travolish. They set out your rights and responsibilities as a user of the Platform.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="space-y-6">
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
