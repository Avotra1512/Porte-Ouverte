from fastapi import APIRouter
import requests
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta

router = APIRouter()

# Fonction pour récupérer les coordonnées d'une ville via Nominatim
def get_city_coordinates(city: str):
    url = f"https://nominatim.openstreetmap.org/search"
    params = {
        "q": city + ", Madagascar",
        "format": "json",
        "addressdetails": 1,
        "limit": 1
    }
    headers = {
        "User-Agent": "MyWeatherApp/1.0 (contact@example.com)"
    }
    response = requests.get(url, params=params, headers=headers)

    if response.status_code == 200:
        data = response.json()
        if data:
            lat = data[0]["lat"]
            lon = data[0]["lon"]
            return {"latitude": lat, "longitude": lon}
        else:
            return {"error": f"Ville '{city}' non trouvée."}
    else:
        return {"error": "Erreur lors de la récupération des coordonnées."}

def get_future_weather_data(city: str, days: int = 5):
    city = city.lower()
    coords = get_city_coordinates(city)
    if "error" in coords:
        return coords

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": coords["latitude"],
        "longitude": coords["longitude"],
        "daily": "temperature_2m_max,precipitation_sum",
        "timezone": "Africa/Nairobi",
        "forecast_days": days
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        return pd.DataFrame({
            "date": data['daily']['time'],
            "temperature": data['daily']['temperature_2m_max'],
            "predicted_precipitation": data['daily']['precipitation_sum']
        })
    else:
        return {"error": "Erreur lors de la récupération des prévisions météo."}

def prepare_data(city, start_date, end_date):
    weather_data = get_future_weather_data(city)
    if isinstance(weather_data, dict) and "error" in weather_data:
        return weather_data

    try:
        df = weather_data.copy()
        df = df.fillna(0)
        df = df.replace([np.inf, -np.inf], np.nan).fillna(0)
        return df
    except Exception as e:
        return {"error": f"Erreur lors de la préparation des données : {str(e)}"}

def train_model(city, start_date, end_date, future_days=5):
    df = prepare_data(city, start_date, end_date)
    if isinstance(df, dict) and "error" in df:
        return df, None, None

    df["date"] = pd.to_datetime(df["date"])
    X = df[["temperature"]]
    y = df["predicted_precipitation"]

    if X.isnull().any().any() or y.isnull().any():
        return {"error": "Les données contiennent des valeurs manquantes."}, None, None

    model = LinearRegression()
    model.fit(X, y)

    last_date = df["date"].max()
    future_dates = [last_date + timedelta(days=i) for i in range(1, future_days + 1)]
    future_temperatures = np.mean(df["temperature"]) + np.random.uniform(-2, 2, size=future_days)
    future_precipitations = model.predict(np.array(future_temperatures).reshape(-1, 1))
    future_precipitations = np.nan_to_num(future_precipitations, nan=0.0)

    future_df = pd.DataFrame({
        "date": [date.strftime("%Y-%m-%d") for date in future_dates],
        "temperature": future_temperatures,
        "predicted_precipitation": future_precipitations
    }).fillna(0)

    return model, df, future_df

# Route racine pour ce module
@router.get("/")
def home():
    return {"message": "Bienvenue sur l'API météo avec Open-Meteo !"}

# Route de prédiction météo
@router.get("/predict/{city}/{start_date}/{end_date}/{future_days}")
def predict(city: str, start_date: str, end_date: str, future_days: int):
    try:
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        return {"error": "Les dates doivent être au format YYYY-MM-DD"}

    model, df, future_df = train_model(city, start_date, end_date, future_days)

    if isinstance(model, dict) and "error" in model:
        return model

    try:
        df["predicted_precipitation"] = model.predict(df[["temperature"]])
    except Exception as e:
        return {"error": f"Erreur lors de la prédiction : {str(e)}"}

    result = pd.concat([df, future_df], ignore_index=True)
    result = result.replace([np.inf, -np.inf], np.nan).fillna(0)

    return result.to_dict(orient="records")
