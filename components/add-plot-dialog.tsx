"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CoordinatePickerMap from "./coordinate-picker-map"
import * as turf from "@turf/turf" // ✅ para calcular área automáticamente

interface AddPlotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export default function AddPlotDialog({ open, onOpenChange, userId }: AddPlotDialogProps) {
  const [nombre, setNombre] = useState("")
  const [cultivo, setCultivo] = useState("")
  const [fechaSiembra, setFechaSiembra] = useState("")
  const [coordenadas, setCoordenadas] = useState("")
  const [areaHectareas, setAreaHectareas] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // 🧮 Calcular el área automáticamente cuando cambian las coordenadas
  useEffect(() => {
    if (!coordenadas) return

    try {
      const coordPairs = coordenadas
        .split(";")
        .map((pair) => pair.trim().split(",").map(Number))
        .map(([lat, lng]) => [lng, lat])

      if (coordPairs.length < 3) return // no es un polígono válido
      coordPairs.push(coordPairs[0]) // cerrar polígono

      const polygon = turf.polygon([coordPairs])
      const areaM2 = turf.area(polygon)
      const hectareas = areaM2 / 10000

      setAreaHectareas(Number(hectareas.toFixed(2)))
    } catch (err) {
      console.error("Error al calcular el área:", err)
    }
  }, [coordenadas])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!coordenadas) throw new Error("Debes seleccionar un área en el mapa.")
      if (!areaHectareas) throw new Error("No se pudo calcular el área. Verifica las coordenadas.")

      const coordPairs = coordenadas
        .split(";")
        .map((pair) => pair.trim().split(",").map(Number))
        .map(([lat, lng]) => [lng, lat])

      coordPairs.push(coordPairs[0])

      const geometry = {
        type: "Polygon",
        coordinates: [coordPairs],
      }

      const supabase = createClient()
      const { error: insertError } = await supabase.from("plots").insert({
        farmer_id: userId,
        name: nombre,
        area_hectares: areaHectareas,
        crop_type: cultivo || null,
        planting_date: fechaSiembra || null,
        geometry: geometry,
      })

      if (insertError) throw insertError

      setNombre("")
      setCultivo("")
      setFechaSiembra("")
      setCoordenadas("")
      setAreaHectareas(null)
      onOpenChange(false)
      router.refresh()
    } catch (err: any) {
      console.error("[Error al agregar parcela]:", err)
      setError(err.message || "Ocurrió un error al guardar la parcela.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[99999] bg-white shadow-2xl border border-gray-200">
        <DialogHeader>
          <DialogTitle>Agregar nueva parcela</DialogTitle>
          <DialogDescription>
            Selecciona el área en el mapa. El sistema calculará automáticamente las hectáreas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la parcela</Label>
            <Input
              id="nombre"
              placeholder="Ejemplo: Finca Norte"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cultivo">Tipo de cultivo</Label>
            <Input
              id="cultivo"
              placeholder="Ejemplo: Maíz, Trigo, Café"
              value={cultivo}
              onChange={(e) => setCultivo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha de siembra (opcional)</Label>
            <Input
              id="fecha"
              type="date"
              value={fechaSiembra}
              onChange={(e) => setFechaSiembra(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Límites de la parcela</Label>
            <CoordinatePickerMap
              onCoordinatesChange={(coords) => setCoordenadas(coords)}
              autoCaptureViewport
              initialCoordinates={coordenadas}
            />
            <p className="text-xs text-gray-500">
              📍 El área se calculará automáticamente según las coordenadas seleccionadas.
            </p>
          </div>

          {areaHectareas !== null && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
              <strong>Área estimada:</strong> {areaHectareas} hectáreas
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Agregar parcela"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
