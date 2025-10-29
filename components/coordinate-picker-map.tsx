"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { Button } from "@/components/ui/button"

interface CoordinatePickerMapProps {
  onCoordinatesChange: (coordinates: string) => void
  initialCoordinates?: string
  autoCaptureViewport?: boolean
}

export default function CoordinatePickerMap({
  onCoordinatesChange,
  initialCoordinates,
  autoCaptureViewport = false,
}: CoordinatePickerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const polygonRef = useRef<any>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [points, setPoints] = useState<[number, number][]>([])

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).L && mapRef.current && !mapInstanceRef.current) {
      const L = (window as any).L
      const map = L.map(mapRef.current).setView([15.7835, -90.2308], 6)

      // 🗺️ Capas base
      const baseLayers = {
        "🟢 Mapa callejero": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }),

        "🌎 Satélite (ESRI)": L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
            maxZoom: 19,
          }
        ),

        "⛰️ Terreno (Mapbox)": L.tileLayer(
          "https://api.maptiler.com/tiles/terrain/{z}/{x}/{y}.png?key=1YjqB4P6nybWkA4hJkZ1", // 🔑 puedes usar tu propia API key gratis
          {
            attribution: "&copy; MapTiler & OpenStreetMap contributors",
            maxZoom: 19,
          }
        ),
      }

      // Agregar la capa por defecto (callejero)
      baseLayers["🟢 Mapa callejero"].addTo(map)

      // Añadir control para cambiar entre capas
      L.control.layers(baseLayers).addTo(map)

      const customIcon = L.divIcon({
        className: "custom-marker",
        html: '<div style="background-color: #16a34a; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })

      const updateViewportBounds = () => {
        if (!autoCaptureViewport) return
        const bounds = map.getBounds()
        const ne = bounds.getNorthEast()
        const sw = bounds.getSouthWest()

        const coords = [
          [sw.lat, sw.lng],
          [ne.lat, sw.lng],
          [ne.lat, ne.lng],
          [sw.lat, ne.lng],
        ] as [number, number][]

        if (polygonRef.current) map.removeLayer(polygonRef.current)
        polygonRef.current = L.polygon(coords, {
          color: "#16a34a",
          fillColor: "#16a34a",
          fillOpacity: 0.25,
          weight: 2,
        }).addTo(map)

        setPoints(coords)
        const coordString = coords.map((p) => `${p[0]},${p[1]}`).join(";")
        onCoordinatesChange(coordString)
      }

      if (autoCaptureViewport) {
        map.on("zoomend moveend", updateViewportBounds)
        updateViewportBounds()
      }

      map.on("click", (e: any) => {
        if (autoCaptureViewport) return
        const { lat, lng } = e.latlng
        const newPoint: [number, number] = [lat, lng]
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
        markersRef.current.push(marker)

        const updatedPoints = [...points, newPoint]
        setPoints(updatedPoints)
        if (polygonRef.current) map.removeLayer(polygonRef.current)

        if (updatedPoints.length >= 3) {
          polygonRef.current = L.polygon(updatedPoints, {
            color: "#16a34a",
            fillColor: "#16a34a",
            fillOpacity: 0.25,
            weight: 2,
          }).addTo(map)
        } else if (updatedPoints.length === 2) {
          polygonRef.current = L.polyline(updatedPoints, {
            color: "#16a34a",
            weight: 2,
          }).addTo(map)
        }

        const coordString = updatedPoints.map((p) => `${p[0]},${p[1]}`).join(";")
        onCoordinatesChange(coordString)
      })

      // 🔁 Cargar coordenadas iniciales si existen
      if (initialCoordinates) {
        try {
          const coordPairs = initialCoordinates.split(";").map((pair) => {
            const [lat, lng] = pair.trim().split(",").map(Number)
            return [lat, lng] as [number, number]
          })

          coordPairs.forEach(([lat, lng]) => {
            const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
            markersRef.current.push(marker)
          })

          if (coordPairs.length >= 3) {
            polygonRef.current = L.polygon(coordPairs, {
              color: "#16a34a",
              fillColor: "#16a34a",
              fillOpacity: 0.25,
              weight: 2,
            }).addTo(map)
            map.fitBounds(polygonRef.current.getBounds())
          }

          setPoints(coordPairs)
        } catch (error) {
          console.error("Error al analizar coordenadas iniciales:", error)
        }
      }

      mapInstanceRef.current = map
      setIsMapReady(true)
    }
  }, [isMapReady, autoCaptureViewport, initialCoordinates, onCoordinatesChange, points])

  const handleClearPoints = () => {
    if (mapInstanceRef.current) {
      markersRef.current.forEach((marker) => mapInstanceRef.current.removeLayer(marker))
      markersRef.current = []
      if (polygonRef.current) {
        mapInstanceRef.current.removeLayer(polygonRef.current)
        polygonRef.current = null
      }
      setPoints([])
      onCoordinatesChange("")
    }
  }

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"
        integrity="sha512-BwHfrr4c9kmRkLw6iXuqC5nmyLhXwkBi8Vc1bNSxgz6HVP9GqTGzgxOX7wOvvhsEP0Oj0L3u03Y9a3vY0LoRxA=="
        crossOrigin="anonymous"
        onLoad={() => setIsMapReady(true)}
      />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {autoCaptureViewport
              ? "El área visible se actualizará automáticamente según el zoom y movimiento."
              : `Haz clic en el mapa para agregar puntos de límite (${points.length} puntos)`}
          </p>

          {points.length > 0 && !autoCaptureViewport && (
            <Button type="button" variant="outline" size="sm" onClick={handleClearPoints}>
              Borrar puntos
            </Button>
          )}
        </div>
        <div ref={mapRef} className="h-[300px] w-full rounded-lg border border-border" />
      </div>
    </>
  )
}
