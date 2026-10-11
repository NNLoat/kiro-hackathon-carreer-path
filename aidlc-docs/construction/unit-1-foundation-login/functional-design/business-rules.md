# Business Rules — Unit 1: Foundation + Login

## BR-1: Username validation (client-side, before submit)
- BR-1.1: Trim surrounding whitespace before validating and before sending.
- BR-1.2: Reject empty (after trim) with "Username is required".
- BR-1.3: Length MUST be 3–30 characters inclusive.
- BR-1.4: Allowed characters: letters (A–Z, a–z), digits (0–9), underscore `_`, hyphen `-`.
- BR-1.5: On violation, block submission and show an inline, field-associated error (not color-only).

## BR-2: Create-or-load semantics
- BR-2.1: A single "Continue" action calls `createOrLoadProfile(username)`.
- BR-2.2: 200 (existing) and 201 (created) are both success; UI does not distinguish them.
- BR-2.3: On success, establish session and navigate to `/`.

## BR-3: Session persistence & restore (prototype, no token)
- BR-3.1: On signIn, persist `{ profileId, username }` to localStorage under a namespaced key
  (e.g. `cpp.session`).
- BR-3.2: On app load, if a persisted session exists, restore it optimistically.
- BR-3.3: Optionally revalidate via `GET /api/profiles/{id}`; if it 404s, clear session and route to `/login`.
- BR-3.4: On signOut, clear memory + localStorage and route to `/login`.
- BR-3.5: Session is NOT security — it is a prototype convenience key, per the contract's no-auth stance.

## BR-4: Route protection
- BR-4.1: `/` and `/profile` require an active session; otherwise redirect to `/login`.
- BR-4.2: `/login` is always accessible.

## BR-5: Error mapping
- BR-5.1: Parse contract error envelope `{error:{code,message,details?}}` into `ApiError`.
- BR-5.2: Render `message` inline with a Retry affordance.
- BR-5.3: Map known codes: `validation_error` -> field-level error on username; others -> general inline error.
- BR-5.4: Never navigate away on error; preserve the entered username.

## BR-6: In-flight protection
- BR-6.1: While a login request is in flight, disable the submit control and show a loading state.
- BR-6.2: Prevent duplicate submissions.
