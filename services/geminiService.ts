import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractPromoData = async (text: string): Promise<any> => {
  try {
    const prompt = `
      Extract data for a "Surat Kerjasama Promosi" (Promotion Cooperation Agreement) from the following text.
      If specific fields are missing, leave them as empty strings or default values.
      
      Text to analyze:
      "${text}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            principalName: { type: Type.STRING },
            distributorName: { type: Type.STRING },
            periodStart: { type: Type.STRING, description: "YYYY-MM-DD format" },
            periodEnd: { type: Type.STRING, description: "YYYY-MM-DD format" },
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemCode: { type: Type.STRING },
                  namaProduk: { type: Type.STRING },
                  mekanismePromo: { type: Type.STRING },
                  discountPercent: { type: Type.NUMBER },
                  potongHarga: { type: Type.NUMBER }
                }
              }
            },
            rafaksi: { type: Type.STRING },
            marketingSupport: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Error extraction promo data:", error);
    return null;
  }
};
