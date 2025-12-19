
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION_GENERATOR = `You are a helpful and creative AI assistant. You will be given a prompt and must generate a high-quality response that fulfills the user's request precisely and creatively.
Adhere to any specific constraints or formats mentioned in the prompt.
The output should be clean text, without any markdown formatting like bolding (**).`;

export const getMetaPromptInstruction = (strategy: string) => {
    const strategies: Record<string, string> = {
        'meta': `Act as a world-class prompt engineer. Your goal is to transform the user's draft into a high-dimensional 'Meta-Prompt'. 
        Structure the output using clear hierarchical blocks such as [CONTEXT], [OBJECTIVE], [CONSTRAINTS], and [REASONING]. 
        This prompt should be optimized for complex reasoning and multi-step tasks.`,
        
        'refined': `Act as a professional editor and logic specialist. Your goal is to polish the user's draft into a single, cohesive, and perfectly articulated instruction. 
        DO NOT use complex Meta-Prompt headers or sections. Simply return a high-quality, professional, and clear version of the original intent that is ready to be used directly.`,
        
        'concise': `Act as a token-efficiency expert. Your goal is to strip the user's draft down to its absolute core logic. 
        Eliminate all conversational filler, adjectives, and metadata. Return a hyper-direct, punchy instruction that consumes the minimum number of tokens while retaining 100% of the original intent.`,
        
        'technical': `Act as a system architect. Your goal is to format the user's request as a formal technical specification or a programming-style requirement document. 
        Use structured lists, if-then logic, and clearly defined parameters. This is intended for high-precision logic tasks or code generation.`
    };

    const base = strategies[strategy] || strategies['meta'];

    return `${base}

NEURAL TUNING PROTOCOLS (Apply based on the provided Neural Tuning settings):
- If 'Correct Tokenization' is specified: Structure text to minimize token usage for the LLM. Use efficient delimiters and remove repetitive whitespace.
- If 'Semantic Precision' is specified: Use exact technical terms. Replace generic descriptions with specific domain-accurate terminology.

IMPORTANT CONSTRAINTS:
1. Integrate the 'Logic Blueprints' mentioned in the user message into the fabric of the prompt.
2. Adjust syntax specifically for the target LLM indicated.
3. Return ONLY the transformed prompt. NO conversational preamble, NO explanations, and NO markdown bolding (**).`;
};

export const SYSTEM_INSTRUCTION_AUDIT = `You are a Prompt Quality Auditor. Analyze the provided prompt and score it from 0-100 on three metrics: Clarity, Specificity, and Reasoning. Provide results in valid JSON.`;

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
            if (chunk.text) yield chunk.text;
        }
    }
    return streamGenerator();
};

export const auditPrompt = async (prompt: string): Promise<any> => {
    try {
        const ai = getAI();
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
