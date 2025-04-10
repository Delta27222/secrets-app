import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { Header } from "@/components/header"
import { SecretForm } from "@/components/secret-form"

const prisma = new PrismaClient()

export default async function EditSecretPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession()

  if (!session || !session.user) {
    return redirect("/auth/signin")
  }

  const secret = await prisma.secret.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!secret) {
    return redirect("/secrets")
  }

  if (secret.userId !== session.user.id) {
    return redirect("/secrets")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Edit Secret</h1>
        <SecretForm secret={secret} />
      </main>
    </div>
  )
}

