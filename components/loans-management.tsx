"use client"

import { useState } from "react"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Check, X } from "lucide-react"

interface LoansManagementProps {
  loans: any[]
}

export default function LoansManagement({ loans }: LoansManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleUpdateLoanStatus = async (loanId: string, newStatus: string) => {
    setIsLoading(loanId)
    try {
      const supabase = createClient()

      const updateData: any = { status: newStatus }

      if (newStatus === "approved") {
        updateData.disbursement_date = new Date().toISOString().split("T")[0]
        const dueDate = new Date()
        dueDate.setMonth(dueDate.getMonth() + 6)
        updateData.due_date = dueDate.toISOString().split("T")[0]
      }

      const { error } = await supabase.from("loans").update(updateData).eq("id", loanId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("[Sembri] Error al actualizar el estado del préstamo:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch = loan.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  const formatCurrency = (value: number) =>
    value.toLocaleString("es-GT", { style: "currency", currency: "GTQ", maximumFractionDigits: 2 })

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Gestión de Préstamos</h2>
        <p className="text-sm text-gray-500 mt-1">
          Revisa, aprueba o rechaza solicitudes de préstamos agrícolas
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre del agricultor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="approved">Aprobado</SelectItem>
            <SelectItem value="disbursed">Desembolsado</SelectItem>
            <SelectItem value="repaid">Pagado</SelectItem>
            <SelectItem value="defaulted">Rechazado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de préstamos */}
      <div className="space-y-4">
        {filteredLoans.map((loan) => (
          <Card key={loan.id} className="hover:shadow-md transition-shadow duration-200 border-gray-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {loan.profiles?.full_name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {loan.profiles?.phone_number || "Sin teléfono"} • Solicitado el{" "}
                    {new Date(loan.created_at).toLocaleDateString("es-GT")}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}
                >
                  {loan.status === "pending"
                    ? "Pendiente"
                    : loan.status === "approved"
                    ? "Aprobado"
                    : loan.status === "disbursed"
                    ? "Desembolsado"
                    : loan.status === "repaid"
                    ? "Pagado"
                    : "Rechazado"}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Monto del préstamo</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(Number.parseFloat(loan.amount))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tasa de interés</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {loan.interest_rate}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monto a devolver</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(Number.parseFloat(loan.repayment_amount))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de vencimiento</p>
                  <p className="text-sm font-medium text-gray-900">
                    {loan.due_date
                      ? new Date(loan.due_date).toLocaleDateString("es-GT")
                      : "No establecida"}
                  </p>
                </div>
              </div>

              {/* Insumos solicitados */}
              {loan.loan_inputs && loan.loan_inputs.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Insumos solicitados</p>
                  <div className="space-y-2">
                    {loan.loan_inputs.map((li: any) => (
                      <div
                        key={li.id}
                        className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                      >
                        <span className="text-gray-700">
                          {li.inputs?.name} ({li.quantity} {li.inputs?.unit})
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(Number.parseFloat(li.total_price))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              {loan.status === "pending" && (
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpdateLoanStatus(loan.id, "approved")}
                    disabled={isLoading === loan.id}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aprobar préstamo
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                    onClick={() => handleUpdateLoanStatus(loan.id, "defaulted")}
                    disabled={isLoading === loan.id}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sin resultados */}
      {filteredLoans.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">No se encontraron préstamos</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
