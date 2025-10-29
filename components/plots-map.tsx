"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, MapPin, Eye } from "lucide-react"
import dynamic from "next/dynamic"
import AddPlotDialog from "./add-plot-dialog"
import Link from "next/link"

// Cargar el mapa dinámicamente para evitar errores de SSR
const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-100">
      <p className="text-gray-500">Cargando mapa...</p>
    </div>
  ),
})

interface PlotsMapProps {
  plots: any[]
  userId: string
}

export default function PlotsMap({ plots, userId }: PlotsMapProps) {
  const [selectedPlot, setSelectedPlot] = useState<any>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const totalArea = plots.reduce((sum, p) => sum + Number.parseFloat(p.area_hectares || 0), 0).toFixed(2)

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Sección del mapa */}
      <div className="flex-1 relative">
        <MapView plots={plots} selectedPlot={selectedPlot} onPlotSelect={setSelectedPlot} />

        {/* Botón flotante para agregar parcela */}
        <div className="absolute top-4 right-4 z-[1000]">
          <Button className="bg-green-600 hover:bg-green-700 shadow-lg" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar parcela
          </Button>
        </div>
      </div>

      {/* Barra lateral */}
      <div className="w-full lg:w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Mis parcelas</h2>
            <p className="text-sm text-gray-500">
              {plots.length} parcela{plots.length !== 1 ? "s" : ""} • {totalArea} ha en total
            </p>
          </div>

          {/* Estado sin parcelas */}
          {plots.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Aún no has agregado ninguna parcela</p>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowAddDialog(true)}>
                  Agregar primera parcela
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {plots.map((plot: any) => (
                <Card
                  key={plot.id}
                  className={`cursor-pointer transition-colors ${
                    selectedPlot?.id === plot.id ? "border-green-500 bg-green-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedPlot(plot)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-semibold">{plot.name}</CardTitle>
                      <Link href={`/dashboard/plots/${plot.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:text-green-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Área:</span>
                      <span className="font-medium">{plot.area_hectares} ha</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cultivo:</span>
                      <span className="font-medium">{plot.crop_type || "No especificado"}</span>
                    </div>
                    {plot.planting_date && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fecha de siembra:</span>
                        <span className="font-medium">
                          {new Date(plot.planting_date).toLocaleDateString("es-GT", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Diálogo para agregar parcela */}
      <AddPlotDialog open={showAddDialog} onOpenChange={setShowAddDialog} userId={userId} />
    </div>
  )
}
