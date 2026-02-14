
import React, { useState, useEffect } from 'react';
import { PharmacovigilanceReport, ReportStatus, RiskLevel } from '../types';

interface DashboardProps {
  reports: PharmacovigilanceReport[];
  onDelete: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ reports, onDelete }) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const selectedReport = reports.find(r => r.id === selectedReportId);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      if (selectedReportId === id) setSelectedReportId(null);
      onDelete(id);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* List Panel */}
      <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Reports ({reports.length})</h2>
          <div className="flex gap-1">
             <div className="w-2 h-2 rounded-full bg-red-400"></div>
             <div className="w-2 h-2 rounded-full bg-orange-400"></div>
             <div className="w-2 h-2 rounded-full bg-green-400"></div>
          </div>
        </div>
        <div className="divide-y divide-slate-100 max-h-[calc(100vh-250px)] overflow-y-auto">
          {reports.length === 0 ? (
            <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
              <i className="fa-solid fa-folder-open text-4xl opacity-20"></i>
              <p className="text-sm">No reports received yet.</p>
            </div>
          ) : (
            reports.map((report) => (
              <div 
                key={report.id}
                className={`group w-full text-left p-4 hover:bg-slate-50 transition-all relative border-l-4 ${
                  selectedReportId === report.id 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-start pr-8">
                  <span className="font-bold text-slate-800 truncate text-sm">
                    {report.extractedData?.medicines?.[0]?.name || 'Unknown Medicine'}
                    {report.extractedData?.medicines && report.extractedData.medicines.length > 1 && ' + more'}
                  </span>
                  <RiskBadge level={report.analysis?.riskLevel || RiskLevel.LOW} />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedReportId(report.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-colors uppercase"
                    >
                      View
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, report.id)}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <i className="fa-solid fa-trash-can text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Details View - The "Report Card" */}
      <div 
        id="report-detail-view"
        className="flex-1 w-full bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 p-0 overflow-hidden min-h-[600px] relative"
      >
        {selectedReport ? (
          <div className="animate-fade-in flex flex-col h-full">
            {/* Report Card Header */}
            <div className="bg-slate-900 text-white p-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Case #{selectedReport.id}
                    </span>
                    <RiskBadge level={selectedReport.analysis?.riskLevel || RiskLevel.LOW} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mt-3">
                    {selectedReport.extractedData?.medicines?.[0]?.name || 'Adverse Event Report'}
                    {selectedReport.extractedData?.medicines && selectedReport.extractedData.medicines.length > 1 && ` (+${selectedReport.extractedData.medicines.length - 1} others)`}
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">
                    Reported by {selectedReport.reporterType} on {new Date(selectedReport.createdAt).toLocaleString()}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedReportId(null)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-10 flex-1 overflow-y-auto max-h-[700px]">
              {/* Medicines Grid */}
              <section>
                <h3 className="text-[10px] uppercase font-black text-slate-400 mb-4 tracking-[0.2em] flex items-center gap-2">
                  <i className="fa-solid fa-pills text-blue-500"></i>
                  Extracted Medications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedReport.extractedData?.medicines?.map((med, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{med.name}</span>
                        <i className="fa-solid fa-prescription text-slate-300"></i>
                      </div>
                      <div className="flex gap-4">
                        <ReportDetail label="Dosage" value={med.dosage} />
                        <ReportDetail label="Frequency" value={med.frequency} />
                      </div>
                    </div>
                  ))}
                  {(!selectedReport.extractedData?.medicines || selectedReport.extractedData.medicines.length === 0) && (
                    <p className="text-sm text-slate-400 italic">No medications extracted.</p>
                  )}
                </div>
              </section>

              {/* Manual vs Extracted Data Comparison */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <section>
                  <h3 className="text-[10px] uppercase font-black text-slate-400 mb-4 tracking-[0.2em] flex items-center gap-2">
                    <i className="fa-solid fa-microchip text-blue-500"></i>
                    Prescription Meta
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-2 gap-y-6 gap-x-4">
                    <ReportDetail label="Condition" value={selectedReport.extractedData?.condition} />
                    <ReportDetail label="Manufacturer" value={selectedReport.extractedData?.manufacturer} />
                    <ReportDetail label="Date Found" value={selectedReport.extractedData?.date} />
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] uppercase font-black text-slate-400 mb-4 tracking-[0.2em] flex items-center gap-2">
                    <i className="fa-solid fa-user-pen text-orange-500"></i>
                    Manually Entered Data
                  </h3>
                  <div className="bg-orange-50/30 p-6 rounded-2xl border border-orange-100 grid grid-cols-2 gap-y-6 gap-x-4">
                    <ReportDetail label="Manual Condition" value={selectedReport.manualData?.condition} />
                    <ReportDetail label="Manual Dosage" value={selectedReport.manualData?.dosage} />
                    <ReportDetail label="Manual Duration" value={selectedReport.manualData?.duration} />
                    <ReportDetail label="Verifier Type" value={selectedReport.verifierRole} />
                  </div>
                </section>
              </div>

              {/* Narrative Section */}
              <section>
                <h3 className="text-[10px] uppercase font-black text-slate-400 mb-4 tracking-[0.2em] flex items-center gap-2">
                  <i className="fa-solid fa-quote-left text-slate-500"></i>
                  Full Event Narrative
                </h3>
                <div className="bg-white p-6 border border-slate-100 rounded-2xl shadow-sm leading-relaxed text-slate-700 italic text-sm">
                  "{selectedReport.adverseEventDescription}"
                </div>
              </section>

              {/* Patient Profile */}
              <section>
                <h3 className="text-[10px] uppercase font-black text-slate-400 mb-4 tracking-[0.2em] flex items-center gap-2">
                  <i className="fa-solid fa-user text-slate-500"></i>
                  Patient Demographics
                </h3>
                <div className="flex gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                   <ReportDetail label="Age" value={`${selectedReport.patientAge} Years`} />
                   <ReportDetail label="Gender" value={selectedReport.patientGender} />
                   <ReportDetail label="Reporter" value={selectedReport.reporterType} />
                </div>
              </section>

              {/* AI Analysis Card */}
              <section className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                    <i className="fa-solid fa-robot text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-blue-900 tracking-tight">AI Generated Follow-up</h3>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">Protocol Generation</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {selectedReport.analysis?.followUpQuestions.map((q, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-blue-100 text-sm text-slate-800 shadow-sm flex gap-4 items-start">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black">{i + 1}</span>
                      <span className="leading-relaxed">{q}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            
            {/* Report Card Footer Actions */}
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedReportId(null)}
                className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                Close Report
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-6 py-20 bg-slate-50/50">
            <div className="w-24 h-24 bg-white shadow-xl shadow-slate-200 rounded-3xl flex items-center justify-center">
              <i className="fa-solid fa-clipboard-check text-4xl text-blue-500 opacity-40"></i>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-800">Review Selection Pending</h3>
              <p className="text-sm max-w-xs mx-auto mt-2 text-slate-400">Please select a report from the list to open the detailed safety profile card.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
  const styles = {
    [RiskLevel.LOW]: 'bg-emerald-500 text-white',
    [RiskLevel.MEDIUM]: 'bg-amber-500 text-white',
    [RiskLevel.HIGH]: 'bg-rose-500 text-white',
  };
  return <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${styles[level]}`}>{level} Risk</span>;
};

const ReportDetail: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="space-y-1">
    <label className="block text-[9px] text-slate-400 font-black uppercase tracking-widest">{label}</label>
    <span className="text-sm font-bold text-slate-800 break-words leading-tight block">{value || 'Not provided'}</span>
  </div>
);
