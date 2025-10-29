
export const runtime = "nodejs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="w-full max-w-md">
        <Card className="border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Check your email</CardTitle>
            <CardDescription>We&apos;ve sent you a confirmation link to verify your account.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Please check your inbox and click the confirmation link to activate your Sembri account.
            </p>
            <Link
              href="/auth/login"
              className="text-sm text-green-600 underline underline-offset-4 hover:text-green-700"
            >
              Return to login
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
