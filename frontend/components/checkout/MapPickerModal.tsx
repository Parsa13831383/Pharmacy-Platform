'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import 'leaflet/dist/leaflet.css'

// Mahabad, Iran — default center when geolocation is unavailable
const MAHABAD: [number, number] = [36.7638, 45.7228]
const DEFAULT_ZOOM = 14

function CenterTracker({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  useMapEvents({
    move(e) {
      const c = e.target.getCenter()
      onMove(c.lat, c.lng)
    },
  })
  return null
}

interface Props {
  initialLat?: number | null
  initialLng?: number | null
  onConfirm: (lat: number, lng: number) => void
  onClose: () => void
}

export default function MapPickerModal({ initialLat, initialLng, onConfirm, onClose }: Props) {
  const [ready, setReady] = useState(false)
  const [startCenter, setStartCenter] = useState<[number, number]>(MAHABAD)
  // Refs avoid re-renders on every map move while keeping the latest value for confirm
  const latRef = useRef<number>(MAHABAD[0])
  const lngRef = useRef<number>(MAHABAD[1])

  useEffect(() => {
    // If the parent already has coordinates, centre there immediately
    if (initialLat != null && initialLng != null) {
      const c: [number, number] = [initialLat, initialLng]
      setStartCenter(c)
      latRef.current = initialLat
      lngRef.current = initialLng
      setReady(true)
      return
    }

    // Otherwise try browser geolocation with a 3 s timeout before falling back to Mahabad
    let settled = false
    const fallback = setTimeout(() => {
      if (!settled) { settled = true; setReady(true) }
    }, 3000)

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (settled) return
          settled = true
          clearTimeout(fallback)
          const c: [number, number] = [pos.coords.latitude, pos.coords.longitude]
          setStartCenter(c)
          latRef.current = c[0]
          lngRef.current = c[1]
          setReady(true)
        },
        () => {
          if (!settled) { settled = true; clearTimeout(fallback); setReady(true) }
        },
        { timeout: 2500 },
      )
    } else {
      clearTimeout(fallback)
      setReady(true)
    }

    return () => clearTimeout(fallback)
  }, [initialLat, initialLng])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-card w-full sm:max-w-lg sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0" dir="rtl">
          <h3 className="font-bold text-foreground text-sm">انتخاب موقعیت تحویل</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map */}
        <div className="relative" style={{ height: 360 }}>
          {!ready ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted">
              <span className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">در حال تعیین موقعیت...</span>
            </div>
          ) : (
            <>
              {/* Fixed center-pin overlay — pointer-events-none keeps map interactive */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
                {/* Pin: bottom tip lands at the map center point */}
                <div
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: 'translateX(-50%) translateY(-100%)' }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-10 h-10 text-primary drop-shadow-md"
                    aria-hidden
                  >
                    <path
                      fill="currentColor"
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    />
                  </svg>
                </div>
                {/* Shadow dot at exact centre */}
                <div
                  className="absolute left-1/2 top-1/2 w-2.5 h-1 bg-black/25 rounded-full blur-[2px]"
                  style={{ transform: 'translate(-50%, -50%)' }}
                />
              </div>

              <MapContainer
                center={startCenter}
                zoom={DEFAULT_ZOOM}
                style={{ height: '100%', width: '100%' }}
                zoomControl
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <CenterTracker
                  onMove={(lat, lng) => {
                    latRef.current = lat
                    lngRef.current = lng
                  }}
                />
              </MapContainer>
            </>
          )}
        </div>

        {/* Instruction */}
        <div className="px-5 py-2.5 bg-muted/50 border-t border-border shrink-0" dir="rtl">
          <p className="text-xs text-muted-foreground text-center">
            نقشه را بکشید تا نشانگر دقیقاً روی محل تحویل قرار گیرد
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 py-4 border-t border-border shrink-0" dir="rtl">
          <Button
            onClick={() => onConfirm(latRef.current, lngRef.current)}
            className="flex-1 rounded h-11"
          >
            تأیید موقعیت
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 rounded h-11"
          >
            انصراف
          </Button>
        </div>
      </div>
    </div>
  )
}
