import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BedDouble,
  MapPin,
  Star,
  Users,
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { properties } from '../data/mockData'
import useNativeAppLocationStore from '../stores/useNativeAppLocationStore'
import {
  formatCoordinates,
  sortPropertiesBySharedLocation,
} from '../lib/nativeAppLocation'

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN

export default function MapViewPage() {
  const navigate = useNavigate()
  const sharedLocation = useNativeAppLocationStore()
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const propertyMarkersRef = useRef(new Map())
  const propertyCardRefs = useRef(new Map())

  const nearbyProperties = sharedLocation.hasSharedLocation
    ? sortPropertiesBySharedLocation(properties, sharedLocation)
    : []

  const [selectedPropertyId, setSelectedPropertyId] = useState(
    nearbyProperties[0]?.id ?? null,
  )

  const selectedProperty =
    nearbyProperties.find((property) => property.id === selectedPropertyId) ||
    nearbyProperties[0] ||
    null

  useEffect(() => {
    setSelectedPropertyId(nearbyProperties[0]?.id ?? null)
  }, [sharedLocation.hasSharedLocation])

  useEffect(() => {
    if (!sharedLocation.hasSharedLocation || !mapContainerRef.current || !nearbyProperties.length) {
      return
    }

    let isDisposed = false

    const initializeMap = async () => {
      const L = await import('leaflet')

      if (isDisposed || !mapContainerRef.current) {
        return
      }

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      })

      if (mapboxToken) {
        L.tileLayer(
          `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/512/{z}/{x}/{y}@2x?access_token=${mapboxToken}`,
          {
            tileSize: 512,
            zoomOffset: -1,
            attribution: '&copy; Mapbox &copy; OpenStreetMap contributors',
            maxZoom: 20,
          },
        ).addTo(map)
      } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map)
      }

      const bounds = []
      propertyMarkersRef.current = new Map()

      nearbyProperties.forEach((property) => {
        const marker = L.marker(property.coordinates).addTo(map)

        marker.on('click', () => {
          setSelectedPropertyId(property.id)
          marker.openTooltip()
        })

        marker.bindTooltip(
          `${property.title}\n${property.location}, ${property.country}`,
          {
            direction: 'top',
            offset: [0, -10],
          },
        )

        propertyMarkersRef.current.set(property.id, marker)
        bounds.push(property.coordinates)
      })

      L.circleMarker(
        [sharedLocation.latitude, sharedLocation.longitude],
        {
          radius: 8,
          color: '#FF385C',
          fillColor: '#FF385C',
          fillOpacity: 1,
          weight: 2,
        },
      )
        .bindTooltip('Your location', {
          direction: 'top',
          offset: [0, -6],
        })
        .addTo(map)

      bounds.push([sharedLocation.latitude, sharedLocation.longitude])

      map.fitBounds(L.latLngBounds(bounds), {
        padding: [60, 60],
      })

      mapInstanceRef.current = map
    }

    initializeMap()

    return () => {
      isDisposed = true

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      propertyMarkersRef.current = new Map()
    }
  }, [nearbyProperties, sharedLocation])

  useEffect(() => {
    if (!selectedProperty) {
      return
    }

    const marker = propertyMarkersRef.current.get(selectedProperty.id)
    const map = mapInstanceRef.current
    const card = propertyCardRefs.current.get(selectedProperty.id)

    if (marker && map) {
      map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 5), {
        duration: 0.45,
      })
      marker.openTooltip()
    }

    if (card) {
      card.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
    }
  }, [selectedProperty])

  if (!sharedLocation.hasSharedLocation || !nearbyProperties.length) {
    return (
      <main className="min-h-screen bg-white px-6 py-10 md:px-10 xl:px-20">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="mx-auto mt-24 max-w-xl text-center">
          <h1 className="text-3xl font-semibold text-dark">Map view is unavailable</h1>
          <p className="mt-3 text-muted">
            A shared location is required before nearby properties can be shown on
            the map.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f6f5f2] px-4 py-4 md:px-8 md:py-6">
      <div className="mx-auto max-w-[1760px] space-y-5">
        <div className="flex flex-col gap-4 rounded-[28px] border border-gray-200 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <MapPin size={12} />
              Map View
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-dark md:text-3xl">
              Browse nearby stays on the map
            </h1>
            <p className="mt-2 text-sm text-muted md:text-[15px]">
              {nearbyProperties.length} properties around{' '}
              {formatCoordinates(sharedLocation.latitude, sharedLocation.longitude)}.
              Tap a marker to focus the matching card below.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 self-start rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Back to home
          </button>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-sm">
          <div ref={mapContainerRef} className="h-[52vh] min-h-[420px] w-full md:h-[58vh]" />
        </div>

        <section className="rounded-[32px] border border-gray-200 bg-white px-4 py-4 shadow-sm md:px-5 md:py-5">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Nearby Properties
              </p>
              <h2 className="mt-1 text-lg font-semibold text-dark">
                {selectedProperty.title}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {selectedProperty.location}, {selectedProperty.country}
              </p>
            </div>

            <Link
              to={`/property/${selectedProperty.id}`}
              className="inline-flex items-center gap-2 self-start rounded-full bg-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Open property
            </Link>
          </div>

          <div className="overflow-x-auto hide-scrollbar">
            <div className="flex gap-4 pb-2">
              {nearbyProperties.map((property) => {
                const isSelected = property.id === selectedProperty.id

                return (
                  <button
                    key={property.id}
                    type="button"
                    ref={(node) => {
                      if (node) {
                        propertyCardRefs.current.set(property.id, node)
                      } else {
                        propertyCardRefs.current.delete(property.id)
                      }
                    }}
                    onClick={() => setSelectedPropertyId(property.id)}
                    className={`min-w-[308px] max-w-[308px] overflow-hidden rounded-[28px] border bg-white text-left transition-all ${
                      isSelected
                        ? 'border-brand shadow-[0_18px_40px_rgba(255,56,92,0.16)] ring-2 ring-brand/20'
                        : 'border-gray-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-dark shadow-sm">
                        ${property.price} / night
                      </div>
                      {property.host.superhost && (
                        <div className="absolute right-3 top-3 rounded-full bg-dark/90 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                          Superhost
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-[15px] font-semibold leading-5 text-dark">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-sm text-dark">
                          <Star size={13} className="fill-dark text-dark" />
                          <span>{property.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted">
                        <MapPin size={14} />
                        <span className="truncate">
                          {property.location}, {property.country}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-dark">
                          <Users size={12} />
                          {property.guests} guests
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-dark">
                          <BedDouble size={12} />
                          {property.bedrooms} bedrooms
                        </span>
                      </div>

                      <p className="line-clamp-2 text-sm text-muted">
                        {property.description}
                      </p>

                      <div className="pt-1 text-sm font-semibold text-dark">
                        Select property
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
