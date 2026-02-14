
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData, AIAnalysis, RiskLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts safety-relevant data from text or images while removing PII.
 * Now extracts multiple medicines.
 */
export async function extractSafetyData(
  description: string,
  base64Image?: string
): Promise<ExtractedData> {
  const prompt = `
    Extract pharmacovigilance safety-relevant data from the following input.
    CRITICAL: Extract ALL medicines mentioned in the prescription or description.
    For each medicine, identify its name, dosage, and frequency.
    
    CRITICAL: DO NOT extract any Personal Identifiable Information (PII) such as patient names, doctor names, addresses, phone numbers, or hospital names.
    If PII is present in the input, IGNORE IT COMPLETELY.

    Extract the following fields:
    - medicines: A list of objects containing name, dosage, and frequency.
    - date: Date of prescription/event (if available).
    - condition: Disease or medical condition name.
    - manufacturer: Pharmaceutical company / Manufacturer name (if visible).

    Input Description: ${description}
  `;

  const contents: any[] = [{ text: prompt }];
  if (base64Image) {
    contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image.split(',')[1] || base64Image,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: contents },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          medicines: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                dosage: { type: Type.STRING },
                frequency: { type: Type.STRING },
              },
              required: ['name', 'dosage', 'frequency'],
            }
          },
          date: { type: Type.STRING },
          condition: { type: Type.STRING },
          manufacturer: { type: Type.STRING },
        },
        required: ['medicines', 'date', 'condition'],
      },
    },
  });

  return JSON.parse(response.text || '{"medicines": []}') as ExtractedData;
}

/**
 * Performs risk analysis and follow-up generation.
 */
export async function analyzeReport(
  reportData: string,
  extractedData: ExtractedData
): Promise<AIAnalysis> {
  const prompt = `
    Analyze the following adverse event report for pharmacovigilance follow-up.
    Report Context: ${reportData}
    Extracted Clinical Data (Multiple Medicines): ${JSON.stringify(extractedData)}

    Tasks:
    1. Detect missing or unclear safety information across all medications mentioned.
    2. Generate exactly 3 relevant follow-up questions to ask the patient about their symptoms or medication regimen.
    3. Assign a risk level (Low, Medium, High).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          missingInfo: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          followUpQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          riskLevel: {
            type: Type.STRING,
            description: 'Risk level: Low, Medium, or High'
          },
        },
        required: ['missingInfo', 'followUpQuestions', 'riskLevel'],
      },
    },
  });

  const raw = JSON.parse(response.text || '{}');
  
  // Normalize risk level to enum
  let risk: RiskLevel = RiskLevel.LOW;
  if (raw.riskLevel?.toLowerCase().includes('high')) risk = RiskLevel.HIGH;
  else if (raw.riskLevel?.toLowerCase().includes('medium')) risk = RiskLevel.MEDIUM;

  return {
    missingInfo: raw.missingInfo || [],
    followUpQuestions: (raw.followUpQuestions || []).slice(0, 3),
    riskLevel: risk,
  };
}
