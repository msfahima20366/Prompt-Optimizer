
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION_GENERATOR = `You are a helpful and creative AI assistant. You will be given a prompt and must generate a high-quality response that fulfills the user's request precisely and creatively.
Adhere to any specific constraints or formats mentioned in the prompt.
The output should be clean text, without any markdown formatting like bolding (**).`;

export const SYSTEM_INSTRUCTION_META_PROMPT = `You are a world-class AI prompt engineering expert. Your task is to take a user's composed draft and transform it into a single, cohesive, powerful, and detailed 'meta-prompt'.
This final prompt should be structured to instruct another AI (the specified TARGET LLM MODEL) to generate the desired content with extreme clarity and precision.

ENGINEERING REQUIREMENTS:
1. CORE LOGIC INTEGRATION: Deeply weave the requested 'Applied Logic Patterns' into the structural skeleton of the prompt.
   - If 'Expert Role' is active, start with a detailed role definition.
   - If 'Show Examples' is active, include labeled placeholder sections for user-provided examples.
   - If 'Organized Structure' is active, use <tags> to compartmentalize instructions, context, and constraints.
   - If 'Do Not List' is active, create a dedicated 'DO NOT' section with high-priority prohibitions.
   - If 'Thinking Steps' is active, mandate an internal chain-of-thought process.
2. MODEL OPTIMIZATION: Calibrate the technical syntax for the specified TARGET LLM MODEL.
3. DELIMITERS: Use professional delimiters (e.g. ###, ---, <context>) to separate sections.
4. OBJECTIVE PRECISION: Define the AI's role, constraints, and objective with surgical precision.
5. CLEAN OUTPUT: Keep the output as raw text without any markdown (no ** for bold).`;

export const SYSTEM_INSTRUCTION_AUDIT = `You are a Prompt Quality Auditor. Analyze the provided prompt and score it from 0-100 on three metrics: Clarity, Specificity, and Reasoning. Provide results in valid JSON.`;

export const SYSTEM_INSTRUCTION_CRITIQUE = `You are a Senior Prompt Engineer. Look at the optimized prompt and find 3 specific weaknesses. Return a JSON array of objects with "weakness" and "fix_suggestion".`;

const cleanResponse = (text: string | null | undefined): string => {
    if (!text) return '';
    return text.replace(/\*\*/g, '').trim();
}

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY not found. Please check your setup.");
  return new GoogleGenAI({ apiKey });
};

export const generatePrompt = async (
  basePrompt: string,
  temperature: number,
  topP: number,
  systemInstruction?: string
): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
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

export const generatePromptStream = async (
  basePrompt: string,
  temperature: number,
  topP: number,
  systemInstruction?: string
): Promise<AsyncIterable<string>> => {
    const ai = getAI();
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-pro-preview',
        contents: basePrompt,
        config: {
            systemInstruction: systemInstruction || SYSTEM_INSTRUCTION_GENERATOR,
            temperature: temperature,
            topP: topP,
        }
    });

    async function* streamGenerator() {
        for await (const chunk of responseStream) {
            if (chunk.text) yield chunk.text;
        }
    }
    return streamGenerator();
};

export const auditPrompt = async (prompt: string): Promise<any> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Audit this prompt:\n\n${prompt}`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_AUDIT,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        clarity: { type: Type.INTEGER },
                        specificity: { type: Type.INTEGER },
                        reasoning: { type: Type.INTEGER },
                        overall_verdict: { type: Type.STRING }
                    },
                    required: ["clarity", "specificity", "reasoning", "overall_verdict"]
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        return { clarity: 0, specificity: 0, reasoning: 0, overall_verdict: "Audit failed." };
    }
}

export const critiquePrompt = async (prompt: string): Promise<any[]> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Critique this prompt:\n\n${prompt}`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_CRITIQUE,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            weakness: { type: Type.STRING },
                            fix_suggestion: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || '[]');
    } catch (e) {
        return [];
    }
}

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' },
  });
  const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
  if (!base64ImageBytes) throw new Error("No image data received.");
  return `data:image/jpeg;base64,${base64ImageBytes}`;
};
