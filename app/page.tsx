import { Button } from "@/components/ui/button"
import { Sprout, Satellite, CreditCard, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="border-b border-green-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">Sembri</span>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-green-700 hover:text-green-800">
                Login
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-green-600 hover:bg-green-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-green-900 mb-6 text-balance">
          Grow Smarter with Satellite Intelligence
        </h1>
        <p className="text-xl text-green-700 mb-8 max-w-2xl mx-auto text-pretty">
          Monitor your crops from space, access credit for inputs, and get personalized recommendations to maximize your
          harvest.
        </p>
        <Link href="/auth/sign-up">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8">
            Start Your Journey
          </Button>
        </Link>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-green-100">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Satellite className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Satellite Monitoring</h3>
            <p className="text-sm text-green-700">
              Track crop health with NDVI and NDWI indices from Sentinel-2 satellite imagery.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-green-100">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Access Credit</h3>
            <p className="text-sm text-green-700">
              Get loans for seeds, fertilizers, and equipment with flexible repayment terms.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-green-100">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Smart Recommendations</h3>
            <p className="text-sm text-green-700">
              Receive AI-powered advice on irrigation, fertilization, and pest control.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-green-100">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Sprout className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Plot Management</h3>
            <p className="text-sm text-green-700">
              Map and manage all your plots with geospatial precision and crop tracking.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-green-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your farming?</h2>
          <p className="text-lg mb-8 text-green-50">
            Join thousands of farmers using Sembri to increase yields and income.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-200 bg-white/80 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-sm text-green-600">
          <p>&copy; 2025 Sembri. Agricultural Intelligence Platform.</p>
        </div>
      </footer>
    </div>
  )
}
