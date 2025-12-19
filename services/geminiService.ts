
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION_GENERATOR = `You are the world's most advanced Prompt Engineering System. Your task is to transform raw, basic, or messy user drafts into highly optimized, high-performance instructions for AI models.

CRITICAL RULES:
1. OUTPUT ONLY THE FINAL PROMPT. Do not say "Here is your prompt" or "I have optimized it".
2. NO BOLDING. Do not use double asterisks (**) for formatting. Use caps or headers like [SECTION NAME] instead.
3. ADHERE TO THE STRATEGY. If the strategy is Meta, use hierarchical blocks. If it is Concise, be hyper-efficient.
4. INTEGRATE CONTEXT. If Knowledge Context is provided, weave it into the background or persona of the prompt.
5. NO CONVERSATIONAL FILLER. Return only the result.`;

export const getMetaPromptInstruction = (strategy: string) => {
    const strategies: Record<string, string> = {
        'meta': `ACT AS A SENIOR PROMPT ARCHITECT. 
Your goal is to build a 'Meta-Prompt Framework' around the user's draft. 
Structure the output into the following explicit blocks:
[SYSTEM ROLE]: Define a hyper-specific expert persona.
[CONTEXT]: Incorporate all provided background and goals.
[OBJECTIVE]: State the primary task with absolute precision.
[LOGIC STEPS]: Break down the reasoning process (Chain of Thought).
[CONSTRAINTS & FORMATTING]: List strict rules and the expected output structure.
[INITIALIZATION]: A concluding command to start the task.`,
        
        'refined': `ACT AS A PROFESSIONAL EDITOR & LOGIC SPECIALIST. 
Your goal is to turn the user's draft into a single, cohesive, polished, and highly clear instruction. 
Fix all grammatical errors, clarify vague language, and ensure the tone is authoritative and professional. 
Do not use complex Meta-headers. Just a single, high-quality, direct instruction.`,
        
        'concise': `ACT AS A TOKEN-EFFICIENCY EXPERT. 
Strip away all unnecessary words, pleasantries, and metaphors. 
Identify the 'Core Logic' of the user's intent and express it in the shortest possible way that still retains 100% of the instruction's power. 
Ideal for high-speed, cost-effective API calls.`,
        
        'technical': `ACT AS A SOFTWARE ARCHITECT. 
Format the user's request as a Technical Specification or a Requirement Document. 
Use markdown lists and structured logic gates (IF/THEN). 
Focus on variables, parameters, and deterministic outcomes. Use a clinical, precise, and systematic tone.`
    };

    const base = strategies[strategy] || strategies['meta'];

    return `${base}

NEURAL TUNING PROTOCOLS (Apply if specified in user input):
- Correct Tokenization: Ensure logical delimiters (e.g., using ### or ---) to help the model distinguish sections.
- Semantic Precision: Replace all "vague" words with "industry-standard" terminology.

FINAL DIRECTIVE: Transform the draft provided in the user message according to the blueprint above.`;
};

export const SYSTEM_INSTRUCTION_AUDIT = `You are a Prompt Quality Auditor. Analyze the provided prompt and score it from 0-100 on three metrics: Clarity (how easy is it to understand), Specificity (how precise are the instructions), and Reasoning (does it encourage logical steps). Provide results in valid JSON.`;

const cleanResponse = (text: string | null | undefined): string => {
    if (!text) return '';
    // Remove markdown bolding as requested
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
