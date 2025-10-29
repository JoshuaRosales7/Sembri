import { createClient } from "@/lib/server"
import AdminLayout from "@/components/admin-layout"
import AdminOverview from "@/components/admin-overview"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Estadísticas simuladas
  const stats = {
    farmers: 12,
    plots: 28,
    loans: 15,
    pendingLoans: 3,
  }

  const { data: recentLoans } = await supabase
    .from("loans")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <AdminLayout user={user} profile={profile}>
      <div className="flex justify-between items-center px-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          
        </h1>
        <Link href="/dashboard">
          <Button variant="outline" className="border-green-600 text-green-700">
            Volver al Dashboard 🌾
          </Button>
        </Link>
      </div>

      <AdminOverview stats={stats} recentLoans={recentLoans || []} />
    </AdminLayout>
  )
}
