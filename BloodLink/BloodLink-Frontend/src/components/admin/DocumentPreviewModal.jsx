import { X, FileText } from "lucide-react";

export default function DocumentPreviewModal({ requester, onClose }) {
  if (!requester) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#0F172A]">Requisition proof</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-1 text-sm text-slate-500">Submitted by {requester.name}</p>

        <div className="mt-5 flex h-64 items-center justify-center rounded-xl bg-slate-50">
          <div className="text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm text-slate-400">{requester.fileName}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
          >
            Close
          </button>
          <button className="rounded-xl bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0ea371]">
            Approve & Broadcast
          </button>
        </div>
      </div>
    </div>
  );
}
