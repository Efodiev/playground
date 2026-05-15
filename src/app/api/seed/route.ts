import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

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
        lat: 46.8439,
        lng: 29.6285,
        type: 'kids',
        condition: 'excellent',
        status: 'approved',
        photos: JSON.stringify(['/playgrounds/park-pobedy.jpg']),
        equipment: JSON.stringify(['Горки', 'Качели', 'Песочница', 'Качалка-пружина', 'Лабиринт']),
      },
      {
        name: 'Спортивная площадка СШ №2',
        description: 'Открытая спортивная площадка с турниками, брусьями и беговой дорожкой. Бесплатный доступ.',
        address: 'ул. Ленина, 78',
        city: 'Тирасполь',
        lat: 46.8380,
        lng: 29.6150,
        type: 'sports',
        condition: 'good',
        status: 'approved',
        photos: JSON.stringify(['/playgrounds/sport-ss2.jpg']),
        equipment: JSON.stringify(['Турники', 'Брусья', 'Баскетбольное кольцо', 'Скамейки']),
      },
      {
        name: 'Площадка «Солнышко»',
        description: 'Яркая детская площадка в жилом массиве с канатными сетками и домиками для ролевых игр.',
        address: 'пр-т Кириллова и Мефодия, 12',
        city: 'Тирасполь',
        lat: 46.8350,
        lng: 29.6350,
        type: 'kids',
        condition: 'good',
        status: 'approved',
        photos: JSON.stringify(['/playgrounds/solnyshko.jpg']),
        equipment: JSON.stringify(['Канатная сетка', 'Горка', 'Качели', 'Игровой домик']),
      },
      {
        name: 'Бендерская крепость — Зона отдыха',
        description: 'Оборудованная зона для детей рядом с исторической крепостью. Комбинированный тип: игровая и спортивная зоны.',
        address: 'ул. Советская, 40',
        city: 'Бендеры',
        lat: 46.8290,
        lng: 29.4740,
        type: 'both',
        condition: 'excellent',
        status: 'approved',
        photos: JSON.stringify(['/playgrounds/bendery-fortress.jpg']),
        equipment: JSON.stringify(['Горки', 'Качели', 'Турники', 'Брусья', 'Песочница']),
      },
      {
        name: 'Парк им. Горького — Спортзона',
        description: 'WORKOUT-площадка в парке Горького с профессиональным оборудованием для уличных тренировок.',
        address: 'ул. Горького, 1',
        city: 'Тирасполь',
        lat: 46.8460,
        lng: 29.6200,
        type: 'sports',
        condition: 'excellent',
        status: 'approved',
        photos: JSON.stringify(['/playgrounds/gorky-sport.jpg']),
        equipment: JSON.stringify(['Турники', 'Брусья', 'Шведская стенка', 'Скамья для пресса', 'Кольца']),
      },
      {
        name: 'Рыбницкий городской парк',
        description: 'Детская площадка в центре Рыбницы с современными игровыми комплексами и безопасным покрытием.',
        address: 'ул. Ленина, 55',
        city: 'Рыбница',
        lat: 47.7835,
        lng: 28.9915,
        type: 'kids',
        condition: 'good',
        status: 'approved',
        photos: JSON.stringify(['/playgrounds/rybnitsa-park.jpg']),
        equipment: JSON.stringify(['Горки', 'Качели', 'Карусель', 'Песочница', 'Качалки']),
      },
      {
        name: 'Дубоссарский парк культуры',
        description: 'Зона для детей и подростков в парке города Дубоссары. Требуется обновление покрытия.',
        address: 'ул. Октябрьская, 22',
        city: 'Дубоссары',
        lat: 47.2610,
        lng: 29.1650,
        type: 'both',
        condition: 'needs_repair',
        status: 'approved',
        photos: JSON.stringify(['/playgrounds/dubossary-park.jpg']),
        equipment: JSON.stringify(['Качели', 'Горка', 'Турник', 'Баскетбольное кольцо']),
      },
      {
        name: 'Слободзейский детский городок',
        description: 'Небольшая уютная площадка в Слободзее с базовым игровым оборудованием для малышей.',
        address: 'ул. Мира, 15',
        city: 'Слободзея',
        lat: 46.7380,
        lng: 29.7030,
        type: 'kids',
        condition: 'good',
        status: 'approved',
        photos: JSON.stringify(['/playgrounds/slobodzeya.jpg']),
        equipment: JSON.stringify(['Качели', 'Песочница', 'Горка', 'Лавочки']),
      },
      {
        name: 'Площадка ЖК «Дружба»',
        description: 'Новая современная площадка в жилом комплексе с инклюзивным оборудованием и вечерним освещением.',
        address: 'ул. Дружбы, 8',
        city: 'Тирасполь',
        lat: 46.8410,
        lng: 29.6400,
        type: 'kids',
        condition: 'excellent',
        status: 'approved',
        photos: JSON.stringify(['/playgrounds/druzhba.jpg']),
        equipment: JSON.stringify(['Инклюзивные качели', 'Сенсорные панели', 'Горка-туннель', 'Резиновое покрытие', 'Освещение']),
      },
      {
        name: 'Спортплощадка «Олимп»',
        description: 'Полноценная спортивная площадка с покрытием из резиновой крошки для мини-футбола и баскетбола.',
        address: 'ул. Спортивная, 3',
        city: 'Бендеры',
        lat: 46.8310,
        lng: 29.4800,
        type: 'sports',
        condition: 'good',
        status: 'approved',
        photos: JSON.stringify(['/playgrounds/olimp.jpg']),
        equipment: JSON.stringify(['Мини-футбол', 'Баскетбол', 'Волейбол', 'Турники', 'Раздевалка']),
      },
      // Pending submissions for admin demo
      {
        name: 'Новая площадка по ул. Садовой',
        description: 'Пользователь сообщил о новой площадке, построенной в 2024 году. Нуждается в проверке.',
        address: 'ул. Садовая, 20',
        city: 'Тирасполь',
        lat: 46.8360,
        lng: 29.6230,
        type: 'kids',
        condition: 'excellent',
        status: 'pending',
        photos: JSON.stringify(['/playgrounds/sadovaya-new.jpg']),
        equipment: JSON.stringify(['Горки', 'Качели', 'Песочница']),
        submitterName: 'Иван Петров',
        submitterEmail: 'ivan@example.com',
      },
      {
        name: 'Заброшенная площадка на окраине',
        description: 'Старая площадка в аварийном состоянии. Требует сноса или капитального ремонта.',
        address: 'ул. Промышленная, 90',
        city: 'Бендеры',
        lat: 46.8250,
        lng: 29.4650,
        type: 'kids',
        condition: 'dangerous',
        status: 'pending',
        photos: JSON.stringify(['/playgrounds/abandoned.jpg']),
        equipment: JSON.stringify(['Сломанные качели', 'Ржавый турник']),
        submitterName: 'Мария Сидорова',
        submitterEmail: 'maria@example.com',
      },
    ]

    for (const p of playgrounds) {
      await db.playground.create({ data: p })
    }

    return NextResponse.json({ message: 'Database seeded successfully', count: playgrounds.length })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
