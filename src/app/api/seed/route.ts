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

// POST /api/seed - seed database with sample Transnistria playgrounds
export async function POST() {
  try {
    // Check if data already exists
    const existing = await db.playground.count()
    if (existing > 0) {
      return NextResponse.json({ message: 'Database already seeded', count: existing })
    }

    const playgrounds = [
      {
        name: 'Парк Победы — Детская зона',
        description: 'Просторная детская площадка с современным оборудованием в центральном парке Тирасполя. Резиновое покрытие, зоны для разных возрастов.',
        address: 'ул. 25 Октября, 45',
        city: 'Тирасполь',
        district: 'Тираспольский',
        lat: 46.8439,
        lng: 29.6285,
        type: 'kids',
        condition: 'excellent',
        status: 'approved',
        photos: JSON.stringify([]),
        equipment: JSON.stringify(['Горки', 'Качели', 'Песочница', 'Качалки', 'Лабиринт', 'Резиновое покрытие', 'Ограждение', 'Лавочки']),
      },
      {
        name: 'Спортивная площадка СШ №2',
        description: 'Открытая спортивная площадка с турниками, брусьями и беговой дорожкой. Бесплатный доступ.',
        address: 'ул. Ленина, 78',
        city: 'Тирасполь',
        district: 'Тираспольский',
        lat: 46.8380,
        lng: 29.6150,
        type: 'sports',
        condition: 'good',
        status: 'approved',
        photos: JSON.stringify([]),
        equipment: JSON.stringify(['Турники', 'Брусья', 'Баскетбольное кольцо', 'Скамейки', 'Освещение']),
      },
      {
        name: 'Площадка «Солнышко»',
        description: 'Яркая детская площадка в жилом массиве с канатными сетками и домиками для ролевых игр.',
        address: 'пр-т Кириллова и Мефодия, 12',
        city: 'Тирасполь',
        district: 'Тираспольский',
        lat: 46.8350,
        lng: 29.6350,
        type: 'kids',
        condition: 'good',
        status: 'approved',
        photos: JSON.stringify([]),
        equipment: JSON.stringify(['Канатная сетка', 'Горки', 'Качели', 'Игровой домик', 'Лавочки']),
      },
      {
        name: 'Бендерская крепость — Зона отдыха',
        description: 'Оборудованная зона для детей рядом с исторической крепостью. Комбинированный тип: игровая и спортивная зоны.',
        address: 'ул. Советская, 40',
        city: 'Бендеры',
        district: 'Бендерский',
        lat: 46.8290,
        lng: 29.4740,
        type: 'both',
        condition: 'excellent',
        status: 'approved',
        photos: JSON.stringify([]),
        equipment: JSON.stringify(['Горки', 'Качели', 'Турники', 'Брусья', 'Песочница', 'Резиновое покрытие', 'Ограждение']),
      },
      {
        name: 'Парк им. Горького — Спортзона',
        description: 'WORKOUT-площадка в парке Горького с профессиональным оборудованием для уличных тренировок.',
        address: 'ул. Горького, 1',
        city: 'Тирасполь',
        district: 'Тираспольский',
        lat: 46.8460,
        lng: 29.6200,
        type: 'sports',
        condition: 'excellent',
        status: 'approved',
        photos: JSON.stringify([]),
        equipment: JSON.stringify(['Турники', 'Брусья', 'Шведская стенка', 'Скамья для пресса', 'Кольца', 'Освещение', 'Резиновое покрытие']),
      },
      {
        name: 'Рыбницкий городской парк',
        description: 'Детская площадка в центре Рыбницы с современными игровыми комплексами и безопасным покрытием.',
        address: 'ул. Ленина, 55',
        city: 'Рыбница',
        district: 'Рыбницкий',
        lat: 47.7835,
        lng: 28.9915,
        type: 'kids',
        condition: 'good',
        status: 'approved',
        photos: JSON.stringify([]),
        equipment: JSON.stringify(['Горки', 'Качели', 'Карусель', 'Песочница', 'Качалки', 'Лавочки']),
      },
      {
        name: 'Дубоссарский парк культуры',
        description: 'Зона для детей и подростков в парке города Дубоссары. Требуется обновление покрытия.',
        address: 'ул. Октябрьская, 22',
        city: 'Дубоссары',
        district: 'Дубоссарский',
        lat: 47.2610,
        lng: 29.1650,
        type: 'both',
        condition: 'needs_repair',
        status: 'approved',
        photos: JSON.stringify([]),
        equipment: JSON.stringify(['Качели', 'Горки', 'Турники', 'Баскетбольное кольцо']),
      },
      {
        name: 'Слободзейский детский городок',
        description: 'Небольшая уютная площадка в Слободзее с базовым игровым оборудованием для малышей.',
        address: 'ул. Мира, 15',
        city: 'Слободзея',
        district: 'Слободзейский',
        lat: 46.7380,
        lng: 29.7030,
        type: 'kids',
        condition: 'good',
        status: 'approved',
        photos: JSON.stringify([]),
        equipment: JSON.stringify(['Качели', 'Песочница', 'Горки', 'Лавочки']),
      },
      {
        name: 'Площадка ЖК «Дружба»',
        description: 'Новая современная площадка в жилом комплексе с инклюзивным оборудованием и вечерним освещением.',
        address: 'ул. Дружбы, 8',
        city: 'Тирасполь',
        district: 'Тираспольский',
        lat: 46.8410,
        lng: 29.6400,
        type: 'kids',
        condition: 'excellent',
        status: 'approved',
        photos: JSON.stringify([]),
        equipment: JSON.stringify(['Инклюзивные качели', 'Сенсорные панели', 'Горка-туннель', 'Резиновое покрытие', 'Освещение', 'Ограждение', 'Лавочки', 'Теневой навес']),
      },
      {
        name: 'Спортплощадка «Олимп»',
        description: 'Полноценная спортивная площадка с покрытием из резиновой крошки для мини-футбола и баскетбола.',
        address: 'ул. Спортивная, 3',
        city: 'Бендеры',
        district: 'Бендерский',
        lat: 46.8310,
        lng: 29.4800,
        type: 'sports',
        condition: 'good',
        status: 'approved',
        photos: JSON.stringify([]),
        equipment: JSON.stringify(['Мини-футбол', 'Баскетбольное кольцо', 'Волейбол', 'Турники', 'Раздевалка', 'Освещение']),
      },
      {
        name: 'Григориопольская центральная площадка',
        description: 'Детская и спортивная зона в центре Григориополя. Недавно обновлена.',
        address: 'ул. Ленина, 30',
        city: 'Григориополь',
        district: 'Григориопольский',
        lat: 47.1520,
        lng: 29.2950,
        type: 'both',
        condition: 'good',
        status: 'approved',
        photos: JSON.stringify([]),
        equipment: JSON.stringify(['Качели', 'Горки', 'Турники', 'Песочница', 'Лавочки']),
      },
      {
        name: 'Каменский парк',
        description: 'Небольшая детская площадка в райцентре Каменка.',
        address: 'ул. Кирова, 10',
        city: 'Каменка',
        district: 'Каменский',
        lat: 48.0430,
        lng: 28.7190,
        type: 'kids',
        condition: 'needs_repair',
        status: 'approved',
        photos: JSON.stringify([]),
        equipment: JSON.stringify(['Качели', 'Горки', 'Песочница']),
      },
      {
        name: 'Площадка в селе Парканы',
        description: 'Сельская детская площадка с базовым оборудованием.',
        address: 'ул. Центральная, 5',
        city: 'Парканы',
        district: 'Тираспольский',
        lat: 46.8200,
        lng: 29.5800,
        type: 'kids',
        condition: 'good',
        status: 'approved',
        photos: JSON.stringify([]),
        equipment: JSON.stringify(['Качели', 'Горки', 'Песочница', 'Лавочки']),
      },
      {
        name: 'Спортзона в селе Бутор',
        description: 'Спортивная площадка в селе Бутор с турниками и футбольным полем.',
        address: 'ул. Школьная, 1',
        city: 'Бутор',
        district: 'Григориопольский',
        lat: 47.1000,
        lng: 29.3500,
        type: 'sports',
        condition: 'good',
        status: 'approved',
        photos: JSON.stringify([]),
        equipment: JSON.stringify(['Мини-футбол', 'Турники', 'Брусья']),
      },
      // Pending submissions for admin demo
      {
        name: 'Новая площадка по ул. Садовой',
        description: 'Пользователь сообщил о новой площадке, построенной в 2024 году. Нуждается в проверке.',
        address: 'ул. Садовая, 20',
        city: 'Тирасполь',
        district: 'Тираспольский',
        lat: 46.8360,
        lng: 29.6230,
        type: 'kids',
        condition: 'excellent',
        status: 'pending',
        photos: JSON.stringify([]),
        equipment: JSON.stringify(['Горки', 'Качели', 'Песочница', 'Резиновое покрытие']),
        submitterName: 'Иван Петров',
        submitterEmail: 'ivan@example.com',
      },
      {
        name: 'Заброшенная площадка на окраине',
        description: 'Старая площадка в аварийном состоянии. Требует сноса или капитального ремонта.',
        address: 'ул. Промышленная, 90',
        city: 'Бендеры',
        district: 'Бендерский',
        lat: 46.8250,
        lng: 29.4650,
        type: 'kids',
        condition: 'dangerous',
        status: 'pending',
        photos: JSON.stringify([]),
        equipment: JSON.stringify([]),
        submitterName: 'Мария Сидорова',
        submitterEmail: 'maria@example.com',
      },
    ]

    for (const p of playgrounds) {
      const rating = calcRating(p.condition, p.equipment as string);
      await db.playground.create({ data: { ...p, rating } })
    }

    return NextResponse.json({ message: 'Database seeded successfully', count: playgrounds.length })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
