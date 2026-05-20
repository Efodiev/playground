---
Task ID: 1
Agent: Main
Task: Redesign sort UI, implement real reviews, remove mock data

Work Log:
- Redesigned sort buttons on registry page: replaced inline pill toggles with dropdown button (like filter button)
- Added sort options: "Сначала новые", "Сначала старые", "Рейтинг ↓ (высокий)", "Рейтинг ↑ (низкий)"
- Added click-outside handler to close sort dropdown
- Added showSort state with sortBy type updated to include "rating_desc" | "rating_asc"
- Created Review model in Prisma schema with playgroundId, authorName, rating (1-5), text
- Ran prisma db push to create Review table
- Created /api/reviews route (GET with playgroundId filter, POST with validation)
- Created /api/reviews/[id] route (DELETE for admin)
- Replaced MOCK_REVIEWS in PlaygroundDetail with real API-backed reviews
- Added review form with interactive star picker, name input, text area
- Added review submission with loading state
- Added admin delete review functionality (hover to show delete button)
- Added average review rating display, review count with proper Russian pluralization
- Added empty state and loading skeleton for reviews
- Added AnimatePresence import for review form animation
- Verified lint passes with no errors
- Verified reviews API works (GET returns [], POST creates review)

Stage Summary:
- Sort UI now uses dropdown with 4 options including bidirectional rating sort
- Real review system fully functional with backend API and frontend UI
- Mock reviews completely removed
- Admin can delete reviews from detail page
