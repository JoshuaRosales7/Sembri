"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Map,
  CreditCard,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Sprout,
  Crown,
} from "lucide-react"
import Link from "next/link"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: any
  profile: any
}

export default function DashboardLayout({ children, user, profile }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  // 🧭 Navegación principal
  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Resumen" },
    { href: "/dashboard/plots", icon: Map, label: "Mis Parcelas" },
    { href: "/dashboard/loans", icon: CreditCard, label: "Préstamos" },
    { href: "/dashboard/notifications", icon: Bell, label: "Notificaciones" },
    { href: "/dashboard/profile", icon: User, label: "Perfil" },
  ]

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Fondo oscuro (modo móvil) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 📋 Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-md
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <Sprout className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-green-800">Sembri</span>
            </div>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Usuario */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">
              {profile?.full_name || "Usuario"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
              {profile?.role || "Agricultor"}
            </span>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                    ${isActive
                      ? "bg-green-100 text-green-800 font-semibold"
                      : "text-gray-700 hover:bg-gray-100 hover:text-green-700"}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* 🧩 Contenido */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header superior */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm">
          <div className="flex items-center">
            <button
              className="lg:hidden mr-4"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              {navItems.find((item) => item.href === pathname)?.label ||
                "Panel de Control"}
            </h1>
          </div>

          {/* Botón de cambio a Admin */}
          <Link href="/dashboard/admin">
            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md">
              <Crown className="h-4 w-4" />
              Panel Admin
            </Button>
          </Link>
        </header>

        {/* Contenido dinámico */}
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
