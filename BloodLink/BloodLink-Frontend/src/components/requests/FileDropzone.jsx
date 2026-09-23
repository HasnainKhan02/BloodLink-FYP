import { useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

export default function FileDropzone({ file, onFileSelect }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (fileList) => {
    const selected = fileList?.[0];
    if (selected) onFileSelect(selected);
  };

  const isImage = file && file.type?.startsWith("image/");
  const previewUrl = isImage ? URL.createObjectURL(file) : null;

  return (
    <div>
      <label className="text-xs font-semibold text-slate-500">
        Hospital requisition slip / doctor's prescription
      </label>

      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 text-center transition-colors ${
            dragActive ? "border-[#DC2626] bg-[#FEF2F2]" : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <UploadCloud className="h-8 w-8 text-slate-400" />
          <p className="mt-3 text-sm font-medium text-[#0F172A]">
            Drag and drop, or click to upload
          </p>
          <p className="mt-1 text-xs text-slate-400">PDF, JPG, or PNG</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-4 rounded-xl border border-slate-200 p-4">
          {isImage ? (
            <img src={previewUrl} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-50">
              <FileText className="h-7 w-7 text-slate-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#0F172A]">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
