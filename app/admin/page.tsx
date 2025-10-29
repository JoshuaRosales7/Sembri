
export const runtime = "nodejs"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import AdminLayout from "@/components/admin-layout"
import AdminOverview from "@/components/admin-overview"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch statistics
  const { count: farmersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "farmer")

  const { count: plotsCount } = await supabase.from("plots").select("*", { count: "exact", head: true })

  const { count: loansCount } = await supabase.from("loans").select("*", { count: "exact", head: true })

  const { count: pendingLoansCount } = await supabase
    .from("loans")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { data: recentLoans } = await supabase
    .from("loans")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <AdminLayout user={user} profile={profile}>
      <AdminOverview
        stats={{
          farmers: farmersCount || 0,
          plots: plotsCount || 0,
          loans: loansCount || 0,
          pendingLoans: pendingLoansCount || 0,
        }}
        recentLoans={recentLoans || []}
      />
    </AdminLayout>
  )
}
