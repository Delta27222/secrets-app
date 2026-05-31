"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SESSION_EXPIRED_SEARCH_PARAM } from "@/lib/auth-session-config"
import { useNotify } from "@/hooks/useNotify"
import { signIn } from "next-auth/react"
import { AlertCircle, Github, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function SignIn() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const sessionExpired = searchParams.get(SESSION_EXPIRED_SEARCH_PARAM) === "1"
  const notOrgMember = searchParams.get("error") === "not_org_member"
  const notify = useNotify()
  const [isSigningIn, setIsSigningIn] = React.useState<boolean>(false)
  const hasShownExpiredNotice = React.useRef(false)
  const hasShownOrgNotice = React.useRef(false)

  React.useEffect(() => {
    if (!sessionExpired || hasShownExpiredNotice.current) return
    hasShownExpiredNotice.current = true
    notify(
      "Tu sesión ha caducado por inactividad. Inicia sesión de nuevo para continuar.",
      "warning",
    )
  }, [sessionExpired, notify])

  React.useEffect(() => {
    if (!notOrgMember || hasShownOrgNotice.current) return
    hasShownOrgNotice.current = true
    notify(
      "No perteneces a la organización requerida. Contacta al administrador para obtener acceso.",
      "error",
    )
  }, [notOrgMember, notify])

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
        <CardContent className="space-y-4">
          {notOrgMember && (
            <div className="flex items-start gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">
                <p className="font-semibold">Acceso denegado</p>
                <p>No perteneces a la organización requerida. Contacta al administrador para obtener acceso.</p>
              </div>
            </div>
          )}
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

