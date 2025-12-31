import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { LinkedInContentGenerator } from "@/lib/linkedin-content-generator"

export async function POST(request: NextRequest) {
  try {
    const { count = 5 } = await request.json()

    if (count < 1 || count > 10) {
      return NextResponse.json(
        { error: "Count moet tussen 1 en 10 zijn" },
        { status: 400 }
      )
    }

    const generator = new LinkedInContentGenerator()
    const posts = await generator.generatePosts(count)

    // Sla posts op in database
    const savedPosts = []
    for (const post of posts) {
      const savedPost = await prisma.linkedInPost.create({
        data: {
          title: post.title,
          content: post.content,
          topic: post.topic,
          status: "DRAFT"
        }
      })
      savedPosts.push(savedPost)
    }

    return NextResponse.json({
      message: `${savedPosts.length} posts succesvol gegenereerd en opgeslagen`,
      posts: savedPosts.map(p => ({
        id: p.id,
        title: p.title,
        topic: p.topic,
        status: p.status,
        createdAt: p.createdAt
      }))
    })
  } catch (error) {
    console.error("Error generating LinkedIn posts:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Interne server fout" },
      { status: 500 }
    )
  }
}

