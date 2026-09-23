import UrgencySelector from "./UrgencySelector";
import FileDropzone from "./FileDropzone";

export default function UrgencyVerificationStep({ data, onChange }) {
  return (
    <div className="space-y-8">
      <div>
        <label className="text-xs font-semibold text-slate-500">Urgency level</label>
        <div className="mt-2">
          <UrgencySelector
            value={data.urgency}
            onChange={(urgency) => onChange({ ...data, urgency })}
          />
        </div>
      </div>

      <FileDropzone
        file={data.proofFile}
        onFileSelect={(proofFile) => onChange({ ...data, proofFile })}
      />
    </div>
  );
}
