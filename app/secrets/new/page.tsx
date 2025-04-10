import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { SecretForm } from "@/components/secret-form"

export default async function NewSecretPage() {
  const session = await getServerSession()

  if (!session || !session.user) {
    return redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Add New Secret</h1>
        <SecretForm />
      </main>
    </div>
  )
}

