import json
from functools import lru_cache
from typing import Any

from app.core.config import get_settings
from app.schemas.request_management import PassengerVoiceRequestResponse


VOICE_REQUEST_PROMPT = """
You are an airline cabin service assistant.
Interpret the passenger's spoken request and respond with a single JSON object.

Requirements:
- Keep `passenger_message` in the same language used by the passenger.
- Use `source_language` as either `en` or `de`.
- Use `category` as one of these onboard request codes only:
  `water`, `tea`, `coffee`, `juice`, `soft_drink`, `alcoholic_beverage`, `snack`, `meal`, `baby_food`, `warm_milk`, `blanket`, `pillow`, `headphones`, `eye_mask`, `earplugs`, `napkins`, `tissues`, `trash_collection`, `spill_cleanup`, `seat_issue`, `tray_issue`, `overhead_bin_issue`, `usb_charger_help`, `motion_sickness_bag`, `feeling_unwell`, `medication`, `emergency_assistance`.
- Create `action_items` as an array of objects with:
  - `item`: passenger-facing item name in the passenger's language
  - `quantity`: integer, default 1
  - `notes`: optional passenger-language note
  - `normalized_item`: one of the allowed onboard request codes above
- Create `crew_summary` in English for the crew workflow.
- Keep `metadata` as a flat JSON object with extra useful context only when justified.
- Keep any extra passenger custom wording in `passenger_message` or `notes`, but do not invent request codes outside the allowed list.

Return only JSON with this shape:
{
  "category": "water",
  "source_language": "de",
  "passenger_message": "Zwei Wasser, bitte.",
  "crew_summary": "Seat requested 2 waters.",
  "action_items": [
    {
      "item": "Wasser",
      "quantity": 2,
      "notes": null,
      "normalized_item": "water"
    }
  ],
  "metadata": {}
}
""".strip()


CREW_TRANSLATION_PROMPT = """
You localize cabin crew instructions.
Translate the provided JSON into the requested crew language.

Requirements:
- Preserve operational meaning exactly.
- Return a single JSON object with `title`, `instruction_text`, and `language`.
- Keep seat numbers, counts, and item names precise.
- If the requested language is already the same as the input language, return the text unchanged.

Return only JSON.
""".strip()


def _clean_json_response(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()


@lru_cache
def _get_gemini_model() -> Any:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    try:
        import google.generativeai as genai
    except ImportError as exc:
        raise RuntimeError(
            "google-generativeai is not installed. Add it to requirements.txt."
        ) from exc

    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(settings.gemini_model)


def interpret_passenger_audio(
    *,
    audio_bytes: bytes,
    mime_type: str,
    source_language_hint: str | None = None,
) -> PassengerVoiceRequestResponse:
    payload: list[Any] = [VOICE_REQUEST_PROMPT]
    if source_language_hint:
        payload.append(
            f"Passenger language hint: {source_language_hint}. Use it when consistent with the audio."
        )
    payload.append(
        {
            "mime_type": mime_type,
            "data": audio_bytes,
        }
    )

    response = _get_gemini_model().generate_content(payload)
    parsed = json.loads(_clean_json_response(response.text))
    return PassengerVoiceRequestResponse.model_validate(parsed)


def localize_instruction_for_crew(
    *,
    title: str,
    instruction_text: str,
    target_language: str | None,
    source_language: str | None = "en",
) -> tuple[str, str, str | None]:
    if not target_language:
        return title, instruction_text, source_language

    normalized_target = target_language.strip().lower()
    normalized_source = (source_language or "").strip().lower()
    if normalized_target == normalized_source:
        return title, instruction_text, normalized_source or source_language

    response = _get_gemini_model().generate_content(
        [
            CREW_TRANSLATION_PROMPT,
            json.dumps(
                {
                    "target_language": normalized_target,
                    "source_language": normalized_source or source_language,
                    "title": title,
                    "instruction_text": instruction_text,
                }
            ),
        ]
    )
    parsed = json.loads(_clean_json_response(response.text))
    return (
        parsed["title"],
        parsed["instruction_text"],
        parsed.get("language", normalized_target),
    )


def localize_text_for_crew(
    *,
    text: str,
    target_language: str | None,
    source_language: str | None = "en",
) -> tuple[str, str | None]:
    if not target_language:
        return text, source_language

    normalized_target = target_language.strip().lower()
    normalized_source = (source_language or "").strip().lower()
    if normalized_target == normalized_source:
        return text, normalized_source or source_language

    response = _get_gemini_model().generate_content(
        [
            "Translate the following cabin-service text and return only JSON with keys `text` and `language`.",
            json.dumps(
                {
                    "target_language": normalized_target,
                    "source_language": normalized_source or source_language,
                    "text": text,
                }
            ),
        ]
    )
    parsed = json.loads(_clean_json_response(response.text))
    return parsed["text"], parsed.get("language", normalized_target)
