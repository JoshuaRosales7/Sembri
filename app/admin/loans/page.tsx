import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import AdminLayout from "@/components/admin-layout"
import LoansManagement from "@/components/loans-management"

export default async function AdminLoansPage() {
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

  const { data: loans } = await supabase
    .from("loans")
    .select(
      `
      *,
      profiles(full_name, phone_number),
      loan_inputs(*, inputs(*))
    `,
    )
    .order("created_at", { ascending: false })

  return (
    <AdminLayout user={user} profile={profile}>
      <LoansManagement loans={loans || []} />
    </AdminLayout>
  )
}
