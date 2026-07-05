# KO Tournament — Implementation Plan

## Overview

Add a **Knockout (single-elimination) Tournament** format alongside the existing Swiss-system Classical League. Users switch between the two products via a **dropdown on the site name** in the navigation bar. The KO bracket is visualised as a **standard left-to-right elimination tree** (final on the right), rendered with a **vetted third-party bracket library**, with every match card showing the two players and the result.

> **Bracket rendering decision.** We use an existing bracket library (one-directional) rather than hand-rolling the tree — connector routing is a solved problem and not worth building. This replaces the earlier center-converging "butterfly" idea; libraries do not support a center-final layout, and a standard left-to-right bracket is the pragmatic trade. **The library must be validated for compatibility before adoption** (see [Bracket Library Selection](#bracket-library-selection)). The custom center-converging component is retained only as a documented **fallback** if no library passes the compatibility check.

**The KO section is a multi-tournament hub.** `/ko-tournament` is an **overview page listing every KO tournament instance** (active and past) as cards; each links to its own bracket at `/ko-tournament/[slug]`. Admins create a new instance from the admin panel, which opens a **settings dialog** to configure it. The section is built to hold many independent tournaments, not a single fixed one.

**Matches are multi-game by default.** Each bracket match is a **mini-match of N games** — default **2 games** ("double round", one with each colour). `gamesPerRound` is a per-tournament setting chosen from **1, 2, 4, 6, …** (1 or any even number, so colours stay balanced). The match winner is decided on aggregate score across its games.

Unlike the Classical League — which **outsources pairings to SwissSystem.org** and only collects results — the KO format's pairing logic is deterministic (seed → assign byes → generate bracket), so we bring it **in-house**. Where practical we reuse the League's proven plumbing (Postmark email, admin approval patterns, Prisma migration workflow).

**Scope for v1 — results only.** The KO format records **match results only** (who won), *not* the games themselves. There is **no PGN capture and no Lichess broadcast** in the core plan. Full game recording + broadcast is designed for but deferred — it appears as a **"Coming soon"** toggle in the create form and is specified in its own section (see [Game Recording & Broadcast — Coming Soon](#game-recording--broadcast--coming-soon)).

**Results are entered in the admin panel only.** The public/user interface is **read-only** (view the bracket and results). There is no player-facing result submission for the KO format.

This document is a **planning artifact only**. No implementation has started. It is organised as small-to-medium chunks, each shippable on its own, starting from an MVP (UI with simulated data) and expanding gradually.

---

## Goals

- ✅ **MVP-first**: a visible bracket (via a vetted library) with simulated data before any backend work.
- ✅ **Multi-tournament hub**: `/ko-tournament` is an overview of many instances; admins spin up new ones via a settings dialog.
- ✅ **Multi-game matches**: each match is N games (default 2 = double round); winner by aggregate score. `gamesPerRound` ∈ {1, 2, 4, 6, …}.
- ✅ **In-house pairing engine**: pure, unit-tested functions for seeding + bye assignment (highest-risk logic built and proven early).
- ✅ **Separate but consistent**: KO data lives in its own Prisma models; KO code mirrors League conventions (admin approval, email, migrations).
- ✅ **Flexible tournament creation**: player count, odd-player handling, seeding method, third-place match, manual-pairing override — all configurable per tournament. Format (single/double elim) and game-recording are surfaced as **"Coming soon"** options.
- ✅ **Results-only, admin-entered**: v1 stores match outcomes only (no PGN/games); results are entered exclusively in the admin panel; the public UI is read-only.
- ✅ **Reuse over reinvention**: email notifications and admin UI patterns are shared with the League where practical.
- ✅ **Every chunk lists its files** and flags any file the author is *not certain* about.

---

## Decisions (proposed defaults)

These were previously open questions. To keep momentum, the plan adopts sensible defaults; each is cheap to change and is called out here so it can be vetoed before the relevant chunk starts.

| Topic | Default chosen | Rationale |
|-------|----------------|-----------|
| **Format** | Single elimination (v1) | Confirmed. **Double elimination** is offered in the create form as a **"Coming soon"** option (disabled/informational until built). |
| **Bracket rendering** | **Third-party library, one-directional (L→R)** | Confirmed. Don't hand-roll a standard bracket. Trades away the center-final "butterfly" look (no lib supports it). **Library must pass a compatibility check** (React 19 + custom cards + Tailwind dark mode) — see [Bracket Library Selection](#bracket-library-selection). Custom butterfly kept as fallback only. |
| **What is recorded** | **Match result only** (no games/PGN) | Confirmed. Full game recording + Lichess broadcast is a **"Coming soon"** create toggle; see dedicated section. |
| **Result entry location** | **Admin panel only** | Confirmed. Public/user UI is read-only; no player-facing result submission. |
| **Participant registration** | **Public self-registration + admin approval** (mirrors League) | Confirmed. Register CTA shows only while `status = REGISTRATION`; entries start `isApproved = false`; admin approves in Chunk 4. Supports **"select from existing player"** (reuses `SearchablePlayerDropdown`) — a capability the League registration itself does *not* have. |
| **Bracket size** | Any power of 2 (flexible) | Confirmed. Engine pads to next power of 2 ≥ player count. |
| **Odd / non-power-of-2 players** | **Top seeds get Round-1 byes** | Confirmed. `byes = bracketSize − N`, assigned to the highest seeds; they enter in Round 2. |
| **Pairing mode** | **Auto-seed + admin override** | Confirmed. Engine proposes; admin can reassign before publishing. |
| **Third-place match** | Per-tournament toggle | Confirmed. `thirdPlaceMatch: boolean` on the tournament. |
| **Games per match** | **Default 2 (double round)** | Confirmed. `gamesPerRound` ∈ {1, 2, 4, 6, …} (1 or even, for colour balance). Match winner = aggregate score. |
| **Tied match (even score)** | Admin picks the advancer manually in v1 | With 2+ games a match can tie (e.g. 1–1). v1: admin selects the winner + notes the reason. Automated tiebreak (rapid/Armageddon) is an add-on. |
| **Data scope** | Standalone, with *optional* link to a `Player` | "Decide later" — modelled so `KnockoutParticipant.playerId` is nullable, so we can defer the shared-pool decision without a migration later. |
| **Result entry (MVP)** | Read-only public bracket + admin-only entry form | Confirmed. Inline click-to-enter *within the admin bracket* is an add-on (see Optional Add-ons). |
| **Public URL** | `/ko-tournament` = **overview of all instances**; `/ko-tournament/[slug]` = one bracket | Matches existing flat routing (`/stats`, `/byes`). Slug for shareable links. |
| **Admin URL** | `/admin/ko-tournament` (list) + **settings dialog** to create; `/admin/ko-tournament/[id]/...` (manage) | Mirrors `/admin/results`, `/admin/rounds`. Create is a modal, not a separate route. |
| **Create flow** | **Settings dialog (modal)** launched from the admin list | Confirmed. "New tournament" opens a modal prompting all settings; no dedicated create page. |
| **Nav switcher** | Brand dropdown swaps the active section + its nav link set | Keeps League and KO nav sets independent; brand label reflects current section. |
| **Multiple tournaments** | **First-class**: the public overview lists them all; many can coexist | The KO route is a hub over independent tournament instances. |
| **DB model prefix** | `Knockout*` in Prisma; "KO Tournament" in UI copy | Reads clearly in code; avoids the ambiguous `KO` abbreviation in models. |

---

## Data Model (target shape)

Introduced in **Chunk 3**, but defined here so the engine (Chunk 2) and UI (Chunk 1) can code against stable TypeScript types from day one (`lib/ko-tournament-types.ts`).

### `KnockoutTournament`
Tournament-level settings — the "create tournament" configuration surface.

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | PK |
| `slug` | String @unique | URL-friendly identifier |
| `name` | String | Display name |
| `status` | enum `KnockoutStatus` | `DRAFT` → `REGISTRATION` → `IN_PROGRESS` → `COMPLETED` |
| `format` | enum `KnockoutFormat` | `SINGLE_ELIMINATION` (v1). `DOUBLE_ELIMINATION` exists in the enum but is **Coming soon** — selectable-but-disabled in the UI until built. |
| `bracketSize` | Int | Power of 2, computed from participant count |
| `allowOddPlayers` | Boolean | If false, participant count must be a power of 2 |
| `oddPlayerHandling` | enum | `BYE_TOP_SEEDS` (default); reserved: `PLAY_IN_ROUND` |
| `seedingMethod` | enum | `RATING` \| `MANUAL` \| `RANDOM` |
| `allowManualPairings` | Boolean | Enables the admin override UI (Chunk 7) |
| `gamesPerRound` | Int @default(2) | Games per match. Allowed: **1, 2, 4, 6, …** (1 or even). Default 2 = double round (each colour once). Winner = aggregate score. |
| `thirdPlaceMatch` | Boolean | Adds a bronze final |
| `enableGameRecording` | Boolean | **Coming soon** — default `false`. When true (future), matches accept PGN + can broadcast. Stored now so the setting is forward-compatible; UI shows it disabled with a "Coming soon" label. |
| `seasonId` | String? | **Nullable** optional link to a `Season` (defers shared-pool decision) |
| `startDate` | DateTime? | Optional |
| `timeControl` | String? | e.g. "30+30" |
| `createdAt` / `updatedAt` | DateTime | |

### `KnockoutParticipant`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | PK |
| `tournamentId` | String | FK |
| `playerId` | String? | **Nullable** optional link to League `Player` (set when registered via "select existing player"). |
| `name` | String | Denormalised display name (works without a `Player`) |
| `email` | String? | Captured on self-registration (Chunk 1.2); null for admin-added. |
| `phoneNumber` | String? | Captured on self-registration; null for admin-added. |
| `rating` | Int? | For `RATING` seeding |
| `seed` | Int? | Assigned at seeding time |
| `isApproved` | Boolean @default(false) | **Approval gate** — mirrors `Player.isApproved`. Self-registrations start `false`; admin-added can be created `true`. Unapproved participants never enter seeding/bracket. |
| `registrationDate` | DateTime @default(now()) | When the participant registered / was added. |
| `approvedDate` | DateTime? | Set when an admin approves. |
| `isEliminated` | Boolean | |
| `eliminatedInRoundId` | String? | For "reached Quarterfinal" style stats |
| `@@unique([tournamentId, seed])` | | One seed per tournament |

### `KnockoutRound`

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | PK |
| `tournamentId` | String | FK |
| `roundNumber` | Int | 1 = first round |
| `name` | String | "Round of 16", "Quarterfinal", "Semifinal", "Final", "Third-Place Match" |
| `@@unique([tournamentId, roundNumber])` | | |

### `KnockoutMatch`
The equivalent of the League's `GameResult`. The **`nextMatchId` self-relation is the structural backbone**: each match points to the match its winner feeds into, so advancing a winner is a single update and the tree render is a straightforward graph walk.

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | PK |
| `tournamentId` | String | FK (denormalised for easy querying) |
| `roundId` | String | FK |
| `matchNumber` | Int | Position within the round |
| `bracketSlot` | Int | Absolute slot index for tree layout / left-right split |
| `side` | enum `BracketSide`? | Optional layout hint (`LEFT`/`RIGHT`/`CENTER`) — only needed by the custom butterfly fallback; unused by a one-directional library. |
| `participant1Id` | String? | Null until known (feeder match undecided) |
| `participant2Id` | String? | Null for a bye or undecided feeder |
| `winnerId` | String? | Advancing participant (may be set manually on a tie). |
| `result` | enum `KnockoutResult`? | `P1_WIN` \| `P2_WIN` \| `BYE` — the match-level outcome derived from aggregate score. |
| `score1` / `score2` | Float? | **Aggregate score** across the match's games (chess points, 0.5 increments). Core, not an add-on — driven by `gamesPerRound`. |
| `decidedByTiebreak` | Boolean @default(false) | True when the aggregate was tied and the admin chose the advancer. |
| `tiebreakNote` | String? | Optional reason/method when decided by tiebreak. |
| `scheduledDate` | DateTime? | Optional |
| `status` | enum | `PENDING` \| `READY` \| `COMPLETED` |
| `isThirdPlace` | Boolean | Marks the bronze final |
| `nextMatchId` | String? | Self-relation — where the winner advances |
| `nextMatchSlot` | Int? | 1 or 2 — which participant slot the winner fills |
| `@@unique([roundId, matchNumber])` | | |

### `KnockoutGame`
Because a match is **N games** (`gamesPerRound`), each individual game is its own row. In v1 a game stores only its **result**; the match's `score1`/`score2` are the aggregate of its games. This is also the natural future home for **per-game PGN** — the game-recording feature attaches PGN here without touching the match model.

| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | PK |
| `matchId` | String | FK |
| `gameNumber` | Int | 1..`gamesPerRound` |
| `result` | enum `GameOutcome`? | `P1_WIN` \| `P2_WIN` \| `DRAW` — null until entered. |
| `pgn` | String? @db.Text | **Coming soon / reserved** — unused in v1; per-game PGN lands here when game recording ships (non-breaking). |
| `boardNumber` | Int? | **Coming soon / reserved** — for future Lichess broadcast parity; unused in v1. |
| `@@unique([matchId, gameNumber])` | | |

> **Aggregate rule:** `score1 = Σ(1 for P1_WIN, 0.5 for DRAW)`, `score2` symmetrically. Match `result`/`winnerId` follow the higher score; equal scores ⇒ admin picks the advancer (`decidedByTiebreak = true`).

### New enums
`KnockoutStatus`, `KnockoutFormat` (`SINGLE_ELIMINATION`, `DOUBLE_ELIMINATION` — the latter Coming soon), `KnockoutResult` (`P1_WIN`/`P2_WIN`/`BYE`), `GameOutcome` (`P1_WIN`/`P2_WIN`/`DRAW`), `BracketSide`, plus a seeding/odd-handling enum. (Model names above are the author's proposal and **not yet cross-checked against any Prisma reserved words** — verify at implementation.)

---

## Implementation Chunks

Legend: **[New]** = create file · **[Edit]** = modify existing · **⚠️ unverified** = author is not certain this file exists / is the right target and must confirm during implementation. Size: **S** ≈ half-day, **M** ≈ 1–2 days.

---

### Chunk 1 — Navigation switcher + MVP overview & bracket (static data)  ·  **Size: M**
**Goal:** Ship (a) the brand dropdown that switches between "Classical League" and "KO Tournament", (b) a **KO overview page listing multiple tournament instances**, and (c) a **one-directional elimination bracket** for one instance — all from hardcoded data. No backend.

**Why first:** De-risks the multi-instance hub layout *and* the bracket-library choice (the compatibility spike below) early, giving an immediately reviewable artifact.

**✅ Implemented.** Status of each deliverable:
- **Step 0 spike result — fallback triggered.** Both candidates were installed against this repo's React 19.1.0 and tested with `renderToStaticMarkup`:
  - `react-brackets@0.4.7` — peer dep `react@^17.0.0` (needs `--legacy-peer-deps`). It does render, but its `SeedItem` wrapper ships hardcoded styled-components CSS (`background-color:#1a1d2e; color:#fff`, fixed `#707070` connector borders) with no theme hook — it fights Tailwind dark mode rather than deferring to it. **Fails gate 3.**
  - `@g-loot/react-tournament-brackets@1.0.31-rc` — peer dep `react@^18.1.0` (needs `--legacy-peer-deps`), plus an undeclared transitive dependency (`react-svg-pan-zoom`) that isn't even listed in its own `package.json` and had to be installed separately to avoid a `MODULE_NOT_FOUND` at render time. Heavier, older, same class of risk.
  - Neither library cleanly passes gate 1 (both require `--legacy-peer-deps`) and `react-brackets` concretely fails gate 3. Per the plan's own rule ("do not adopt a library that fails any gate"), the **custom fallback was built**: `components/ko-tournament/bracket-tree.tsx` — a one-directional CSS flex layout with connector lines computed at runtime from measured DOM positions (via `ResizeObserver` + `getBoundingClientRect`), so correctness doesn't depend on exact column spacing. No new dependency was added to `package.json`.
- Brand dropdown switcher, KO overview page, single-tournament bracket page, match/seed card, shared types, and hardcoded fixtures are all implemented — see Files below (all shipped, none skipped).

**Step 0 — Bracket library compatibility spike (do this before writing card UI):**
Evaluate a candidate library (see [Bracket Library Selection](#bracket-library-selection)) against three gates: (1) installs & runs on **React 19.1.0** (note any `--legacy-peer-deps`/overrides needed), (2) supports a **fully custom match/seed component** so we can render seeds + per-game score (`1.5–0.5`) + tiebreak badge, (3) respects **Tailwind 4 dark mode** without fighting its own styling. **If a library passes → use it. If none passes → fall back** to a custom `bracket-tree.tsx` (one-directional, or the center-converging butterfly as originally envisioned).

**Files:**
- **[Edit]** `components/navigation.tsx` — turn the brand link ([navigation.tsx:79](components/navigation.tsx#L79)) into a dropdown switcher; introduce a `navMode` (`'league' | 'ko'`) that selects which nav item set renders.
- **[New]** `app/ko-tournament/page.tsx` — **overview page**: grid of tournament cards (name, status, dates, winner if done) from a static list.
- **[New]** `app/ko-tournament/[slug]/page.tsx` — single-tournament bracket page (static fixture) reached from an overview card.
- **[New]** `components/ko-tournament/tournament-card.tsx` — one instance card for the overview grid.
- **[New]** `components/ko-tournament/bracket-tree.tsx` — thin wrapper around the chosen library that maps our types → the library's shape (or the custom renderer if the spike fails).
- **[New]** `components/ko-tournament/bracket-match.tsx` — the custom match/seed card passed to the library: both players, seeds, **per-game score (e.g. 1.5–0.5)**, highlighted winner, tiebreak badge.
- **[New]** `lib/ko-tournament-types.ts` — shared TS types (mirrors the target data model above, incl. `gamesPerRound` and per-game scores).
- **[New]** `lib/ko-tournament-fixtures.ts` — hardcoded sample: 2–3 instances, one with a full 8-player 2-games-per-round bracket.
- **[Edit]** `package.json` — add the chosen bracket library (only if the spike passes).

**Not certain about:**
- ⚠️ **Which library passes the spike** — decided during Step 0, not now. Candidates and criteria are in [Bracket Library Selection](#bracket-library-selection).
- ⚠️ Whether the brand/switcher also needs a change in `app/layout.tsx` (if the brand lives partly there). Needs a quick check at implementation.
- ⚠️ Exact Tailwind 4 tokens / dark-mode classes to match existing cards — confirm against `components/stats/*` styling.

**Success criteria:**
- A bracket library is chosen via the documented compatibility spike (or the fallback is triggered with the reason recorded).
- Brand dropdown switches sections and swaps nav items; League behaviour unchanged when in league mode.
- `/ko-tournament` shows an overview grid of multiple instances; clicking one opens `/ko-tournament/[slug]` with a one-directional bracket, match cards showing aggregate game scores, responsive + dark-mode correct.

---

### Chunk 1.1 — Tabs on the Tournament Rules page (Classical League + KO)  ·  **Size: S**
**Goal:** Turn the single-format Rules page into a **two-tab** page — **"Classical League"** and **"KO Tournament"**. The KO tab reuses the League page's exact look and section structure, with only the details adjusted for knockout play.

**Why here:** Pure static content, no backend — a natural companion to the Chunk 1 nav/UI work and independently shippable. It also gives players a place to read KO rules the moment the KO section appears in the nav.

**Current state:** [`app/rules/page.tsx`](app/rules/page.tsx) is a single static **server component** (header + TL;DR box + sectioned cards: Format, Schedule, Playing, Recording, Reporting, FIDE chess rules, Conduct, Agreement). No tabs today.

**Approach:** Extract the existing content into a `LeagueRules` component (verbatim), add a sibling `KnockoutRules` component with the same layout, and wrap both in a tab shell. **URL-driven tabs** via a search param (`/rules?format=league|ko`) so tabs are deep-linkable, SSR-friendly, and controllable from the nav; the tab bar is a small `'use client'` component that updates the param while the content stays server-rendered. Default tab = `league` when no param is present.

**Confirmed — nav integration:** the **"Rules" nav link is context-aware**: in **KO nav mode** it points to `/rules?format=ko`; in League mode it points to `/rules` (League tab). This is why URL-driven tabs (not a plain `useState` toggle) are required — the nav must be able to preselect the tab via the link.

**KO tab — sections mirrored from the League, details adjusted:**
- **Format:** single-elimination bracket (not Swiss); **each match = N games, default 2 (double round)**; winner by aggregate score; top seeds may receive Round-1 byes.
- **Scoring:** per-game 1 / 0.5 / 0; **match won on aggregate**; **tie → tiebreak** (v1: organiser decides; automated tiebreak "coming soon").
- **Schedule:** bracket rounds (Round of N → … → Final), advance-or-out; no biweekly Swiss cadence.
- **Byes:** *seeding* byes (top seeds skip Round 1) — distinct from the League's absence byes.
- **Reporting results:** **organiser/admin-entered only** — no player submission form; PGN/broadcast noted as "coming soon".
- **Reused as-is:** FIDE chess rules, Conduct & Fair Play, Agreement (identical — candidates to extract into a shared sub-component to avoid duplication).

**Files:**
- **[Edit]** `app/rules/page.tsx` — becomes the tab shell: reads the active tab (search param), renders the tab bar + the selected content component.
- **[New]** `components/rules/rules-tabs.tsx` — `'use client'` tab bar (League / KO), updates the `?format=` param and highlights the active tab.
- **[New]** `components/rules/league-rules.tsx` — the existing Rules content, extracted verbatim.
- **[New]** `components/rules/knockout-rules.tsx` — KO rules, same visual structure as the League page, details per above.
- **[New]** `components/rules/shared-chess-rules.tsx` — *optional* extraction of the identical FIDE-rules / conduct / agreement sections shared by both tabs.
- **[Edit]** `components/navigation.tsx` — make the "Rules" link context-aware: `/rules?format=ko` in KO nav mode, `/rules` otherwise. *(Coordinates with the Chunk 1 `navMode` work.)*

**Not certain about:**
- ⚠️ Exact KO rule wording (bye/tiebreak specifics) — placeholder copy until the organiser confirms; flagged for review.

**Success criteria:**
- `/rules` shows two tabs; League tab is byte-for-byte the current page; KO tab mirrors its layout with knockout details; deep-linkable via `?format=`; responsive + dark-mode correct.
- Opening "Rules" from **KO nav mode** lands on the **KO tab**; from League mode it lands on the League tab.

---

### Chunk 1.2 — Participant self-registration UI (with admin approval)  ·  **Size: M**
**Goal:** When a tournament is **open for registration** (`status = REGISTRATION`, not yet started), the public tournament page shows a **"Register"** call-to-action leading to a **registration form**. Registrations are created **pending admin approval** (approved in Chunk 4), exactly like the League. Where possible, reuse the League's registration patterns rather than reinventing them.

**Directly mirrors the League** — see the *Findings* note at the end of this doc. Reuse:
- **Form stack:** React-Hook-Form + Zod (`zodResolver`), the same field/label/error markup and success + "next steps" view as [`app/players/register/page.tsx`](app/players/register/page.tsx).
- **Approval model:** create the participant with `isApproved = false`; admin approves later (mirrors `Player.isApproved` + `POST /api/admin/players/[id]/approve`).
- **Email (optional):** non-blocking `sendEmailSafe(...)` for registrant + admin notification, mirroring the League's `lib/email.ts` calls. *(Optional for MVP; can piggyback the game-recording/email add-on.)*

**Registration gating:**
- The **"Register" CTA** renders only when `tournament.status === 'REGISTRATION'`. It disappears once `IN_PROGRESS`/`COMPLETED`. Shown on both the overview card and the `[slug]` bracket page.
- Direct visits to the register route when registration is closed show a friendly "registration is closed" state (no form).

**Two registration modes (single form, a toggle):**
1. **New participant** — free-entry fields: name, email, phone, rating (mirrors the League form, minus League-only bits like the nickname generator unless we want it).
2. **Select from an existing player** — reuse the existing [`components/SearchablePlayerDropdown.tsx`](components/SearchablePlayerDropdown.tsx) to pick a player already in the DB; selecting one **prefills name/rating and sets `KnockoutParticipant.playerId`**. *(This "select existing" capability does **not** exist in the League's own registration today — the League always creates a brand-new player — but the dropdown component and its `GET /api/players` data source already exist and are reused here.)*

**Files (this chunk = UI + validation):**
- **[New]** `app/ko-tournament/[slug]/register/page.tsx` — the registration page (gated on `REGISTRATION` status).
- **[New]** `components/ko-tournament/participant-register-form.tsx` — the form (RHF + Zod), with the new-vs-existing toggle.
- **[Reuse]** `components/SearchablePlayerDropdown.tsx` — for the "select existing player" mode (no changes expected; ⚠️ confirm the players endpoint it reads returns the pool we want — see below).
- **[Edit]** `lib/validations.ts` — add `knockoutParticipantRegistrationSchema` (new-participant fields **or** an existing `playerId`).
- **[Edit]** `components/ko-tournament/tournament-card.tsx` + `app/ko-tournament/[slug]/page.tsx` — conditionally render the "Register" CTA when status is `REGISTRATION`.

**Backend dependencies (implemented in later chunks, called out here):**
- **Chunk 3 (schema):** `KnockoutParticipant` gains registration/approval fields — `email?`, `phoneNumber?`, `isApproved` (default false), `registrationDate`, `approvedDate?` (and keeps the optional `playerId` link). See the updated model.
- **Chunk 4 (admin + endpoints):** public `POST /api/ko-tournament/[slug]/register` (creates a pending participant) **and** the admin **approval queue** (approve/reject), mirroring the League. Until these land, the MVP form can submit to a stub.

**Not certain about:**
- ⚠️ **Which "existing players" pool** to offer. The League's `GET /api/players` returns **approved, non-withdrawn players of the *active League season*** (shape `{id, firstName, nickname, lastInitial, …}`). Reusing it ties KO participants to the current League season — which overlaps the deferred **Data scope** decision. Alternative: a KO-specific players endpoint. Flagged for that decision.
- ⚠️ Whether KO registration needs the League's nickname generator / rules-accept checkbox, or a slimmer field set. Default: slimmer (name, email, phone, rating) unless requested.

**Success criteria:**
- A tournament in `REGISTRATION` shows a "Register" CTA; a started/finished one does not.
- The form validates via Zod and supports both **new participant** and **select-existing-player** modes; the latter reuses `SearchablePlayerDropdown` and captures `playerId`.
- Submissions create participants **pending approval** (once the Chunk 3/4 backend lands); nothing appears in the bracket until an admin approves.

---

### Chunk 2 — Bracket engine (pure functions, unit-tested, no DB)  ·  **Size: M**
**Goal:** Implement the deterministic bracket math in isolation: standard seeding order, next-power-of-2 padding, bye assignment to top seeds, round naming, and construction of the `nextMatchId` linked structure. Feed Chunk 1's page with *computed* fixtures instead of hardcoded ones.

**Why here:** Highest-risk logic (non-power-of-2 byes, seed ordering). Building it as pure functions makes it fully unit-testable before persistence exists, and it informs the final schema.

**✅ Implemented.** Status of each deliverable:
- `lib/ko-bracket-generator.ts` ships `computeBracketSize`, `standardSeedOrder`, `assignByes`, `assignSeeds` (RATING/RANDOM/MANUAL — not in the original file list, added because `buildBracket` needs seeded input and this is the natural place to produce it), and `buildBracket`. Pure TypeScript, zero dependencies, no Prisma/`fs`/`'use server'` imports.
- **No test runner added.** The repo has no test environment configured, and rather than introducing Vitest for one module, `scripts/ko-bracket-engine-demo.ts` (run via `npm run ko:verify-bracket-engine`, using the already-installed `tsx`) drives every exported function with explicit inputs and asserts on the outputs — 924 checks across bracket sizes 2 through 128, gamesPerRound validation, seeding methods, and third-place-match handling — printing a pass/fail summary and exiting non-zero on failure. This supersedes the originally-planned `lib/__tests__/ko-bracket-generator.test.ts`; revisit with real Vitest unit tests once a test runner is adopted repo-wide.
- `lib/ko-tournament-fixtures.ts` gained a 4th tournament ("K4 Spring Classical Knockout", 11 players) generated end-to-end by the engine — the first fixture to exercise the non-power-of-2 bye path (5 byes into a 16-slot bracket) that the three hand-authored 8-player fixtures never touched. The original three fixtures were left as-is; they encode specific hand-crafted narratives (a tiebreak, an in-progress round, a not-yet-generated bracket) not worth re-deriving through the engine.
- `app/ko-tournament/page.tsx` needed no changes — it already just maps over `koTournamentSummaries`, which picks up the new engine-generated fixture automatically.

#### Architecture — is it OK to build this "backend" logic inside the Next.js app? **Yes.**
This engine is **pure, deterministic computation with zero I/O**, and generating a bracket for ≤1024 players is microsecond-level work — there is **no CPU, scaling, or latency reason to extract a separate service**. A standalone backend would only add a network hop, another runtime/deploy, and cross-repo coordination for no benefit. The existing app already runs *all* its backend logic (approval workflows, result verification) in **Next.js API routes / server actions + Prisma** — this stays consistent with that. The correct discipline here is **layering inside the app, not splitting services**:

- **`lib/ko-bracket-generator.ts` (this chunk)** — pure functions, **no Prisma / `fs` / `'use server'`**, no I/O. Runs anywhere, unit-testable in isolation, and portable (could even run client-side for a preview — a bonus, not a requirement).
- **`lib/ko-tournament.ts` (Chunk 3)** — persistence/orchestration; imports Prisma; **server-only**.
- **API routes / server actions (Chunks 4–7)** — the HTTP boundary + admin-auth guard; the only place mutations happen.

Net: the "strictly backend" concern (persisted state, guarded mutations) is satisfied by keeping those in the server layer, while the pure math stays dependency-free and testable. **No microservice.**

#### Implementation approach & stack
**Recommended: hand-written pure TypeScript in `lib/`, no runtime dependency.** The math is small and well-understood — standard seed "fold" order, pad to next power of 2 with `BYE` placeholders opposite the top seeds, then link each match to its `nextMatch`. It's ~100–150 LOC, we fully control the output shape to match our Prisma models **and** our non-standard **multi-game aggregate scoring** (0.5-point draws), and it keeps the correctness-critical core free of dependency/licensing/maintenance risk. Tested with **Vitest**.

#### Library options (researched — optional, **not** must-haves)
Real libraries cover parts of this. None is required; noted so the choice is informed. **For Chunk 2 alone, custom wins** (small, controlled, no license/scoring friction). The one scenario where a library makes sense is an *architecture-level* decision to standardise the **whole** KO stack (render + logic + propagation) on one ecosystem — decide that during the Chunk 1 [library spike](#bracket-library-selection), not here.

| Library | Covers | License | Maint. | Fit / caveats |
|---------|--------|---------|--------|---------------|
| **`tournament-pairings`** | Bracket **generation** (single/double elim, swiss, round-robin, stepladder). Returns `{round, match, player1, player2, win?, loss?}` where `win`/`loss` point to the next match — **maps almost 1:1 onto our `nextMatch` links**. Handles byes + seeding (`ordered`). | **GPL-3.0** ⚠️ | Stale (v1.5, Jan 2023) | Closest to our `buildBracket` output. But **GPL-3.0 is copyleft** — flag for the club/app's licensing stance before adopting. ESM-only (fine). We'd still layer multi-game scoring on top. |
| **`brackets-manager.js`** (+ `brackets-viewer.js`) | The heavyweight all-in-one: generation + **automatic BYE** + inner/outer **seeding** + **result propagation** + a matching **viewer** (cross-refs Chunk 1 render *and* Chunk 5 advancement). | **MIT** ✅ | Active (v1.11.0, May 2026; 400+ commits) | Strong *if* we standardise the whole stack on it. Cost: adopt its `brackets-model` data shape + write a **Prisma storage adapter** (its `Storage` interface supports SQL). ⚠️ Its match "child games"/best-of model likely **won't express chess aggregate-with-draws** cleanly; third-place/consolation-final support for single-elim needs verifying. |

**Recommendation restated:** implement Chunk 2 as our own pure module; keep `tournament-pairings` in mind only as a generation reference/shortcut (mind the GPL), and evaluate `brackets-manager`+`brackets-viewer` **holistically** (Chunks 1/2/5) if we ever want one unified ecosystem.

**Files:**
- **[New]** `lib/ko-bracket-generator.ts` — `computeBracketSize(n)`, `standardSeedOrder(size)`, `assignByes(participants, size)`, `assignSeeds(participants, method)`, `buildBracket(participants, opts)` returning rounds + matches + `nextMatch` links + optional third-place match. Pure; no Prisma import.
- **[New]** `scripts/ko-bracket-engine-demo.ts` — explicit-input/output check harness run via `npm run ko:verify-bracket-engine` (`tsx`, already a dependency). Replaces the originally-planned Vitest unit test file since the repo has no test runner configured yet.
- **[Edit]** `package.json` — added the `ko:verify-bracket-engine` script.
- **[Edit]** `lib/ko-tournament-fixtures.ts` — added a 4th, engine-generated fixture demonstrating the non-power-of-2 bye path; the original three hand-authored fixtures were left untouched.
- `app/ko-tournament/page.tsx` — no change needed; it already consumes fixtures generically.

**Not certain about:**
- ⚠️ ~~Whether a test runner is configured~~ — resolved: no runner exists, and per explicit direction this chunk deliberately does **not** add one (Vitest or otherwise). The check-harness script is the interim substitute; swap in real unit tests if/when a runner is adopted repo-wide.
- ⚠️ If a library route is ever chosen instead of custom, **GPL-3.0** (`tournament-pairings`) vs **MIT** (`brackets-manager`) licensing must be cleared first.

**Success criteria:**
- Given any N (2..1024), engine returns a valid bracket; byes go to the top `bracketSize − N` seeds; every non-final match has a correct `nextMatchId`/slot. ✅ verified by the check harness for N ∈ {2,3,4,5,6,7,8,9,11,12,16,20,32}.
- Engine module imports no Prisma/server-only code (stays pure & portable). ✅
- `npm run ko:verify-bracket-engine` passes (924/924 checks). Real unit tests remain a TODO once a test runner is chosen for the repo.

---

### Chunk 3 — Database schema + persistence layer  ·  **Size: M**
**Goal:** Add the five `Knockout*` models (`Tournament`, `Participant`, `Round`, `Match`, `Game`) + enums and a persistence library, following the repo's strict migration workflow (`DATABASE_MIGRATIONS.md`).

**Files:**
- **[Edit]** `prisma/schema.prisma` — add `KnockoutTournament` (incl. `gamesPerRound`), `KnockoutParticipant` (**incl. the Chunk 1.2 registration/approval fields: `email?`, `phoneNumber?`, `isApproved`, `registrationDate`, `approvedDate?`**), `KnockoutRound`, `KnockoutMatch`, `KnockoutGame` + enums.
- **[New]** `prisma/migrations/<timestamp>_add_knockout_tournament/migration.sql` — generated via `npm run db:migrate:dev` (never hand-edited).
- **[New]** `lib/ko-tournament.ts` — DB service: `createTournament()`, `getTournament(slug)`, `listTournaments()`, `getBracketState(id)`, `persistBracket(engineOutput)`, plus participant helpers `registerParticipant()` / `approveParticipant()`. Bridges the pure engine (Chunk 2) to Prisma. Only **approved** participants are passed to the engine.
- **[Edit]** `prisma/seed.ts` *(or the repo's seed file)* — optional demo KO tournament for local dev. ⚠️ Exact seed filename unverified (`prisma/seed.*`).

**Not certain about:**
- ⚠️ Whether to reuse `GameResultEnum` vs a new `KnockoutResult` — leaning new (match-level winner semantics differ). Confirm during design.

**Success criteria:**
- `npm run db:migrate:dev` applies cleanly; `npx prisma generate` produces types; `npm run build` type-checks.
- `persistBracket()` round-trips engine output into the DB and back via `getBracketState()`.

---

### Chunk 4 — Admin: create tournament (settings dialog) + manage/approve participants  ·  **Size: M**
**Goal:** From the admin KO list, "**New tournament**" opens a **settings dialog (modal)** that prompts for **all settings**; on save the instance is created. Admin can then **manage and approve** its participant list — including **approving the self-registrations from Chunk 1.2**, mirroring the League's player approval. The KO analogue of the League's season/players admin.

**Files:**
- **[Edit]** `components/admin-navigation.tsx` — add "KO Tournament" nav entry (+ pending-count badge for unapproved registrations later if useful).
- **[New]** `app/admin/ko-tournament/page.tsx` — tournament **list/dashboard** with a "New tournament" button that opens the settings dialog.
- **[New]** `components/ko-tournament/create-tournament-dialog.tsx` — **settings modal**. Fields: name, `gamesPerRound` (select 1/2/4/6…, default 2), seeding method, odd-player handling, third-place toggle, manual-pairings toggle, optional `seasonId`. Two **"Coming soon"** controls rendered **disabled with a badge**: (a) **Format → Double elimination**, (b) **Enable game recording (PGN + broadcast + stats)**.
- **[New]** `app/admin/ko-tournament/[id]/page.tsx` — tournament detail (status, bracket preview, actions, edit-settings via the same dialog).
- **[New]** `app/admin/ko-tournament/[id]/participants/page.tsx` — participant management: **approve/reject pending registrations** (filter pending/approved), add/remove/seed participants (optionally import from a `Season`). Mirrors `/admin/players`.
- **[New]** `app/api/ko-tournament/[slug]/register/route.ts` — **public** `POST` for Chunk 1.2 self-registration → creates a `KnockoutParticipant` with `isApproved = false` (guarded so it only accepts submissions while `status = REGISTRATION`). Mirrors `app/api/players/register/route.ts`.
- **[New]** `app/api/admin/ko-tournament/route.ts` — `GET` list / `POST` create.
- **[New]** `app/api/admin/ko-tournament/[id]/route.ts` — `GET` / `PATCH` / `DELETE`.
- **[New]** `app/api/admin/ko-tournament/[id]/participants/route.ts` — participant CRUD (admin add/remove/seed).
- **[New]** `app/api/admin/ko-tournament/[id]/participants/[participantId]/approve/route.ts` — **approve** a pending registration (`isApproved = true`, `approvedDate = now`, optional approval email). Mirrors `app/api/admin/players/[id]/approve/route.ts`.
- **[Edit]** `lib/validations.ts` — Zod schemas: `knockoutTournamentSchema` (incl. `gamesPerRound` restricted to 1 or even numbers), `knockoutParticipantSchema` (admin add).

**Reuse:** admin auth guard pattern from `app/admin/layout.tsx`; the League's **player approval flow** (`isApproved`/`approvedDate` + approve endpoint + approval email) applied to `KnockoutParticipant`; React-Hook-Form + Zod modal pattern; `SearchablePlayerDropdown` if importing from a Season.

**Success criteria:**
- "New tournament" opens the settings dialog; saving creates an instance that appears in the list; `gamesPerRound` validates to {1, 2, 4, 6, …}; Coming-soon controls are visibly disabled.
- Public registration creates a **pending** participant only while `status = REGISTRATION`; the admin can **approve/reject**; only **approved** participants are eligible for seeding/bracket generation (Chunk 7).
- All admin endpoints enforce the existing admin session check; the public register endpoint is unauthenticated but status-gated and rate-limited/validated.

---

### Chunk 5 — Admin: enter per-game results + advance winners  ·  **Size: M**
**Goal:** Admin enters the **result of each game** in a match (`gamesPerRound` of them); the system computes the aggregate score, determines the winner, and advances them to the linked `nextMatch`. **Admin-panel only** — no public/user result entry.

**Scope note:** v1 records per-game outcomes only (`GameOutcome` = `P1_WIN`/`P2_WIN`/`DRAW`) → aggregate `score1`/`score2` → match `winnerId`. No PGN, no board number, no broadcast (those columns stay null). On a **tied aggregate**, the admin explicitly picks the advancer (`decidedByTiebreak = true`, optional `tiebreakNote`).

**Files:**
- **[New]** `app/admin/ko-tournament/[id]/results/page.tsx` — list matches; for each, a row of `gamesPerRound` game pickers (P1/P2/Draw); shows the running aggregate; prompts for a manual advancer only when tied.
- **[New]** `app/api/admin/ko-tournament/[id]/matches/route.ts` — `GET` matches with their games (admin-guarded).
- **[New]** `app/api/admin/ko-tournament/[id]/matches/[matchId]/route.ts` — `PATCH` per-game results → recompute aggregate, set `winnerId`, propagate to `nextMatchId`/`nextMatchSlot`, mark loser eliminated, complete the round when all its matches are done. Admin session required.
- **[Edit]** `lib/ko-tournament.ts` — `recordGameResults()` (writes `KnockoutGame` rows), `computeAggregate()`, `advanceWinner()` — all in one transaction so scoring + advancement are atomic.
- **[Edit]** `lib/validations.ts` — `knockoutMatchResultSchema` (array of per-game outcomes sized to `gamesPerRound`; requires an explicit advancer when tied).

**Reuse:** admin session guard from `app/admin/layout.tsx`. *(PGN/name-formatting reuse via `lib/pgn-processor.ts` / `lib/player-utils.ts` is intentionally deferred to the game-recording feature — not part of v1.)*

**Not certain about:**
- ⚠️ Whether to auto-verify or keep a two-step submit→verify like the League. Default: single admin entry = authoritative (no separate verify step for MVP).
- ⚠️ Score storage as `Float` (0.5 increments) vs integer half-points — confirm at implementation; `Float` is simpler to display.

**Success criteria:**
- All result endpoints reject non-admin sessions; there is no public write path.
- Entering all games computes the correct aggregate; a decisive aggregate auto-sets the winner; a tie forces a manual advancer; the winner advances into the correct downstream slot; completing a semifinal populates the final (and third-place match if enabled); loser flagged eliminated. All wrapped in a transaction.

---

### Chunk 6 — Public live overview + bracket (wire real data)  ·  **Size: S–M**
**Goal:** Replace static fixtures with live DB data. The **overview** lists all tournament instances; each bracket reflects results as the admin enters them. Both pages are strictly **read-only** — display only, no result entry, no PGN.

**Files:**
- **[Edit]** `app/ko-tournament/page.tsx` — fetch and list **all** tournament instances (grouped active / completed).
- **[Edit]** `app/ko-tournament/[slug]/page.tsx` — wire the single-tournament bracket to live data (created static in Chunk 1).
- **[Edit]** `components/ko-tournament/bracket-tree.tsx` — accept real bracket-state props (already type-compatible from Chunk 1).
- **[New]** `app/api/ko-tournament/route.ts` — public list of instances.
- **[New]** `app/api/ko-tournament/[slug]/bracket/route.ts` — public read-only bracket-state endpoint (incl. per-game scores).

**Success criteria:**
- `/ko-tournament` lists live instances; each bracket reflects live data; upcoming matches show "TBD"; completed matches show **aggregate score + highlighted winner** (with a tiebreak marker when applicable); final centered; third-place match rendered when present.

---

### Chunk 7 — Auto-pairing generation + manual override UI  ·  **Size: M**
**Goal:** One-click bracket generation from the seeded participant list (via the Chunk 2 engine), plus a manual override UI for admins to reassign Round-1 pairings before publishing.

**Files:**
- **[New]** `app/admin/ko-tournament/[id]/pairings/page.tsx` — review generated bracket; drag/drop or select-to-swap Round-1 participants; publish.
- **[New]** `app/api/admin/ko-tournament/[id]/generate-bracket/route.ts` — run engine + `persistBracket()`.
- **[Edit]** `app/api/admin/ko-tournament/[id]/matches/[matchId]/route.ts` — allow pre-publish participant reassignment when `allowManualPairings` is true.
- **[Edit]** `lib/ko-tournament.ts` — `regenerateBracket()`, `swapParticipants()` guarded to pre-start only.

**Not certain about:**
- ⚠️ Drag-and-drop library choice — recommend **@dnd-kit/core** (modern, accessible, React 19-friendly) over adding a heavier dependency; a simpler select-based swap is the no-new-dependency fallback.

**Success criteria:**
- Admin generates a bracket in one click; can swap seeds/pairings before the tournament starts; overrides persist and re-render in the tree; locked once `IN_PROGRESS`.

---

## Chunk dependency graph

```
Chunk 1 (UI, static) ─┐
                      ├─> Chunk 6 (public live) ─┐
Chunk 2 (engine) ─────┤                          │
        │             └─> Chunk 7 (pairings UI)  │
        v                      ^                  │
Chunk 3 (schema) ─> Chunk 4 (admin create) ─> Chunk 5 (results/advance)

Chunk 1.1 (Rules tabs) — standalone, no dependencies
Chunk 1.2 (registration UI) ─> backend wired by Chunk 3 (fields) + Chunk 4 (endpoints + approval)
```
Chunks 1, 1.1 and 2 are independent and can proceed in parallel. Chunk 1.1 (static Rules content) has no dependency on anything else. Chunk 1.2 ships the registration **UI** early, but its persistence + admin approval depend on Chunk 3 (participant fields) and Chunk 4 (public register endpoint + approval queue). Everything from Chunk 4 on depends on Chunk 3.

---

## Recommended Tech Stack

Stay within the existing stack (Next.js 15 App Router, React 19, TailwindCSS 4, Prisma + PostgreSQL, NextAuth, Zod, React-Hook-Form). Additions, with justification:

| Need | Recommendation | Why / alternative |
|------|----------------|-------------------|
| **Bracket render** | **Third-party library (one-directional)**, chosen via the Chunk-1 compatibility spike | Don't hand-roll a standard bracket — connector routing is solved. Candidates + gates in [Bracket Library Selection](#bracket-library-selection). **Fallback:** custom CSS/SVG component (one-directional or center-converging butterfly) if no library passes. |
| **Bracket math** | Plain TypeScript in `lib/` | Pure, testable, no dependency. |
| **Unit tests** | **Vitest** (if no runner exists) | Zero-config with the current toolchain; fast. ⚠️ Confirm no Jest is already wired first. |
| **Manual pairing DnD** | **@dnd-kit/core** (Chunk 7 only) | Accessible, React 19-compatible; fallback is a dependency-free select-swap. |
| **Email (optional add-on)** | **Reuse** `lib/email.ts` | No new deps; consistency with the League. |
| **PGN / broadcast / stats (Coming soon)** | **Reuse** `lib/pgn-processor.ts`, `lib/pgn-file-service.ts`, `scripts/generate-stats.js`, `components/stats/*` when built | **Not in v1.** A single bundled feature (game recording → broadcast → stats). Wiring described in the Game Recording & Broadcast section. |
| **Charts (used by the stats bundle)** | **recharts** (already a dependency) | Already used across `components/stats/*`. |

**Explicitly avoid for now:** `react-flow`/xyflow (overkill for a static tree until interactivity grows) — but a purpose-built tournament-bracket library is now *preferred* over a custom tree (see below).

### Bracket Library Selection

**Recommendation:** use a purpose-built bracket library and render our own match card into it, rather than hand-rolling the tree. **Selection is gated by a compatibility check (Chunk 1, Step 0) — do not adopt a library that fails any gate.**

**Compatibility gates (all must pass):**
1. **React 19.1.0** — installs and runs; record any `--legacy-peer-deps` / `overrides` needed. Most bracket libs predate React 19, so this is the highest-risk gate.
2. **Custom match/seed component** — the library must let us fully render our card (two seeds, per-game aggregate score like `1.5–0.5`, highlighted winner, tiebreak badge). A library that only takes plain strings fails.
3. **Tailwind 4 dark mode** — our styling must win; the library's own CSS/theme must not fight it.
4. **Mobile behaviour acceptable** — a one-directional bracket is wide; horizontal scroll on phones is expected — confirm it degrades sanely (this app is mobile-first).

**Candidates to evaluate (verify current React 19 support at implementation — do not assume):**
- `react-brackets` — small, simple, custom `seedComponent`; lightest footprint.
- `@g-loot/react-tournament-brackets` — richer (single + double elim, SVG viewer, custom `Match`); heavier, styled-components based.
- `brackets-viewer.js` — the render half of the **`brackets-manager`** ecosystem (see the [Chunk 2 library options](#chunk-2--bracket-engine-pure-functions-unit-tested-no-db)). Not React (imperative/DOM), so it wraps awkwardly in React 19 — but worth a look **only if** we decide to standardise render **+** logic **+** result propagation on that one ecosystem. Otherwise skip.
- (Shortlist may change — pick by the gates above, not by popularity.)

**Fallback if none passes:** build the custom `bracket-tree.tsx` (CSS grid/flex cards + SVG connector overlay). At that point the **center-converging butterfly** layout becomes viable again (it is just two mirrored one-directional halves with the final between them) and is the more mobile-compact option — revisit it there. Record which path was taken and why.

---

## Recommended Claude Model per Chunk

Match model capability to chunk difficulty. (Latest available: **Opus 4.8** — most capable; **Sonnet 5** — strong general coding; **Haiku 4.5** — fast/cheap for mechanical edits.)

| Chunk | Recommended model | Reasoning |
|-------|-------------------|-----------|
| 1 — Nav + MVP bracket | **Opus 4.8** | The library compatibility spike + hub/bracket layout is the trickiest foundational UI; get it right. |
| 2 — Bracket engine | **Opus 4.8** | Algorithmic core (seeding + byes); correctness-critical, worth top model + tests. |
| 3 — Schema + persistence | **Sonnet 5** (Opus 4.8 for the schema design pass) | Migrations are mechanical once the model is agreed; use Opus to finalise the schema, Sonnet to wire it. |
| 4 — Admin create/participants | **Sonnet 5** | CRUD + forms following established patterns. |
| 5 — Results + advancement | **Opus 4.8** | Winner-propagation + transaction logic has real correctness risk. |
| 6 — Public live bracket | **Sonnet 5** | Mostly wiring existing components to real data. |
| 7 — Pairings + override UI | **Opus 4.8** | DnD + pre-publish invariants are fiddly and easy to get subtly wrong. |
| Nav copy / trivial edits | **Haiku 4.5** | Fast, cheap, low-risk mechanical changes. |

Rule of thumb: **Opus for algorithm/correctness/novel-layout chunks, Sonnet for pattern-following CRUD/UI, Haiku for trivial edits.**

---

## Optional Features / Add-ons

Deliberately **out of the core MVP path**; each is independently shippable after the core chunks land.

1. **[Coming soon] Game recording + Lichess broadcast + statistics** — the headline deferred feature (one bundle: enter PGN → broadcast on Lichess → generate KO stats); gated by the `enableGameRecording` create toggle. Fully specified in [Game Recording & Broadcast — Coming Soon](#game-recording--broadcast--coming-soon).
2. **[Coming soon] Double elimination** — winners + losers brackets; offered (disabled) at create time. Larger effort; the `nextMatchId` model extends to a `nextMatchLoserId` for the drop-down path.
3. **[Add-on] Public self-registration for KO** — players sign up for a KO tournament with admin approval, reusing the League's registration + approval workflow and (optionally) the shared player pool via `KnockoutParticipant.playerId` / `seasonId`. *Resolves the deferred "data scope" decision.*
4. **[Add-on] Inline result entry in the admin bracket** — click a match **within the admin bracket** to open the winner picker, instead of the separate admin results page (Chunk 5). *Admin-only; not exposed publicly.*
5. **[Add-on] Email notifications for KO** — reuse `lib/email.ts` (Postmark) to notify participants of pairings, results, and advancement.
6. **[Coming soon — part of #1] KO statistics** — reuse the stats system (`scripts/generate-stats.js`, `components/stats/*`) for per-match analysis, biggest upsets, Cinderella runs, seed-vs-result trends. Requires game-level PGN, so it ships **together with** the game-recording bundle (#1).
7. **[Add-on] Automated tiebreak for tied matches** — replace v1's manual advancer pick with rapid/blitz/Armageddon playoff handling (multi-game matches themselves are already core via `gamesPerRound`).
8. **[Add-on] Bracket export & share** — export the bracket tree as PNG/SVG and provide an embeddable/shareable public link.
9. **[Add-on] Seed from League final standings** — auto-import the top N finishers of a completed `Season` as seeded participants.
10. **[Add-on] Player-facing "my next match" view (read-only)** — let participants see their upcoming opponent and the bracket. **View only — result entry stays admin-only** per the v1 decision.

---

## Game Recording & Broadcast — Coming Soon

**Not part of v1.** v1 records match results (per-game outcomes → aggregate winner) only. This is a **single bundled feature — game recording → Lichess broadcast → statistics** — documented here so the schema and create form are forward-compatible today and enabling it later is a **non-breaking, additive** change.

**Surfaced now:**
- Create form shows an **"Enable game recording (PGN + broadcast + stats)"** toggle, rendered **disabled with a "Coming soon" badge**.
- `KnockoutTournament.enableGameRecording` (default `false`) and `KnockoutGame.pgn` / `KnockoutGame.boardNumber` columns already exist but are unused — so turning the feature on later needs **no migration**. (Per-game PGN lives on `KnockoutGame`, one row per game of the multi-game match.)

**When built, it will:**
1. When `enableGameRecording` is true, the admin result form gains an optional **PGN field per game** (each of the `gamesPerRound` games; still admin-entered).
2. Normalise PGN by **reusing `lib/pgn-processor.ts`** (`buildStandardPGN`, `formatResult`, `extractMoves`) and `lib/player-utils.ts` for player naming — exactly as `app/api/results/route.ts` does for the League.
3. Assign `boardNumber` and generate a combined per-round PGN via **`lib/pgn-file-service.ts`**, enabling a **Lichess broadcast** for the KO event (mirrors the League's broadcast setup).
4. **Generate KO statistics** by reusing `scripts/generate-stats.js` and `components/stats/*` (per-match analysis, biggest upsets, seed-vs-result trends) — this is the third part of the bundle, unlocked once game PGN exists.

**Why deferred:** it adds meaningful surface area (PGN validation, broadcast file generation, stats pipeline, storage) with no benefit to the core "who advances" goal. Keeping v1 results-only ships the multi-instance hub and bracket faster and de-risks the visualisation and pairing work first.

---

## Double Elimination — Coming Soon

**Not part of v1.** Single elimination only. Double elimination is surfaced as a **disabled "Coming soon"** choice in the create form's **Format** field, and `DOUBLE_ELIMINATION` exists in the `KnockoutFormat` enum so no migration is required to enable it.

**When built, it will** add a **losers bracket**: each `KnockoutMatch` gains a `nextMatchLoserId` (+ slot) so a first loss drops a participant into the losers side rather than eliminating them; a grand final joins the two bracket winners. The bracket renderer (library or fallback) will need a second (losers) tier — a notable UI extension, hence its deferral.

---

## Risks & Open Points

- **Bracket library compatibility** — the chosen library must pass the Chunk-1 gates (React 19, custom cards, Tailwind dark mode). Highest risk is React 19 peer-deps on older libs; mitigated by spiking it first with static data and keeping a custom fallback.
- **One-directional mobile width** — a L→R bracket is wide and will scroll horizontally on phones; accepted trade for using a library. The custom butterfly fallback is more compact if this proves unacceptable.
- **Non-power-of-2 seeding correctness** — mitigated by the pure, unit-tested engine (Chunk 2) before any DB coupling.
- **Test runner assumption** — Vitest is assumed; must confirm the repo has no existing runner before Chunk 2.
- **Model/enum naming vs Prisma** — `Knockout*` names not yet checked against reserved words; verify at Chunk 3.
- **Seed file name** — `prisma/seed.*` exact path unverified.
- **Shared player pool** — intentionally deferred; nullable `playerId`/`seasonId` keep the door open without a future migration.
- **Tied multi-game matches** — with `gamesPerRound ≥ 2` a match can tie; v1 requires a manual admin advancer. Automated tiebreaks are an add-on. Confirm the manual-pick UX is acceptable.
- **Score precision** — `Float` (0.5 increments) assumed for aggregate scores; verify vs integer half-points at Chunk 3.

---

## Conventions to Follow (from repo docs)

- **Migrations:** `npm run db:migrate:dev` to create, never hand-edit migrations, never `db:push` in prod (`DATABASE_MIGRATIONS.md`).
- **Build gate:** run `npm run build` before any push to `main` (per `CLAUDE.md`).
- **Never run `npm run dev`** — the user runs it in a separate terminal.
- **Commit messages:** concise, no AI attribution (per `CLAUDE.md`).
- **Push target:** `fork` remote (per user preference), not `origin`, unless told otherwise.
- **Mobile-first Tailwind**, dark-mode throughout, Swiss date formatting (`de-CH`) to match the rest of the app.

---

## Suggested Delivery Order (recap)

1. **Chunk 1** — Nav switcher + multi-instance overview + MVP bracket (library spike, static) → *reviewable demo*
1.1 **Chunk 1.1** — Tabs on the Rules page (League + KO), static content → *shippable independently*
1.2 **Chunk 1.2** — Participant self-registration UI + "select existing player" (backend wired in Chunk 3/4)
2. **Chunk 2** — Bracket engine + tests → *proven pairing math* → **done (check harness)**
3. **Chunk 3** — Schema + persistence (incl. `KnockoutGame`, `gamesPerRound`, participant approval fields) → *data foundation*
4. **Chunk 4** — Admin create (settings dialog) + manage/**approve** participants + public register endpoint
5. **Chunk 5** — Admin per-game results + aggregate scoring + winner advancement
6. **Chunk 6** — Public live overview + bracket
7. **Chunk 7** — Auto-pairing + manual override
8. **Add-ons** — as prioritised (game-recording/broadcast/stats bundle, double elim, …)

*End of plan. No code has been written; this document is the deliverable.*
