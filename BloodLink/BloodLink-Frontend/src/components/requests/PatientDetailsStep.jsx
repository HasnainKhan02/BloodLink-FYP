const GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function PatientDetailsStep({ data, onChange }) {
  const set = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="text-xs font-semibold text-slate-500">Patient name</label>
        <input
          type="text"
          value={data.patientName}
          onChange={set("patientName")}
          placeholder="Full name"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 focus:border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500">Age</label>
        <input
          type="number"
          min={0}
          value={data.age}
          onChange={set("age")}
          placeholder="e.g. 34"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 focus:border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500">Required blood group</label>
        <select
          value={data.bloodGroup}
          onChange={set("bloodGroup")}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[#0F172A] focus:border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20"
        >
          {GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label className="text-xs font-semibold text-slate-500">Units needed</label>
        <input
          type="number"
          min={1}
          value={data.unitsNeeded}
          onChange={set("unitsNeeded")}
          placeholder="e.g. 2"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 focus:border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 sm:w-48"
        />
      </div>
    </div>
  );
}
