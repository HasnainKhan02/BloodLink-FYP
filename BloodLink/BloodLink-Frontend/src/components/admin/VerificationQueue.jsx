import { useState } from "react";
import { Eye, Check, Flag } from "lucide-react";
import DocumentPreviewModal from "./DocumentPreviewModal";

const QUEUE = [
  { name: "Imran Shah", hospital: "Swabi Medical Complex", bloodGroup: "A-", submitted: "2h ago", fileName: "requisition_slip.pdf" },
  { name: "Sana Gul", hospital: "Northwest General Hospital", bloodGroup: "O+", submitted: "5h ago", fileName: "prescription.jpg" },
  { name: "Bilal Khan", hospital: "Lady Reading Hospital", bloodGroup: "B+", submitted: "1d ago", fileName: "requisition_slip.pdf" },
];

export default function VerificationQueue() {
  const [previewing, setPreviewing] = useState(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6 pb-0">
        <h3 className="text-lg font-bold text-[#0F172A]">Pending verification queue</h3>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-y border-slate-100 text-slate-400">
              <th className="px-6 py-3 font-medium">Requester</th>
              <th className="px-6 py-3 font-medium">Hospital</th>
              <th className="px-6 py-3 font-medium">Group</th>
              <th className="px-6 py-3 font-medium">Submitted</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {QUEUE.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-4 font-medium text-[#0F172A]">{row.name}</td>
                <td className="px-6 py-4 text-slate-600">{row.hospital}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-[#FEF2F2] px-2.5 py-1 text-xs font-bold text-[#DC2626]">
                    {row.bloodGroup}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{row.submitted}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewing(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                      title="View proof document"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#10B981] hover:bg-[#10B981]/10"
                      title="Approve & broadcast"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#DC2626] hover:bg-[#FEF2F2]"
                      title="Reject / flag"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DocumentPreviewModal requester={previewing} onClose={() => setPreviewing(null)} />
    </div>
  );
}
