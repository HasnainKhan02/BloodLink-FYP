import { Droplet, HeartHandshake } from "lucide-react";
import LocationMap from "./LocationMap";

export default function DonorStatsGrid({
  donationsCompleted = 6,
  bloodGroup = "A-",
  latitude,
  longitude,
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <HeartHandshake className="h-6 w-6 text-[#DC2626]" />
        <p className="mt-4 text-3xl font-extrabold text-[#0F172A]">{donationsCompleted}</p>
        <p className="mt-1 text-sm text-slate-500">Lives saved / donations completed</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Droplet className="h-6 w-6 text-[#DC2626]" fill="#DC2626" />
        <p className="mt-4 text-3xl font-extrabold text-[#0F172A]">{bloodGroup}</p>
        <p className="mt-1 text-sm text-slate-500">Your blood group</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="px-2 text-sm font-medium text-slate-500">Stored location</p>
        <div className="mt-2">
          <LocationMap latitude={latitude} longitude={longitude} />
        </div>
      </div>
    </div>
  );
}
