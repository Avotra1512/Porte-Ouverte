import React, { useState, useEffect } from 'react';
import Weather from '../components/Weather'; // Import du composant Weather
import './Analyse.css';

function Analyse() {
  const [inputValue, setInputValue] = useState(''); // Valeur de l'input
  const [suggestions, setSuggestions] = useState([]); // Liste des suggestions
  const [city, setCity] = useState('Antananarivo'); // Ville par défaut
  const [lat, setLat] = useState(null); // Latitude
  const [lon, setLon] = useState(null); // Longitude
  const [countries, setCountries] = useState([]); // Liste des pays
  const [loading, setLoading] = useState(false); // Indicateur de chargement

  // Charger la liste des pays automatiquement
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all')
      .then(res => res.json())
      .then(data => {
        const countryNames = data.map(c => c.name.common).sort();
        setCountries(countryNames);
      })
      .catch(err => console.error('Erreur lors du chargement des pays:', err));
  }, []);

  // Recherche des lieux en fonction de la saisie utilisateur
  const handleSearch = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    try {
      setLoading(true);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${inputValue}&format=json&addressdetails=1&limit=5`);
      const data = await response.json();

      if (data && data.length > 0) {
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche :', error);
    } finally {
      setLoading(false);
    }
  };

  // Lorsque l'utilisateur choisit une suggestion
  const handleSuggestionClick = (suggestion) => {
    if (suggestion.lat && suggestion.lon) {
      // Si la suggestion est une ville avec latitude/longitude
      setCity(suggestion.display_name);
      setLat(suggestion.lat);
      setLon(suggestion.lon);
    } else {
      // Si c'est un pays (pas de latitude/longitude)
      setCity(suggestion);
      setLat(null);
      setLon(null);
    }
    setSuggestions([]); // Fermer la liste des suggestions
  };

  // Mettre à jour les suggestions selon la saisie (pays ou villes)
  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
    } else {
      if (inputValue.length === 1 && /^[a-zA-Z]$/.test(inputValue)) {
        // Suggestions basées sur les pays si une seule lettre est saisie
        const filteredCountries = countries.filter(country =>
          country.toLowerCase().startsWith(inputValue.toLowerCase())
        );
        setSuggestions(filteredCountries.slice(0, 10)); // Max 10 suggestions
      } else if (inputValue.length > 1) {
        // Suggestions basées sur les villes si la chaîne est plus longue
        setSuggestions([]);
      }
    }
  }, [inputValue, countries]);

  return (
    <div className="analyse-container">
      <h1 className="title">Analyse Météo <span className="emoji">🌤️</span></h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={inputValue}
          placeholder="Rechercher une ville, région ou pays..."
          onChange={(e) => setInputValue(e.target.value)}
          className="search-input"
          autoComplete="off"
        />
        <button type="submit" className="search-button">Rechercher</button>
      </form>

      {/* Affichage des suggestions */}
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{ cursor: 'pointer', padding: '5px', borderBottom: '1px solid #ccc' }}
            >
              {suggestion.display_name || suggestion}
            </li>
          ))}
        </ul>
      )}

      {/* Affichage du composant Weather avec les données de la ville choisie */}
      {lat && lon ? (
        <Weather city={city} lat={lat} lon={lon} />
      ) : (
        <Weather city={city} />
      )}

      {/* Affichage du loader si le contenu est en chargement */}
      {loading && <p>Chargement des résultats...</p>}
    </div>
  );
}

export default Analyse;
