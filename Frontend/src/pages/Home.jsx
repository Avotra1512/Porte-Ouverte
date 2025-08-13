import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import WeatherInfo from "../components/WeatherInfo";
import MapWeather from "../components/MapWeather";
import WeatherAlerts from "../components/WeatherAlerts";
import CitySearch from "../components/CitySearch";

const Home = () => {
  // Exemple de données à venir de FastAPI (à remplacer plus tard)
  const globalWeather = "sunny"; // Cette donnée viendrait de FastAPI plus tard

  // Définition dynamique de la classe de fond en fonction du temps
  const backgroundClass =
    globalWeather === "rain"
      ? "bg-blue-200"
      : globalWeather === "sunny"
      ? "bg-yellow-100"
      : "bg-gray-100";

  const [notifications] = useState([
      "🌬 Fermez vos fenêtres pendant les tempêtes de vent",
  
  "🧴 Protégez votre peau avec de la crème solaire par temps ensoleillé",
  
  "🌧 Portez des vêtements imperméables lors de fortes pluies",
  
  "🧊 En cas de verglas, évitez de conduire si possible",
  
  "💨 Aérez votre maison tôt le matin en période de canicule",
  
  "🧥 Couvrez-vous bien lors de chutes de température soudaines",
  
  "🚱 Ne gaspillez pas l’eau lors des périodes de restriction",
  
  "⚡ Débranchez les appareils en cas d’orage",
  
  "🌲 Évitez les zones boisées pendant les alertes incendie",
  
  "📱 Suivez les alertes météo officielles via votre application préférée",
    ]);

  // State pour la date actuelle
  const [currentDate, setCurrentDate] = useState("");

  // Utilisation de useEffect pour mettre à jour la date au chargement du composant
  useEffect(() => {
    // Créer un objet Date pour obtenir la date actuelle
    const date = new Date();

    // Formater la date au format "Jour Mois Année"
    const formattedDate = `${date.toLocaleDateString("fr-FR", {
      weekday: "long", // Jour de la semaine (ex: lundi)
      year: "numeric", // Année (ex: 2025)
      month: "long", // Mois (ex: mars)
      day: "numeric", // Jour du mois (ex: 11)
    })}`;

    // Mettre à jour l'état avec la date formatée
    setCurrentDate(formattedDate);
  }, []); // Cette effet s'exécute une seule fois lorsque le composant est monté

  return (
    <div className="w-full min-h-screen bg-gray-100">
        {/* Notifications */}
        <div className="bg-[#f1b813] text-black shadow-lg py-2 text-center animate-pulse">
          <marquee>
            {notifications.map((notif, index) => (
              <span key={index} className="mx-96 inline-block">
                <AlertCircle className="inline w-4 h-4 mr-2 text-red-600" />
                {notif}
              </span>
            ))}
          </marquee>
      </div>

      {/* Section principale */}
      <div className="container mx-auto flex flex-col md:flex-row items-start justify-between py-12 px-6 md:px-12 space-x-0 md:space-x-24">
        {/* Carte interactive */}
        <div className="w-full md:w-1/2 pr-0 md:pr-10">
          {/* Recherche de ville */}
          <div className="mt-4 w-full">
            <CitySearch />
          </div>
          <MapWeather />
        </div>

        {/* Section textuelle */}
        <div className="w-full md:w-1/2 flex flex-col items-start">
          <div className="inline-flex items-center gap-2">
            <h1 className="prata-regular text-4xl text-green-700">
              Bienvenue sur TerraSmart
            </h1>
            <hr className="border-none h-[2px] w-16 bg-green-700" />
          </div>

          <p className="mt-4 text-gray-700">
            Notre mission est de vous fournir des informations précises sur le climat
            et vous aider à vous adapter aux changements climatiques.
          </p>

          {/* Date dynamique */}
          <p className="text-2xl mt-6 text-[#7DA38C]">{currentDate}</p>

          {/* Section Info météo */}
          <WeatherInfo /> {/* Placer WeatherInfo ici, au-dessus des alertes */}

          {/* Alertes météo */}
          <div className="mt-10">
            <WeatherAlerts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
