import { MapPin } from "lucide-react";
import { sortByDistance } from "../../utils/haversine";

const RAW_REQUESTS = [
  { patientName: "Ayesha Bibi", hospital: "Lady Reading Hospital, Peshawar", requiredGroup: "A-", latitude: 34.0151, longitude: 71.5249 },
  { patientName: "Imran Shah", hospital: "Swabi Medical Complex", requiredGroup: "A-", latitude: 34.1203, longitude: 72.4708 },
  { patientName: "Sana Gul", hospital: "Northwest General Hospital", requiredGroup: "A-", latitude: 34.0083, longitude: 71.5350 },
];

export default function NearbyRequestsFeed({ donorLat = 34.1203, donorLon = 72.4708 }) {
  const sorted = sortByDistance(donorLat, donorLon, RAW_REQUESTS);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[#0F172A]">Nearby matching requests</h3>
      <p className="mt-1 text-sm text-slate-500">Sorted by distance from your stored location.</p>

      <div className="mt-5 flex flex-col divide-y divide-slate-100">
        {sorted.map((req, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="font-semibold text-[#0F172A]">{req.patientName}</p>
              <p className="mt-0.5 text-sm text-slate-500">{req.hospital}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="h-3.5 w-3.5" />
                {req.distanceKm.toFixed(1)} km away
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#FEF2F2] px-3 py-1 text-sm font-bold text-[#DC2626]">
                {req.requiredGroup}
              </span>
              <button className="rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E293B]">
                Pledge
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
