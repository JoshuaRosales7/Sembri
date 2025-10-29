export const runtime = "nodejs"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import DashboardLayout from "@/components/dashboard-layout"
import PlotsMap from "@/components/plots-map"

export default async function PlotsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: plots } = await supabase.from("plots").select("*").eq("farmer_id", user.id)

  return (
    <DashboardLayout user={user} profile={profile}>
      <PlotsMap plots={plots || []} userId={user.id} />
    </DashboardLayout>
  )
}
