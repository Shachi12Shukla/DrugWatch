
export enum ReporterType {
  PATIENT = 'Patient',
  PHARMACIST = 'Pharmacist'
}

export enum VerifierRole {
  DOCTOR = 'Doctor',
  PHARMACIST = 'Pharmacist',
  MEDICAL_REP = 'Medical Representative'
}

export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum ReportStatus {
  INCOMPLETE = 'Incomplete',
  FOLLOW_UP_REQUIRED = 'Follow-up required',
  COMPLETED = 'Completed'
}

export interface MedicineDetail {
  name: string;
  dosage: string;
  frequency: string;
}

export interface ExtractedData {
  medicines: MedicineDetail[];
  date: string;
  condition: string;
  manufacturer?: string;
}

export interface ManualData {
  condition: string;
  dosage: string;
  duration: string;
}

export interface AIAnalysis {
  missingInfo: string[];
  followUpQuestions: string[];
  riskLevel: RiskLevel;
}

export interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
}

export interface PharmacovigilanceReport {
  id: string;
  createdAt: number;
  reporterType: ReporterType;
  patientAge: string;
  patientGender: string;
  adverseEventDescription: string;
  fileData?: string; // Base64
  extractedData?: ExtractedData;
  manualData?: ManualData;
  isVerified: boolean;
  verifierRole?: VerifierRole;
  analysis?: AIAnalysis;
  status: ReportStatus;
  chatHistory?: ChatMessage[];
}
