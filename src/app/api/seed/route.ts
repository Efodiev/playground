import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// Rating calculation (mirrors frontend)
const CONDITION_SCORES: Record<string, number> = { excellent: 40, good: 28, needs_repair: 12, dangerous: 0 };
function calcRating(condition: string, equipmentStr: string): number {
  let equip: string[] = [];
  try { equip = JSON.parse(equipmentStr || '[]'); } catch {}
  const condScore = CONDITION_SCORES[condition] || 0;
  const equipScore = Math.min(equip.length * 4, 60);
  return Math.min(condScore + equipScore, 100);
}

// POST /api/seed - re-seed database (clears all data first, then creates 3 playgrounds)
export async function POST() {
  try {
    // Delete all existing playgrounds
    await db.playground.deleteMany()

    const playgrounds = [
      {
        name: 'Парк Победы — Детская зона',
        description: 'Просторная детская площадка с современным оборудованием в центральном парке Тирасполя. Резиновое покрытие, зоны для разных возрастов. Одна из лучших площадок города с безопасным покрытием и разнообразным игровым оборудованием.',
        address: 'ул. 25 Октября, 45',
        city: 'Тирасполь',
        district: 'Тираспольский',
        lat: 46.8439,
        lng: 29.6285,
        type: 'kids',
        condition: 'excellent',
        status: 'approved',
        photos: JSON.stringify(['/images/park-pobedy.jpg']),
        equipment: JSON.stringify(['Горки', 'Качели', 'Песочница', 'Качалки', 'Лабиринт', 'Резиновое покрытие', 'Ограждение', 'Лавочки']),
      },
      {
        name: 'Бендерская крепость — Зона отдыха',
        description: 'Оборудованная зона для детей рядом с исторической крепостью. Комбинированный тип: игровая и спортивная зоны. Уникальное расположение рядом с исторической достопримечательностью делает эту площадку особенно привлекательной для семейного отдыха.',
        address: 'ул. Советская, 40',
        city: 'Бендеры',
        district: 'Бендерский',
        lat: 46.8290,
        lng: 29.4740,
        type: 'both',
        condition: 'excellent',
        status: 'approved',
        photos: JSON.stringify(['/images/bender-fortress.jpg']),
        equipment: JSON.stringify(['Горки', 'Качели', 'Турники', 'Брусья', 'Песочница', 'Резиновое покрытие', 'Ограждение']),
      },
      {
        name: 'Парк им. Горького — Спортзона',
        description: 'WORKOUT-площадка в парке Горького с профессиональным оборудованием для уличных тренировок. Бесплатный доступ для всех желающих. Отличное место для занятий спортом на свежем воздухе.',
        address: 'ул. Горького, 1',
        city: 'Тирасполь',
        district: 'Тираспольский',
        lat: 46.8460,
        lng: 29.6200,
        type: 'sports',
        condition: 'excellent',
        status: 'approved',
        photos: JSON.stringify(['/images/gorky-sport.jpg']),
        equipment: JSON.stringify(['Турники', 'Брусья', 'Шведская стенка', 'Скамья для пресса', 'Кольца', 'Освещение', 'Резиновое покрытие']),
      },
    ]

    for (const p of playgrounds) {
      const rating = calcRating(p.condition, p.equipment as string);
      await db.playground.create({ data: { ...p, rating } })
    }

    return NextResponse.json({ message: 'Database re-seeded successfully', count: playgrounds.length })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
