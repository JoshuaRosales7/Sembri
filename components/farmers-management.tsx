"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, MapPin, CreditCard } from "lucide-react"
import { useState } from "react"

interface FarmersManagementProps {
  farmers: any[]
}

export default function FarmersManagement({ farmers }: FarmersManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // 🔍 Filtrado dinámico por nombre o número de teléfono
  const filteredFarmers = farmers.filter(
    (farmer) =>
      farmer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.phone_number?.includes(searchTerm)
  )

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Gestión de Agricultores</h2>
        <p className="text-sm text-gray-500 mt-1">
          Visualiza y administra todos los agricultores registrados
        </p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar agricultores por nombre o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de Agricultores */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFarmers.map((farmer) => (
          <Card
            key={farmer.id}
            className="hover:shadow-md transition-shadow duration-200 border-gray-200"
          >
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">
                {farmer.full_name}
              </CardTitle>
              <p className="text-sm text-gray-500">
                {farmer.phone_number || "Sin número de teléfono"}
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>Parcelas</span>
                </div>
                <span className="font-medium">
                  {farmer.plots?.[0]?.count || 0}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Préstamos</span>
                </div>
                <span className="font-medium">
                  {farmer.loans?.[0]?.count || 0}
                </span>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  Registrado el {new Date(farmer.created_at).toLocaleDateString("es-GT")}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mensaje si no se encuentran agricultores */}
      {filteredFarmers.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">No se encontraron agricultores</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
