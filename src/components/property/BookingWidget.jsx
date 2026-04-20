import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react'

export default function BookingWidget({ property }) {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [showGuests, setShowGuests] = useState(false)

  const nights = 5
  const cleaningFee = Math.round(property.price * 0.15)
  const serviceFee = Math.round(property.price * nights * 0.12)
  const total = property.price * nights + cleaningFee + serviceFee

  return (
    <div className="sticky top-28">
      <div className="border border-gray-200 rounded-2xl shadow-lg p-6">
        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-6">
          <span className="text-[22px] font-bold text-dark">${property.price}</span>
          <span className="text-muted">night</span>
          <div className="ml-auto flex items-center gap-1.5">
            <Star size={13} className="fill-dark text-dark" />
            <span className="text-sm font-semibold">{property.rating}</span>
            <span className="text-muted text-sm">· {property.reviewCount} reviews</span>
          </div>
        </div>

        {/* Date Inputs */}
        <div className="border border-gray-300 rounded-xl overflow-hidden mb-4">
          <div className="grid grid-cols-2 divide-x divide-gray-300">
            <div className="p-3">
              <label className="block text-[10px] font-bold text-dark uppercase tracking-wider">
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-sm text-dark bg-transparent outline-none mt-0.5"
                placeholder="Add date"
              />
            </div>
            <div className="p-3">
              <label className="block text-[10px] font-bold text-dark uppercase tracking-wider">
                Checkout
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-sm text-dark bg-transparent outline-none mt-0.5"
                placeholder="Add date"
              />
            </div>
          </div>

          {/* Guests */}
          <div className="border-t border-gray-300">
            <button
              onClick={() => setShowGuests(!showGuests)}
              className="w-full flex items-center justify-between p-3"
            >
              <div>
                <span className="block text-[10px] font-bold text-dark uppercase tracking-wider">
                  Guests
                </span>
                <span className="text-sm text-dark mt-0.5">
                  {guests} guest{guests !== 1 ? 's' : ''}
                </span>
              </div>
              {showGuests ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showGuests && (
              <div className="px-3 pb-3 border-t border-gray-100">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold">Adults</p>
                    <p className="text-xs text-muted">Ages 13+</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      disabled={guests <= 1}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{guests}</span>
                    <button
                      onClick={() => setGuests(Math.min(property.guests, guests + 1))}
                      disabled={guests >= property.guests}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reserve Button */}
        <button className="w-full bg-gradient-to-r from-brand to-rose-500 text-white rounded-xl py-3.5 text-base font-bold hover:opacity-90 transition-opacity shadow-md shadow-brand/20">
          Reserve
        </button>
        <p className="text-center text-muted text-xs mt-3">You won't be charged yet</p>
        <Link
          to={`/checkout/${property.id}`}
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
        >
          Preview checkout
        </Link>

        {/* Price Breakdown */}
        <div className="mt-6 space-y-3 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark underline cursor-help">
              ${property.price} x {nights} nights
            </span>
            <span className="text-dark">${property.price * nights}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark underline cursor-help">Cleaning fee</span>
            <span className="text-dark">${cleaningFee}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark underline cursor-help">Travolish service fee</span>
            <span className="text-dark">${serviceFee}</span>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="font-bold text-dark">Total before taxes</span>
            <span className="font-bold text-dark">${total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
