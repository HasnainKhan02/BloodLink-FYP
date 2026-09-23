import { Siren, Clock3, CalendarClock } from "lucide-react";

const OPTIONS = [
  {
    value: "CRITICAL",
    label: "Critical",
    description: "Immediate — life at risk",
    icon: Siren,
    activeStyle: "border-[#DC2626] bg-[#FEF2F2]",
    iconStyle: "text-[#DC2626]",
  },
  {
    value: "URGENT",
    label: "Urgent",
    description: "Needed within 24 hours",
    icon: Clock3,
    activeStyle: "border-[#F59E0B] bg-[#F59E0B]/5",
    iconStyle: "text-[#F59E0B]",
  },
  {
    value: "ROUTINE",
    label: "Routine",
    description: "Planned / non-emergency",
    icon: CalendarClock,
    activeStyle: "border-blue-400 bg-blue-50",
    iconStyle: "text-blue-500",
  },
];

export default function UrgencySelector({ value, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-xl border-2 p-5 text-left transition-colors ${
              isActive ? opt.activeStyle : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <opt.icon className={`h-6 w-6 ${isActive ? opt.iconStyle : "text-slate-400"}`} />
            <p className="mt-3 font-bold text-[#0F172A]">{opt.label}</p>
            <p className="mt-1 text-xs text-slate-500">{opt.description}</p>
          </button>
        );
      })}
    </div>
  );
}
