import os
from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Supabase setup
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    pass
else:
    supabase: Client = create_client(supabase_url, supabase_key)

@router.get("/requests")
async def get_requests():
    try:
        res = supabase.table("requests").select("*").eq("status", "submitted").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/request/{id}/delivered")
async def mark_as_delivered(id: str):
    try:
        res = supabase.table("requests").update({"status": "delivered"}).eq("id", id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Request not found")
        return {"status": "success", "message": f"Request {id} marked as delivered"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
