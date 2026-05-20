import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/reviews?playgroundId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const playgroundId = searchParams.get('playgroundId')

    if (!playgroundId) {
      return NextResponse.json({ error: 'playgroundId is required' }, { status: 400 })
    }

    const reviews = await db.review.findMany({
      where: { playgroundId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST /api/reviews - create a new review
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { playgroundId, authorName, rating, text } = body

    if (!playgroundId || !authorName || !rating || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const ratingNum = parseInt(String(rating), 10)
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (String(text).trim().length < 3) {
      return NextResponse.json({ error: 'Review text is too short' }, { status: 400 })
    }

    if (String(authorName).trim().length < 2) {
      return NextResponse.json({ error: 'Name is too short' }, { status: 400 })
    }

    // Check playground exists
    const playground = await db.playground.findUnique({ where: { id: playgroundId } })
    if (!playground) {
      return NextResponse.json({ error: 'Playground not found' }, { status: 404 })
    }

    const review = await db.review.create({
      data: {
        playgroundId,
        authorName: String(authorName).trim(),
        rating: ratingNum,
        text: String(text).trim(),
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
