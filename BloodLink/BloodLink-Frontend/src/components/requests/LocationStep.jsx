import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

// Custom Marker Pin Icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Helper component to smoothly animate & zoom map to new location
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function LocationStep({ data, onChange }) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  // Default initial position (Swabi center if null)
  const defaultCenter = [34.1202, 72.4700];
  const position = data.latitude && data.longitude ? [data.latitude, data.longitude] : defaultCenter;
  const zoomLevel = data.latitude && data.longitude ? 16 : 12;

  // Reverse geocode coordinates to City & Address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      if (!response.ok) throw new Error("Failed to fetch address");

      const result = await response.json();
      const addr = result.address || {};

      const detectedCity =
        addr.city || addr.town || addr.village || addr.county || addr.state_district || "";

      const streetParts = [
        addr.road || addr.pedestrian || addr.suburb,
        addr.neighbourhood || addr.residential,
        addr.city_district,
      ].filter(Boolean);

      const detectedAddress = streetParts.length > 0 ? streetParts.join(", ") : result.display_name || "";

      onChange((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        city: detectedCity || prev.city,
        address: detectedAddress || prev.address,
      }));
    } catch (err) {
      onChange((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    }
  };

  // High-Precision Geolocation Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        await reverseGeocode(lat, lng);
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Location permission denied. Please allow location access in browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("GPS position unavailable. Try moving to an open area or entering address manually.");
            break;
          case error.TIMEOUT:
            setGeoError("GPS location timeout. Please try again.");
            break;
          default:
            setGeoError("Unable to acquire high-accuracy GPS fix.");
        }
      },
      {
        enableHighAccuracy: true, // Forces GPS sensor instead of IP address estimation
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Marker Drag End Handler
  const eventHandlers = useMemo(
    () => ({
      dragend(e) {
        const marker = e.target;
        if (marker != null) {
          const latLng = marker.getLatLng();
          reverseGeocode(latLng.lat, latLng.lng);
        }
      },
    }),
    []
  );

  return (
    <div className="space-y-5">
      {geoError && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-600 font-medium">
          {geoError}
        </div>
      )}

      {/* Locate Button */}
      <button
        type="button"
        onClick={handleDetectLocation}
        disabled={locating}
        className="w-full py-3 px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-sm font-bold hover:bg-rose-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {locating ? "📍 Acquiring High-Accuracy GPS Fix..." : "🎯 Use My Current Location"}
      </button>

      {/* Interactive Leaflet Map */}
      <div className="h-56 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
        <MapContainer center={position} zoom={zoomLevel} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://www.openstreetmap.org/tile/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={markerIcon} draggable={true} eventHandlers={eventHandlers} />
          <MapController center={position} zoom={zoomLevel} />
        </MapContainer>
      </div>

      <p className="text-[11px] text-slate-400 text-center">
        Tip: You can drag the map marker pin to adjust your exact hospital / emergency location.
      </p>

      {/* Location Input Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Hospital / Medical Center Name
          </label>
          <input
            type="text"
            required
            value={data.hospitalName}
            onChange={(e) => onChange({ ...data, hospitalName: e.target.value })}
            placeholder="e.g. Swabi Medical Complex / Bacha Khan Medical Complex"
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              City
            </label>
            <input
              type="text"
              required
              value={data.city}
              onChange={(e) => onChange({ ...data, city: e.target.value })}
              placeholder="e.g. Swabi"
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Coordinates
            </label>
            <input
              type="text"
              readOnly
              value={
                data.latitude && data.longitude
                  ? `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`
                  : "Not set"
              }
              className="w-full rounded-xl border border-slate-200 p-3 text-sm bg-slate-50 text-slate-500 font-mono text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Detailed Street Address
          </label>
          <textarea
            required
            rows={2}
            value={data.address}
            onChange={(e) => onChange({ ...data, address: e.target.value })}
            placeholder="Emergency Ward, Floor number, Near landmark..."
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>
    </div>
  );
}