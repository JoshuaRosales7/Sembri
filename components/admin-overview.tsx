"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MapPin, CreditCard, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface AdminOverviewProps {
  stats: {
    farmers: number
    plots: number
    loans: number
    pendingLoans: number
  }
  recentLoans: any[]
}

export default function AdminOverview({ stats, recentLoans }: AdminOverviewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "disbursed":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "repaid":
        return "bg-blue-100 text-blue-700"
      case "defaulted":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("es-GT", { style: "currency", currency: "GTQ", maximumFractionDigits: 2 })

  return (
    <div className="p-6 space-y-6">
      {/* 📊 Resumen general */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Agricultores</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.farmers}</div>
            <p className="text-xs text-gray-500 mt-1">Usuarios registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Parcelas</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.plots}</div>
            <p className="text-xs text-gray-500 mt-1">En monitoreo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Préstamos</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.loans}</div>
            <p className="text-xs text-gray-500 mt-1">Histórico total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Préstamos Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.pendingLoans}</div>
            <p className="text-xs text-gray-500 mt-1">A la espera de revisión</p>
          </CardContent>
        </Card>
      </div>

      {/* 💰 Solicitudes recientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Solicitudes de Préstamo Recientes</CardTitle>
            <Link href="/admin/loans">
              <Button variant="outline" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentLoans.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay solicitudes de préstamo recientes</p>
          ) : (
            <div className="space-y-3">
              {recentLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{loan.profiles?.full_name}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(Number(loan.amount))} • Solicitado el{" "}
                      {new Date(loan.created_at).toLocaleDateString("es-GT", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}>
                    {loan.status === "approved"
                      ? "Aprobado"
                      : loan.status === "pending"
                      ? "Pendiente"
                      : loan.status === "disbursed"
                      ? "Desembolsado"
                      : loan.status === "repaid"
                      ? "Pagado"
                      : loan.status === "defaulted"
                      ? "Incumplido"
                      : loan.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
