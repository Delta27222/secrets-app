"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { SecretForm } from "@/components/secret-form"
import { getSecret } from "@/lib/api"

export default function EditarSecretoPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const [secret, setSecret] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.accessToken) {
        localStorage.setItem("token", session.accessToken as string)
      }

      if (params.id) {
        fetchSecret(params.id as string)
      }
    }
  }, [status, session, params.id])

  async function fetchSecret(id: string) {
    try {
      setLoading(true)
      const data = await getSecret(id)
      setSecret(data)
    } catch (err) {
      console.error("Error fetching secret:", err)
      setError("No se pudo cargar el secreto. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return <div>Cargando...</div>
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-10 px-4">
          <div className="text-center py-12 text-red-500">{error}</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Editar Secreto</h1>
        {secret && <SecretForm secret={secret} />}
      </main>
    </div>
  )
}

