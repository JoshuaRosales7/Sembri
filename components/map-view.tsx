"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

interface MapViewProps {
  plots: any[]
  selectedPlot: any
  onPlotSelect: (plot: any) => void
}

// Extender Window para Leaflet
declare global {
  interface Window {
    L: any
  }
}

export default function MapView({ plots, selectedPlot, onPlotSelect }: MapViewProps) {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const plotLayersRef = useRef<Record<string, any>>({})
  const baseLayersRef = useRef<Record<string, any>>({})
  const [leafletReady, setLeafletReady] = useState(false)

  // Inicializar mapa + capas base una sola vez
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || mapRef.current) return

    const L = window.L
    if (!L) return

    // Fix de íconos por defecto de Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    })

    // Crear mapa centrado en Guatemala
    const map = L.map(mapContainerRef.current, {
      center: [15.7835, -90.2308],
      zoom: 7,
      zoomControl: true,
    })
    mapRef.current = map

    // Capas base
    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    })

    const esriSat = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "&copy; Esri, Maxar, Earthstar Geographics",
        maxZoom: 19,
      }
    )

    const openTopo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org">OSM</a> contributors, ' +
        '<a href="https://viewfinderpanoramas.org">SRTM</a> | ' +
        'Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      maxZoom: 17,
    })

    const cartoPositron = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          "&copy; OpenStreetMap contributors &copy; CARTO",
        maxZoom: 20,
      }
    )

    // Agregar por defecto (Carto claro para ver bien los polígonos)
    cartoPositron.addTo(map)

    // Guardar en ref para el control
    baseLayersRef.current = {
      "🟢 Calles (OSM)": osm,
      "🌎 Satélite (Esri)": esriSat,
      "⛰️ Terreno (OpenTopoMap)": openTopo,
      "🗺️ Claro (Carto Positron)": cartoPositron,
    }

    // Control de capas
    L.control.layers(baseLayersRef.current, undefined, { position: "topright", collapsed: true }).addTo(map)

    // Control de escala
    L.control.scale({ metric: true, imperial: false }).addTo(map)

    // Limpieza al desmontar
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [leafletReady])

  // Pintar/actualizar polígonos cuando cambian las parcelas o la selección
  useEffect(() => {
    if (!mapRef.current || !window.L) return
    const L = window.L
    const map = mapRef.current

    // Quitar capas anteriores
    Object.values(plotLayersRef.current).forEach((layer: any) => map.removeLayer(layer))
    plotLayersRef.current = {}

    if (plots.length > 0) {
      const bounds: [number, number][] = []

      plots.forEach((plot: any) => {
        const ring = plot?.geometry?.coordinates?.[0]
        if (!ring || !Array.isArray(ring)) return

        try {
          // GeoJSON [lng, lat] -> Leaflet [lat, lng]
          const latLngs = ring.map((coord: number[]) => [coord[1], coord[0]]) as [number, number][]

          const isSelected = selectedPlot?.id === plot.id
          const polygon = L.polygon(latLngs, {
            color: isSelected ? "#15803d" : "#22c55e",
            fillColor: isSelected ? "#16a34a" : "#86efac",
            fillOpacity: 0.4,
            weight: isSelected ? 3 : 2,
          }).addTo(map)

          polygon.bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-gray-900">${plot.name ?? "Parcela"}</h3>
              <p class="text-sm text-gray-600">${plot.area_hectares} hectáreas</p>
              ${plot.crop_type ? `<p class="text-sm text-gray-600">Cultivo: ${plot.crop_type}</p>` : ""}
            </div>
          `)

          polygon.on("click", () => onPlotSelect(plot))
          plotLayersRef.current[plot.id] = polygon

          bounds.push(...latLngs)
        } catch (err) {
          console.error("[Sembri] Error al renderizar parcela:", plot?.id, err)
        }
      })

      if (bounds.length > 0) {
        map.fitBounds(bounds as any, { padding: [40, 40] })
      }
    }
  }, [plots, selectedPlot, onPlotSelect, leafletReady])

  return (
    <>
      {/* CSS Leaflet */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        integrity="sha512-h9FcoyWjHcOcmEVkxOfTLnmZFWIH0iZhZT1H2TbOq55xssQGEJHEaIm+PgoUaZbRvQTNTluNOEfb1ZRy6D3BOw=="
        crossOrigin="anonymous"
      />

      {/* Leaflet JS */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"
        integrity="sha512-puJW3E/qXDqYp9IfhAI54BJEaWIfloJ7JWs7OeD5i6ruC9JZL1gERT1wjtwXFlh7CjE7ZJ+/vcRZRkIYIb6p4g=="
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => setLeafletReady(true)}
      />

      {/* Contenedor del mapa */}
      <div
        ref={mapContainerRef}
        className="h-[600px] w-full rounded-lg border border-gray-200 shadow-sm"
      />
    </>
  )
}
