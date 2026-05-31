  import { useEffect, useMemo, useRef } from 'react'
  import { MapPin } from 'lucide-react'
  import 'leaflet/dist/leaflet.css'
  import useCurrency from '../../hooks/useCurrency'
  import { formatCurrencyAmount } from '../../lib/currency'

  const cityCoordinates = {
    agra: [27.1767, 78.0081],
    bengaluru: [12.9716, 77.5946],
    bangalore: [12.9716, 77.5946],
    chennai: [13.0827, 80.2707],
    darjeeling: [27.041, 88.2663],
    goa: [15.2993, 74.124],
    hyderabad: [17.385, 78.4867],
    jaipur: [26.9124, 75.7873],
    kochi: [9.9312, 76.2673],
    kolkata: [22.5726, 88.3639],
    ladakh: [34.1526, 77.5771],
    leh: [34.1526, 77.5771],
    manali: [32.2432, 77.1892],
    mumbai: [19.076, 72.8777],
    munnar: [10.0889, 77.0595],
    mussoorie: [30.4598, 78.0644],
    'new delhi': [28.6139, 77.209],
    delhi: [28.6139, 77.209],
    ooty: [11.4102, 76.695],
    pune: [18.5204, 73.8567],
    rishikesh: [30.0869, 78.2676],
    shimla: [31.1048, 77.1734],
    udaipur: [24.5854, 73.7125],
    varanasi: [25.3176, 82.9739],
  }

  function getPriceLabel(price, currency) {
    if (price === null || price === undefined) return 'View'
    return formatCurrencyAmount(price, currency)
  }

  function getHashNumber(value) {
    const text = String(value || '')
    return text.split('').reduce((total, char) => total + char.charCodeAt(0), 0)
  }

  function hasRealCoordinates(property) {
    const lat = property.coordinates?.lat
    const lng = property.coordinates?.lng
    return Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)
  }

  function findBaseCoordinates(property, destination) {
    if (hasRealCoordinates(property)) {
      return [property.coordinates.lat, property.coordinates.lng]
    }

    const haystack = [
      property.city,
      property.location,
      property.country,
      destination,
      property.title,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const match = Object.entries(cityCoordinates).find(([city]) =>
      haystack.includes(city),
    )

    return match?.[1] || [22.9734, 78.6569]
  }

  function getMarkerCoordinates(property, index, destination) {
    const [baseLat, baseLng] = findBaseCoordinates(property, destination)
    if (hasRealCoordinates(property)) return [baseLat, baseLng]

    const seed = getHashNumber(property.id || property.title || index)
    const ring = 0.018 + (index % 5) * 0.012
    const angle = (seed % 360) * (Math.PI / 180)

    return [
      baseLat + Math.sin(angle) * ring,
      baseLng + Math.cos(angle) * ring,
    ]
  }

  function createPriceIcon(L, property, isSelected, currency) {
    const label = getPriceLabel(property.price, currency)
    const background = isSelected ? '#222222' : '#ffffff'
    const color = isSelected ? '#ffffff' : '#222222'
    const border = isSelected ? '#222222' : '#d1d5db'

    return L.divIcon({
      className: '',
      html: `
        <div style="
          min-width: 74px;
          text-align: center;
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid ${border};
          background: ${background};
          color: ${color};
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        ">
          ${label}
        </div>
      `,
      iconSize: [82, 36],
      iconAnchor: [41, 18],
    })
  }

  export default function SearchResultsMap({
    properties,
    destination,
    compact = false,
    onPropertySelect,
  }) {
    const mapContainerRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const { currency } = useCurrency()

    const markers = useMemo(
      () =>
        properties.map((property, index) => ({
          property,
          coordinates: getMarkerCoordinates(property, index, destination),
        })),
      [properties, destination],
    )

    useEffect(() => {
      if (!mapContainerRef.current || !markers.length) return undefined

      let isDisposed = false

      const initializeMap = async () => {
        const L = await import('leaflet')
        if (isDisposed || !mapContainerRef.current) return

        const map = L.map(mapContainerRef.current, {
          attributionControl: true,
          zoomControl: false,
          scrollWheelZoom: true,
        })

        L.control.zoom({ position: 'topleft' }).addTo(map)
        L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map)

        const bounds = []

        markers.forEach(({ property, coordinates }) => {
          const marker = L.marker(coordinates, {
            icon: createPriceIcon(L, property, false, currency),
            keyboard: true,
          }).addTo(map)

          marker.on('mouseover', () => {
            marker.setIcon(createPriceIcon(L, property, true, currency))
          })

          marker.on('mouseout', () => {
            marker.setIcon(createPriceIcon(L, property, false, currency))
          })

          marker.on('click', () => onPropertySelect?.(property))

          bounds.push(coordinates)
        })

        if (bounds.length === 1) {
          map.setView(bounds[0], 12)
        } else {
          map.fitBounds(L.latLngBounds(bounds), {
            padding: [48, 48],
            maxZoom: 12,
          })
        }

        mapInstanceRef.current = map
      }

      initializeMap()

      return () => {
        isDisposed = true
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }
      }
    }, [currency, markers, onPropertySelect])

    if (!properties.length) {
      return (
        <div className={`flex items-center justify-center border border-gray-200 bg-white text-center shadow-sm ${
          compact
            ? 'h-[420px]'
            : 'sticky top-[184px] h-[calc(100vh-184px)] min-h-[540px]'
        }`}
        >
          <div>
            <MapPin size={36} className="mx-auto text-gray-300" />
            <p className="mt-3 text-sm font-semibold text-dark">Map will update here</p>
            <p className="mt-1 text-xs text-muted">Search for properties to see prices on the map.</p>
          </div>
        </div>
      )
    }

    return (
      <div className={`overflow-hidden border border-gray-200 bg-white shadow-sm ${
        compact
          ? ''
          : 'sticky top-[184px] flex h-[calc(100vh-184px)] min-h-[540px] flex-col border-r-0'
      }`}
      >
        <div
          ref={mapContainerRef}
          className={compact ? 'classic-search-map h-[420px] w-full' : 'classic-search-map min-h-0 flex-1 w-full'}
        />
      </div>
    )
  }
