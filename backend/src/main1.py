from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import hashlib

app = FastAPI()

# ✅ Autoriser les requêtes entre FastAPI et React (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL de ton frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Base de données simulée (en mémoire pour l'exemple)
fake_db = []

# ✅ Modèle de l'utilisateur
class User(BaseModel):
    nom: str | None = None  # Optionnel pour la connexion
    email: str
    password: str

# ✅ Fonction pour hacher les mots de passe (sécurité basique)
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# ✅ Route d'inscription
@app.post("/users")
def create_user(user: User):
    # Vérifier si l'email existe déjà
    for existing_user in fake_db:
        if existing_user["email"] == user.email:
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    # Ajouter l'utilisateur avec mot de passe haché
    new_user = {
        "nom": user.nom,
        "email": user.email,
        "password": hash_password(user.password),
    }
    fake_db.append(new_user)

    return {
        "message": "Utilisateur créé avec succès",
        "user": new_user
    }

# ✅ Route de connexion
@app.post("/login")
def login_user(user: User):
    for existing_user in fake_db:
        if existing_user["email"] == user.email and existing_user["password"] == hash_password(user.password):
            return {
                "message": "Connexion réussie",
                "user": {
                    "nom": existing_user["nom"],
                    "email": existing_user["email"]
                }
            }
    raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

# ✅ Route pour lister les utilisateurs (pour l'admin)
@app.get("/admin/users", response_model=List[User])
def list_users():
    return fake_db
