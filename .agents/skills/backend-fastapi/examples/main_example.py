"""
Ejemplo de main.py completo.
Muestra el wiring de dependencias con FastAPI Depends()
y los dos endpoints: sin historial y con historial.
"""
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.domain.schemas import ChatRequest, ChatResponse
from src.services.chat_service import ChatService
from src.infrastructure.context_loader import ContextLoader

app = FastAPI(
    title="Asistente IA — Tierra de Agricultores",
    version="1.0.0",
    description="API que responde preguntas sobre la plataforma usando IA",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ─── Wiring de dependencias ───────────────────────────────────────────────────
# Este es el único lugar donde se instancian las dependencias.
# Patrón: los endpoints reciben el servicio ya configurado.

def get_chat_service() -> ChatService:
    """Inyecta el ChatService con el contexto cargado desde archivos .md"""
    context = ContextLoader().load_full_context()
    return ChatService(context=context)


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/")
async def health() -> dict:
    return {"status": "ok", "message": "Asistente IA de Tierra de Agricultores"}


@app.post("/chat", response_model=ChatResponse)
async def chat_simple(
    request: ChatRequest,
    service: ChatService = Depends(get_chat_service),
) -> ChatResponse:
    """
    Endpoint simple: recibe una pregunta y un proveedor de IA.
    No mantiene historial de conversación.

    Body:
        pregunta: La pregunta del usuario
        provider: "gemini" | "openai" | "claude" | "deepseek"
    """
    try:
        return service.respond(request)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.post("/chat/con-historial", response_model=ChatResponse)
async def chat_con_historial(
    request: ChatRequest,
    service: ChatService = Depends(get_chat_service),
) -> ChatResponse:
    """
    Endpoint con memoria: recibe la pregunta + historial previo.
    El historial debe enviarse en cada request (stateless).

    Body:
        pregunta: La pregunta actual del usuario
        provider: "gemini" | "openai" | "claude" | "deepseek"
        historial: Lista de mensajes previos [{role, content}]

    Ejemplo:
        {
            "pregunta": "¿Y cuánto cuesta el primero?",
            "provider": "gemini",
            "historial": [
                {"role": "user", "content": "¿Qué frutas tienen?"},
                {"role": "assistant", "content": "Tenemos pomelo..."}
            ]
        }
    """
    try:
        return service.respond(request)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
