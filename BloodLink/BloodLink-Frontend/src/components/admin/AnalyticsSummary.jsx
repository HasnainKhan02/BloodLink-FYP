import { Users, Activity, HeartHandshake, ClipboardList } from "lucide-react";

const METRICS = [
  { label: "Total registered donors", value: "4,812", icon: Users },
  { label: "Active blood requests", value: "37", icon: Activity },
  { label: "Fulfilled matches", value: "1,840", icon: HeartHandshake },
  { label: "Pending verification", value: "12", icon: ClipboardList },
];

export default function AnalyticsSummary() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {METRICS.map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <metric.icon className="h-6 w-6 text-[#DC2626]" />
          <p className="mt-4 text-2xl font-extrabold text-[#0F172A]">{metric.value}</p>
          <p className="mt-1 text-sm text-slate-500">{metric.label}</p>
        </div>
      ))}
    </div>
  );
}
