import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/admin/stats - get admin statistics
export async function GET() {
  try {
    const total = await db.playground.count()
    const approved = await db.playground.count({ where: { status: 'approved' } })
    const pending = await db.playground.count({ where: { status: 'pending' } })
    const rejected = await db.playground.count({ where: { status: 'rejected' } })
    const kids = await db.playground.count({ where: { type: 'kids', status: 'approved' } })
    const sports = await db.playground.count({ where: { type: 'sports', status: 'approved' } })
    const both = await db.playground.count({ where: { type: 'both', status: 'approved' } })

    return NextResponse.json({
      total,
      approved,
      pending,
      rejected,
      kids,
      sports,
      both,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
