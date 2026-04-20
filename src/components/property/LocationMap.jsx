import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

export default function LocationMap({ coordinates, location }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (!coordinates || !mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      const L = await import('leaflet')

      // Fix default marker icon
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView(coordinates, 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      // Add a circle instead of a precise pin for privacy
      L.circle(coordinates, {
        color: '#FF385C',
        fillColor: '#FF385C',
        fillOpacity: 0.15,
        radius: 800,
        weight: 2,
      }).addTo(map)

      L.marker(coordinates).addTo(map)

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [coordinates])

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
