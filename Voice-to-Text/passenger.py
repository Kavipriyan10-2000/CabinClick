import os
import json
from fastapi import APIRouter, UploadFile, File, Query, HTTPException
import google.generativeai as genai
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Supabase setup
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    # In a real app, we'd want to ensure these are set
    pass
else:
    supabase: Client = create_client(supabase_url, supabase_key)

# Gemini setup
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# Using gemini-3-flash-preview as per platform guidelines (1.5-flash is deprecated)
model = genai.GenerativeModel("gemini-3-flash-preview")

SYSTEM_PROMPT = """
You are an airline cabin service assistant. 
Process the provided audio request from a passenger.
Extract the items they are requesting.
Return the result as a JSON array of objects, where each object has:
- "item": The name of the item (e.g., "water", "blanket").
- "quantity": The number of items requested (default to 1 if not specified).

Only return the JSON array. Do not include any other text or markdown blocks.
"""

@router.post("/voice-request")
async def voice_request(
    seat_number: str = Query(...),
    audio: UploadFile = File(...)
):
    if not seat_number:
        raise HTTPException(status_code=400, detail="seat_number is required")
    
    try:
        # Read audio content
        audio_content = await audio.read()
        
        # Call Gemini
        response = model.generate_content([
            SYSTEM_PROMPT,
            {
                "mime_type": audio.content_type or "audio/webm",
                "data": audio_content
            }
        ])
        
        # Parse JSON response
        try:
            text = response.text.strip()
            # Basic cleaning of potential markdown
            if text.startswith("```json"):
                text = text[7:-3].strip()
            elif text.startswith("```"):
                text = text[3:-3].strip()
            
            items = json.loads(text)
        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse Gemini response: {str(e)}")

        # Store in Supabase
        stored_items = []
        for item_data in items:
            request_data = {
                "seat_number": seat_number,
                "item": item_data.get("item"),
                "quantity": item_data.get("quantity", 1),
                "status": "submitted"
            }
            
            try:
                res = supabase.table("requests").insert(request_data).execute()
                if hasattr(res, 'data') and res.data:
                    stored_items.append(res.data[0])
            except Exception as supabase_err:
                print(f"Supabase error: {supabase_err}")
                # Continue processing other items or handle as needed

        return {"status": "success", "items": stored_items}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
