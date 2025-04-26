# Leaf Backend

Express API backend for the Leaf app. Handles book tracking, progress, recommendations, and integrates with Open Library and Supabase.

## Authentication Strategy

This app uses **device-based authentication** instead of traditional user accounts. On first launch, each device generates a unique UUID, which is securely stored and used as the `user_id` for all API and database operations. There is no login or signup screen. This means:
- All book/progress/recommendation data is scoped to the device.
- The device's UUID is sent as `user_id` in all API requests.
- The database no longer enforces a foreign key constraint to `auth.users` on `user_id` fields.
- If the app is deleted and reinstalled, a new device identity is created.

This approach provides a frictionless experience and is suitable for non-sensitive, per-device personalization. See `mobile/utils/deviceUser.ts` for implementation details.
