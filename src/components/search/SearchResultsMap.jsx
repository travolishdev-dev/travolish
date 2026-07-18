import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { MapPin } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import useCurrency from '../../hooks/useCurrency'
import { formatCurrencyAmount } from '../../lib/currency'

// ─── city fallback coords (used only when no geocoded coords exist) ───────────
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

// ─── helpers ─────────────────────────────────────────────────────────────────

function hasRealCoords(property) {
  const { lat, lng } = property.coordinates ?? {}
  return Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)
}

function hashNum(value) {
  return String(value || '').split('').reduce((t, c) => t + c.charCodeAt(0), 0)
}

function resolveMarkerLatLng(property, index, destination) {
  if (hasRealCoords(property)) {
    return [property.coordinates.lat, property.coordinates.lng]
  }

  const haystack = [property.city, property.location, property.country, destination, property.title]
    .filter(Boolean).join(' ').toLowerCase()

  const match = Object.entries(cityCoordinates).find(([city]) => haystack.includes(city))
  const [baseLat, baseLng] = match?.[1] ?? [22.9734, 78.6569]

  const seed = hashNum(property.id || property.title || index)
  const ring = 0.018 + (index % 5) * 0.012
  const angle = (seed % 360) * (Math.PI / 180)

  return [baseLat + Math.sin(angle) * ring, baseLng + Math.cos(angle) * ring]
}

function makePriceIcon(label, selected) {
  const bg = selected ? '#222' : '#fff'
  const color = selected ? '#fff' : '#222'
  const border = selected ? '#222' : '#d1d5db'
  return L.divIcon({
    className: '',
    html: `<div style="min-width:74px;text-align:center;padding:8px 10px;border-radius:999px;border:1px solid ${border};background:${bg};color:${color};box-shadow:0 12px 30px rgba(15,23,42,0.18);font-size:12px;font-weight:800;white-space:nowrap;">${label}</div>`,
    iconSize: [82, 36],
    iconAnchor: [41, 18],
  })
}

// ─── inner component — runs inside <MapContainer> context ─────────────────────

function MapInner({ markers, selectedPropertyId, currency, onPropertySelect, onBoundsChange }) {
  const map = useMap()
  const clusterRef = useRef(null)
  const markerRefs = useRef({})

  // Fit bounds on first load or when markers change meaningfully
  const markerCount = markers.length
  useEffect(() => {
    if (!markerCount) return
    const latLngs = markers.map((m) => m.latLng)
    if (latLngs.length === 1) {
      map.setView(latLngs[0], 12)
    } else {
      map.fitBounds(L.latLngBounds(latLngs), { padding: [48, 48], maxZoom: 12 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerCount])

  // Rebuild cluster group whenever markers change
  useEffect(() => {
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current)
      clusterRef.current = null
    }
    markerRefs.current = {}
    if (!markers.length) return

    import('leaflet.markercluster').then(() => {
      const cluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        iconCreateFunction(c) {
          return L.divIcon({
            className: '',
            html: `<div style="width:40px;height:40px;border-radius:50%;background:#222;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;box-shadow:0 4px 14px rgba(0,0,0,0.25);">${c.getChildCount()}</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          })
        },
      })

      markers.forEach(({ property, latLng }) => {
        const isSelected = property.id === selectedPropertyId
        const label = property.price != null ? formatCurrencyAmount(property.price, currency) : 'View'
        const marker = L.marker(latLng, { icon: makePriceIcon(label, isSelected) })

        marker.on('click', () => onPropertySelect?.(property))
        marker.on('mouseover', () => marker.setIcon(makePriceIcon(label, true)))
        marker.on('mouseout', () => {
          const stillSelected = property.id === selectedPropertyId
          marker.setIcon(makePriceIcon(label, stillSelected))
        })

        cluster.addLayer(marker)
        markerRefs.current[property.id] = { marker, label }
      })

      map.addLayer(cluster)
      clusterRef.current = cluster
    })

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current)
        clusterRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, currency])

  // Update selected marker icon reactively without rebuilding
  const prevSelectedRef = useRef(null)
  useEffect(() => {
    const prev = prevSelectedRef.current
    if (prev && markerRefs.current[prev]) {
      const { marker, label } = markerRefs.current[prev]
      marker.setIcon(makePriceIcon(label, false))
    }
    if (selectedPropertyId && markerRefs.current[selectedPropertyId]) {
      const { marker, label } = markerRefs.current[selectedPropertyId]
      marker.setIcon(makePriceIcon(label, true))
    }
    prevSelectedRef.current = selectedPropertyId
  }, [selectedPropertyId])

  // Detect map movement to show "Search this area"
  useMapEvents({
    moveend() {
      const b = map.getBounds()
      onBoundsChange?.({
        latMin: b.getSouth(),
        latMax: b.getNorth(),
        lngMin: b.getWest(),
        lngMax: b.getEast(),
      })
    },
  })

  return null
}

// ─── exported component ───────────────────────────────────────────────────────

export default function SearchResultsMap({
  properties,
  destination,
  compact = false,
  selectedPropertyId,
  onPropertySelect,
  onBboxSearch,
}) {
  const { currency } = useCurrency()
  const [pendingBbox, setPendingBbox] = useState(null)
  const [mapMoved, setMapMoved] = useState(false)

  const markers = useMemo(
    () =>
      properties.map((property, index) => ({
        property,
        latLng: resolveMarkerLatLng(property, index, destination),
      })),
    [properties, destination],
  )

  const handleBoundsChange = useCallback((bbox) => {
    setPendingBbox(bbox)
    setMapMoved(true)
  }, [])

  const handleSearchThisArea = useCallback(() => {
    if (pendingBbox) {
      onBboxSearch?.(pendingBbox)
      setMapMoved(false)
    }
  }, [pendingBbox, onBboxSearch])

  if (!properties.length) {
    return (
      <div
      className={`flex items-center justify-center border border-gray-200 bg-white text-center shadow-sm ${
        compact ? 'h-[420px]' : 'sticky top-[184px] h-[calc(100vh-184px)] min-h-[540px]'
      }`}
      style={compact ? undefined : { height: 'calc(100dvh - 184px)' }}
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
    <div
      className={`relative overflow-hidden border border-gray-200 bg-white shadow-sm ${
        compact ? '' : 'sticky top-[184px] flex h-[calc(100vh-184px)] min-h-[540px] flex-col border-r-0'
      }`}
      style={compact ? { touchAction: 'pan-y' } : { height: 'calc(100dvh - 184px)' }}
    >
      <MapContainer
        center={markers[0]?.latLng ?? [22.9734, 78.6569]}
        zoom={5}
        scrollWheelZoom
        zoomControl
        attributionControl
        dragging={!compact}
        touchZoom={!compact}
        doubleClickZoom={!compact}
        className={compact ? 'classic-search-map h-[420px] w-full' : 'classic-search-map min-h-0 flex-1 w-full h-full'}
        style={{ zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
          maxZoom={18}
        />
        <MapInner
          markers={markers}
          selectedPropertyId={selectedPropertyId}
          currency={currency}
          onPropertySelect={onPropertySelect}
          onBoundsChange={handleBoundsChange}
        />
      </MapContainer>

      {/* Search this area pill */}
      {mapMoved && onBboxSearch && (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-[1000] flex justify-center">
          <button
            type="button"
            onClick={handleSearchThisArea}
            className="pointer-events-auto rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-dark shadow-lg transition hover:bg-gray-50 active:scale-95"
          >
            Search this area
          </button>
        </div>
      )}
    </div>
  )
}
