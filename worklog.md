---
Task ID: 2
Agent: main
Task: Improve add playground form, implement rating system, add Transnistria cities/villages

Work Log:
- Fixed hydration mismatch error by adding suppressHydrationWarning to body tag in layout.tsx
- Replaced lat/lng coordinate inputs with interactive MapPicker component:
  - "Показать на карте" button opens interactive Leaflet map
  - Users can click on map to place marker
  - Marker is draggable for fine-tuning
  - Coordinates displayed below map
- Implemented PhotoUploader component with full functionality:
  - Drag and drop support
  - File browser (click to select)
  - Clipboard paste (Ctrl+V) support
  - Up to 5 photos per playground
  - Preview grid with delete buttons
  - First photo marked as "Главное" (main)
  - File validation (image type, 10MB max)
- Designed and implemented rating criteria system:
  - Rating calculated from condition (0-40 points) + equipment (0-60 points)
  - Excellent=40, Good=28, Needs Repair=12, Dangerous=0
  - Each equipment item = 4 points (max 60)
  - Total max = 100 points
  - RatingBar component with animated progress
  - RatingPreview component in add form showing breakdown
  - Rating displayed on cards, detail modal, and admin panel
  - Added `rating` field to Prisma schema
- Added all cities and villages of Transnistria (100+ locations):
  - 8 cities: Тирасполь, Бендеры, Рыбница, Дубоссары, Слободзея, Григориополь, Каменка, Красные Окны
  - 3 urban-type settlements
  - 90+ villages across all districts
- Added more seed playgrounds (16 total: 14 approved, 2 pending):
  - Added Григориополь, Каменка, Парканы, Бутор locations
- Added Safety category to equipment options
- Updated seed API with rating calculation
- All lint checks pass, all APIs return 200

Stage Summary:
- MapPicker: interactive map for location selection replacing manual coordinate entry
- PhotoUploader: full upload support (drag-drop, browse, paste) up to 5 photos
- Rating system: 0-100 score from condition (40pts) + equipment (60pts)
- 100+ Transnistria cities/villages in city selector
- Database now includes rating field
