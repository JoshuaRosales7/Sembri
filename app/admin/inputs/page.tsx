import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import AdminLayout from "@/components/admin-layout"
import InputsManagement from "@/components/inputs-management"

export default async function AdminInputsPage() {
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

  const { data: inputs } = await supabase.from("inputs").select("*").order("category").order("name")

  return (
    <AdminLayout user={user} profile={profile}>
      <InputsManagement inputs={inputs || []} />
    </AdminLayout>
  )
}
