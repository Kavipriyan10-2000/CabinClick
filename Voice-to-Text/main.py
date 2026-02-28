from fastapi import FastAPI
from passenger import router as passenger_router
from crew import router as crew_router
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="CabinFlow Backend")

# Include routers with prefixes
app.include_router(passenger_router, prefix="/passenger", tags=["Passenger"])
app.include_router(crew_router, prefix="/crew", tags=["Crew"])

@app.get("/")
async def root():
    return {"message": "Welcome to CabinFlow API"}