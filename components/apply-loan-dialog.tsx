"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ApplyLoanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inputs: InputItem[]
  userId: string
}

interface InputItem {
  id: string
  name: string
  description: string
  category: string
  unit: string
  unit_price: string
}

interface SelectedInput {
  inputId: string
  quantity: number
  unitPrice: number
}

export default function ApplyLoanDialog({
  open,
  onOpenChange,
  inputs,
  userId,
}: ApplyLoanDialogProps) {
  const [selectedInputs, setSelectedInputs] = useState<SelectedInput[]>([])
  const [interestRate, setInterestRate] = useState("12")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Agrupar insumos por categoría
  const categoryOrder: Record<string, string> = {
    seed: "🌾 Semillas",
    fertilizer: "🧪 Fertilizantes",
    pesticide: "🐛 Pesticidas",
    equipment: "⚙️ Equipos y Herramientas",
    other: "💧 Otros Insumos",
  }

  const groupedInputs = inputs.reduce((acc, input) => {
    if (!acc[input.category]) acc[input.category] = []
    acc[input.category].push(input)
    return acc
  }, {} as Record<string, InputItem[]>)

  // ✅ Manejar selección/deselección de insumos
  const handleInputToggle = (input: InputItem, checked: boolean) => {
    if (checked) {
      setSelectedInputs([
        ...selectedInputs,
        {
          inputId: input.id,
          quantity: 1,
          unitPrice: Number.parseFloat(input.unit_price),
        },
      ])
    } else {
      setSelectedInputs(selectedInputs.filter((si) => si.inputId !== input.id))
    }
  }

  // ✅ Actualizar cantidad
  const handleQuantityChange = (inputId: string, quantity: number) => {
    setSelectedInputs(
      selectedInputs.map((si) =>
        si.inputId === inputId ? { ...si, quantity: Math.max(1, quantity) } : si
      )
    )
  }

  const totalAmount = selectedInputs.reduce(
    (sum, si) => sum + si.quantity * si.unitPrice,
    0
  )

  // ✅ Formatear moneda
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("es-GT", {
      style: "currency",
      currency: "GTQ",
      maximumFractionDigits: 2,
    })

  // ✅ Enviar solicitud de préstamo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (selectedInputs.length === 0) {
      setError("Debes seleccionar al menos un insumo.")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const rate = Number.parseFloat(interestRate) / 100
      const repaymentAmount = totalAmount * (1 + rate)

      const { data: loan, error: loanError } = await supabase
        .from("loans")
        .insert({
          farmer_id: userId,
          amount: totalAmount,
          interest_rate: Number.parseFloat(interestRate),
          status: "pending",
          repayment_amount: repaymentAmount,
        })
        .select()
        .single()

      if (loanError) throw loanError

      const loanInputsData = selectedInputs.map((si) => ({
        loan_id: loan.id,
        input_id: si.inputId,
        quantity: si.quantity,
        total_price: si.quantity * si.unitPrice,
      }))

      const { error: inputsError } = await supabase
        .from("loan_inputs")
        .insert(loanInputsData)

      if (inputsError) throw inputsError

      setSelectedInputs([])
      setInterestRate("12")
      onOpenChange(false)
      router.refresh()
    } catch (err: any) {
      console.error("[Error al solicitar préstamo]:", err)
      setError(err.message || "Error al enviar la solicitud de préstamo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Solicitar Préstamo Agrícola</DialogTitle>
          <DialogDescription>
            Selecciona los insumos que necesitas. El monto del préstamo se
            calculará automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ScrollArea className="h-[400px] pr-4 space-y-4">
            <div className="space-y-6">
              {/* 🧾 Agrupar por categoría */}
              {Object.keys(categoryOrder).map((category) => {
                const categoryInputs = groupedInputs[category] || []
                if (categoryInputs.length === 0) return null

                return (
                  <div key={category} className="space-y-3">
                    <Label className="text-base font-semibold text-green-700 border-b pb-1 block">
                      {categoryOrder[category]}
                    </Label>
                    <div className="space-y-3">
                      {categoryInputs.map((input: InputItem) => {
                        const selected = selectedInputs.find(
                          (si) => si.inputId === input.id
                        )
                        return (
                          <div
                            key={input.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                id={input.id}
                                checked={!!selected}
                                onCheckedChange={(checked) =>
                                  handleInputToggle(input, checked as boolean)
                                }
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={input.id}
                                  className="font-medium text-gray-900 cursor-pointer block"
                                >
                                  {input.name}
                                </label>
                                <p className="text-sm text-gray-500 mt-1">
                                  {input.description}
                                </p>
                                <p className="text-sm font-medium text-gray-700 mt-2">
                                  {formatCurrency(
                                    Number.parseFloat(input.unit_price)
                                  )}{" "}
                                  por {input.unit}
                                </p>

                                {selected && (
                                  <div className="mt-3 flex items-center gap-2">
                                    <Label
                                      htmlFor={`qty-${input.id}`}
                                      className="text-sm"
                                    >
                                      Cantidad:
                                    </Label>
                                    <Input
                                      id={`qty-${input.id}`}
                                      type="number"
                                      min="1"
                                      value={selected.quantity}
                                      onChange={(e) =>
                                        handleQuantityChange(
                                          input.id,
                                          Number.parseInt(e.target.value)
                                        )
                                      }
                                      className="w-24"
                                    />
                                    <span className="text-sm text-gray-600">
                                      {input.unit}
                                    </span>
                                    <span className="ml-auto text-sm font-semibold text-gray-900">
                                      {formatCurrency(
                                        selected.quantity * selected.unitPrice
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 💲 Tasa de interés */}
            <div className="border-t pt-4">
              <Label htmlFor="interest">Tasa de Interés (%)</Label>
              <Input
                id="interest"
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tasa estándar para préstamos agrícolas
              </p>
            </div>
          </ScrollArea>

          {/* 💰 Resumen del préstamo */}
          {selectedInputs.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">
                  Monto del préstamo:
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Total a pagar:</span>
                <span className="text-xl font-bold text-green-700">
                  {formatCurrency(
                    totalAmount * (1 + Number.parseFloat(interestRate) / 100)
                  )}
                </span>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Botones */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
