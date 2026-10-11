# Business Logic Model — Unit 1: Foundation + Login

Technology-agnostic behavior for the foundation + login flow. Stories: US-0.1/0.2/0.3, US-1.1/1.2.

## 1. API Client Selection
- A single `createApiClient()` returns either `HttpApiClient` or `StubApiClient` based on `VITE_USE_STUB`.
- All data access flows through the `ApiClient` interface; UI/hooks never branch on stub vs http.

## 2. Create-or-Load Profile Flow (US-1.1)
```
User enters username on LoginPage
  -> validate username (see business-rules)
  -> if invalid: block submit, show field error
  -> if valid: call ApiClient.createOrLoadProfile(username)
       - backend POST /api/profiles returns Profile (200 existing | 201 created)
       - success: SessionContext.signIn(profile); persist session; navigate to "/"
       - failure: map error envelope; show inline error + Retry (no navigation)
  -> while in-flight: show loading; disable submit (prevent double submit)
```

## 3. Session Lifecycle (US-0.1, US-1.1)
```
signIn(profile):   set { profileId, username }; persist to localStorage
signOut():         clear session; remove from localStorage; navigate to /login
on app load:       read persisted session; if present, restore it (optimistic),
                   optionally revalidate via GET /api/profiles/{id};
                   if revalidation 404s: clear session -> /login
```

## 4. Routing & Guard (US-0.1)
```
routes: /login (public), / (protected), /profile (protected)
RequireProfile: if no active session -> redirect /login; else render child
after signIn -> navigate "/"; after signOut -> "/login"
```

## 5. Error Handling (US-1.1)
- All ApiClient methods normalize transport/HTTP errors into UI `ApiError {code,message,details?}`
  by parsing the contract envelope `{error:{...}}`.
- LoginPage renders `message` inline with Retry; known codes map to specific UI (validation_error -> field).

## 6. Data Mapping Boundary
- `HttpApiClient` parses wire (snake_case) and runs `mappers` to UI types before returning.
- `mappers` are pure and round-trip-testable (PBT-02).

## PBT Property Identification (PBT-01)
| Function | Category | Property |
|---|---|---|
| `mappers.toProfile`/`profilePatchToWire` | Round-trip (PBT-02) | wire -> UI -> wire reproduces original (modulo documented field set) |
| `validateUsername` | Invariant (PBT-03) | valid output never contains leading/trailing space; length in [3,30]; charset enforced; deterministic |
