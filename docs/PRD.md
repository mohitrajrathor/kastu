# PRD — English Communication Voice Agent

**Version:** 1.0  
**Author:** Billy  
**Status:** Final Draft  
**Last Updated:** 2026-09-28  

---

## 1. Executive Summary

An AI-powered voice agent that helps non-native English speakers build spoken confidence through real-time, personalised practice. The system listens to user speech, responds conversationally via a voice agent, and simultaneously surfaces grammar correction suggestions on-screen — without interrupting the flow of conversation. Built as a single Docker container (React + FastAPI), deployed locally first, cloud later.

**Day 1 objective:** Ship a working voice conversation loop with real-time on-screen grammar correction and user authentication. Everything else is V1 or later.

---

## 2. Problem Statement

Non-native English speakers lack a patient, always-available practice partner. Existing tools:
- Correct mistakes after the fact, not in the moment.
- Treat vocabulary as isolated flashcards, disconnected from speaking.
- Offer generic conversation practice with no personalisation.

**Cost of inaction:** Stagnant fluency, low interview confidence, no measurable progress signal.

---

## 3. Goals *(measurable only)*

| Goal | Target |
|------|--------|
| End-to-end voice latency (speech in → audio out) | < 3s |
| Grammar suggestion card visible on screen | < 2s after user finishes speaking |
| Auth round-trip (register/login) | < 500ms |
| Session state survives page refresh | Within 30-minute JWT window |
| Grammar error log written to DynamoDB per utterance | 100% of utterances |

---

## 4. Success Metrics

| Metric | How Measured |
|--------|-------------|
| Voice loop stability | Zero dropped WebSocket connections in a 10-min session |
| STT accuracy | Whisper transcript matches spoken input (manual spot-check) |
| Suggestion relevance | Grammar card shows a real correction, not a false positive |
| Auth security | bcrypt hash verified, JWT expiry enforced |
| DynamoDB write success rate | > 99% per session |

---

## 5. Stakeholders

| Role | Person | Responsibility |
|------|--------|---------------|
| PM + Engineer | Billy | All decisions, implementation |
| QA | Billy | Manual testing per acceptance criteria |

---

## 6. User Personas

**Primary — Non-native English learner (Billy)**
- Goal: Build spoken confidence, practice without embarrassment.
- Pain: Loses conversational thread, grammar mistakes go unnoticed in real time.
- Technical level: Comfortable with web apps, not a developer.
- Session behaviour: 10–20 min sessions, topic-scoped conversations.

---

## 7. User Stories

All 9 stories captured from requirements. **Day 1 delivers US-1 and US-4.** The rest are V1/V2.

| # | Story | Release |
|---|-------|---------|
| US-1 | As a learner, I want to talk with a voice agent on a topic at my own pace so I feel confident practising. | **Day 1** |
| US-4 | As a learner, I want real-time grammar and structure corrections shown on screen while I speak so I can self-correct immediately. | **Day 1** |
| US-2 | As a learner, I want to learn new vocabulary and see past words in new contexts so I retain them better. | V1 |
| US-3 | As a learner, I want the voice agent to use the same vocabulary from my last vocab session during conversation. | V1 |
| US-5 | As a learner, I want rephrasing suggestions and a natural opportunity to use the phrase in ongoing conversation. | V1 |
| US-7 | As a learner, I want to track my progress through KPIs and analytics. | V1 |
| US-6 | As a learner, I want to practice for job interviews with a research-backed realistic scenario. | V2 |
| US-8 | As a learner, I want a short focused lesson on my weak areas before starting a new practice channel. | V2 |
| US-9 | As a learner, I want the agent to keep me focused when I lose context mid-conversation. | V2 |

---

## 8. Functional Requirements

### ✅ F-0: Authentication (Day 1)

**Description:** Email + password auth. Roll your own — no Cognito. Credentials stored in DynamoDB. JWT issued on login, required on all protected routes and WebSocket connections.

**Inputs / Outputs:**

| Endpoint | Input | Output |
|----------|-------|--------|
| `POST /auth/register` | `{email, password}` | `{userId, token}` or `400` |
| `POST /auth/login` | `{email, password}` | `{token, expiresIn}` or `401` |
| `POST /auth/logout` | `Authorization: Bearer <token>` | `200` |

**Acceptance Criteria:**
- Password hashed with bcrypt (cost factor ≥ 12) before DynamoDB write. Raw password never stored.
- JWT expiry: 30 minutes. No refresh token in Day 1.
- Duplicate email on register returns `400 Email already exists`.
- Invalid credentials on login return `401` with no detail about which field is wrong.
- All non-auth routes return `401` if token missing or expired.
- WebSocket connection rejected if token invalid.

---

### ✅ F-1: Voice Conversation Loop (Day 1)

**Description:** User speaks into browser microphone. Audio is streamed via WebSocket to FastAPI backend. Groq Whisper transcribes it. LangChain agent (Groq OSS 120B) generates a response. AWS Polly Neural synthesises audio. Audio returned to browser and played back.

**Pipeline:**

```
Browser mic (audio chunks)
    │ WebSocket binary frames
    ▼
FastAPI WebSocket handler
    │ raw audio bytes
    ▼
Groq Whisper (STT)
    │ transcript text
    ├─────────────────────────────────────┐
    ▼                                     ▼
Main Agent Chain (async)          Suggestion Chain (async)
Groq OSS 120B                     Groq OSS 20B (no thinking)
LangChain + last 6 turns memory   grammar + correction JSON
    │                                     │
    ▼                                     ▼
AWS Polly Neural (TTS)            WebSocket → suggestion card (React)
    │ audio bytes
    ▼
WebSocket → browser audio playback
```

**Session context injected into main agent system prompt:**
- Topic selected at session start
- User's name and current level (stored in DynamoDB)
- Last 6 turns (`ConversationBufferWindowMemory`)
- Instruction to keep responses concise (Polly cost optimisation)
- Instruction to match user's pace and complexity level

**Inputs / Outputs:**

| Direction | Type | Content |
|-----------|------|---------|
| Client → Server | WebSocket binary | Audio chunks (PCM/WebM) |
| Client → Server | WebSocket JSON | `{type: "session_start", topic, userId}` |
| Server → Client | WebSocket binary | TTS audio bytes |
| Server → Client | WebSocket JSON | `{type: "suggestion", original, corrected, errorType}` |
| Server → Client | WebSocket JSON | `{type: "transcript", text}` (echo for display) |

**Acceptance Criteria:**
- End-to-end latency (mic release → audio playback starts) < 3s on local network.
- Agent response is topically relevant to the selected topic.
- Agent does not respond until user stops speaking (VAD or silence detection).
- Polly audio streams back as chunks, playback begins before full synthesis completes.
- WebSocket connection persists for full session without manual reconnect.
- Connection dropped → client retries automatically up to 3 times.

---

### ✅ F-4: Real-Time Grammar Correction — On-Screen (Day 1)

**Description:** Parallel to the main agent call, the Whisper transcript is sent to a separate, smaller LLM (Groq OSS 20B, no thinking mode) which returns grammar corrections as structured JSON. React renders these as non-blocking suggestion cards on screen. No audio output — purely visual.

**Suggestion chain prompt contract:**

Input: raw user transcript text.  
Output (JSON only, no prose):
```json
{
  "has_errors": true,
  "corrections": [
    {
      "original": "I am go to the market",
      "corrected": "I am going to the market",
      "error_type": "verb_form",
      "explanation": "Use present continuous 'going' after 'am'."
    }
  ]
}
```

**Acceptance Criteria:**
- Suggestion card visible on screen < 2s after user finishes speaking.
- If `has_errors: false`, no card is shown. No false positives surfaced to user.
- Card shows: original phrase (strikethrough) → corrected phrase + one-line explanation.
- Card is dismissible. Does not block conversation UI.
- Agent does not verbally reference the correction — screen only.
- Suggestion LLM model configurable via `SUGGESTION_MODEL` env var, default `groq-oss-20b`.

---

## 9. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Voice loop latency | < 3s end-to-end |
| Suggestion card latency | < 2s from utterance end |
| Auth response time | < 500ms |
| DynamoDB write latency | < 100ms per record |
| No raw audio stored | Audio processed in memory only, never written to disk or DB |
| Session transcripts encrypted at rest | DynamoDB encryption at rest (default AWS managed key) |
| JWT secret in environment variable | Never hardcoded |
| Docker image size | < 800MB (multi-stage build) |
| Cold start (local Docker) | < 5s to ready |

---

## 10. System Scope

### Day 1 — In Scope
- User registration and login (email + password, bcrypt + JWT)
- Voice conversation loop (Whisper → Groq 120B → Polly → browser)
- Real-time grammar correction cards on screen (Groq 20B parallel chain)
- WebSocket session management
- DynamoDB writes: users table, sessions table, grammar errors table
- Single Docker container (React static files served by FastAPI)
- Local deployment only

### V1 — Out of Scope for Day 1
- Vocabulary module (F-2, F-3)
- Rephrasing suggestions (F-5)
- Progress dashboard (F-7)
- JWT refresh tokens
- Cloud deployment

### V2 — Out of Scope for V1
- Interview simulation (F-6)
- Shortcoming lessons (F-8)
- Context-keeping guardrail (F-9)
- Mobile app
- SM-2 spaced repetition
- Multi-language support

---

## 11. User Journey (Day 1)

```
Land on app
    │
    ▼
Register / Login (email + password)
    │  JWT issued
    ▼
Dashboard — select topic for conversation session
    │
    ▼
Session starts → WebSocket connection opened
    │
    ▼
User speaks into mic
    │  audio → WebSocket
    ▼
Whisper transcribes → transcript shown on screen
    │
    ├──────────────────────────────────┐
    ▼                                  ▼
Main agent generates response    Suggestion chain checks grammar
    │                                  │
    ▼                                  ▼
Polly TTS → audio plays         Correction card appears on screen
    │                            (user reads, dismisses, self-corrects)
    ▼
Agent turn ends → user speaks again
    │
    ▼  (loop)
    │
User ends session → WebSocket closes → session record written to DynamoDB
```

---

## 12. Business Rules

1. Raw audio is never persisted — processed in memory, discarded after STT.
2. Passwords are never stored in plain text — bcrypt only.
3. Suggestion cards are screen-only — the main agent never verbally references a grammar correction.
4. JWT is required on every WebSocket connection open — unauthenticated connections are rejected immediately.
5. Main agent response must be concise — system prompt instructs ≤ 3 sentences per turn to control Polly cost.
6. Static phrases (session greetings, transition phrases) are cached as pre-synthesised Polly audio — not re-synthesised per session.
7. Suggestion model is swappable via env var — never hardcoded in business logic.

---

## 13. Data Requirements

### DynamoDB Tables (multi-table design)

**`users`**
| Attribute | Type | Notes |
|-----------|------|-------|
| `userId` (PK) | String (UUID) | Partition key |
| `email` | String | Unique, GSI |
| `passwordHash` | String | bcrypt hash |
| `createdAt` | String (ISO) | |
| `lastLoginAt` | String (ISO) | |

**`sessions`**
| Attribute | Type | Notes |
|-----------|------|-------|
| `userId` (PK) | String | Partition key |
| `sessionId#startedAt` (SK) | String | Sort key — enables time-range queries |
| `mode` | String | `conversation` / `vocab` / `interview` |
| `topic` | String | |
| `durationSeconds` | Number | |
| `turnCount` | Number | |

**`grammar_errors`**
| Attribute | Type | Notes |
|-----------|------|-------|
| `userId` (PK) | String | Partition key |
| `timestamp` (SK) | String (ISO) | Sort key |
| `sessionId` | String | |
| `original` | String | User's utterance |
| `corrected` | String | Suggested correction |
| `errorType` | String | e.g. `verb_form`, `article`, `preposition` |

**`websocket_connections`** *(in-memory / TTL-based)*
| Attribute | Type | Notes |
|-----------|------|-------|
| `connectionId` (PK) | String | Partition key |
| `userId` | String | |
| `connectedAt` | String (ISO) | |
| `ttl` | Number | Unix epoch + 1800s (auto-expire) |

### Retention Policy

| Data | Retention |
|------|-----------|
| User records | Indefinite |
| Session records | 1 year |
| Grammar error logs | 90 days |
| Raw audio | Never stored |
| Transcripts | Never stored (errors logged, not full transcripts) |

---

## 14. API Requirements

### Auth Endpoints

**`POST /auth/register`**
- Input: `{email: string, password: string}`
- Output (201): `{userId: string, token: string}`
- Errors: `400 Email already exists`, `422 Validation error`

**`POST /auth/login`**
- Input: `{email: string, password: string}`
- Output (200): `{token: string, expiresIn: 1800}`
- Errors: `401 Invalid credentials`

**`POST /auth/logout`**
- Input: `Authorization: Bearer <token>`
- Output (200): `{message: "logged out"}`
- Errors: `401 Unauthorized`

### WebSocket Endpoint

**`WS /ws/{userId}`**
- Auth: `?token=<jwt>` query param on connect
- Reject immediately if token invalid or expired → close code `4001`

**Client → Server message types:**

```json
// Session control
{"type": "session_start", "topic": "technology", "sessionId": "uuid"}
{"type": "session_end", "sessionId": "uuid"}

// Audio (binary frame — PCM 16kHz mono)
<binary audio chunk>
```

**Server → Client message types:**

```json
// Transcript echo
{"type": "transcript", "text": "I am go to the market", "isFinal": true}

// Grammar suggestion
{"type": "suggestion", "corrections": [...], "sessionId": "uuid"}

// Agent response text (before TTS)
{"type": "agent_text", "text": "That's interesting! Tell me more.", "sessionId": "uuid"}

// TTS audio (binary frame)
<binary audio chunk>

// Error
{"type": "error", "code": "STT_FAILED", "message": "..."}
```

### Session Endpoints

**`POST /session/start`**
- Input: `{userId, mode, topic}`
- Output: `{sessionId, startedAt}`

**`POST /session/end`**
- Input: `{sessionId}`
- Output: `{durationSeconds, turnCount}`

---

## 15. Architecture Overview

### Container Structure

Single Docker container, multi-stage build:

```
Stage 1 (node:20-alpine)       Stage 2 (python:3.11-slim)
  npm install                    pip install requirements
  npm run build                  COPY --from=stage1 /app/dist ./static
  → /app/dist (static files)     uvicorn main:app
```

FastAPI serves React static files from `/static` at root (`/`).  
All API routes under `/api/*`.  
WebSocket at `/ws/{userId}`.

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│  Docker Container                                        │
│                                                         │
│  ┌──────────────┐        ┌──────────────────────────┐  │
│  │ React (static│        │ FastAPI                  │  │
│  │ files served │◄───────│ - Auth routes            │  │
│  │ by FastAPI)  │        │ - WebSocket handler      │  │
│  └──────────────┘        │ - Session routes         │  │
│                          │ - Static file mount      │  │
│                          └──────────┬───────────────┘  │
└─────────────────────────────────────│───────────────────┘
                                      │
              ┌───────────────────────┼────────────────────┐
              ▼                       ▼                     ▼
      Groq Whisper API        Groq OSS 120B API      Groq OSS 20B API
      (STT)                   (main agent)            (suggestion chain)
                                      │
                              AWS Polly Neural
                              (TTS)
                                      │
                              AWS DynamoDB
                              (users, sessions,
                               grammar_errors,
                               ws_connections)
```

### Environment Variables

```env
# Groq
GROQ_API_KEY=
MAIN_MODEL=groq-oss-120b
SUGGESTION_MODEL=groq-oss-20b

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
DYNAMODB_TABLE_USERS=users
DYNAMODB_TABLE_SESSIONS=sessions
DYNAMODB_TABLE_GRAMMAR_ERRORS=grammar_errors
DYNAMODB_TABLE_WS_CONNECTIONS=websocket_connections
POLLY_VOICE_ID=Kajal          # Neural voice

# Auth
JWT_SECRET=
JWT_EXPIRY_SECONDS=1800
BCRYPT_COST=12
```

---

## 16. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Groq API rate limit hit during sustained voice session | High — breaks voice loop | Request queue + exponential backoff; surface friendly error to user |
| Polly cost exceeds free tier (1M chars/month) | Medium | Concise system prompt (≤ 3 sentences/turn); cache static phrases as pre-synthesised audio |
| STT error causes garbage correction card | Medium | Confidence threshold check; suppress suggestion card if Whisper confidence < 0.75 |
| Parallel LLM calls spike Groq quota usage | Medium | Suggestion chain uses 20B model, ~6x fewer tokens than 120B |
| WebSocket drops mid-session | Medium | Auto-reconnect (3 retries, exponential backoff); session state restored from DynamoDB |
| bcrypt slow on cold start under load | Low | Pre-warm bcrypt on container start; async hash via `asyncio.run_in_executor` |
| DynamoDB cold read on session start | Low | DynamoDB on-demand mode; no provisioned throughput to manage |

---

## 17. Assumptions & Dependencies

### Assumptions
- User has a working microphone and uses a Chromium-based browser (Web Audio API compatibility).
- Groq free tier is sufficient for MVP usage volume.
- AWS Polly Neural free tier (1M chars/month, 12 months) covers MVP testing.
- DynamoDB free tier (25 GB, 25 RCU/WCU) is sufficient for MVP.
- Local Docker environment has internet access to reach Groq and AWS APIs.

### Dependencies

| Dependency | Purpose | Fallback |
|------------|---------|----------|
| Groq API (Whisper) | STT | None — critical path |
| Groq API (OSS 120B) | Main agent | None — critical path |
| Groq API (OSS 20B) | Suggestion chain | Degrade gracefully — skip cards |
| AWS Polly Neural | TTS | Browser Web Speech API (lower quality fallback) |
| AWS DynamoDB | All persistence | None — required for auth |
| LangChain | Agent orchestration, memory | None |

---

## 18. Release Plan

### Day 1 — MVP (current sprint)
**Must-have. Ship nothing until all three work end-to-end.**

- [ ] F-0: Auth — register, login, logout, JWT middleware
- [ ] F-1: Voice conversation loop — Whisper → Groq 120B → Polly → browser
- [ ] F-4: Real-time grammar correction cards — parallel Groq 20B chain → WebSocket → React
- [ ] DynamoDB: users, sessions, grammar_errors, ws_connections tables
- [ ] Docker multi-stage build — React + FastAPI single container
- [ ] `.env` config for all external services

### V1 — Post Day 1
- F-2 + F-3: Vocabulary module + vocab-in-conversation bridge
- F-5: Rephrasing suggestions + practice loop
- F-7: Progress dashboard (grammar error rate, session frequency)
- JWT refresh tokens
- Fixed-interval spaced repetition for vocab
- Cloud deployment (EKS or Railway)

### V2 — Future
- F-6: Interview simulation with web search tool
- F-8: Shortcoming lesson gate
- F-9: Context-keeping guardrail
- SM-2 spaced repetition upgrade
- Mobile app
- Multi-language support

---

## 19. Acceptance Criteria — Project Level

Day 1 is done when all of the following pass:

| # | Criterion | Verified By |
|---|-----------|-------------|
| AC-1 | User registers with email + password; login returns JWT | Manual test |
| AC-2 | Protected route returns 401 without valid JWT | Manual test |
| AC-3 | WebSocket connection rejected if JWT missing | Manual test |
| AC-4 | User speaks → transcript appears on screen → agent responds in audio < 3s | Stopwatch test |
| AC-5 | Grammar error in speech → correction card visible on screen < 2s | Stopwatch test |
| AC-6 | Grammatically correct speech → no correction card shown | Manual test |
| AC-7 | Session record written to DynamoDB on session end | DynamoDB console |
| AC-8 | Grammar error written to DynamoDB per utterance with error | DynamoDB console |
| AC-9 | `docker build` succeeds; `docker run` serves app at `localhost:8000` | Shell test |
| AC-10 | Changing `SUGGESTION_MODEL` env var changes model used — no code change needed | Log inspection |

