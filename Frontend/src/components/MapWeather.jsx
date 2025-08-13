import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapWeather = () => {
  return (
    <div className="mt-10 w-full h-[400px] rounded-lg relative z-0">
    <MapContainer
      center={[20, 0]}
      zoom={2}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={[48.8566, 2.3522]}>
        <Popup>Paris: 🌧️ 12°C</Popup>
      </Marker>
    </MapContainer>
  </div>
  
  );
};

export default MapWeather;
