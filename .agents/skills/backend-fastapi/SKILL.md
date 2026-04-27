---
name: backend-fastapi
description: >
  Build Python FastAPI backends that integrate AI models (Gemini, OpenAI, Claude, DeepSeek).
  Use this skill when creating endpoints, services, adapters, factories, or any backend
  code for AI-powered applications. Activates on: "create endpoint", "build backend",
  "add service", "implement adapter", "connect AI model", "FastAPI", "Python backend".
compatibility: Python 3.13+, FastAPI, uv, Vercel serverless, google-genai, openai, anthropic
metadata:
  author: Herramientas para el desarrollo de aplicaciones con IA
  version: "1.0"
  course: Especialización — Universidad del Magdalena
---

# Backend FastAPI with AI — Development Skill

## Goal

Generate production-quality Python backends that integrate AI models following
**Hexagonal Architecture**, **SOLID principles**, and **Factory + Dependency Injection**
patterns. Code must be deployable on Vercel as serverless functions.

See `references/REFERENCE.md` for detailed architecture and examples.
See `examples/` for concrete implementations of adapters and factory.

---

## Architecture: The 3-Layer Model

```
┌─ HTTP Layer       (FastAPI routes — dispatch only, zero business logic)
│
├─ Service Layer    (Business logic — orchestrates adapters via Protocol)
│
└─ Infrastructure   (AI adapters, context loader — all external I/O)
     ↑
     └─ ModelFactory creates adapters — callers NEVER import concrete classes
```

**Key rule**: Upper layers depend on `AIModelProtocol`, never on `GeminiAdapter`.
Switching from Gemini to OpenAI = change ONE line in the request body.

---

## File Structure (always generate this layout)

```
project/
├── .agent/skills/backend-fastapi/   ← This skill
├── knowledge/                        ← RAG: domain knowledge (.md files)
├── skills/                           ← AI behavior (system prompt .md files)
├── src/
│   ├── domain/
│   │   └── schemas.py                ← Pydantic models + AIProvider enum
│   ├── services/
│   │   └── chat_service.py           ← Business logic (no AI lib imports)
│   └── infrastructure/
│       ├── model_protocol.py         ← AIModelProtocol (Protocol class)
│       ├── model_factory.py          ← Factory function (single wiring point)
│       ├── gemini_adapter.py
│       ├── openai_adapter.py
│       ├── claude_adapter.py
│       ├── deepseek_adapter.py
│       └── context_loader.py         ← Reads .md files (RAG)
├── main.py                           ← FastAPI app (MUST be named `app`)
├── requirements.txt
├── vercel.json
└── .env.example
```

---

## The AIProvider Enum (strict — no magic strings)

```python
# src/domain/schemas.py
from enum import StrEnum
from pydantic import BaseModel

class AIProvider(StrEnum):
    GEMINI   = "gemini"
    OPENAI   = "openai"
    CLAUDE   = "claude"
    DEEPSEEK = "deepseek"

class ChatRequest(BaseModel):
    provider: AIProvider      # Validated automatically — typos become 422 errors
    message: str
    max_tokens: int = 500

class ChatResponse(BaseModel):
    response: str
    provider: str
```

---

## Factory + Dependency Injection (SOLID Principle D)

```python
# src/infrastructure/model_factory.py
from src.domain.schemas import AIProvider
from src.infrastructure.model_protocol import AIModelProtocol

def create_model(provider: AIProvider) -> AIModelProtocol:
    """Single wiring point. Callers never import concrete adapters."""
    match provider:
        case AIProvider.GEMINI:
            from src.infrastructure.gemini_adapter import GeminiAdapter
            return GeminiAdapter()
        case AIProvider.OPENAI:
            from src.infrastructure.openai_adapter import OpenAIAdapter
            return OpenAIAdapter()
        case AIProvider.CLAUDE:
            from src.infrastructure.claude_adapter import ClaudeAdapter
            return ClaudeAdapter()
        case AIProvider.DEEPSEEK:
            from src.infrastructure.deepseek_adapter import DeepSeekAdapter
            return DeepSeekAdapter()
        case _:
            raise ValueError(f"Unknown provider: {provider}")
```

---

## Code Standards (non-negotiable)

- **Type hints** on every function parameter and return value
- **Pydantic** for all request/response bodies — never raw dicts
- **try/except** around every API call with descriptive error messages
- **dotenv** for all secrets — never hardcode API keys
- **Google-style docstrings** on every public function
- **Conventional Commits**: `feat(chat): add history endpoint`

---

## Vercel Deployment

```json
{
  "version": 2,
  "builds": [{ "src": "main.py", "use": "@vercel/python" }],
  "routes": [{ "src": "/(.*)", "dest": "main.py" }],
  "functions": {
    "main.py": {
      "maxDuration": 30,
      "excludeFiles": "{tests/**,.agent/**,**/*.test.py}"
    }
  }
}
```

The `app` variable in `main.py` MUST be the FastAPI instance.
Files in `knowledge/` and `skills/` are auto-bundled by Vercel.
