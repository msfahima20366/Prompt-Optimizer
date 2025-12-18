
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION_GENERATOR = `You are a helpful and creative AI assistant. You will be given a prompt and must generate a high-quality response that fulfills the user's request precisely and creatively.
Adhere to any specific constraints or formats mentioned in the prompt.
The output should be clean text, without any markdown formatting like bolding (**).`;

const SYSTEM_INSTRUCTION_SURPRISE = `You are a creative idea generator.
Your task is to invent a compelling and concise base idea for a prompt, and then expand that idea into a full, detailed paragraph.
The base idea should be a short phrase (e.g., "explain the concept of gravity to a 5-year-old").
The full prompt should be a well-written paragraph.
You must return a valid JSON object with two keys: "baseIdea" and "fullPrompt".
Do not include any other text or markdown formatting outside of the JSON object.`;

export const SYSTEM_INSTRUCTION_META_PROMPT = `You are a world-class AI prompt engineering expert. Your task is to take a user's composed draft, which is a collection of prompt components, and transform it into a single, cohesive, powerful, and detailed 'meta-prompt'.
This final prompt should be structured to instruct another AI to generate the desired content with extreme clarity and precision.

IMPORTANT INSTRUCTIONS:
1.  If the user provides content within <context> tags, treat this as essential background information or a knowledge base.
2.  Refine the language, structure it logically, and fill in any logical gaps.
3.  The output must ONLY be the final, optimized meta-prompt text, ready to be used.
4.  The output text must be clean and free of any markdown formatting (e.g., no ** for bolding).`;

export const SYSTEM_INSTRUCTION_AUDIT = `You are a Prompt Quality Auditor. Analyze the provided prompt and score it from 0-100 on three metrics: Clarity, Specificity, and Reasoning.
Provide the results in a valid JSON object.
Metric scores should be integers. 
Also provide a 1-sentence "overall_verdict".`;

export const SYSTEM_INSTRUCTION_CRITIQUE = `You are a Senior Prompt Engineer. Look at the optimized prompt and find 3 specific weaknesses or areas for improvement.
Return a JSON array of objects, each with a "weakness" and a "fix_suggestion".`;


// Helper function to clean the response text
const cleanResponse = (text: string | null | undefined): string => {
    if (!text) {
        return '';
    }
    return text.replace(/\*\*/g, '').trim();
}

export const generatePrompt = async (
  basePrompt: string,
  temperature: number,
  topP: number,
  systemInstruction?: string
): Promise<string> => {
  try {
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
    console.error("Error generating prompt with Gemini:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
};

export const generatePromptStream = async (
  basePrompt: string,
  temperature: number,
  topP: number,
  systemInstruction?: string
): Promise<AsyncIterable<string>> => {
    try {
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
                const text = chunk.text;
                if (text) {
                    yield text;
                }
            }
        }
        return streamGenerator();

    } catch (error) {
        console.error("Error streaming prompt with Gemini:", error);
        throw new Error("Failed to stream from AI model.");
    }
};

export const auditPrompt = async (prompt: string): Promise<any> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
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
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
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
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    const base64ImageBytes: string | undefined = response.generatedImages?.[0]?.image?.imageBytes;

    if (!base64ImageBytes) {
      throw new Error("No image data received from the API.");
    }
    
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    throw new Error(error instanceof Error ? error.message : "Image generation failed.");
  }
};
