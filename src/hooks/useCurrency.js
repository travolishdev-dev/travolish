import { useEffect, useState } from 'react'
import { formatCurrencyAmount, getStoredCountry, getStoredCurrency } from '../lib/currency'

export default function useCurrency() {
  const [country, setCountry] = useState(getStoredCountry)
  const [currency, setCurrency] = useState(getStoredCurrency)

  useEffect(() => {
    function syncCurrency() {
      setCountry(getStoredCountry())
      setCurrency(getStoredCurrency())
    }

    window.addEventListener('storage', syncCurrency)
    window.addEventListener('travolish-region-change', syncCurrency)
    return () => {
      window.removeEventListener('storage', syncCurrency)
      window.removeEventListener('travolish-region-change', syncCurrency)
    }
  }, [])

  return {
    country,
    currency,
    formatCurrency: (value) => formatCurrencyAmount(value, currency),
  }
}
