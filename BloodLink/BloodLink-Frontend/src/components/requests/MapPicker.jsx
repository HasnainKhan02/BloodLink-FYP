import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const pinIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ latitude, longitude, onPick }) {
  const hasPin = latitude != null && longitude != null;
  const center = hasPin ? [latitude, longitude] : [34.1203, 72.4708];

  return (
    <div className="h-64 w-full overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={center} zoom={hasPin ? 13 : 6} className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onPick} />
        {hasPin && <Marker position={[latitude, longitude]} icon={pinIcon} />}
      </MapContainer>
    </div>
  );
}
