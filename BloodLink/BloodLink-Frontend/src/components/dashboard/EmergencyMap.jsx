import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { Droplet, MapPin, Phone, Upload, CheckCircle2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix Default Leaflet Icon Issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom Red Pulse Icon for Emergency Requests
const createEmergencyIcon = (bloodType) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 bg-rose-500/40 rounded-full animate-ping"></div>
        <div class="bg-rose-600 text-white border-2 border-white text-[11px] font-extrabold px-2 py-1 rounded-xl shadow-lg flex items-center gap-1 z-10">
          <span>${bloodType}</span>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

export default function EmergencyMap({
  requests,
  currentUserId,
  onAcceptRequest,
  onUploadProof,
}) {
  // Default Center: Swabi / KP Pakistan coordinates or fallback
  const defaultCenter = [34.1202, 72.4702];

  // Calculate center based on first valid request coordinate if available
  const validRequests = requests.filter((r) => r.latitude && r.longitude);
  const centerPosition =
    validRequests.length > 0
      ? [parseFloat(validRequests[0].latitude), parseFloat(validRequests[0].longitude)]
      : defaultCenter;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm h-[550px] relative z-10">
      <MapContainer
        center={centerPosition}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validRequests.map((req) => {
          const isRequester = String(req.requester_id) === String(currentUserId);
          const isAccepted = req.status?.toLowerCase() === "accepted";
          const lat = parseFloat(req.latitude);
          const lng = parseFloat(req.longitude);

          return (
            <React.Fragment key={req.id}>
              {/* Optional 5km Coverage Circle */}
              <Circle
                center={[lat, lng]}
                radius={5000}
                pathOptions={{
                  color: "#e11d48",
                  fillColor: "#f43f5e",
                  fillOpacity: 0.08,
                  weight: 1,
                  dashArray: "4, 6",
                }}
              />

              {/* Marker with Custom Blood Group Badge */}
              <Marker
                position={[lat, lng]}
                icon={createEmergencyIcon(req.blood_type)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 space-y-2 max-w-[220px]">
                    <div className="flex items-center justify-between border-b pb-1.5">
                      <span className="font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg text-xs">
                        {req.blood_type} Needed
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {req.urgency || "Emergency"}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">
                        {req.patient_name}
                      </h4>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{req.hospital_name}, {req.city}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Units: <strong>{req.units_needed || 1} Bag(s)</strong>
                      </p>
                    </div>

                    <div className="pt-2 border-t flex justify-end">
                      {isRequester ? (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-md font-semibold">
                          Your Call
                        </span>
                      ) : req.user_has_proof ? (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Proof Sent
                        </span>
                      ) : isAccepted ? (
                        <button
                          onClick={() => onUploadProof(req.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-xs"
                        >
                          <Upload className="w-3 h-3" /> Upload Proof
                        </button>
                      ) : (
                        <button
                          onClick={() => onAcceptRequest(req.id, req.patient_name)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition shadow-xs"
                        >
                          Respond Now
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}