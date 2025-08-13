import React, { useEffect,useState } from "react";
import { useParams,useLocation } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Simulation.css";

// Enregistrement de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const coords = {
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      };
      setPosition(e.latlng);
      onSelect(coords);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Coordonnées sélectionnées</Popup>
    </Marker>
  );
}

function Simulation() {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [cityTemp, setCityTemp] = useState(null);
  const [temp2050, setTemp2050] = useState(null);
  const [temp2100, setTemp2100] = useState(null);
  const [seaLevel2050, setSeaLevel2050] = useState(null);
  const [seaLevel2100, setSeaLevel2100] = useState(null);
  const { city } = useParams();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const rawRegion = queryParams.get("region");
  const cityParam = queryParams.get("city");
  const regionParam = rawRegion && rawRegion !== "null" ? rawRegion : null;

const finalCity = regionParam ? `${cityParam}, ${regionParam}` : cityParam;

  useEffect(() => {
    const fetchWeatherFromCity = async () => {
      if (!finalCity) return;
  
      try {
        const response = await axios.post("http://127.0.0.1:8000/get_climate_by_city", {
          city: cityParam,
          region: regionParam
        });
  
        const data = response.data;
        setWeatherData(data);
  
        const predictionRes = await axios.post("http://127.0.0.1:8000/predict_temperature", {
          city: data.name,
        });
  
        const predictions = predictionRes.data;
  
        if (predictions.error) {
          setError(predictions.error);
          return;
        }
  
        const temp2025 = predictions.temperature_2025;
        const temp2050 = predictions.temperature_2050;
        const temp2100 = predictions.temperature_2100;
  
        setCityTemp(temp2025);
        setTemp2050(temp2050);
        setTemp2100(temp2100);
  
        setSeaLevel2050(calculateSeaLevelRise(temp2050).toFixed(2));
        setSeaLevel2100(calculateSeaLevelRise(temp2100).toFixed(2));
      } catch (err) {
        setError("Erreur lors de la récupération des données.");
        console.error(err);
      }
    };
  
    fetchWeatherFromCity();
  }, [finalCity]);
  

  const handleMapClick = async ({ latitude, longitude }) => {
    setCoordinates({ latitude, longitude });

    try {
      // Récupérer les données climatiques actuelles
      const response = await axios.post(
        "http://127.0.0.1:8000/get_climate_by_coordinates",
        { latitude, longitude }
      );

      const data = response.data;
      setWeatherData(data);

      // Utiliser le nom de la ville pour récupérer les prévisions climatiques
      const cityName = data.name;
      const predictionRes = await axios.post(
        "http://127.0.0.1:8000/predict_temperature",
        { city: cityName }
      );

      const predictions = predictionRes.data;

      if (predictions.error) {
        setError(predictions.error);
        return;
      }

      // Récupérer les prévisions de température et niveau de la mer
      const temp2025 = predictions.temperature_2025;
      const temp2050 = predictions.temperature_2050;
      const temp2100 = predictions.temperature_2100;

      setCityTemp(temp2025);
      setTemp2050(temp2050);
      setTemp2100(temp2100);

      // Calculer l'élévation du niveau de la mer en 2050 et 2100
      const seaLevel2050 = calculateSeaLevelRise(temp2050);
      const seaLevel2100 = calculateSeaLevelRise(temp2100);

      setSeaLevel2050(seaLevel2050.toFixed(2));
      setSeaLevel2100(seaLevel2100.toFixed(2));
    } catch (err) {
      setError("Erreur lors de la récupération des données.");
      console.error(err);
    }
  };

  // Fonction pour calculer l'élévation du niveau de la mer
  const calculateSeaLevelRise = (temp) => {
    const baseLevel = 75;
    const factor = 4;
    const anomaly = temp - 14.0;
    return baseLevel + factor * anomaly ** 2;
  };

  // Fonction pour générer les données de température
  const generateTemperatureData = (startYear, endYear, startTemp, increaseRate) => {
    const data = [];
    for (let year = startYear; year <= endYear; year += 5) {
      const yearsPassed = year - 2025;
      const temp = startTemp * Math.exp(increaseRate * yearsPassed); // Progression exponentielle pour mieux refléter l'augmentation de la température
      data.push({ x: year, y: temp });
    }
    return data;
  };

  // Générer les données pour la température et le niveau de la mer
  const temperatureData = generateTemperatureData(2025, 2100, cityTemp, 0.02); // 0.02 est un taux d'augmentation pour l'exemple
  const seaLevelData = [
    { x: 2025, y: 0 },
    { x: 2050, y: seaLevel2050 },
    { x: 2100, y: seaLevel2100 },
  ];

  const data = {
    datasets: [
      {
        label: "Température (°C)",
        data: temperatureData,
        borderColor: "red",
        fill: false,
        tension: 0.4,
      },
      {
        label: "Niveau de la mer (mm)",
        data: seaLevelData,
        borderColor: "blue",
        fill: false,
        tension: 0.4,
      },
    ],
    labels: temperatureData.map(item => item.x),
  };

  return (
    <div className="simulation-container">
      <h2>
        Simulation climatique {finalCity ? <> pour <strong>{finalCity}</strong> </> : ""}
        : Cliquez sur la carte pour voir les données météorologiques en temps réel
      </h2>

      <div className="map-section">
        <MapContainer center={[0, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker onSelect={handleMapClick} />
        </MapContainer>
      </div>

      {error && <p className="error-message">{error}</p>}

      {weatherData && (
        <>
          <div className="info-block">
            <h3>Météo actuelle à {weatherData.name}</h3>
            <p><strong>Température :</strong> {weatherData.main.temp} °C</p>
            <p><strong>Pression :</strong> {weatherData.main.pressure} hPa</p>
            <p><strong>Humidité :</strong> {weatherData.main.humidity} %</p>
            <p><strong>Conditions :</strong> {weatherData.weather[0].description}</p>
          </div>

          <div className="info-block">
            <h3>Prévisions climatiques</h3>
            <p>Température en 2050 : {temp2050} °C | Niveau de la mer : {seaLevel2050} mm</p>
            <p>Température en 2100 : {temp2100} °C | Niveau de la mer : {seaLevel2100} mm</p>
          </div>

          <div className="graph-section">
            <Line data={data} />
          </div>
        </>
      )}
    </div>
  );
}

export default Simulation;
