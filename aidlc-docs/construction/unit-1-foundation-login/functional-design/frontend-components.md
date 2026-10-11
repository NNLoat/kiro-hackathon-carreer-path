# Frontend Components — Unit 1: Foundation + Login

Component hierarchy, props/state, interactions, and API integration points for Unit 1.

## Component Hierarchy
```
main.tsx
  AppProviders            (QueryClientProvider + SessionProvider)
    AppRouter             (react-router)
      /login  -> LoginPage
                   UsernameForm
      /       -> RequireProfile -> (Landing placeholder until Unit 3)
      /profile-> RequireProfile -> (Profile placeholder until Unit 2)
      AppNav              (shown when session active)
```

## AppProviders  (`app/AppProviders.tsx`)
- **Purpose**: Wrap app in TanStack Query client + SessionProvider.
- **Props**: `{ children }`.
- **State**: creates a `QueryClient` once.

## SessionProvider / useSession  (`lib/SessionContext.tsx`)
- **State**: `{ profileId, username }`.
- **Methods**: `signIn(profile)`, `signOut()`.
- **Effects**: on mount, restore from localStorage (BR-3.2); persist on change (BR-3.1); clear on signOut (BR-3.4).

## AppRouter  (`app/AppRouter.tsx`)
- **Purpose**: Define routes and guards (BR-4).
- **Routes**: `/login` (public), `/` and `/profile` (wrapped in `RequireProfile`).

## RequireProfile  (`app/RequireProfile.tsx`)
- **Props**: `{ children }`.
- **Behavior**: if `!session.profileId` -> `<Navigate to="/login" />`; else render children (BR-4.1).

## LoginPage  (`features/auth/LoginPage.tsx`)
- **Purpose**: Host the login flow (US-1.1, US-1.2).
- **State**: delegates to UsernameForm; reads `useCreateOrLoadProfile` mutation status.
- **API integration**: `POST /api/profiles` via `useCreateOrLoadProfile` -> `ApiClient.createOrLoadProfile`.
- **On success**: `session.signIn(profile)` then navigate `/`.

## UsernameForm  (`features/auth/UsernameForm.tsx`)
- **Props**: `{ onSubmit(username), loading, error }`.
- **State**: `username` (controlled input).
- **Validation**: BR-1 (trim, 3–30, charset); shows field-associated error (a11y, BR-1.5).
- **Interactions**: Enter or Continue submits when valid; disabled while `loading` (BR-6).
- **A11y (US-1.2)**: label associated with input; error linked via `aria-describedby`; visible focus.

## Shared UI primitives seeded in Unit 1  (`components/`)
- `Button` (variants, loading/disabled, focus), `Field` (label + error association),
  `Spinner`/`LoadingState`, `ErrorState` (message + Retry), `Toast` (ARIA live), `AppNav` (nav + Sign Out).

## API Integration Points (Unit 1)
| Component/Hook | Endpoint | Purpose |
|---|---|---|
| useCreateOrLoadProfile | POST /api/profiles | create/load profile by username |
| session restore (optional) | GET /api/profiles/{id} | revalidate persisted session (BR-3.3) |

## Stub Behavior (Unit 1, minimal — Q5=A)
- `StubApiClient` keeps an in-memory `Map<username, Profile>`:
  - `createOrLoadProfile`: return existing or create a new Profile with empty selection arrays.
  - `getProfile`: look up by id; throw `ApiError{code:"not_found"}` if absent.
- Catalog/radar/pathway/plan methods exist but return empty/placeholder results until their units.

## PBT targets (Unit 1)
- `mappers.toProfile` / `profilePatchToWire`: round-trip (PBT-02).
- `validateUsername`: invariants (PBT-03) with a username generator (PBT-07).
