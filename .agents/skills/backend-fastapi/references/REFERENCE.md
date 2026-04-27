# Backend FastAPI + AI — Architecture Reference

## The Protocol (Dependency Inversion)

```python
# src/infrastructure/model_protocol.py
from typing import Protocol

class AIModelProtocol(Protocol):
    def chat(self, system: str, user_message: str) -> str: ...
    def chat_with_history(self, system: str, history: list[dict[str, str]], user_message: str) -> str: ...
```

## Gemini Adapter (free tier — use in class)

```python
# src/infrastructure/gemini_adapter.py
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

class GeminiAdapter:
    DEFAULT_MODEL = "gemini-2.5-flash"

    def __init__(self) -> None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set.")
        self.client = genai.Client(api_key=api_key)
        self._model = self._resolve_model()

    def _resolve_model(self) -> str:
        try:
            available = [
                getattr(m, "name", "")
                for m in self.client.models.list()
                if "generateContent" in getattr(m, "supported_actions", [])
            ]
            preferred = f"models/{self.DEFAULT_MODEL}"
            if preferred in available:
                return preferred
            for fallback in ["models/gemini-2.0-flash", "models/gemini-1.5-flash"]:
                if fallback in available:
                    return fallback
            return available[0] if available else self.DEFAULT_MODEL
        except Exception:
            return self.DEFAULT_MODEL

    def chat(self, system: str, user_message: str) -> str:
        try:
            response = self.client.models.generate_content(
                model=self._model,
                contents=user_message,
                config=types.GenerateContentConfig(system_instruction=system),
            )
            return response.text or ""
        except Exception as e:
            raise RuntimeError(f"Gemini API error: {e}") from e

    def chat_with_history(self, system: str, history: list[dict[str, str]], user_message: str) -> str:
        try:
            contents: list[types.Content] = []
            for msg in history:
                role = "model" if msg["role"] == "assistant" else "user"
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg["content"])]))
            contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_message)]))
            response = self.client.models.generate_content(
                model=self._model,
                contents=contents,
                config=types.GenerateContentConfig(system_instruction=system),
            )
            return response.text or ""
        except Exception as e:
            raise RuntimeError(f"Gemini API error (history): {e}") from e
```

## DeepSeek Adapter (same lib as OpenAI)

```python
# src/infrastructure/deepseek_adapter.py
import os
from dotenv import load_dotenv
from openai import OpenAI  # Same library — only base_url changes

load_dotenv()

class DeepSeekAdapter:
    DEFAULT_MODEL = "deepseek-chat"

    def __init__(self, model: str = DEFAULT_MODEL) -> None:
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            raise ValueError("DEEPSEEK_API_KEY is not set.")
        self.client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
        self.model = model

    def chat(self, system: str, user_message: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": system}, {"role": "user", "content": user_message}],
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            raise RuntimeError(f"DeepSeek API error: {e}") from e

    def chat_with_history(self, system: str, history: list[dict[str, str]], user_message: str) -> str:
        try:
            messages = [{"role": "system", "content": system}, *history, {"role": "user", "content": user_message}]
            response = self.client.chat.completions.create(model=self.model, messages=messages)
            return response.choices[0].message.content or ""
        except Exception as e:
            raise RuntimeError(f"DeepSeek API error (history): {e}") from e
```

## RAG Context Loader

```python
# src/infrastructure/context_loader.py
from pathlib import Path

def load_knowledge(folder: str = "knowledge") -> str:
    path = Path(folder)
    if not path.exists():
        return ""
    contents = []
    for md_file in sorted(path.glob("*.md")):
        content = md_file.read_text(encoding="utf-8")
        contents.append(f"## {md_file.stem}\n\n{content}")
    return "\n\n---\n\n".join(contents)

def load_skill(skill_file: str) -> str:
    path = Path(skill_file)
    return path.read_text(encoding="utf-8") if path.exists() else ""

def build_system_prompt(skill_file: str, knowledge_folder: str = "knowledge") -> str:
    skill = load_skill(skill_file)
    knowledge = load_knowledge(knowledge_folder)
    if knowledge:
        return f"{skill}\n\n---\n\n## Conocimiento disponible:\n\n{knowledge}"
    return skill
```

---

## LangChain vs Implementación manual — tabla comparativa

| Concepto              | A mano (nuestros adaptadores)           | Con LangChain                        |
|-----------------------|-----------------------------------------|--------------------------------------|
| Construir mensajes    | Array manual de dicts/objects           | `ChatPromptTemplate.from_messages()` |
| Inyectar historial    | Loop manual sobre la lista              | `MessagesPlaceholder`                |
| Llamar al modelo      | `client.models.generate_content(...)`   | `ChatGoogleGenerativeAI(...)`        |
| Encadenar pasos       | Código imperativo paso a paso           | `prompt | llm | parser` (LCEL)       |
| Extraer texto         | `response.text` o `response.choices[0]`| `StrOutputParser()`                  |
| Cambiar de proveedor  | Cambiar adaptador en el Factory         | Cambiar `ChatGoogleGenerativeAI` por `ChatOpenAI` |

## LangChain — Adaptador completo con LCEL

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI

# 1. Definir el template con variables
prompt = ChatPromptTemplate.from_messages([
    ("system", "{system_prompt}"),
    MessagesPlaceholder(variable_name="historial", optional=True),
    ("human", "{pregunta}"),
])

# 2. Configurar el modelo
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.3)

# 3. LCEL: encadenar prompt → modelo → parser
chain = prompt | llm | StrOutputParser()

# 4. Invocar
respuesta = chain.invoke({
    "system_prompt": "Eres un asistente...",
    "historial": [],         # HumanMessage / AIMessage
    "pregunta": "¿Qué frutas tienen?",
})
```

## Por qué LangChain importa más allá de la sintaxis

LangChain no es solo azúcar sintáctico. Su valor real está en:

**Estandarización**: El mismo código funciona con OpenAI, Anthropic, Gemini,
Mistral, etc. Solo cambia la clase del modelo. El `ChatPromptTemplate` y el
`StrOutputParser` quedan exactamente iguales.

**Composición**: LCEL permite encadenar pasos complejos de forma declarativa.
En producción se usan chains más largas:
```
prompt | llm | parser | validator | formatter
```

**Observabilidad**: LangSmith (la plataforma de monitoreo de LangChain)
traza automáticamente cada paso del chain — tokens, latencia, errores —
algo que a mano requeriría instrumentar cada llamada individualmente.

**Ecosistema**: LangChain tiene integraciones con vectorstores (Pinecone,
ChromaDB, FAISS) para RAG completo, retrievers, document loaders y más.
Lo que construimos a mano en `context_loader.py` es el paso 1 de un
pipeline que LangChain puede extender sin reescribir la arquitectura.
