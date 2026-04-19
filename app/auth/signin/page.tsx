"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { Github, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function SignIn() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const [isSigningIn, setIsSigningIn] = React.useState<boolean>(false)

  const handleSignIn = async () => {
    if (isSigningIn) return
    setIsSigningIn(true)
    try {
      await signIn("github", { callbackUrl })
    } catch {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
          <CardDescription>Inicia sesión para acceder a tus secretos</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            disabled={isSigningIn}
            onClick={handleSignIn}
          >
            {isSigningIn ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Redirigiendo…
              </>
            ) : (
              <>
                <Github aria-hidden />
                Iniciar sesión con GitHub
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Al iniciar sesión, aceptas nuestros Términos de Servicio y Política de Privacidad.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

