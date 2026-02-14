
import React, { useState, useRef, useEffect } from 'react';
import { ReporterType, ManualData } from '../types';

interface ReporterFormProps {
  onSubmit: (data: {
    reporterType: ReporterType;
    patientAge: string;
    patientGender: string;
    adverseEventDescription: string;
    fileData?: string;
    manualData?: ManualData;
  }) => void;
}

const DRAFT_KEY = 'safewatch_report_draft';

export const ReporterForm: React.FC<ReporterFormProps> = ({ onSubmit }) => {
  const [reporterType, setReporterType] = useState<ReporterType>(ReporterType.PATIENT);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  
  // Manual fields
  const [manualCondition, setManualCondition] = useState('');
  const [manualDosage, setManualDosage] = useState('');
  const [manualDuration, setManualDuration] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setReporterType(draft.reporterType || ReporterType.PATIENT);
        setAge(draft.patientAge || '');
        setGender(draft.patientGender || '');
        setDescription(draft.adverseEventDescription || '');
        setImage(draft.fileData || null);
        setManualCondition(draft.manualData?.condition || '');
        setManualDosage(draft.manualData?.dosage || '');
        setManualDuration(draft.manualData?.duration || '');
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  const handleSaveDraft = () => {
    const draft = {
      reporterType,
      patientAge: age,
      patientGender: gender,
      adverseEventDescription: description,
      fileData: image,
      manualData: {
        condition: manualCondition,
        dosage: manualDosage,
        duration: manualDuration,
      }
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setSaveMessage("Draft saved successfully!");
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    localStorage.removeItem(DRAFT_KEY);
    onSubmit({
      reporterType,
      patientAge: age,
      patientGender: gender,
      adverseEventDescription: description,
      fileData: image || undefined,
      manualData: image ? {
        condition: manualCondition,
        dosage: manualDosage,
        duration: manualDuration,
      } : undefined,
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">New Safety Report</h2>
        {saveMessage && (
          <span className="text-xs font-bold text-emerald-600 animate-pulse bg-emerald-50 px-2 py-1 rounded">
            {saveMessage}
          </span>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">I am reporting as a:</label>
          <div className="flex gap-4">
            {Object.values(ReporterType).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setReporterType(type)}
                className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                  reporterType === type
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Patient Age</label>
            <input
              type="number"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. 45"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
            <select
              required
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Prescription or Medicine Photo
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors bg-slate-50 relative group"
          >
            {image ? (
              <div className="relative">
                <img src={image} alt="Preview" className="h-32 object-contain rounded" />
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImage(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ) : (
              <>
                <i className="fa-solid fa-camera text-2xl text-slate-400 mb-2 group-hover:text-blue-500 transition-colors"></i>
                <span className="text-sm text-slate-500">Tap to upload or take photo</span>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Conditional Manual Fields */}
        {image && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-4 animate-fade-in">
            <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-file-pen"></i>
              Additional Details from Photo
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Patient Condition/Disease</label>
                <input
                  type="text"
                  value={manualCondition}
                  onChange={(e) => setManualCondition(e.target.value)}
                  className="w-full px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="e.g. Hypertension"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Medicine Dosage</label>
                  <input
                    type="text"
                    value={manualDosage}
                    onChange={(e) => setManualDosage(e.target.value)}
                    className="w-full px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="e.g. 500mg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Medicine Duration</label>
                  <input
                    type="text"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    className="w-full px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="e.g. 7 days"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description of Adverse Event</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="Describe what happened after taking the medication..."
          ></textarea>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 border border-slate-200"
          >
            <i className="fa-solid fa-floppy-disk"></i>
            Save Draft
          </button>
          
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            {isProcessing ? (
              <>
                <i className="fa-solid fa-circle-notch animate-spin"></i>
                Processing with AI...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane"></i>
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
