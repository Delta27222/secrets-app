import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const session = await getServerSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, value, description } = await request.json()

    const secret = await prisma.secret.create({
      data: {
        name,
        value,
        description,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ id: secret.id }, { status: 201 })
  } catch (error) {
    console.error("Error creating secret:", error)
    return NextResponse.json({ error: "Failed to create secret" }, { status: 500 })
  }
}

