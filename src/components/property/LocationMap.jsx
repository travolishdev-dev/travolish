import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

export default function LocationMap({ coordinates, location }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  // Accept both { lat, lng } object and legacy [lat, lng] array
  const lat = Array.isArray(coordinates) ? coordinates[0] : coordinates?.lat
  const lng = Array.isArray(coordinates) ? coordinates[1] : coordinates?.lng
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)
  const latLng = hasCoords ? [lat, lng] : null

  useEffect(() => {
    if (!latLng || !mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      const L = await import('leaflet')

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView(latLng, 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      L.circle(latLng, {
        color: '#FF385C',
        fillColor: '#FF385C',
        fillOpacity: 0.15,
        radius: 800,
        weight: 2,
      }).addTo(map)

      L.marker(latLng).addTo(map)

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng])

  return (
    <div>
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-200"
      />
      <p className="text-sm text-dark font-semibold mt-4">{location}</p>
      <p className="text-sm text-muted mt-1">
        Exact location provided after booking.
      </p>
    </div>
  )
}
