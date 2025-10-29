import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import DashboardLayout from "@/components/dashboard-layout"
import NotificationsView from "@/components/notifications-view"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: plots } = await supabase.from("plots").select("id").eq("farmer_id", user.id)

  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("*, plots(name)")
    .in("plot_id", plots?.map((p) => p.id) || [])
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout user={user} profile={profile}>
      <NotificationsView recommendations={recommendations || []} />
    </DashboardLayout>
  )
}
