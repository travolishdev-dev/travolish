import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CalendarDays,
  CreditCard,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { buildCheckoutState, checkoutPreview } from '../../data/mockPortalData'

export default function CheckoutPage() {
  const { propertyId } = useParams()
  const checkoutState = buildCheckoutState(propertyId)
  const [selectedAddOns, setSelectedAddOns] = useState(['addon-transfer'])

  if (!checkoutState) {
    return (
      <PortalShell
        eyebrow="Checkout"
        title="Property not found."
        description="Use a valid property id from the existing listing data to preview this mock checkout flow."
        actions={[{ label: 'Back to search', href: '/search' }]}
      >
        <SectionCard>
          <p className="text-sm text-muted">
            The checkout UI is ready, but the requested property is missing from the
            mock listing set.
          </p>
        </SectionCard>
      </PortalShell>
    )
  }

  const selectedAddOnTotal = checkoutPreview.addOns
    .filter((addOn) => selectedAddOns.includes(addOn.id))
    .reduce((total, addOn) => total + Number(addOn.price.replace(/[^0-9]/g, '')), 0)

  return (
    <PortalShell
      eyebrow="Checkout"
      title="Review and confirm your stay."
      mobileTitle="Checkout"
      mobileBottomAction={{ label: 'Confirm and reserve', onClick: () => {} }}
      description="This is the mock booking confirmation page for traveler details, add-ons, pricing, and payment readiness. It can later connect to availability, price calculation, booking, and payment APIs without a redesign."
      actions={[
        { label: 'Back to stays', href: `/property/${propertyId}`, secondary: true },
        { label: 'Need help?', href: '/messages' },
      ]}
      stats={[
        {
          label: 'Stay total',
          value: `$${checkoutState.total + selectedAddOnTotal}`,
          note: `${checkoutState.nights} nights`,
        },
        {
          label: 'Guests',
          value: String(checkoutState.guests),
          note: checkoutState.dateLabel,
        },
        {
          label: 'Reward ready',
          value: '$275',
          note: 'Can be applied later',
        },
      ]}
      accent="from-rose-50 via-white to-amber-50"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="order-first space-y-6 xl:order-last">
          <SectionCard>
            <img
              src={checkoutState.property.image}
              alt={checkoutState.property.title}
              className="aspect-[4/3] w-full rounded-[24px] object-cover"
            />

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <StatusPill tone="brand">Preview checkout</StatusPill>
              <StatusPill tone="success">Flexible policy</StatusPill>
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-dark">
              {checkoutState.property.title}
            </h2>

            <div className="mt-4 space-y-3 text-sm text-muted">
              <p className="inline-flex items-center gap-2">
                <MapPin size={15} />
                {checkoutState.property.location}, {checkoutState.property.country}
              </p>
              <p className="inline-flex items-center gap-2">
                <CalendarDays size={15} />
                {checkoutState.dateLabel}
              </p>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading
              eyebrow="Price Summary"
              title="What you pay today"
              description="Simple enough for mobile, detailed enough to feel trustworthy."
            />

            <div className="mt-6 space-y-4 text-sm text-dark">
              <div className="flex items-center justify-between gap-4">
                <span>
                  ${checkoutState.property.price} x {checkoutState.nights} nights
                </span>
                <span>${checkoutState.nightlySubtotal}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Service fee</span>
                <span>${checkoutState.serviceFee}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Taxes</span>
                <span>${checkoutState.taxes}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Selected add-ons</span>
                <span>${selectedAddOnTotal}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-lg font-semibold">
                <span>Total</span>
                <span>${checkoutState.total + selectedAddOnTotal}</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-dark px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              <CreditCard size={16} />
              Confirm and reserve
            </button>

            <div className="mt-5 rounded-[24px] bg-[#fcfcfb] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Included protection
              </p>
              <div className="mt-3 space-y-3">
                {checkoutPreview.supportHighlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-3">
                    <div className="rounded-full bg-emerald-50 p-1.5 text-emerald-700">
                      <ShieldCheck size={12} />
                    </div>
                    <p className="text-sm leading-6 text-dark">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 hidden rounded-[24px] border border-dashed border-gray-200 bg-white p-5 md:block">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-rose-50 p-3 text-brand">
                  <Sparkles size={18} />
                </div>
                <p className="text-sm leading-6 text-muted">
                  The later booking flow can connect `check availability`, `calculate
                  price`, `create booking`, and `process payment` into this exact
                  surface.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard>
            <SectionHeading
              eyebrow="Traveler"
              title="Primary traveler details"
              description="The form is intentionally short and mobile-friendly so it can become the real checkout baseline later."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {Object.entries(checkoutPreview.travelerDetails).map(([field, value]) => (
                <label key={field} className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {field.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <input
                    type="text"
                    defaultValue={value}
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm"
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 hidden rounded-[24px] border border-dashed border-gray-200 bg-white p-5 md:block">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
                  <UserRound size={18} />
                </div>
                <p className="text-sm leading-6 text-muted">
                  Passport, emergency contact, and guest verification fields can be
                  introduced here later without disturbing the form rhythm.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeading
              eyebrow="Extras"
              title="Add-ons worth considering"
              description="Optional services make the mock checkout feel real and give us room for future monetization patterns."
            />

            <div className="mt-6 grid gap-4">
              {checkoutPreview.addOns.map((addOn) => {
                const isSelected = selectedAddOns.includes(addOn.id)

                return (
                  <button
                    key={addOn.id}
                    type="button"
                    onClick={() =>
                      setSelectedAddOns((current) =>
                        isSelected
                          ? current.filter((id) => id !== addOn.id)
                          : [...current, addOn.id],
                      )
                    }
                    className={`rounded-[24px] border p-5 text-left transition-colors ${
                      isSelected
                        ? 'border-dark bg-dark text-white'
                        : 'border-gray-200 bg-[#fcfcfb] text-dark hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">{addOn.title}</p>
                        <p
                          className={`mt-2 text-sm leading-6 ${
                            isSelected ? 'text-white/80' : 'text-muted'
                          }`}
                        >
                          {addOn.description}
                        </p>
                      </div>
                      <p className="text-lg font-semibold">{addOn.price}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </SectionCard>
        </div>
      </div>

      <Link
        to={`/property/${propertyId}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-dark transition-colors hover:text-muted"
      >
        Back to property
      </Link>
    </PortalShell>
  )
}
