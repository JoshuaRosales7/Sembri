"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package } from "lucide-react"

interface InputItem {
  id: string
  name: string
  description?: string
  unit: string
  unit_price: string
  category: string
}

interface InputsManagementProps {
  inputs: InputItem[]
}

export default function InputsManagement({ inputs }: InputsManagementProps) {
  // Definir las categorías en orden deseado
  const categoryOrder: Record<string, string> = {
    seed: "🌾 Semillas",
    fertilizer: "🧪 Fertilizantes",
    pesticide: "🐛 Pesticidas",
    equipment: "⚙️ Equipos y Herramientas",
    other: "💧 Otros Insumos",
  }

  // Agrupar insumos por categoría
  const groupedInputs = inputs.reduce((acc, input) => {
    if (!acc[input.category]) acc[input.category] = []
    acc[input.category].push(input)
    return acc
  }, {} as Record<string, InputItem[]>)

  const formatCurrency = (value: number) =>
    value.toLocaleString("es-GT", {
      style: "currency",
      currency: "GTQ",
      maximumFractionDigits: 2,
    })

  return (
    <div className="p-6 space-y-10">
      {/* Encabezado principal */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Gestión de Insumos Agrícolas
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Visualiza y administra los insumos disponibles para los agricultores registrados
        </p>
      </div>

      {/* Mostrar categorías en orden */}
      {Object.keys(categoryOrder).map((category) => {
        const categoryInputs = groupedInputs[category] || []
        if (categoryInputs.length === 0) return null // si no hay insumos de esta categoría, no se muestra

        return (
          <section key={category} className="space-y-4">
            <h3 className="text-lg font-bold text-green-700 border-b pb-1">
              {categoryOrder[category]}
            </h3>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryInputs.map((input) => (
                <Card
                  key={input.id}
                  className="hover:shadow-md transition-shadow duration-200 border-gray-200"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-gray-900">
                          {input.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {input.description || "Sin descripción disponible"}
                        </p>
                      </div>
                      <Package className="h-5 w-5 text-green-500" />
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Precio por {input.unit}
                      </span>
                      <span className="text-lg font-semibold text-green-700">
                        {formatCurrency(Number.parseFloat(input.unit_price))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )
      })}

      {/* Estado sin insumos */}
      {inputs.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">
              No hay insumos agrícolas registrados aún.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
