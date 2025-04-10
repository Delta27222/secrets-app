import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const secret = await prisma.secret.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!secret) {
      return NextResponse.json({ error: "Secret not found" }, { status: 404 })
    }

    if (secret.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(secret)
  } catch (error) {
    console.error("Error fetching secret:", error)
    return NextResponse.json({ error: "Failed to fetch secret" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, value, description } = await request.json()

    // Check if the secret exists and belongs to the user
    const existingSecret = await prisma.secret.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingSecret) {
      return NextResponse.json({ error: "Secret not found" }, { status: 404 })
    }

    if (existingSecret.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updatedSecret = await prisma.secret.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        value,
        description,
      },
    })

    return NextResponse.json({ id: updatedSecret.id })
  } catch (error) {
    console.error("Error updating secret:", error)
    return NextResponse.json({ error: "Failed to update secret" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if the secret exists and belongs to the user
    const existingSecret = await prisma.secret.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingSecret) {
      return NextResponse.json({ error: "Secret not found" }, { status: 404 })
    }

    if (existingSecret.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.secret.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting secret:", error)
    return NextResponse.json({ error: "Failed to delete secret" }, { status: 500 })
  }
}

