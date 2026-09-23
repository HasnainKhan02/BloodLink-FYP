import React from 'react';
import { FileCheck, Upload, AlertCircle } from 'lucide-react';

export default function VerificationDocsUpload({ documents }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
        <FileCheck className="w-4 h-4 text-emerald-500" />
        <span>Verification Documents</span>
      </h3>

      <div className="space-y-2.5">
        {documents.map((doc, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
            <div className="flex items-center space-x-2.5">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="font-semibold text-slate-800">{doc.name}</p>
                <p className="text-[10px] text-slate-400">Uploaded on {doc.date}</p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
              VERIFIED
            </span>
          </div>
        ))}
      </div>

      <button className="w-full py-2.5 border border-dashed border-slate-300 hover:border-rose-400 hover:bg-rose-50/30 text-slate-600 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all">
        <Upload className="w-3.5 h-3.5 text-slate-400" />
        <span>Upload New Medical Report / ID</span>
      </button>
    </div>
  );
}