import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import DashboardLayout from "@/components/dashboard-layout"
import DashboardOverview from "@/components/dashboard-overview"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user's plots
  const { data: plots } = await supabase
    .from("plots")
    .select("*")
    .eq("farmer_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch user's loans
  const { data: loans } = await supabase
    .from("loans")
    .select("*")
    .eq("farmer_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch recommendations
  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("*, plots(name)")
    .in("plot_id", plots?.map((p) => p.id) || [])
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <DashboardLayout user={user} profile={profile}>
      <DashboardOverview plots={plots || []} loans={loans || []} recommendations={recommendations || []} />
    </DashboardLayout>
  )
}
