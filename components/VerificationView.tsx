
import React, { useState } from 'react';
import { ExtractedData, VerifierRole } from '../types';

interface VerificationViewProps {
  data: ExtractedData;
  onVerify: (role: VerifierRole) => void;
}

export const VerificationView: React.FC<VerificationViewProps> = ({ data, onVerify }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [role, setRole] = useState<VerifierRole>(VerifierRole.PHARMACIST);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <i className="fa-solid fa-user-shield text-xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Verification Step</h2>
      </div>

      <div className="bg-slate-50 rounded-xl p-5 mb-6 space-y-6">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-2">
          <i className="fa-solid fa-microchip text-xs opacity-50"></i>
          AI Extracted Safety Data (PII Redacted)
        </h3>
        
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medicines Found</h4>
          <div className="space-y-3">
            {data.medicines && data.medicines.length > 0 ? (
              data.medicines.map((med, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 grid grid-cols-3 gap-2">
                  <DetailItem label="Name" value={med.name} />
                  <DetailItem label="Dosage" value={med.dosage} />
                  <DetailItem label="Frequency" value={med.frequency} />
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic">No medicines extracted.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-6 pt-2">
          <DetailItem label="Prescription Date" value={data.date} />
          <DetailItem label="Condition" value={data.condition} />
          <DetailItem label="Manufacturer" value={data.manufacturer || 'Unknown'} />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">My Professional Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as VerifierRole)}
            className="w-full px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {Object.values(VerifierRole).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
          <input
            type="checkbox"
            checked={isVerified}
            onChange={(e) => setIsVerified(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded border-slate-300"
          />
          <span className="text-sm font-medium text-slate-700">Verified by Medical & Healthcare Industry Professional</span>
        </label>

        <button
          onClick={() => onVerify(role)}
          disabled={!isVerified}
          className={`w-full py-3 rounded-xl font-bold transition-all ${
            isVerified 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Submit to Pharmaceutical Company
        </button>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">{label}</span>
    <span className="text-slate-700 font-medium break-words text-sm">{value || 'N/A'}</span>
  </div>
);
