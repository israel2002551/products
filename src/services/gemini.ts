import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getGeminiResponse = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `You are the BUYSELL Nigeria Shopping Assistant. 
        Your goal is to help users buy, sell, or dropship in Nigeria.
        Key info:
        - Bank: OPay
        - Account: 9061484256
        - Name: Efe Israel
        - Commission: ₦5,000 after 3 months for sellers.
        - Support: WhatsApp +234 906 148 4256.
        Be friendly, use Nigerian slang occasionally (like 'Abeg', 'Chop life', 'No wahala'), and focus on safety and verified sellers.`,
      }
    });

    return response.text || "I'm sorry, I couldn't process that. Please try again or contact support.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Omo, something went wrong with my brain. Please try again later or chat with us on WhatsApp!";
  }
};
