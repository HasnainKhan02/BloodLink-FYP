import React from 'react';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodTypeSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {BLOOD_TYPES.map((type) => {
        const isSelected = selected === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={`py-3 rounded-xl font-bold transition-all border text-sm ${
              isSelected
                ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-200'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50/50'
            }`}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}