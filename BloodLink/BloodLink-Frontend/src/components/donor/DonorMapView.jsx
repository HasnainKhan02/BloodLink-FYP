import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Phone, HeartPulse } from 'lucide-react';

// Custom Map Pins Fix
const donorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function DonorMapView() {
  // Default center set to Swabi, KPK coordinates [lat, lng]
  const [userLocation, setUserLocation] = useState([34.1202, 72.4698]); 
  const [radius, setRadius] = useState(10); // in kilometers
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get current browser location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => console.log("Using default location (Swabi)")
      );
    }
    fetchNearbyDonors();
  }, [radius]);

  // Fetch Nearby Donors from Backend API
  const fetchNearbyDonors = async () => {
    setLoading(true);
    const token = localStorage.getItem('bloodlink_token');

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/donors/nearby?lat=${userLocation[0]}&lng=${userLocation[1]}&radius=${radius}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setDonors(data);
      }
    } catch (err) {
      console.error("Failed to load map donors", err);
    } finally {
      setLoading(false);
    }
  };

  // Open Google Maps Directions
  const openDirections = (destLat, destLng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Map Control Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-rose-500 animate-pulse" />
          <h3 className="font-bold text-sm">Nearby Emergency Donors Map</h3>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-300 font-medium">Radius:</label>
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-rose-500"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="h-[500px] w-full relative">
        <MapContainer
          center={userLocation}
          zoom={12}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Current Location Marker */}
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center font-bold text-xs">
                📍 You are here
              </div>
            </Popup>
          </Marker>

          {/* Radius Circle overlay */}
          <Circle
            center={userLocation}
            radius={radius * 1000} // Radius in meters
            pathOptions={{ color: '#e11d48', fillColor: '#e11d48', fillOpacity: 0.1 }}
          />

          {/* Available Donor Markers */}
          {donors.map((donor) => (
            <Marker
              key={donor.id}
              position={[donor.latitude || userLocation[0] + 0.01, donor.longitude || userLocation[1] + 0.01]}
              icon={donorIcon}
            >
              <Popup>
                <div className="p-1 space-y-2 max-w-[200px]">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="font-black text-slate-900 text-sm">{donor.name}</span>
                    <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                      {donor.blood_type}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {donor.city || "Swabi"}
                  </p>

                  <div className="pt-1 flex flex-col gap-1.5">
                    <a
                      href={`tel:${donor.phone}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1 px-2 rounded-lg text-center flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Call {donor.phone}
                    </a>

                    <button
                      onClick={() => openDirections(donor.latitude, donor.longitude)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-1 px-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Navigation className="w-3 h-3 text-rose-400" /> Get Directions
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}