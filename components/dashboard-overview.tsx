"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MapPin,
  CreditCard,
  TrendingUp,
  Bell,
  Activity,
  AlertCircle,
  Leaf,
  Sun,
  CloudRain,
  Wind,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface DashboardOverviewProps {
  plots: any[]
  loans: any[]
  recommendations: any[]
}

export default function DashboardOverview({
  plots,
  loans,
  recommendations,
}: DashboardOverviewProps) {
  const totalPlots = plots?.length || 0
  const totalLoans = loans?.length || 0
  const totalArea = plots.reduce((sum, p) => sum + Number(p.area_hectares || 0), 0)
  const pendingLoans = loans.filter((l) => l.status === "pending").length

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-green-50 to-gray-100 p-6 space-y-8">
      {/* 🔝 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            🌿 Panel de Control
          </h1>
          <p className="text-gray-600 text-sm">
            Visualiza tus parcelas, préstamos y recomendaciones.
          </p>
        </div>

        <Button className="bg-green-600 hover:bg-green-700 text-white shadow-md">
          <Leaf className="h-4 w-4 mr-2" /> Nueva Parcela
        </Button>
      </div>

      {/* 📊 Métricas principales */}
      {/* 📊 Métricas principales */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {[
    { title: "Parcelas", value: totalPlots, sub: `${totalArea.toFixed(2)} ha`, icon: MapPin },
    { title: "Préstamos", value: totalLoans, sub: `${pendingLoans} pendientes`, icon: CreditCard },
    { title: "Productividad", value: "+12%", sub: "vs mes anterior", icon: TrendingUp },
    { title: "Recomendaciones", value: recommendations.length, sub: "Sin leer", icon: Bell },
  ].map((item, i) => (
    <motion.div
      key={i}
      whileHover={{ scale: 1.03 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between p-5 min-h-[130px]"
    >
      <div className="flex justify-between items-center">
        <CardTitle className="text-sm font-medium text-gray-600">{item.title}</CardTitle>
        <item.icon className="h-5 w-5 text-green-600" />
      </div>
      <div>
        <p className="text-4xl font-bold text-gray-900 leading-tight">{item.value}</p>
        <p className="text-sm text-gray-500 mt-1">{item.sub}</p>
      </div>
    </motion.div>
  ))}
</div>


      {/* 🧭 Sección principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🗺️ Parcelas */}
        <Card className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="flex items-center gap-2 text-green-700 font-semibold">
              <MapPin className="h-5 w-5" /> Mis Parcelas
            </CardTitle>
            <Button variant="outline" size="sm" className="hover:bg-green-50">
              Ver todas
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {plots.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">
                No tienes parcelas registradas aún.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-gray-700">
                  <thead className="bg-green-50 text-green-700 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-2 text-left">Nombre</th>
                      <th className="px-4 py-2 text-left">Cultivo</th>
                      <th className="px-4 py-2 text-left">Área</th>
                      <th className="px-4 py-2 text-left">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plots.slice(0, 5).map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{p.name}</td>
                        <td className="px-4 py-2">{p.crop_type || "—"}</td>
                        <td className="px-4 py-2">{p.area_hectares.toFixed(2)} ha</td>
                        <td className="px-4 py-2">
                          {new Date(p.created_at).toLocaleDateString("es-GT")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ☁️ Clima y Recomendaciones */}
        <div className="space-y-6">
          {/* Clima */}
          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl shadow-md">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="h-4 w-4" /> Clima Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-xs pt-0">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-300" /> <span>Soleado</span>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain className="h-4 w-4 text-blue-200" /> <span>Humedad 68%</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-200" /> <span>Temp 25°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-white/70" /> <span>Viento 8 km/h</span>
              </div>
            </CardContent>
          </Card>

          {/* Recomendaciones */}
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                <AlertCircle className="h-4 w-4" /> Recomendaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {recommendations.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-3">
                  Sin recomendaciones por ahora.
                </p>
              ) : (
                recommendations.slice(0, 3).map((r) => (
                  <motion.div
                    key={r.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-3 bg-gray-50 border rounded-lg text-xs"
                  >
                    <p className="font-medium text-gray-800">{r.message}</p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(r.created_at).toLocaleDateString("es-GT")}
                    </p>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 💰 Préstamos */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
        <CardHeader className="flex justify-between items-center pb-2">
          <CardTitle className="flex items-center gap-2 text-green-700 text-sm font-semibold">
            <CreditCard className="h-4 w-4" /> Préstamos Recientes
          </CardTitle>
          <Button variant="outline" size="sm" className="hover:bg-green-50">
            Ver historial
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loans.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              No tienes préstamos registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-green-50 text-green-700 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-4 py-2 text-left">Monto</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                    <th className="px-4 py-2 text-left">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.slice(0, 5).map((l) => (
                    <tr key={l.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">
                        Q{Number(l.amount).toLocaleString("es-GT")}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                            l.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : l.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : l.status === "defaulted"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(l.created_at).toLocaleDateString("es-GT")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
