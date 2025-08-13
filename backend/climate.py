# climate.py

from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
import os
import requests
import numpy as np
import threading
from geopy.distance import geodesic
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import BallTree
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# Schémas
class Coordinates(BaseModel):
    latitude: float
    longitude: float

class CityRequest(BaseModel):
    city: str
    region: Optional[str] = None

# Clés API
OPENCAGE_API_KEY = "627cfea81c2c4360a4d9365144ca1385"
OPENWEATHER_API_KEY = "be0bbc049778cd48291e9da13b375f13"

# Cache
station_cache = {}
model_cache = {}

# Fichier de données
url = "https://berkeley-earth-temperature.s3.us-west-1.amazonaws.com/Global/Land_and_Ocean_complete.txt"
output_file = "data/Land_and_Ocean_complete.txt"
os.makedirs("data", exist_ok=True)

if not os.path.exists(output_file):
    try:
        response = requests.get(url)
        if response.status_code == 200:
            with open(output_file, "wb") as file:
                file.write(response.content)
            print("Fichier téléchargé avec succès.")
        else:
            print("Erreur lors du téléchargement.")
    except requests.exceptions.RequestException as e:
        print(f"Erreur de requête : {e}")

def load_ghcn_stations(file_path: str):
    column_names = ["ID", "LATITUDE", "LONGITUDE", "ELEVATION", "STATE", "NAME", "GSN_FLAG", "HCN_FLAG", "WMO_ID"]
    colspecs = [(0, 11), (12, 20), (21, 30), (31, 37), (38, 40), (41, 71), (72, 75), (76, 79), (80, 85)]
    df = pd.read_fwf(file_path, colspecs=colspecs, names=column_names)
    df.dropna(subset=["LATITUDE", "LONGITUDE"], inplace=True)
    return df

stations_df = load_ghcn_stations("data/ghcnd-stations.txt")

# Fonctions utilitaires (identiques à ton code)
def get_weather_data(latitude, longitude):
    base_url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": latitude,
        "lon": longitude,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric",
        "lang": "fr"
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"Échec de la requête météo (code {response.status_code})"}

def extract_annual_temperature(station_id):
    file_path = f"data/ghcnd_all/{station_id}.dly"
    if not os.path.exists(file_path):
        return None
    records = []
    try:
        with open(file_path, 'r') as file:
            for line in file:
                element = line[17:21]
                if element == "TAVG":
                    year = int(line[11:15])
                    for i in range(31):
                        value_str = line[21 + i * 8:26 + i * 8].strip()
                        if value_str and value_str != "-9999":
                            value = int(value_str)
                            records.append((year, value / 10.0))
    except Exception as e:
        print(f"Erreur fichier {file_path}: {e}")
        return None

    if not records:
        return None

    df = pd.DataFrame(records, columns=["year", "temperature"])
    return df.groupby("year")["temperature"].mean().reset_index()

# Préparation unique
stations_coords = stations_df[["LATITUDE", "LONGITUDE"]].to_numpy()
ball_tree = BallTree(np.radians(stations_coords), metric='haversine')

# Fonction rapide
def find_nearest_station_fast(lat, lon):
    dist, idx = ball_tree.query(np.radians([[lat, lon]]), k=1)
    nearest_station = stations_df.iloc[idx[0][0]]
    return nearest_station

def find_nearest_station(lat, lon, stations_df):
    user_location = (lat, lon)
    stations_df["DISTANCE_KM"] = stations_df.apply(
        lambda row: geodesic(user_location, (row["LATITUDE"], row["LONGITUDE"])).kilometers,
        axis=1
    )
    return stations_df.sort_values(by="DISTANCE_KM").iloc[0]

def get_coordinates(city: str):
    base_url = "https://api.opencagedata.com/geocode/v1/json"
    params = {
        "q": city,
        "key": OPENCAGE_API_KEY,
        "language": "fr",
        "no_annotations": 1
    }
    response = requests.get(base_url, params=params)
    data = response.json()

    if data["results"]:
        lat = data["results"][0]["geometry"]["lat"]
        lon = data["results"][0]["geometry"]["lng"]
        return {"latitude": lat, "longitude": lon}
    else:
        return {"error": "Ville non trouvée"}

# Prétraitement
def pretrain_models():
    print("Prétraitement des stations…")
    for _, station in stations_df.iterrows():
        station_id = station["ID"]
        data = extract_annual_temperature(station_id)
        if data is not None and not data.empty:
            model = LinearRegression()
            X = data["year"].values.reshape(-1, 1)
            y = data["temperature"].values
            model.fit(X, y)
            model_cache[station_id] = model
            station_cache[station_id] = data
    print("Prétraitement terminé.")

threading.Thread(target=pretrain_models, daemon=True).start()

# === ROUTES ===

@router.post("/get_climate_by_city")
def get_climate_by_city(req: CityRequest):
    city = req.city.strip()
    region = req.region.strip() if req.region else None

    query = city
    if region:
        query += f", {region}"

    geocode_url = f"https://api.opencagedata.com/geocode/v1/json?q={query}&key={OPENCAGE_API_KEY}"
    geo_response = requests.get(geocode_url)
    geo_data = geo_response.json()

    if not geo_data["results"]:
        return {"error": f"Aucune donnée trouvée pour {query}"}

    lat = geo_data["results"][0]["geometry"]["lat"]
    lon = geo_data["results"][0]["geometry"]["lng"]

    weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric&lang=fr"
    weather_response = requests.get(weather_url)
    return weather_response.json()


@router.get("/get_coordinates")
def route_get_coordinates(city: str):
    return get_coordinates(city)

@router.get("/get_climate_data")
def get_climate_data(city: str, region: Optional[str] = None):
    full_query = f"{city},{region}" if region else city
    coords = get_coordinates(full_query)
    if "error" in coords:
        return {"error": "Ville non trouvée"}
    return get_weather_data(coords["latitude"], coords["longitude"])

@router.post("/get_climate_by_coordinates")
def get_climate_by_coordinates(coord: Coordinates):
    return get_weather_data(coord.latitude, coord.longitude)

@router.post("/nearest_station")
def get_nearest_station(coord: Coordinates):
    station = find_nearest_station_fast(coords["latitude"], coords["longitude"])
    return {
        "station_id": station["ID"],
        "station_name": station["NAME"].strip(),
        "latitude": station["LATITUDE"],
        "longitude": station["LONGITUDE"],
        "distance_km": round(station["DISTANCE_KM"], 2)
    }

@router.post("/predict_temperature")
def predict_temperature(request: CityRequest):
    coords = get_coordinates(request.city)
    if "error" in coords:
        return {"error": "Ville non trouvée"}
    
    station = find_nearest_station(coords["latitude"], coords["longitude"], stations_df)
    station_id = station["ID"]

    data = station_cache.get(station_id)

    if data is None:
        data = extract_annual_temperature(station_id)
        if data is None or data.empty:
            return {"error": f"Aucune donnée disponible pour la station {station_id}"}
        station_cache[station_id] = data

    model = model_cache.get(station_id)
    if model is None:
        model = LinearRegression()
        X = data["year"].values.reshape(-1, 1)
        y = data["temperature"].values
        model.fit(X, y)
        model_cache[station_id] = model

    predictions = {
        year: round(model.predict([[year]])[0], 2)
        for year in [2025, 2050, 2100]
    }

    return {
        "ville": request.city,
        "station": station["NAME"].strip(),
        "temperature_2025": predictions[2025],
        "temperature_2050": predictions[2050],
        "temperature_2100": predictions[2100],
    }

@router.post("/cache_station")
def cache_station_data(station_id: str):
    if station_id in model_cache:
        return {"message": f"Modèle déjà en cache pour la station {station_id}"}

    data = extract_annual_temperature(station_id)
    if data is None or data.empty:
        return {"error": f"Aucune donnée pour {station_id}"}

    model = LinearRegression()
    X = data["year"].values.reshape(-1, 1)
    y = data["temperature"].values
    model.fit(X, y)

    station_cache[station_id] = data
    model_cache[station_id] = model

    return {"message": f"Modèle et données mis en cache pour la station {station_id}"}
