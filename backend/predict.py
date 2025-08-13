# predict.py
from fastapi import APIRouter
import requests
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

router = APIRouter()

# Cache pour les coordonnées des villes
city_cache = {}


def get_city_coordinates(city: str):
    if city.lower() in city_cache:
        return city_cache[city.lower()]
    
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": f"{city}, Madagascar",
        "format": "json",
        "limit": 1
    }
    headers = {"User-Agent": "MyWeatherApp/1.0"}
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data:
                result = {
                    "latitude": float(data[0]["lat"]),
                    "longitude": float(data[0]["lon"])
                }
                city_cache[city.lower()] = result
                return result
        return {"error": "Ville non trouvée"}
    except Exception as e:
        return {"error": f"Erreur de connexion: {str(e)}"}


def get_weather_forecast(lat: float, lon: float, days: int):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "temperature_2m_max,precipitation_sum,windspeed_10m_max",
        "timezone": "Africa/Nairobi",
        "forecast_days": days
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return pd.DataFrame({
                "date": data['daily']['time'],
                "temperature": data['daily']['temperature_2m_max'],
                "predicted_precipitation": data['daily']['precipitation_sum'],
                "wind_speed": data['daily']['windspeed_10m_max']
            })
        return {"error": "Erreur API météo"}
    except Exception as e:
        return {"error": f"Erreur de connexion: {str(e)}"}


@router.get("/")
def home():
    return {"message": "Bienvenue sur l'API météo avec Open-Meteo !"}


@router.get("/predict/{city}/{start_date}/{end_date}/{future_days}")
async def predict(city: str, start_date: str, end_date: str, future_days: int):
    try:
        # Validation des dates
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        return {"error": "Format de date invalide (YYYY-MM-DD requis)"}

    # Récupération des coordonnées
    coords = get_city_coordinates(city)
    if "error" in coords:
        return coords

    # Récupération des données météo
    weather_data = get_weather_forecast(coords["latitude"], coords["longitude"], future_days)
    if isinstance(weather_data, dict) and "error" in weather_data:
        return weather_data

    # Simulation de prédictions
    try:
        model = LinearRegression()
        X = weather_data[["temperature"]].values.reshape(-1, 1)
        y = weather_data["predicted_precipitation"].values
        model.fit(X, y)
        
        
        
        # Génération de prévisions
        future_dates = pd.date_range(
            start=datetime.strptime(start_date, "%Y-%m-%d"),
            periods=future_days
        ).strftime("%Y-%m-%d").tolist()

        
        predictions = model.predict(
            np.array(weather_data["temperature"].mean() + np.random.normal(0, 1, future_days))
            .reshape(-1, 1)
        )
        
        # Construction de la réponse
        return [
            {
                "date": date,
                "temperature": float(temp),
                "predicted_precipitation": float(precip),
                "wind_speed": float(ws)
            } for date, temp, precip, ws in zip(
                future_dates,
                np.random.normal(weather_data["temperature"].mean(), 2, future_days),
                np.clip(predictions, 0, None),
                weather_data["wind_speed"][-future_days:]  # Utilise les dernières valeurs de vent
            )
        ]
    except Exception as e:
        return {"error": f"Erreur de modélisation: {str(e)}"}
