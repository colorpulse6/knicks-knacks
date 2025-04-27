# Device-Based Authentication Strategy for Leaf

- **Per-device identity:** Each device is assigned a UUID on first launch, securely stored and used as the `user_id` for all API/database operations.
- **No login or signup:** All user data is automatically scoped to the device. There is no user-facing authentication flow.
- **No foreign key constraint:** The backend/database does not enforce a foreign key to `auth.users` on `user_id` fields. Any UUID is valid.
- **Persistence:** If the app is deleted/reinstalled, a new device/user is created.
- **Security:** This strategy is suitable for non-sensitive, per-device personalization, not for high-security or multi-device sync scenarios.

See `mobile/utils/deviceUser.ts` for implementation details.
