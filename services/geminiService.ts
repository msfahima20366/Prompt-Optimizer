
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

const SYSTEM_INSTRUCTION_META_PROMPT = `You are a world-class AI prompt engineering expert. Your task is to take a user's composed draft, which is a collection of prompt components, and transform it into a single, cohesive, powerful, and detailed 'meta-prompt'.
This final prompt should be structured to instruct another AI on how to generate the desired content with extreme clarity and precision.

IMPORTANT INSTRUCTIONS:
1.  If the user provides content within <context> tags, treat this as essential background information or a knowledge base. The final prompt must instruct the AI to heavily rely on this context to inform its response, treating it as a primary source of truth.
2.  Refine the language, structure it logically, combine related instructions, and fill in any logical gaps to make the final prompt exceptionally clear and effective.
3.  The output must ONLY be the final, optimized meta-prompt text, ready to be used. Do not include any conversational filler, introductory phrases like "Here is the optimized prompt:", or explanations about your process.
4.  The output text must be clean and free of any markdown formatting (e.g., no ** for bolding).`;


// Helper function to clean the response text
const cleanResponse = (text: string | null | undefined): string => {
    if (!text) {
        return '';
    }
    // Removes markdown bolding (**)
    return text.replace(/\*\*/g, '').trim();
}

export const generatePrompt = async (
  basePrompt: string,
  temperature: number,
  topP: number
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: basePrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_GENERATOR,
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

export const optimizePrompt = async (composedPrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Using a more powerful model for high-quality optimization
        contents: `Here is the user's composed draft prompt:\n\n---\n\n${composedPrompt}\n\n---\n\nNow, optimize it into a meta-prompt.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_META_PROMPT,
          temperature: 0.7,
          topP: 0.9,
        }
    });

    return cleanResponse(response.text);
  } catch (error) {
    console.error("Error optimizing prompt with Gemini:", error);
    throw new Error("Failed to communicate with the AI model for optimization.");
  }
};


export const generateSimplePrompt = async (): Promise<{ baseIdea: string; fullPrompt: string }> => {
  const userQuery = `Generate a creative prompt concept.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_SURPRISE,
        temperature: 1.0,
        topP: 0.95,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            baseIdea: {
              type: Type.STRING,
              description: 'A concise, creative base idea for the prompt.',
            },
            fullPrompt: {
              type: Type.STRING,
              description: 'The full, detailed prompt paragraph.',
            },
          },
          required: ["baseIdea", "fullPrompt"],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      throw new Error("Received an empty response from the AI. This might be due to content filtering.");
    }

    const parsed = JSON.parse(jsonText);
    
    if (typeof parsed.baseIdea === 'string' && typeof parsed.fullPrompt === 'string') {
        return parsed;
    } else {
        throw new Error("Invalid JSON structure received from AI.");
    }
  } catch (error) {
    console.error("Error generating surprise prompt with Gemini:", error);
    if (error instanceof Error) {
        // Re-throw specific, user-friendly errors from the try block
        if (error.message.includes("Received an empty response") || error.message.includes("Invalid JSON structure")) {
            throw error;
        }
    }
    throw new Error("Failed to communicate with the AI model for a surprise prompt.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    const base64ImageBytes: string | undefined = response.generatedImages?.[0]?.image?.imageBytes;

    if (!base64ImageBytes) {
      throw new Error("No image data received from the API.");
    }
    
    return `data:image/png;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    throw new Error("Failed to generate image. The prompt may have been blocked.");
  }
};
