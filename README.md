# kastu

> AI-powered spoken English voice agent and real-time on-screen grammar assistant.

**kastu** pairs Indian English learners with a patient, natural voice conversational partner. It implements a dual-output architecture:
- **Audio Conversation**: Natural voice responses generated via Amazon Bedrock (Nova Pro) and spoken via AWS Polly Neural (`Kajal` voice) without interrupting speech with verbal corrections.
- **On-Screen Grammar Guidance**: Real-time, non-blocking visual feedback cards that highlight phrasing errors with corrected forms and explanations.

---

## Architecture & Specs

| Layer | Technologies & Services | Details |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS v4, Lucide React | Single-page application, Web Audio API (16kHz PCM capture & chunked audio playback), HTML5 Canvas waveform visualization |
| **Backend** | FastAPI, WebSockets, Uvicorn, LangGraph | Async turn coordinator, session state machine, JWT authentication (`HS256`, 30m TTL) |
| **ASR** | Amazon Transcribe Streaming | Live bi-directional WebSocket audio streaming (`en-IN`, 16,000 Hz, 16-bit mono PCM) |
| **LLM & Safety** | Amazon Bedrock (Amazon Nova Pro), Bedrock Guardrails | Model ID: `apac.amazon.nova-pro-v1:0` (ap-south-1). Structured JSON generation for conversational replies and grammar suggestions |
| **TTS** | AWS Polly Neural | Neural engine, Voice: `Kajal` (bilingual Indian English / Hindi accent) |
| **Database** | Amazon DynamoDB | Tables: `users`, `sessions`, `grammar_errors`, `websocket_connections` |

---

## Prerequisites

- **Python** >= 3.13 and [`uv`](https://github.com/astral-sh/uv)
- **Node.js** >= 20 and `npm`
- **AWS Account** with permissions for Amazon Bedrock, Transcribe, Polly, and DynamoDB in `ap-south-1`
- **Docker** *(optional, for containerized run)*

---

## Environment Configuration

Create a `.env` file in the project root:

```bash
cp example.env .env
```

Fill in your AWS credentials and configuration:

```env
# AWS Credentials
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=ap-south-1

# AI Services
BEDROCK_MODEL_ID=apac.amazon.nova-pro-v1:0
TRANSCRIBE_LANGUAGE_CODE=en-IN
TTS_VOICE_ID=Kajal

# Security
JWT_SECRET=your-random-secret-key-32-chars-minimum

# Testing & Dev Account (auto-seeded at startup)
DEV_USER_EMAIL=dev@kastu.ai
DEV_USER_PASSWORD=Password123!
AUTO_SEED_DEV_USER=true
```

---

## Local Development Setup

### 1. Backend

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API and OpenAPI docs will be available at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend development server will run at `http://localhost:5173`.

---

## Containerized Deployment (Docker)

The multi-stage `Dockerfile` compiles the frontend into static assets and serves both the API and the React UI from a single port (`8000`):

```bash
# Build the Docker image
docker build -t kastu:latest .

# Run the container
docker run -p 8000:8000 --env-file .env kastu:latest
```

Open `http://localhost:8000` in your browser.

---

## Developer Test Account

On application startup, the backend automatically provisions an active developer test account:
- **Email**: `dev@kastu.ai`
- **Password**: `Password123!`

The frontend sign-in modal comes pre-filled with these credentials for instant 1-click testing.

---

## Running Tests

### Backend (pytest & mypy)
```bash
cd backend
uv run pytest
uv run mypy app
```

### Frontend (vitest & build)
```bash
cd frontend
npm run test
npm run build
```