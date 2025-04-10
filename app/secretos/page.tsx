"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSecrets } from "@/lib/api"
import { SecretsList } from "@/components/secrets-list"

export default function SecretosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [secrets, setSecrets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated") {
      // Almacenar el token de acceso para usarlo en las peticiones a la API
      if (session?.accessToken) {
        localStorage.setItem("token", session.accessToken as string)
      }
      fetchSecrets()
    }
  }, [status, session])

  async function fetchSecrets() {
    try {
      setLoading(true)
      const data = await getSecrets()
      setSecrets(data)
    } catch (err) {
      console.error("Error fetching secrets:", err)
      setError("No se pudieron cargar los secretos. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mis Secretos</h1>
          <Button asChild>
            <Link href="/secretos/nuevo">Añadir Nuevo Secreto</Link>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Cargando secretos...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <SecretsList secrets={secrets} onUpdate={fetchSecrets} />
        )}
      </main>
    </div>
  )
}

