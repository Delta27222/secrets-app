import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SecretsList } from "@/components/secrets-list"

const prisma = new PrismaClient()

export default async function SecretsPage() {
  const session = await getServerSession()

  if (!session || !session.user) {
    return redirect("/auth/signin")
  }

  const secrets = await prisma.secret.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Secrets</h1>
          <Button asChild>
            <Link href="/secrets/new">Add New Secret</Link>
          </Button>
        </div>

        <SecretsList secrets={secrets} />
      </main>
    </div>
  )
}

