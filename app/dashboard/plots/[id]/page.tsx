
export const runtime = "nodejs"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import DashboardLayout from "@/components/dashboard-layout"
import PlotDetails from "@/components/plot-details"

interface PlotPageProps {
  params: Promise<{ id: string }>
}

export default async function PlotPage({ params }: PlotPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: plot } = await supabase.from("plots").select("*").eq("id", id).eq("farmer_id", user.id).single()

  if (!plot) {
    redirect("/dashboard/plots")
  }

  const { data: satelliteData } = await supabase
    .from("satellite_data")
    .select("*")
    .eq("plot_id", id)
    .order("date", { ascending: false })
    .limit(30)

  return (
    <DashboardLayout user={user} profile={profile}>
      <PlotDetails plot={plot} satelliteData={satelliteData || []} />
    </DashboardLayout>
  )
}
