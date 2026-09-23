import { Ban, X } from "lucide-react";

const REPORTS = [
  { user: "unknown_user_44", reason: "Duplicate spam requests", reportedBy: "3 users" },
  { user: "fake_req_88", reason: "Fabricated hospital details", reportedBy: "1 user" },
  { user: "spammer_01", reason: "Solicited payment for blood", reportedBy: "5 users" },
];

export default function ModerationFeed() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6 pb-0">
        <h3 className="text-lg font-bold text-[#0F172A]">Spam &amp; abuse moderation</h3>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-y border-slate-100 text-slate-400">
              <th className="px-6 py-3 font-medium">Reported user</th>
              <th className="px-6 py-3 font-medium">Reason</th>
              <th className="px-6 py-3 font-medium">Flagged by</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {REPORTS.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-4 font-medium text-[#0F172A]">{row.user}</td>
                <td className="px-6 py-4 text-slate-600">{row.reason}</td>
                <td className="px-6 py-4 text-slate-400">{row.reportedBy}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#FEF2F2] px-3 py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-[#DC2626]/10">
                      <Ban className="h-3.5 w-3.5" />
                      Ban Requester
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                      <X className="h-3.5 w-3.5" />
                      Dismiss
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
