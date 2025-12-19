
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION_GENERATOR = `You are a World-Class Senior Prompt Architect and Professional Copywriter. 
Your goal is to transform messy user drafts into High-Dimensional AI Instructions.

STRICT FORMATTING RULES FOR "OPTIMIZED OUTPUT":
1. NO SYMBOLS: Never use emojis, icons, or symbols (no 🚀, 🎯, 🧠, etc.).
2. STYLE: Professional, clean, and architected. LinkedIn-style airy layout.
3. HEADERS: Use plain text inside brackets for sections, e.g., [SYSTEM PERSONA].
4. SPACING: Add TWO full empty lines between every major section.
5. NO BOLDING: Do not use ** or __. No markdown bold artifacts.
6. NO MARKDOWN HEADERS: Do not use #, ##, or ###.
7. LANGUAGE: If the input is in Bengali or any other language, intelligently translate and optimize it into high-performance English while preserving technical intent.
8. NEGATIVE CONSTRAINTS: Always include a [NEGATIVE CONSTRAINTS: WHAT TO AVOID] section to specify undesirable behaviors.`;

export const getMetaPromptInstruction = (strategy: string, variant: 'A' | 'B' = 'A') => {
    const variation = variant === 'B' ? "Focus on creative, unconventional logic and unique perspective." : "Focus on structural precision, clinical logic, and step-by-step clarity.";
    
    const strategies: Record<string, string> = {
        'meta': `ACT AS A SENIOR PROMPT ARCHITECT. ${variation}
Generate a comprehensive framework with DOUBLE NEWLINES between sections:

[SYSTEM ROLE]
Define a precise expert persona.

[CORE OBJECTIVE]
The primary goal of the prompt.

[STEP-BY-STEP REASONING]
Detailed chain-of-thought instructions.

[NEGATIVE CONSTRAINTS: WHAT TO AVOID]
Behaviors or styles to strictly avoid.

[OUTPUT FORMAT SPECIFICATION]
The final result format requirements.`,
        
        'refined': `ACT AS A PROFESSIONAL EDITOR. ${variation}
Header: [REFINED INSTRUCTION]
Provide a polished, single-block authoritative instruction. Include a [CONSTRAINTS] section at the end.`,
        
        'concise': `ACT AS A TOKEN-EFFICIENCY EXPERT.
Header: [CONCISE POWER PROMPT]
Reduce intent to its most potent logical form. Zero fluff.`,
        
        'technical': `ACT AS A SOLUTIONS ARCHITECT.
Header: [TECHNICAL SPECIFICATION]
Structure as a logic document using [VARIABLES] and [IF/THEN] states.`
    };

    return (strategies[strategy] || strategies['meta']) + "\n\nSTRICT: Use only plain text. No symbols. No emojis. Double spacing.";
};

const cleanResponse = (text: string | null | undefined): string => {
    if (!text) return '';
    let cleaned = text.replace(/\*\*/g, '');
    cleaned = cleaned.replace(/^#+\s*(.*)/gm, '[$1]');
    cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    return cleaned.trim();
}

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY not found.");
  return new GoogleGenAI({ apiKey });
};

export const generatePromptStream = async (
  basePrompt: string,
  temperature: number,
  topP: number,
  systemInstruction?: string
): Promise<AsyncIterable<string>> => {
    const ai = getAI();
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: basePrompt,
        config: {
            systemInstruction: systemInstruction || SYSTEM_INSTRUCTION_GENERATOR,
            temperature: temperature,
            topP: topP,
        }
    });

    async function* streamGenerator() {
        for await (const chunk of responseStream) {
            if (chunk.text) yield cleanResponse(chunk.text);
        }
    }
    return streamGenerator();
};

export const auditPrompt = async (prompt: string): Promise<any> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Audit this prompt for clarity, specificity, and efficiency:\n\n${prompt}`,
            config: {
                systemInstruction: "You are a Prompt Quality Auditor. Provide results in strictly valid JSON.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        clarity: { type: Type.INTEGER },
                        specificity: { type: Type.INTEGER },
                        reasoning: { type: Type.INTEGER },
                        token_efficiency: { type: Type.INTEGER },
                        overall_verdict: { type: Type.STRING }
                    },
                    required: ["clarity", "specificity", "reasoning", "token_efficiency", "overall_verdict"]
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        return { clarity: 0, specificity: 0, reasoning: 0, token_efficiency: 0, overall_verdict: "Audit failed." };
    }
}

export const generatePrompt = async (
  basePrompt: string,
  temperature: number,
  topP: number,
  systemInstruction?: string
): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: basePrompt,
        config: {
          systemInstruction: systemInstruction || SYSTEM_INSTRUCTION_GENERATOR,
          temperature: temperature,
          topP: topP,
        }
    });
    return cleanResponse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } },
    });
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data.");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};
