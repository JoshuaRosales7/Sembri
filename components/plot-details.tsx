"use client"

import { useState } from "react"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Satellite, TrendingUp, Droplets, RefreshCw, Lightbulb } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface PlotDetailsProps {
  plot: any
  satelliteData: any[]
}

export default function PlotDetails({ plot, satelliteData }: PlotDetailsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recsMessage, setRecsMessage] = useState<string | null>(null)

  const handleFetchSatelliteData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch("/api/satellite/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plotId: plot.id, date: today }),
      })

      if (!response.ok) throw new Error("No se pudo obtener los datos satelitales")

      await response.json()
      window.location.reload()
    } catch (err: any) {
      setError(err.message || "Error al obtener los datos satelitales")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateRecommendations = async () => {
    setIsGeneratingRecs(true)
    setRecsMessage(null)
    setError(null)

    try {
      const response = await fetch("/api/recommendations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plotId: plot.id }),
      })

      if (!response.ok) throw new Error("No se pudieron generar recomendaciones")

      const data = await response.json()
      setRecsMessage(
        `Se generó${data.count > 1 ? "ron" : ""} ${data.count} nueva${data.count > 1 ? "s" : ""} recomendación${
          data.count > 1 ? "es" : ""
        }. Revisa tus notificaciones.`
      )

      setTimeout(() => window.location.reload(), 2000)
    } catch (err: any) {
      setError(err.message || "Error al generar recomendaciones")
    } finally {
      setIsGeneratingRecs(false)
    }
  }

  const latestData = satelliteData[0]

  const chartData = satelliteData
    .slice(0, 15)
    .reverse()
    .map((d) => ({
      date: format(new Date(d.date), "dd MMM", { locale: es }),
      ndvi: Number.parseFloat(d.ndvi),
      ndwi: Number.parseFloat(d.ndwi),
    }))

  const getNDVIStatus = (ndvi: number) => {
    if (ndvi > 0.7) return { label: "Excelente", color: "text-green-600" }
    if (ndvi > 0.5) return { label: "Buena", color: "text-green-500" }
    if (ndvi > 0.3) return { label: "Regular", color: "text-yellow-600" }
    return { label: "Deficiente", color: "text-red-600" }
  }

  const ndviStatus = latestData ? getNDVIStatus(Number.parseFloat(latestData.ndvi)) : null

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{plot.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {plot.area_hectares} hectáreas • {plot.crop_type || "Cultivo no especificado"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateRecommendations}
            disabled={isGeneratingRecs || !latestData}
            variant="outline"
            className="bg-transparent"
          >
            <Lightbulb className={`h-4 w-4 mr-2 ${isGeneratingRecs ? "animate-pulse" : ""}`} />
            {isGeneratingRecs ? "Generando..." : "Obtener recomendaciones"}
          </Button>
          <Button onClick={handleFetchSatelliteData} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Actualizando..." : "Actualizar datos"}
          </Button>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {recsMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">{recsMessage}</p>
        </div>
      )}

      {/* Estado actual */}
      {latestData && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">NDVI (Salud del cultivo)</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{Number.parseFloat(latestData.ndvi).toFixed(3)}</div>
              {ndviStatus && <p className={`text-sm font-medium mt-1 ${ndviStatus.color}`}>{ndviStatus.label}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Actualizado el {format(new Date(latestData.date), "dd MMM yyyy", { locale: es })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">NDWI (Contenido de agua)</CardTitle>
              <Droplets className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{Number.parseFloat(latestData.ndwi).toFixed(3)}</div>
              <p className="text-sm text-gray-500 mt-1">
                {Number.parseFloat(latestData.ndwi) > 0.2 ? "Humedad adecuada" : "Humedad baja"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Actualizado el {format(new Date(latestData.date), "dd MMM yyyy", { locale: es })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cobertura de nubes</CardTitle>
              <Satellite className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Number.parseFloat(latestData.cloud_coverage).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {Number.parseFloat(latestData.cloud_coverage) < 20 ? "Cielo despejado" : "Condiciones nubladas"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Última observación</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfica histórica */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tendencias históricas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ndvi" stroke="#16a34a" name="NDVI (Salud del cultivo)" strokeWidth={2} />
                <Line type="monotone" dataKey="ndwi" stroke="#2563eb" name="NDWI (Contenido de agua)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Información de la parcela */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la parcela</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Área:</span>
            <span className="font-medium">{plot.area_hectares} hectáreas</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo de cultivo:</span>
            <span className="font-medium">{plot.crop_type || "No especificado"}</span>
          </div>
          {plot.planting_date && (
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha de siembra:</span>
              <span className="font-medium">
                {format(new Date(plot.planting_date), "dd MMM yyyy", { locale: es })}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Creada el:</span>
            <span className="font-medium">
              {format(new Date(plot.created_at), "dd MMM yyyy", { locale: es })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Estado sin datos */}
      {satelliteData.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Satellite className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no hay datos satelitales</h3>
            <p className="text-gray-600 mb-6">
              Pulsa el botón “Actualizar datos” para obtener las últimas imágenes satelitales y datos de salud del
              cultivo para esta parcela.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
