from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.tasks import router as tasks_router

app = FastAPI(title="md-linear", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks_router, prefix="/api")
