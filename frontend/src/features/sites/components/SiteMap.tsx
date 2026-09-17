import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L, { type LatLngExpression } from 'leaflet'

const siteIcon = L.divIcon({
  className: 'site-marker',
  html: '<div style="align-items:center;background:#10b981;border:3px solid white;border-radius:999px;box-shadow:0 2px 8px #0f172a66;color:white;display:flex;height:34px;justify-content:center;width:34px">&#9889;</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

interface SiteMapProps {
  latitude: number
  longitude: number
  nom: string
  interactive?: boolean
  onPositionChange?: (position: { latitude: number; longitude: number }) => void
  className?: string
}

function MapPositionSync({ latitude, longitude }: Pick<SiteMapProps, 'latitude' | 'longitude'>) {
  const map = useMap()

  useEffect(() => {
    map.setView([latitude, longitude])
  }, [latitude, longitude, map])

  return null
}

function MapClickHandler({ onPositionChange }: Pick<SiteMapProps, 'onPositionChange'>) {
  useMapEvents({
    click: (event) => onPositionChange?.({ latitude: event.latlng.lat, longitude: event.latlng.lng }),
  })
  return null
}

export function SiteMap({ latitude, longitude, nom, interactive = false, onPositionChange, className = '' }: SiteMapProps) {
  const position: LatLngExpression = [latitude, longitude]

  return (
    <div className={`h-56 overflow-hidden rounded-lg ${className}`}>
      <MapContainer center={position} zoom={14} scrollWheelZoom={interactive} className="h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapPositionSync latitude={latitude} longitude={longitude} />
        {interactive ? <MapClickHandler onPositionChange={onPositionChange} /> : null}
        <Marker position={position} icon={siteIcon} title={nom} />
      </MapContainer>
    </div>
  )
}
