"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Plus } from "lucide-react"
import ApplyLoanDialog from "./apply-loan-dialog"

interface LoansViewProps {
  loans: any[]
  inputs: any[]
  userId: string
}

export default function LoansView({ loans, inputs, userId }: LoansViewProps) {
  const [showApplyDialog, setShowApplyDialog] = useState(false)

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Mis Préstamos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Administra tus solicitudes y préstamos agrícolas activos
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowApplyDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Solicitar Préstamo
        </Button>
      </div>

      {/* Si no hay préstamos */}
      {loans.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="pt-6 text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no tienes préstamos</h3>
            <p className="text-gray-600 mb-6">
              Solicita un préstamo para obtener semillas, fertilizantes o equipo agrícola.
            </p>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowApplyDialog(true)}>
              Solicitar mi primer préstamo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {loans.map((loan: any) => (
            <Card
              key={loan.id}
              className="hover:shadow-md transition-shadow duration-200 border-gray-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Préstamo #{loan.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Solicitado el {new Date(loan.created_at).toLocaleDateString("es-GT")}
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
                {/* Detalles principales */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-600">Monto del préstamo</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(Number.parseFloat(loan.amount))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tasa de interés</p>
                    <p className="text-lg font-semibold text-gray-900">{loan.interest_rate}%</p>
                  </div>
                  {loan.repayment_amount && (
                    <div>
                      <p className="text-sm text-gray-600">Total a devolver</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(Number.parseFloat(loan.repayment_amount))}
                      </p>
                    </div>
                  )}
                  {loan.disbursement_date && (
                    <div>
                      <p className="text-sm text-gray-600">Desembolsado</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(loan.disbursement_date).toLocaleDateString("es-GT")}
                      </p>
                    </div>
                  )}
                  {loan.due_date && (
                    <div>
                      <p className="text-sm text-gray-600">Fecha de vencimiento</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(loan.due_date).toLocaleDateString("es-GT")}
                      </p>
                    </div>
                  )}
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

                {/* Estado del préstamo */}
                {loan.status === "pending" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      Tu solicitud está en revisión. Recibirás una notificación cuando sea aprobada.
                    </p>
                  </div>
                )}

                {loan.status === "approved" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      ¡Tu préstamo ha sido aprobado! Los fondos serán desembolsados próximamente.
                    </p>
                  </div>
                )}

                {loan.status === "disbursed" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      Los fondos ya fueron desembolsados. Asegúrate de realizar los pagos a tiempo.
                    </p>
                  </div>
                )}

                {loan.status === "defaulted" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      Tu solicitud de préstamo ha sido rechazada. Puedes intentarlo nuevamente más adelante.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para solicitar préstamo */}
      <ApplyLoanDialog
        open={showApplyDialog}
        onOpenChange={setShowApplyDialog}
        inputs={inputs}
        userId={userId}
      />
    </div>
  )
}
