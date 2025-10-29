export const runtime = "nodejs"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import DashboardLayout from "@/components/dashboard-layout"
import DashboardOverview from "@/components/dashboard-overview"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Perfil del usuario
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Parcelas
  const { data: plots } = await supabase
    .from("plots")
    .select("*")
    .eq("farmer_id", user.id)
    .order("created_at", { ascending: false })

  // Préstamos
  const { data: loans } = await supabase
    .from("loans")
    .select("*")
    .eq("farmer_id", user.id)
    .order("created_at", { ascending: false })

  // Recomendaciones
  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("*, plots(name)")
    .in("plot_id", plots?.map((p) => p.id) || [])
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <DashboardLayout user={user} profile={profile}>
      {/* HEADER PRINCIPAL */}
      <header className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm sticky top-0 z-30">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Panel del Agricultor</h1>
          <p className="text-sm text-gray-500">Monitorea tus cultivos, préstamos y alertas 🌿</p>
        </div>

        {/* Botón Admin */}
        <Link href="/dashboard/admin">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Ir al Panel Admin 👑
          </Button>
        </Link>
      </header>

      {/* CONTENIDO */}
      <main className="p-6">
        <DashboardOverview
          plots={plots || []}
          loans={loans || []}
          recommendations={recommendations || []}
        />
      </main>
    </DashboardLayout>
  )
}
