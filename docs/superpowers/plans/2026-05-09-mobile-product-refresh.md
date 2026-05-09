# Mobile Product Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first product-quality pass for Leaf and CalorieCam after store-readiness cleanup.

**Architecture:** Keep the apps device-scoped and backend-mediated. CalorieCam moves food image access behind signed URLs and adds history deletion/update APIs; Leaf adds status/progress fields to books and exposes scoped update APIs. Mobile UI is refreshed per selected direction: Leaf = dark editorial, CalorieCam = clean premium.

**Tech Stack:** Expo React Native, TypeScript, TanStack Query, Express, Supabase, OpenAI, Node test runner.

---

### Task 1: CalorieCam Privacy + Food Log APIs

**Files:**
- Modify: `apps/calorie-cam/backend/src/controllers/food.controller.ts`
- Modify: `apps/calorie-cam/backend/src/routes/food.ts`
- Create: `apps/calorie-cam/backend/src/utils/foodLogs.ts`
- Create: `apps/calorie-cam/backend/test/food-logs.test.ts`
- Create: `apps/calorie-cam/supabase/migrations/0002_private_food_images.sql`

- [x] Add tests for signed image URL mapping, scoped delete, and editable nutrition payload validation.
- [x] Store `image_path` alongside `image_url`, make the bucket private in migration, and return signed URLs from API responses.
- [x] Add `DELETE /api/food-logs/:id` and `PATCH /api/food-logs/:id`, both scoped by device `userId`.
- [x] Return created log metadata from upload so the mobile result can be edited/deleted.

### Task 2: CalorieCam Clean Premium UX

**Files:**
- Modify: `apps/calorie-cam/mobile/src/types/index.ts`
- Modify: `apps/calorie-cam/mobile/src/services/api.ts`
- Modify: `apps/calorie-cam/mobile/src/screens/MainScreen.tsx`
- Modify: `apps/calorie-cam/mobile/src/screens/HistoryScreen.tsx`
- Modify: `apps/calorie-cam/mobile/src/screens/SettingsScreen.tsx`
- Modify: `apps/calorie-cam/mobile/src/components/NutritionCard.tsx`
- Create: `apps/calorie-cam/mobile/src/components/TodaySummary.tsx`

- [x] Add client functions for per-log delete/update.
- [x] Add Today macro summary and make Camera the primary action.
- [x] Add approximate nutrition disclaimer to result/history/settings.
- [x] Wire legal/contact links through Expo config/env.
- [x] Add individual delete from history and editable result controls.

### Task 3: Leaf Status + Progress Backend

**Files:**
- Modify: `apps/leaf/backend/src/controllers/books.controller.ts`
- Modify: `apps/leaf/backend/src/routes/books.ts`
- Create: `apps/leaf/backend/src/utils/books.ts`
- Create: `apps/leaf/backend/test/books.test.ts`
- Create: `apps/leaf/supabase/migrations/20260509000000_add_status_progress.sql`

- [x] Add tests for status/progress validation and scoped update payloads.
- [x] Add `status`, `pages_read`, and `percent_complete` to books.
- [x] Add `PATCH /books/:id` scoped by `user_id`.
- [x] Default new books to `want_to_read`.

### Task 4: Leaf Dark Editorial UX

**Files:**
- Modify: `apps/leaf/mobile/src/context/ThemeContext.tsx`
- Modify: `apps/leaf/mobile/src/services/api.ts`
- Modify: `apps/leaf/mobile/src/screens/BooksListScreen.tsx`
- Modify: `apps/leaf/mobile/src/screens/AddBookScreen.tsx`
- Modify: `apps/leaf/mobile/src/screens/BookDetailsScreen.tsx`
- Modify: `apps/leaf/mobile/src/screens/ProfileScreen.tsx`
- Modify: `apps/leaf/mobile/src/navigation.tsx`

- [x] Add typed book status/progress fields to the mobile API.
- [x] Group library by status instead of finished month/year.
- [x] Refresh the visual design with dark editorial shelf styling.
- [x] Add status chips and progress controls on book detail.
- [x] Debounce Open Library search to reduce keystroke API churn.

### Task 5: Verification + PR

**Commands:**
- `yarn workspace @knicks-knacks/calorie-cam-backend test`
- `yarn workspace @knicks-knacks/calorie-cam-backend build`
- `yarn workspace @knicks-knacks/leaf-backend test`
- `yarn workspace @knicks-knacks/leaf-backend build`
- `yarn workspace @knicks-knacks/calorie-cam-mobile exec tsc --noEmit`
- `yarn workspace @knicks-knacks/leaf-mobile exec tsc --noEmit`
- `yarn workspace @knicks-knacks/calorie-cam-mobile lint`
- `yarn workspace @knicks-knacks/leaf-mobile lint`
- `yarn dlx expo-doctor` in each mobile app directory

- [x] Run all checks and fix failures.
- [ ] Commit only product-refresh files, leaving unrelated local files untouched.
- [ ] Push `codex/mobile-product-refresh` and open a draft PR.
