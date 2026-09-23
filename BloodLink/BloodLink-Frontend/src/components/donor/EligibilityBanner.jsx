import { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";

export default function EligibilityBanner({
  eligible = true,
  cooldownDaysRemaining = 34,
  cooldownIntervalDays = 90,
}) {
  const [available, setAvailable] = useState(true);

  if (eligible) {
    return (
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#10B981]/20 bg-[#10B981]/5 p-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[#10B981]" />
          <div>
            <p className="font-bold text-[#0F172A]">You're eligible to donate!</p>
            <p className="mt-0.5 text-sm text-slate-500">
              You can be matched with nearby emergency requests right now.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">
            Available for emergency requests
          </span>
          <button
            role="switch"
            aria-checked={available}
            onClick={() => setAvailable((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              available ? "bg-[#10B981]" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                available ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>
      </div>
    );
  }

  const progress = Math.round(
    ((cooldownIntervalDays - cooldownDaysRemaining) / cooldownIntervalDays) * 100
  );

  return (
    <div className="rounded-2xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-6">
      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 h-6 w-6 shrink-0 text-[#F59E0B]" />
        <div className="w-full">
          <p className="font-bold text-[#0F172A]">
            Cooldown active: {cooldownDaysRemaining} days remaining
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            Your next eligible donation date follows the {cooldownIntervalDays}-day interval rule.
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-[#F59E0B]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
