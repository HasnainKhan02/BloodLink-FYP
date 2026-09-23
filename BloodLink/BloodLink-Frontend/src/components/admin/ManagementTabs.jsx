import { useState } from "react";
import { Search } from "lucide-react";

const TABS = ["Donors", "Requests"];

const FILTER_CHIPS = {
  Donors: ["All Donors", "Available Only", "In Cooldown"],
  Requests: ["All Requests", "Critical", "Urgent", "Routine"],
};

const DONORS = [
  { name: "Hasnain Kabir", bloodGroup: "A-", status: "Available", donations: 6 },
  { name: "Zainab Malik", bloodGroup: "O+", status: "In Cooldown", donations: 3 },
  { name: "Usman Tariq", bloodGroup: "B+", status: "Available", donations: 9 },
];

const STATUS_STYLES = {
  Available: "bg-[#10B981]/10 text-[#10B981]",
  "In Cooldown": "bg-[#F59E0B]/10 text-[#B45309]",
};

export default function ManagementTabs() {
  const [tab, setTab] = useState("Donors");
  const [filter, setFilter] = useState(FILTER_CHIPS.Donors[0]);
  const [query, setQuery] = useState("");

  const switchTab = (t) => {
    setTab(t);
    setFilter(FILTER_CHIPS[t][0]);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 pt-5">
        <div className="flex gap-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
                tab === t
                  ? "border-[#DC2626] text-[#0F172A]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTER_CHIPS[tab].map((chip) => (
            <button
              key={chip}
              onClick={() => setFilter(chip)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === chip
                  ? "bg-[#0F172A] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 sm:w-64">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${tab.toLowerCase()}`}
            className="w-full text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {tab === "Donors" && (
        <div className="overflow-x-auto px-6 pb-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-y border-slate-100 text-slate-400">
                <th className="py-3 pr-6 font-medium">Name</th>
                <th className="py-3 pr-6 font-medium">Blood group</th>
                <th className="py-3 pr-6 font-medium">Status</th>
                <th className="py-3 pr-6 font-medium">Donations</th>
              </tr>
            </thead>
            <tbody>
              {DONORS.map((donor, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="py-4 pr-6 font-medium text-[#0F172A]">{donor.name}</td>
                  <td className="py-4 pr-6 text-slate-600">{donor.bloodGroup}</td>
                  <td className="py-4 pr-6">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[donor.status]}`}
                    >
                      {donor.status}
                    </span>
                  </td>
                  <td className="py-4 pr-6 text-slate-600">{donor.donations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Requests" && (
        <div className="px-6 pb-6 text-sm text-slate-400">
          Plug your requests dataset in here, filtered by the chip above.
        </div>
      )}
    </div>
  );
}
