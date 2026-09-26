import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Navbar from "../components/layout/Navbar";
import StepIndicator from "../components/requests/StepIndicator";
import PatientDetailsStep from "../components/requests/PatientDetailsStep";
import UrgencyVerificationStep from "../components/requests/UrgencyVerificationStep";

// Dynamically Inject Leaflet CSS & Container Styles
const LeafletMapStyles = () => {
  useEffect(() => {
    const linkId = "leaflet-css-cdn";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <style>{`
      .leaflet-container {
        width: 100%;
        height: 100%;
        border-radius: 1rem;
        z-index: 10;
      }
    `}</style>
  );
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (center) map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

function LocationStepComponent({ data, onChange }) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  const defaultCenter = [34.1202, 72.47];
  const position =
    data.latitude && data.longitude
      ? [data.latitude, data.longitude]
      : defaultCenter;
  const zoomLevel = data.latitude && data.longitude ? 16 : 12;

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      if (!response.ok) throw new Error("Failed to resolve address");

      const result = await response.json();
      const addr = result.address || {};

      const detectedCity =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.county ||
        addr.state_district ||
        "";

      const streetParts = [
        addr.road || addr.pedestrian || addr.suburb,
        addr.neighbourhood || addr.residential,
        addr.city_district,
      ].filter(Boolean);

      const detectedAddress =
        streetParts.length > 0
          ? streetParts.join(", ")
          : result.display_name || "";

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
        setGeoError("Location permission denied or unavailable.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

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
      <LeafletMapStyles />
      {geoError && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-600 font-medium">
          {geoError}
        </div>
      )}

      <button
        type="button"
        onClick={handleDetectLocation}
        disabled={locating}
        className="w-full py-3 px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-sm font-bold hover:bg-rose-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {locating
          ? "📍 Acquiring High-Accuracy GPS Fix..."
          : "🎯 Use My Current Location"}
      </button>

      {/* Map Container */}
      <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
        <MapContainer
          center={position}
          zoom={zoomLevel}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={position}
            icon={markerIcon}
            draggable={true}
            eventHandlers={eventHandlers}
          />
          <MapController center={position} zoom={zoomLevel} />
        </MapContainer>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Hospital / Medical Center Name *
          </label>
          <input
            type="text"
            required
            value={data.hospitalName}
            onChange={(e) =>
              onChange({ ...data, hospitalName: e.target.value })
            }
            placeholder="e.g. Swabi Medical Complex"
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              City *
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
              GPS Coordinates *
            </label>
            <input
              type="text"
              readOnly
              value={
                data.latitude && data.longitude
                  ? `${Number(data.latitude).toFixed(4)}, ${Number(data.longitude).toFixed(4)}`
                  : "Not set (click locate button)"
              }
              className="w-full rounded-xl border border-slate-200 p-3 text-sm bg-slate-50 text-slate-500 font-mono text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Detailed Street Address *
          </label>
          <textarea
            required
            rows={2}
            value={data.address}
            onChange={(e) => onChange({ ...data, address: e.target.value })}
            placeholder="Emergency Ward, Floor number, landmark..."
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>
    </div>
  );
}

const INITIAL_DATA = {
  patientName: "",
  age: "",
  bloodGroup: "O+",
  unitsNeeded: 1,
  urgency: "CRITICAL",
  proofFile: null,
  latitude: null,
  longitude: null,
  hospitalName: "",
  city: "",
  address: "",
};

export default function CreateRequestPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load User Data for Navbar
  const currentUser = JSON.parse(localStorage.getItem("bloodlink_user") || "{}");

  const validateStep = (currentStep) => {
    setError("");

    if (currentStep === 1) {
      if (!data.patientName.trim()) {
        setError("Patient Name is required.");
        return false;
      }
      if (!data.age || Number(data.age) <= 0) {
        setError("Please enter a valid Patient Age.");
        return false;
      }
      if (!data.unitsNeeded || Number(data.unitsNeeded) <= 0) {
        setError("Please specify required Blood Units.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (!data.urgency) {
        setError("Please select an Urgency Level.");
        return false;
      }
      if (!data.proofFile) {
        setError("Please upload a medical proof or hospital requisition document.");
        return false;
      }
    }

    if (currentStep === 3) {
      if (!data.hospitalName.trim()) {
        setError("Hospital / Medical Center Name is required.");
        return false;
      }
      if (!data.city.trim()) {
        setError("City is required.");
        return false;
      }
      if (!data.address.trim()) {
        setError("Detailed Address is required.");
        return false;
      }
      if (!data.latitude || !data.longitude) {
        setError("Please click 'Use My Current Location' or set position on map.");
        return false;
      }
    }

    return true;
  };

  const next = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 3));
    }
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  // Prevent early form submit on pressing Enter key in inputs
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && step < 3) {
      e.preventDefault();
      next();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    setLoading(true);
    setError("");

    const token = localStorage.getItem("bloodlink_token");

    if (!token) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      navigate("/auth", { state: { redirectTo: "/create-request" } });
      return;
    }

    const formData = new FormData();
    formData.append("patient_name", data.patientName);
    formData.append("age", data.age);
    formData.append("blood_type", data.bloodGroup);
    formData.append("units_needed", data.unitsNeeded);
    formData.append("urgency", data.urgency);
    formData.append("hospital_name", data.hospitalName);
    formData.append("city", data.city);
    formData.append("address", data.address);
    formData.append("latitude", data.latitude);
    formData.append("longitude", data.longitude);

    if (data.proofFile) {
      formData.append("proof_document", data.proofFile);
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/requests", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          const firstKey = Object.keys(result.errors)[0];
          throw new Error(`${firstKey}: ${result.errors[firstKey][0]}`);
        }
        throw new Error(result.message || "Failed to broadcast request.");
      }

      alert("Emergency blood request broadcasted successfully!");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      <Navbar userName={currentUser.name || "Requester"} />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Create a blood request
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Every field helps donors respond faster.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-600">
            ⚠️ {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
        >
          <StepIndicator currentStep={step} />

          <div className="mt-8">
            {step === 1 && (
              <PatientDetailsStep data={data} onChange={setData} />
            )}
            {step === 2 && (
              <UrgencyVerificationStep data={data} onChange={setData} />
            )}
            {step === 3 && (
              <LocationStepComponent data={data} onChange={setData} />
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={back}
                disabled={loading}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Back
              </button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={next}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 cursor-pointer"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:bg-rose-300 cursor-pointer shadow-md shadow-rose-600/20"
              >
                {loading
                  ? "Broadcasting..."
                  : "Broadcast Request to Nearby Donors"}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}