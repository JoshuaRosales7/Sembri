"use client"

import { useState } from "react"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, AlertCircle, CheckCircle } from "lucide-react"

interface NotificationsViewProps {
  recommendations: any[]
}

export default function NotificationsView({ recommendations }: NotificationsViewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleMarkAsRead = async (id: string) => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase.from("recommendations").update({ is_read: true }).eq("id", id)
      router.refresh()
    } catch (error) {
      console.error("[Sembri] Error al marcar notificación como leída:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAllAsRead = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const unreadIds = recommendations.filter((r) => !r.is_read).map((r) => r.id)
      if (unreadIds.length > 0) {
        await supabase.from("recommendations").update({ is_read: true }).in("id", unreadIds)
        router.refresh()
      }
    } catch (error) {
      console.error("[Sembri] Error al marcar todas como leídas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const unreadCount = recommendations.filter((r) => !r.is_read).length

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 border-red-300 text-red-800"
      case "high":
        return "bg-orange-100 border-orange-300 text-orange-800"
      case "medium":
        return "bg-yellow-100 border-yellow-300 text-yellow-800"
      default:
        return "bg-blue-100 border-blue-300 text-blue-800"
    }
  }

  const getPriorityIcon = (priority: string) => {
    if (priority === "urgent" || priority === "high") {
      return <AlertCircle className="h-5 w-5 text-red-600" />
    }
    return <Bell className="h-5 w-5 text-blue-600" />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Notificaciones</h2>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} notificación${unreadCount > 1 ? "es" : ""} sin leer`
              : "Estás al día con todas tus notificaciones"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead} disabled={isLoading}>
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Sin notificaciones */}
      {recommendations.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="pt-6 text-center py-12">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes notificaciones</h3>
            <p className="text-gray-600">
              Todo está tranquilo por ahora. Vuelve más tarde para nuevas recomendaciones o alertas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <Card
              key={rec.id}
              className={`${!rec.is_read ? "border-l-4 border-l-green-500 shadow-sm" : ""} ${getPriorityColor(
                rec.priority,
              )} transition-all duration-200`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getPriorityIcon(rec.priority)}
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {rec.plots?.name || "Parcela sin nombre"}
                      </CardTitle>
                      <p className="text-xs mt-1 text-gray-600">
                        {new Date(rec.created_at).toLocaleDateString("es-GT", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        •{" "}
                        {new Date(rec.created_at).toLocaleTimeString("es-GT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  {!rec.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(rec.id)}
                      disabled={isLoading}
                      className="text-xs text-green-700 hover:text-green-800 hover:bg-green-50"
                    >
                      Marcar como leída
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-800">{rec.message}</p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-white/60 border border-gray-200">
                    Tipo: {rec.recommendation_type}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-white/60 border border-gray-200">
                    Prioridad: {rec.priority === "urgent"
                      ? "Urgente"
                      : rec.priority === "high"
                      ? "Alta"
                      : rec.priority === "medium"
                      ? "Media"
                      : "Baja"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
