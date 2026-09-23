import { Check } from "lucide-react";

const STEPS = ["Patient Details", "Urgency & Verification", "Location"];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isComplete = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isComplete
                    ? "bg-[#DC2626] text-white"
                    : isActive
                    ? "border-2 border-[#DC2626] text-[#DC2626]"
                    : "border-2 border-slate-200 text-slate-400"
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span
                className={`mt-2 max-w-[90px] text-center text-xs font-medium ${
                  isActive || isComplete ? "text-[#0F172A]" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {stepNum < STEPS.length && (
              <div
                className={`mx-2 mb-6 h-0.5 flex-1 rounded ${
                  isComplete ? "bg-[#DC2626]" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
