from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from home import router as home_router
from climate import router as climate_router
from alerte import router as alerte_router
from analyse import router as analyse_router
from predict import router as predict_router

app = FastAPI()

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion du routeur
app.include_router(home_router)
app.include_router(climate_router)
app.include_router(alerte_router)
app.include_router(analyse_router)
app.include_router(predict_router)
