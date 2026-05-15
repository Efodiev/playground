import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/playgrounds - list approved playgrounds with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')
    const district = searchParams.get('district')
    const type = searchParams.get('type')
    const condition = searchParams.get('condition')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'approved'

    const where: Record<string, unknown> = { status }

    if (city) where.city = city
    if (district) where.district = district
    if (type) where.type = type
    if (condition) where.condition = condition
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
        { city: { contains: search } },
      ]
    }

    const playgrounds = await db.playground.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(playgrounds)
  } catch (error) {
    console.error('Error fetching playgrounds:', error)
    return NextResponse.json({ error: 'Failed to fetch playgrounds' }, { status: 500 })
  }
}

// POST /api/playgrounds - create a new playground (pending by default)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, address, city, district, lat, lng, type, condition, rating, photos, equipment, submitterName, submitterEmail } = body

    if (!name || !address || !city || lat == null || lng == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const playground = await db.playground.create({
      data: {
        name,
        description: description || null,
        address,
        city,
        district: district || 'Тираспольский',
        lat: parseFloat(String(lat)),
        lng: parseFloat(String(lng)),
        type: type || 'kids',
        condition: condition || 'good',
        rating: rating || 0,
        status: 'pending',
        photos: JSON.stringify(photos || []),
        equipment: JSON.stringify(equipment || []),
        submitterName: submitterName || null,
        submitterEmail: submitterEmail || null,
      },
    })

    return NextResponse.json(playground, { status: 201 })
  } catch (error) {
    console.error('Error creating playground:', error)
    return NextResponse.json({ error: 'Failed to create playground' }, { status: 500 })
  }
}
