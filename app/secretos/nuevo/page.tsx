"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { SecretForm } from "@/components/secret-form"

export default function NuevoSecretoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      localStorage.setItem("token", session.accessToken as string)
    }
  }, [status, session])

  if (status === "loading") {
    return <div>Cargando...</div>
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Añadir Nuevo Secreto</h1>
        <SecretForm />
      </main>
    </div>
  )
}

