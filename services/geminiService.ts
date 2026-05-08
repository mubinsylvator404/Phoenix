
import { GoogleGenAI, Type } from "@google/genai";
import { PerformanceInsight } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getPerformanceInsight = async (
  attendance: number,
  score: number,
  assignments: number
): Promise<PerformanceInsight> => {
  try {
    const ai = getAI();
    if (!ai) {
      throw new Error("AI not initialized");
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this HSC Science student's performance: 
      Attendance: ${attendance}%, Exam Score: ${score}%, Assignment Completion: ${assignments}%. 
      Provide a concise 1-sentence academic suggestion.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ['Critical', 'Warning', 'Good', 'Excellent'] },
            color: { type: Type.STRING, description: 'CSS color code like red, yellow, green' },
            message: { type: Type.STRING }
          },
          required: ['status', 'color', 'message']
        }
      }
    });

    // Handle potential undefined or empty text response
    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback logic
    if (score < 50 || attendance < 60) {
      return { status: 'Critical', color: 'red', message: 'Urgent attention required in both attendance and core subjects.' };
    }
    return { status: 'Good', color: 'green', message: 'Maintaining steady progress. Keep focusing on revisions.' };
  }
};
