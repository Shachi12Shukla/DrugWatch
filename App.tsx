
import React, { useState } from 'react';
import { 
  PharmacovigilanceReport, 
  ReportStatus, 
  ReporterType, 
  VerifierRole, 
  ExtractedData,
  ManualData
} from './types';
import { ReporterForm } from './components/ReporterForm';
import { VerificationView } from './components/VerificationView';
import { Dashboard } from './components/Dashboard';
import { ChatbotSection } from './components/ChatbotSection';
import { extractSafetyData, analyzeReport } from './services/geminiService';

enum AppView {
  ENTRY = 'entry',
  VERIFICATION = 'verification',
  SUCCESS = 'success',
  COMPANY_DASHBOARD = 'dashboard',
  CHATBOT = 'chatbot'
}

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.ENTRY);
  const [reports, setReports] = useState<PharmacovigilanceReport[]>([]);
  const [currentReport, setCurrentReport] = useState<PharmacovigilanceReport | null>(null);
  const [activeChatReport, setActiveChatReport] = useState<PharmacovigilanceReport | null>(null);

  const handleEntrySubmit = async (data: {
    reporterType: ReporterType;
    patientAge: string;
    patientGender: string;
    adverseEventDescription: string;
    fileData?: string;
    manualData?: ManualData;
  }) => {
    try {
      // Step 1: Extract Safety Data
      const extracted = await extractSafetyData(data.adverseEventDescription, data.fileData);
      
      const newReport: PharmacovigilanceReport = {
        id: Math.random().toString(36).substring(2, 9),
        createdAt: Date.now(),
        reporterType: data.reporterType,
        patientAge: data.patientAge,
        patientGender: data.patientGender,
        adverseEventDescription: data.adverseEventDescription,
        fileData: data.fileData,
        manualData: data.manualData,
        extractedData: extracted,
        isVerified: false,
        status: ReportStatus.INCOMPLETE,
      };

      setCurrentReport(newReport);
      setView(AppView.VERIFICATION);
    } catch (error) {
      console.error("AI Extraction failed", error);
      alert("AI extraction encountered an error. Please try again.");
    }
  };

  const handleVerification = async (role: VerifierRole) => {
    if (!currentReport || !currentReport.extractedData) return;

    try {
      // Step 2: AI Analysis
      const analysis = await analyzeReport(currentReport.adverseEventDescription, currentReport.extractedData);
      
      const updatedReport: PharmacovigilanceReport = {
        ...currentReport,
        isVerified: true,
        verifierRole: role,
        analysis: analysis,
        status: ReportStatus.FOLLOW_UP_REQUIRED,
      };

      setReports((prev) => [updatedReport, ...prev]);
      setCurrentReport(null);
      setView(AppView.SUCCESS);
    } catch (error) {
      console.error("AI Analysis failed", error);
      alert("Safety analysis failed. Please verify connection.");
    }
  };

  const handleDeleteReport = (id: string) => {
    setReports((prev) => prev.filter(r => r.id !== id));
  };

  const updateReportChatHistory = (updatedReport: PharmacovigilanceReport) => {
    setReports((prev) => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
    setActiveChatReport(updatedReport);
  };

  const startChatbot = (report: PharmacovigilanceReport) => {
    setActiveChatReport(report);
    setView(AppView.CHATBOT);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Global Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(AppView.ENTRY)}>
            <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-200">
              <i className="fa-solid fa-shield-heart text-white text-lg"></i>
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">DrugWatch</span>
          </div>
          <nav className="flex gap-2">
            <button 
              onClick={() => setView(AppView.ENTRY)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === AppView.ENTRY || view === AppView.VERIFICATION || view === AppView.SUCCESS
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <i className="fa-solid fa-pen-to-square mr-2"></i>
              Reporter
            </button>
            <button 
              onClick={() => {
                if (reports.length > 0) startChatbot(reports[0]);
                else alert("Submit a report first to use the safety assistant.");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === AppView.CHATBOT 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <i className="fa-solid fa-robot mr-2"></i>
              Safety Assistant
            </button>
            <button 
              onClick={() => setView(AppView.COMPANY_DASHBOARD)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === AppView.COMPANY_DASHBOARD 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <i className="fa-solid fa-chart-line mr-2"></i>
              Company Dashboard
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 pt-8">
        {view === AppView.ENTRY && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Report a Safety Concern</h1>
              <p className="text-slate-500 leading-relaxed">Your feedback helps pharmaceutical companies improve medicine safety for everyone. Reports are processed using secure AI to protect your identity.</p>
            </div>
            <ReporterForm onSubmit={handleEntrySubmit} />
          </div>
        )}

        {view === AppView.VERIFICATION && currentReport && currentReport.extractedData && (
          <div className="animate-fade-in">
             <VerificationView 
              data={currentReport.extractedData} 
              onVerify={handleVerification} 
            />
          </div>
        )}

        {view === AppView.SUCCESS && (
          <div className="animate-fade-in max-w-xl mx-auto text-center py-20 space-y-6">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <i className="fa-solid fa-check text-5xl"></i>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900">Submission Successful</h2>
              <p className="text-slate-500">The report has been securely transmitted to the pharmaceutical safety team for further evaluation.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button 
                onClick={() => setView(AppView.COMPANY_DASHBOARD)}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-chart-line"></i>
                View in Dashboard
              </button>
              <button 
                onClick={() => {
                  if (reports.length > 0) startChatbot(reports[0]);
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-robot"></i>
                Talk to Assistant
              </button>
            </div>
          </div>
        )}

        {view === AppView.CHATBOT && activeChatReport && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
             <div className="text-center">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Patient Follow-up Chat</h1>
                <p className="text-slate-500 text-sm">Automated assistant conducting safety interviews for <b>{activeChatReport.extractedData?.medicines?.[0]?.name || 'reported medications'}</b></p>
             </div>
             <ChatbotSection report={activeChatReport} onUpdateReport={updateReportChatHistory} />
          </div>
        )}

        {view === AppView.COMPANY_DASHBOARD && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Safety Surveillance</h1>
                <p className="text-slate-500">Monitoring real-time adverse event signals and follow-ups.</p>
              </div>
              <div className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg">
                <i className="fa-solid fa-lock"></i>
                Authorized Access
              </div>
            </div>
            <Dashboard reports={reports} onDelete={handleDeleteReport} />
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
