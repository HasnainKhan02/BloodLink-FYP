import { Award } from "lucide-react";

const HISTORY = [
  { date: "2026-06-12", hospital: "Lady Reading Hospital", status: "Verified" },
  { date: "2026-02-03", hospital: "Swabi Medical Complex", status: "Verified" },
  { date: "2025-10-21", hospital: "Northwest General Hospital", status: "Completed" },
];

const STATUS_STYLES = {
  Verified: "bg-[#10B981]/10 text-[#10B981]",
  Completed: "bg-slate-100 text-slate-600",
};

export default function DonationHistoryTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6 pb-0">
        <h3 className="text-lg font-bold text-[#0F172A]">Donation history</h3>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-y border-slate-100 text-slate-400">
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Recipient hospital</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Badge</th>
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-4 text-slate-600">{row.date}</td>
                <td className="px-6 py-4 font-medium text-[#0F172A]">{row.hospital}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Award className="h-5 w-5 text-[#F59E0B]" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
