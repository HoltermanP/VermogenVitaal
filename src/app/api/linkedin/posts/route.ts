import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { LinkedInPostStatus } from "@prisma/client"

// GET: Haal alle posts op
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where = status && Object.values(LinkedInPostStatus).includes(status as LinkedInPostStatus) 
      ? { status: status as LinkedInPostStatus } 
      : {}

    const posts = await prisma.linkedInPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching LinkedIn posts:", error)
    return NextResponse.json(
      { error: "Interne server fout" },
      { status: 500 }
    )
  }
}

