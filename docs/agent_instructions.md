# agent_instructions.md — Tierra de Agricultores AI

## I. VISIÓN DEL PROYECTO

El objetivo: **Crear una aplicación para que los invitados de un baby shower puedan seleccionar el o los regalos que le quieren dar a la bebé.**

---

## II. ARQUITECTURA HEXAGONAL

### A. Estructura de capas

```
agent_instructions/
├── src/
│   ├── domain/                          # La lógica pura, sin dependencias
│   │   ├── schemas.py                   # AIProvider enum, ChatRequest, ChatResponse
│   │   └── interfaces.py (opcional)     # IModelAdapter si lo necesitas
│   │
│   ├── services/                        # Orquestación, sin detalles técnicos
│   │
│   └── infrastructure/                  # Detalles técnicos, integraciones
├── .agent/skills/                       # Skills para el editor de código
├── main.py                              # Entrypoint FastAPI
├── requirements.txt                     # Dependencias con versiones fijas
├── vercel.json                          # Configuración de despliegue
├── .env.example                         # Template de variables de entorno
└── .gitignore                           # Excluir .env, __pycache__, etc.
```

### B. Regla de oro: flujo descendente

```
domain/ (lógica pura, sin frameworks)
    ↓ importa desde
services/ (orquestación, sin detalles técnicos)
    ↓ importa desde
infrastructure/ (detalles, adaptadores, factory)

NUNCA invertir este flujo. Si domain/ sabe de FastAPI o Gemini, violaste la arquitectura.
```

---

## III. PYTHON — ESTÁNDARES DE CÓDIGO

### A. Type hints obligatorios en TODO

Toda función, variable de ciclo, parámetro, retorno **DEBE** tener type hint.

```python
# ✓ CORRECTO
def chat(
    pregunta: str,
    provider: str,
    historial: list[dict] | None = None
) -> dict[str, str]:
    """Procesa una pregunta y retorna la respuesta."""
    respuesta: str = ""
    tokens_usados: int = 0
    return {"respuesta": respuesta, "tokens": tokens_usados}

# ✗ INCORRECTO: faltan type hints
def chat(pregunta, provider, historial=None):
    respuesta = ""
    return {"respuesta": respuesta}
```

### B. Pydantic v2 para schemas

Toda entrada/salida de API **DEBE** ser un schema Pydantic.

### C. Try/except explícito — nunca `except: pass`

Siempre especifica la excepción y manejala explícitamente.

### D. Naming conventions

- **Constantes:** Mayúscula sostenida usando snakecase
- **Clases:** Pascalcase
- **Funciones:** snakecase
- **Variables privadas:** `_variables`

### E. Imports organizados

```python
# 1. Estándar library
import os
import logging
from pathlib import Path
from enum import Enum

# 2. Terceros
from pydantic import BaseModel
import google.generativeai as genai

# 3. Local
from domain.schemas import AIProvider, ChatRequest
from infrastructure.context_loader import ContextLoader
```

---

## VII. SEGURIDAD — SIN EXCEPCIONES

### A. NUNCA hardcodear API keys

```python
# ✗ PROHIBIDO
GOOGLE_API_KEY = "AIza..."
openai_key = "sk-..."

# ✓ CORRECTO
import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY no está configurada en .env")
```

### B. Rutas SIEMPRE relativas a la raíz del proyecto

```python
from pathlib import Path

# ✓ CORRECTO
skills_path = Path("skills/asistente-tienda.md")
knowledge_path = Path("knowledge/productos.md")

# ✗ INCORRECTO
skills_path = Path("/home/usuario/proyecto/skills/...")  # Absoluta
skills_path = Path("../../../skills/...")  # Confusa
```

### C. .env SIEMPRE en .gitignore

```bash
# .gitignore
.env
.env.local
*.key
*.pem
__pycache__/
*.pyc
.venv/
```

### D. Validación de entrada con Pydantic

```python
from pydantic import BaseModel, Field, validator

class ChatRequest(BaseModel):
    pregunta: str = Field(..., min_length=1, max_length=500)
    provider: str = Field(default="gemini")

    @validator('provider')
    def validate_provider(cls, v):
        valid = ["gemini", "openai", "claude", "deepseek", "langchain"]
        if v not in valid:
            raise ValueError(f"Provider inválido: {v}")
        return v
```

---

## VIII. DESPLIEGUE — VERCEL

### A. Entrypoint: main.py expone `app`

Vercel **NO** ejecuta `python main.py`. Busca la variable `app` directamente.

```python
# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Tierra de Agricultores AI")

# CORS para frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok"}

@app.post("/chat")
async def chat(request: ChatRequest) -> ChatResponse:
    pass

# ✗ NUNCA hagas esto:
# if __name__ == "__main__":
#     uvicorn.run(app)  # Vercel no lo ejecuta
```

### B. requirements.txt con versiones explícitas

```bash
# Usar: pip freeze > requirements.txt
fastapi==0.104.1
pydantic==2.5.0
pydantic-settings==2.1.0
google-genai==0.3.0
langchain-core==0.1.20
langchain-google-genai==0.0.10
python-dotenv==1.0.0
uvicorn==0.24.0
```

### C. vercel.json

```json
{
  "buildCommand": "pip install -r requirements.txt",
  "outputDirectory": ".",
  "env": {
    "GOOGLE_API_KEY": "@google_api_key"
  }
}
```

### D. Desplegar

```bash
npm i -g vercel
vercel login
vercel --prod

# Luego en Vercel dashboard:
# Settings → Environment Variables
# Añadir GOOGLE_API_KEY
```

---

## XI. CHECKLIST ANTES DE CADA COMMIT

Antes de hacer `git commit`, verifica:

- [ ] **Type hints:** Toda función tiene type hints
- [ ] **Pydantic:** Schemas en BaseModel
- [ ] **Try/except:** Excepciones específicas, sin `except: pass`
- [ ] **Factory:** Modelos vía Factory, no imports directos
- [ ] **System prompt:** Desde `skills/*.md`, no hardcodeado
- [ ] **Knowledge:** Desde `knowledge/*.md`, inyectado en cada petición
- [ ] **Sin secrets:** No hay API keys en código
- [ ] **Rutas:** Todas relativas (`Path("...")`)
- [ ] **`.env`:** Está en `.gitignore`
- [ ] **`requirements.txt`:** Actualizado con `pip freeze`
- [ ] **Estructura:** Carpetas respetadas, no creadas nuevas sin consultar
- [ ] **main.py:** Expone `app`, no tiene `if __name__`
- [ ] **Tests:** Si modificas lógica crítica, prueba localmente

---

## XII. TROUBLESHOOTING

### "No puedo importar mi módulo"

```python
# ✗ Esto falla
from infrastructure.gemini_adapter import GeminiAdapter

# ✓ Asegúrate de tener __init__.py
src/__init__.py
src/domain/__init__.py
src/services/__init__.py
src/infrastructure/__init__.py
```

### "El ContextLoader no encuentra los archivos"

```python
# ✓ Corre desde la raíz
cd tierra-agricultores-ai
python main.py

# ✗ NO desde dentro de src/
cd tierra-agricultores-ai/src
python main.py  # Falla: no encuentra knowledge/
```

### "Vercel dice que no encuentra main.py"

```json
// vercel.json debe estar en la RAIZ, no en src/
{
  "buildCommand": "pip install -r requirements.txt",
  "outputDirectory": "."
}
```

---

Sigue estas Rules y:

- ✓ Tu código será profesional
- ✓ El agente aprenderá a programar como un senior
- ✓ Los estudiantes entenderán arquitectura real
- ✓ Podrás cambiar de proveedor en 1 línea
- ✓ Desplegarás en Vercel sin sorpresas.
