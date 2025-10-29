"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, CreditCard, TrendingUp, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface DashboardOverviewProps {
  plots: any[]
  loans: any[]
  recommendations: any[]
}

export default function DashboardOverview({ plots, loans, recommendations }: DashboardOverviewProps) {
  const activeLoans = loans.filter((l) => l.status === "approved" || l.status === "disbursed")
  const totalLoanAmount = activeLoans.reduce((sum, loan) => sum + Number.parseFloat(loan.amount), 0)
  const totalArea = plots.reduce((sum, plot) => sum + Number.parseFloat(plot.area_hectares), 0)

  const formatCurrency = (value: number) =>
    value.toLocaleString("es-GT", { style: "currency", currency: "GTQ", maximumFractionDigits: 2 })

  return (
    <div className="p-6 space-y-6">
      {/* 📊 Estadísticas generales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Parcelas</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{plots.length}</div>
            <p className="text-xs text-gray-500 mt-1">{totalArea.toFixed(2)} hectáreas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Préstamos Activos</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeLoans.length}</div>
            <p className="text-xs text-gray-500 mt-1">{formatCurrency(totalLoanAmount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Salud del Cultivo</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Buena</div>
            <p className="text-xs text-gray-500 mt-1">Basado en los últimos datos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Alertas</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{recommendations.length}</div>
            <p className="text-xs text-gray-500 mt-1">Notificaciones sin leer</p>
          </CardContent>
        </Card>
      </div>

      {/* ⚡ Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/dashboard/plots">
            <Button className="bg-green-600 hover:bg-green-700">
              <MapPin className="h-4 w-4 mr-2" />
              Agregar Parcela
            </Button>
          </Link>
          <Link href="/dashboard/loans">
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Solicitar Préstamo
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* 🔔 Recomendaciones recientes */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec: any) => (
                <div
                  key={rec.id}
                  className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{rec.plots?.name || "Parcela"}</p>
                    <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded
                        ${
                          rec.priority === "urgent"
                            ? "bg-red-100 text-red-700"
                            : rec.priority === "high"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      Prioridad {rec.priority === "urgent" ? "urgente" : rec.priority === "high" ? "alta" : "media"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🌾 Mis Parcelas */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Parcelas</CardTitle>
        </CardHeader>
        <CardContent>
          {plots.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Aún no has agregado ninguna parcela</p>
              <Link href="/dashboard/plots">
                <Button className="bg-green-600 hover:bg-green-700">Agregar mi primera parcela</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {plots.slice(0, 5).map((plot: any) => (
                <div
                  key={plot.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">{plot.name}</p>
                    <p className="text-sm text-gray-500">
                      {plot.area_hectares} ha • {plot.crop_type || "Sin cultivo"}
                    </p>
                  </div>
                  <Link href="/dashboard/plots">
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </Link>
                </div>
              ))}
              {plots.length > 5 && (
                <Link href="/dashboard/plots">
                  <Button variant="link" className="w-full text-green-700">
                    Ver las {plots.length} parcelas
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
