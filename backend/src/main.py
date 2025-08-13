from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 👇 Importation des routers (on les ajoutera progressivement)
# Chaque fichier (comme alerte.py) doit avoir `router = APIRouter()` et des routes avec @router.get/post...
from alerte import router as alerte_router
from login import router as login_router
from app import router as prediction_router
from fastapi_app import router as simulation_router
from mainMaholy import router as analyse_router
from home import router as home_router  # Importation du router de home.py

app = FastAPI(
    title="Application Météo",
    description="Projet intégré : alerte, prédiction, simulation, analyse, etc.",
    version="1.0.0"
)

# CORS middleware (autorise les appels depuis React par exemple)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tu peux mettre ["http://localhost:5173"] pour limiter au frontend local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routers
app.include_router(login_router, prefix="/auth", tags=["Authentification"])
app.include_router(alerte_router, prefix="/alerte", tags=["Alertes"])
app.include_router(prediction_router, prefix="/prediction", tags=["Prédiction"])
app.include_router(simulation_router, prefix="/simulation", tags=["Simulation"])
app.include_router(analyse_router, prefix="/analyse", tags=["Analyse"])
app.include_router(home_router, prefix="/home", tags=["Accueil"])

# Optionnel : route racine
@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API Météo centralisée"}
