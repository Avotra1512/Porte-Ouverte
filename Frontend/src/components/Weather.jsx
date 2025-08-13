import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const Weather = ({ city }) => {
  const DEFAULT_CITY = "Antananarivo, Analamanga, Province d'Antananarivo, 101, Madagascar";
  const effectiveCity = city && city.trim() !== "" ? city : DEFAULT_CITY;

  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (cityName) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/weather/${encodeURIComponent(cityName)}`
      );
      const data = await response.json();

      if (data.detail) {
        alert(data.detail);
        setWeatherData(null);
      } else {
        setWeatherData(data);
      }
    } catch (error) {
      console.error('Erreur réseau :', error);
      alert('Erreur réseau');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(effectiveCity);
  }, [effectiveCity]);

  if (loading) return <p>Chargement des données...</p>;
  if (!weatherData) return <p>Aucune donnée à afficher</p>;

  const getTemperatureColor = (temp) => {
    if (temp <= 0) return 'rgba(0, 0, 255, 1)';
    if (temp > 0 && temp <= 10) return 'rgba(135, 206, 250, 1)';
    if (temp > 10 && temp <= 20) return 'rgba(34, 139, 34, 1)';
    if (temp > 20 && temp <= 30) return 'rgba(255, 255, 0, 1)';
    if (temp > 30 && temp <= 40) return 'rgba(255, 165, 0, 1)';
    return 'rgba(255, 0, 0, 1)';
  };

  const temperatureChartData = {
    labels: weatherData.labels,
    datasets: [{
      label: 'Température (°C)',
      data: weatherData.temperatures,
      fill: false,
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: weatherData.temperatures.map(temp => getTemperatureColor(temp)),
      borderWidth: 1,
      tension: 0.1,
    }],
  };

  const humidityChartData = {
    labels: weatherData.labels,
    datasets: [{
      label: 'Humidité (%)',
      data: weatherData.humidities,
      backgroundColor: weatherData.humidities.map(h => h <= 60 ? 'rgba(0, 123, 255, 0.2)' : 'rgba(0, 0, 255, 0.6)'),
      borderColor: weatherData.humidities.map(h => h <= 60 ? 'rgba(0, 123, 255, 1)' : 'rgba(0, 0, 255, 1)'),
      borderWidth: 1,
    }],
  };

  const pressureChartData = {
    labels: weatherData.labels,
    datasets: [{
      label: 'Pression (hPa)',
      data: weatherData.pressures,
      fill: true,
      backgroundColor: weatherData.pressures.map(p =>
        p < 1000 ? 'rgba(0, 0, 255, 0.2)' :
        (p <= 1025 ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 165, 0, 0.2)')
      ),
      borderColor: weatherData.pressures.map(p =>
        p < 1000 ? 'rgba(0, 0, 255, 1)' :
        (p <= 1025 ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 165, 0, 1)')
      ),
      borderWidth: 1,
      tension: 0.4,
    }],
  };

  const descriptionChartData = {
    labels: ['Rain', 'Clouds', 'Clear'],
    datasets: [{
      label: 'Description Météo',
      data: [
        weatherData.descriptions.filter(d => d === 'Rain').length,
        weatherData.descriptions.filter(d => d === 'Clouds').length,
        weatherData.descriptions.filter(d => d === 'Clear').length,
      ],
      backgroundColor: ['rgba(0, 0, 255, 0.6)', 'rgba(169, 169, 169, 0.6)', 'rgba(135, 206, 235, 0.6)'],
      borderColor: ['rgba(0, 0, 255, 1)', 'rgba(169, 169, 169, 1)', 'rgba(135, 206, 235, 1)'],
      borderWidth: 1,
    }],
  };

  const windSpeedChartData = {
    labels: weatherData.labels,
    datasets: [{
      label: 'Vitesse du vent (m/s)',
      data: weatherData.wind_speeds,
      backgroundColor: weatherData.wind_speeds.map(speed => {
        if (speed < 5) return 'rgba(173, 216, 230, 0.6)';
        if (speed < 10) return 'rgba(255, 255, 0, 0.6)';
        if (speed < 15) return 'rgba(255, 165, 0, 0.6)';
        if (speed < 20) return 'rgba(255, 0, 0, 0.6)';
        return 'rgba(128, 0, 128, 0.6)';
      }),
      borderColor: weatherData.wind_speeds.map(speed => {
        if (speed < 5) return 'rgba(173, 216, 230, 1)';
        if (speed < 10) return 'rgba(255, 255, 0, 1)';
        if (speed < 15) return 'rgba(255, 165, 0, 1)';
        if (speed < 20) return 'rgba(255, 0, 0, 1)';
        return 'rgba(128, 0, 128, 1)';
      }),
      borderWidth: 1,
    }],
  };

  return (
    <div className="weather-container">
      <h2>Prévisions pour {effectiveCity}</h2>

      <div className="charts-grid">
        <div className="chart-item">
          <h3>Température</h3>
          <Line data={temperatureChartData} options={{ responsive: true, maintainAspectRatio: true,    animation: {
      duration: 1000, easing: 'easeInOutQuart',
    },  }} />
        </div>
        <div className="chart-item">
          <h3>Humidité</h3>
          <Bar data={humidityChartData} options={{ responsive: true, maintainAspectRatio: true,     animation: {
      duration: 1000, easing: 'easeInOutQuart',
    },}} />
        </div>
        <div className="chart-item">
          <h3>Pression</h3>
          <Line data={pressureChartData} options={{ responsive: true, maintainAspectRatio: true, animation: {
      duration: 1000, easing: 'easeInOutQuart',
    }, }} />
        </div>
        <div className="chart-item">
          <h3>Description Météo</h3>
          <div style={{ width: '400px', height: '400px', margin: '0 auto' }}>
          <Pie data={descriptionChartData} options={{ responsive: true, maintainAspectRatio: true, animation: {
      animateScale: true, animateRotate: true, duration: 1000, easing: 'easeInOutBounce',
    }, }}  />
          </div>
        </div>
      </div>

      <div className="charts-grid1">
        <div className="chart-item">
          <h3>Vitesse du Vent</h3>
          <Bar data={windSpeedChartData} options={{
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
          }} />
        </div>
      </div>
    </div>
  );
};

export default Weather;
