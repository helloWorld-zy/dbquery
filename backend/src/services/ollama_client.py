from __future__ import annotations

from typing import Any

import httpx

from ..utils.settings import get_settings


class OllamaClient:
    def __init__(self, base_url: str | None = None, model_name: str | None = None) -> None:
        settings = get_settings()
        self._base_url = base_url or settings.ollama_base_url
        self._model_name = model_name or settings.ollama_model_name

    async def generate_sql(self, prompt: str) -> str:
        payload: dict[str, Any] = {
            "model": self._model_name,
            "prompt": prompt,
            "stream": False,
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(f"{self._base_url}/api/generate", json=payload)
            response.raise_for_status()
            data = response.json()
            return str(data.get("response", "")).strip()
