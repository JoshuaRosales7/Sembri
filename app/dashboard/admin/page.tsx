export const runtime = "nodejs"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import AdminLayout from "@/components/admin-layout"
import FarmersManagement from "@/components/farmers-management"

export default async function AdminFarmersPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  const { data: farmers } = await supabase
    .from("profiles")
    .select(`
      *,
      plots(count),
      loans(count)
    `)
    .eq("role", "farmer")
    .order("created_at", { ascending: false })

  return (
    <AdminLayout user={user} profile={profile}>
      <FarmersManagement farmers={farmers || []} />
    </AdminLayout>
  )
}
