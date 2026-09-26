import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Phone, Hospital, X, HeartPulse, User } from 'lucide-react';

// Hospital Marker Pin
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function RequestDetailsModal({ request, onClose }) {
  if (!request) return null;

  // Default Hospital Coordinates (Fallback to Swabi / Request Lat-Lng)
  const hospitalLocation = [
    request.latitude || 34.1202, 
    request.longitude || 72.4698
  ];

  // Open Google Maps Directions to Hospital
  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospitalLocation[0]},${hospitalLocation[1]}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
              {request.blood_type}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">{request.patient_name || "Emergency Patient"}</h3>
              <p className="text-xs text-rose-400 font-medium">Urgency: {request.urgency_level || "Urgent"}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-bold block mb-0.5">Hospital Name</span>
              <span className="font-extrabold text-slate-800 flex items-center gap-1">
                <Hospital className="w-3.5 h-3.5 text-rose-600" /> {request.hospital_name || "Bacha Khan Medical Complex"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-bold block mb-0.5">City / Location</span>
              <span className="font-extrabold text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> {request.city || "Swabi"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-bold block mb-0.5">Required Units</span>
              <span className="font-extrabold text-rose-600 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5" /> {request.units || 1} Bag(s)
              </span>
            </div>
          </div>

          {/* Interactive Hospital Location Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-600" /> Hospital Map Location
              </label>
              <button
                onClick={handleGetDirections}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" /> Open Directions
              </button>
            </div>

            <div className="h-[220px] w-full rounded-2xl overflow-hidden border border-slate-200">
              <MapContainer
                center={hospitalLocation}
                zoom={14}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={hospitalLocation} icon={hospitalIcon}>
                  <Popup>
                    <div className="text-center text-xs font-bold p-1">
                      🏥 {request.hospital_name || "Bacha Khan Medical Complex"}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={`tel:${request.contact_phone}`}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <Phone className="w-4 h-4" /> Call Requester ({request.contact_phone || "+923001234567"})
            </a>

            <button
              onClick={handleGetDirections}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-slate-900/20"
            >
              <Navigation className="w-4 h-4 text-rose-500" /> Get Directions
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}