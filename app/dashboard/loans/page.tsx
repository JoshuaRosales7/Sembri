import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import DashboardLayout from "@/components/dashboard-layout"
import LoansView from "@/components/loans-view"

export default async function LoansPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: loans } = await supabase
    .from("loans")
    .select(`
      *,
      loan_inputs(
        *,
        inputs(*)
      )
    `)
    .eq("farmer_id", user.id)
    .order("created_at", { ascending: false })

  const { data: inputs } = await supabase.from("inputs").select("*").order("name")

  return (
    <DashboardLayout user={user} profile={profile}>
      <LoansView loans={loans || []} inputs={inputs || []} userId={user.id} />
    </DashboardLayout>
  )
}
