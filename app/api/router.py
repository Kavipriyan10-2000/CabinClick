from fastapi import APIRouter

from app.api.routes.broadcasts import router as broadcasts_router
from app.api.routes.crew_operations import router as crew_operations_router
from app.api.routes.health import router as health_router
from app.api.routes.passenger_access import router as passenger_access_router
from app.api.routes.passenger_requests import router as passenger_requests_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(passenger_access_router)
api_router.include_router(passenger_requests_router)
api_router.include_router(broadcasts_router)
api_router.include_router(crew_operations_router)
