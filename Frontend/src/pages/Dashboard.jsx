/*import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import axios from "axios";

// 🟢 Enregistrement des composants nécessaires de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [weatherData, setWeatherData] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/weather/")
      .then(response => setWeatherData(response.data))
      .catch(error => console.error("Erreur API :", error));
  }, []);

  const chartData = {
    labels: weatherData.map(data => data.date),
    datasets: [
      {
        label: "Température (°C)",
        data: weatherData.map(data => data.temperature),
        borderColor: "red",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "Humidité (%)",
        data: weatherData.map(data => data.humidity),
        borderColor: "blue",
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-green-700">📊 Données Météo</h2>
      {weatherData.length > 0 ? (
        <Line data={chartData} />
      ) : (
        <p className="text-gray-500">Chargement des données...</p>
      )}
    </div>
  );
};

export default Dashboard;*/
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// 🟢 Enregistrement des composants Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [weatherData, setWeatherData] = useState([]);

  // 🟢 Simulation de données météo au lieu de l'API
  useEffect(() => {
    const fakeWeatherData = [
      { date: "2025-03-01", temperature: 23, humidity: 60 },
      { date: "2025-03-02", temperature: 25, humidity: 65 },
      { date: "2025-03-03", temperature: 22, humidity: 55 },
      { date: "2025-03-04", temperature: 21, humidity: 50 },
      { date: "2025-03-05", temperature: 24, humidity: 62 },
    ];
    setWeatherData(fakeWeatherData);
  }, []);

  const chartData = {
    labels: weatherData.map(data => data.date),
    datasets: [
      {
        label: "Température (°C)",
        data: weatherData.map(data => data.temperature),
        borderColor: "red",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "Humidité (%)",
        data: weatherData.map(data => data.humidity),
        borderColor: "blue",
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-green-700">📊 Données Météo (Test)</h2>
      {weatherData.length > 0 ? (
        <Line data={chartData} />
      ) : (
        <p className="text-gray-500">Chargement des données...</p>
      )}
    </div>
  );
};

export default Dashboard;

