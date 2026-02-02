from __future__ import annotations

from openai import AsyncOpenAI

from ..utils.logging import get_logger
from ..utils.settings import get_settings


_logger = get_logger(__name__)


class ModelScopeClient:
    def __init__(
        self,
        base_url: str | None = None,
        api_key: str | None = None,
        model_name: str | None = None,
    ) -> None:
        settings = get_settings()
        base_url = (base_url or settings.modelscope_base_url).rstrip("/")
        api_key = api_key or settings.modelscope_api_key
        self._model_name = model_name or settings.modelscope_model_name
        if not api_key:
            _logger.warning(
                "ModelScope API key is not set. Configure MODELSCOPE_API_KEY or MODELSCOPE_SDK_TOKEN."
            )
        self._client = AsyncOpenAI(base_url=base_url, api_key=api_key)

    async def generate_sql(self, prompt: str) -> str:
        response = await self._client.chat.completions.create(
            model=self._model_name,
            messages=[
                {"role": "system", "content": "You generate SQL only."},
                {"role": "user", "content": prompt},
            ],
            stream=False,
        )
        choices = response.choices or []
        if not choices:
            return ""
        message = choices[0].message
        return str(message.content or "").strip()
