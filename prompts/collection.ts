// All type definitions for the application

export type PromptType = 'text' | 'image' | 'video';

// Expanded list of LLM models
export type LLMModel = 
    // Text Models
    'ChatGPT' | 
    'Claude' | 
    'Gemini' | 
    'DeepSeek' | 
    'Llama' | 
    'Qwen' | 
    'Grok' | 
    'Co-pilot' | 
    'Perplexity' | 
    'Gamma AI' |
    // Image Models
    'Midjourney' |
    'Stable Diffusion' |
    'DALL-E' |
    'Imagen' |
    // Video Models
    'Sora' |
    'Veo' |
    'RunwayML' |
    'Pika' |
    // Other
    'Other';

// Categorized model lists for filtering
export const TEXT_MODELS: LLMModel[] = ['ChatGPT', 'Claude', 'Gemini', 'DeepSeek', 'Llama', 'Qwen', 'Grok', 'Co-pilot', 'Perplexity', 'Gamma AI'];
export const IMAGE_MODELS: LLMModel[] = ['Midjourney', 'Stable Diffusion', 'DALL-E', 'Imagen', 'Gemini'];
export const VIDEO_MODELS: LLMModel[] = ['Sora', 'Veo', 'RunwayML', 'Pika', 'Gemini'];

export const ALL_LLM_MODELS: LLMModel[] = [...new Set([...TEXT_MODELS, ...IMAGE_MODELS, ...VIDEO_MODELS])].sort();


export type PromptTechnique = 
    'Zero-shot' |
    'Few-shot' |
    'One-shot' |
    'Chain-of-Thought (CoT)' |
    'ReAct (Reason + Act)' |
    'Self-Consistency' |
    'Tree-of-Thought (ToT)' |
    'Meta Prompting' |
    'Automatic Prompt Engineer (APE)' |
    'Generated Knowledge' |
    'Prompt Chaining' |
    'Reflexion' |
    'Contrastive Prompting' |
    'Instruction-based' |
    'Role-based' |
    'Multimodal' |
    'Contextual' |
    'Iterative Prompting' |
    'Dynamic Prompting' |
    'Instruction and Example Hybrid';

export interface User {
  id: string;
  name: string;
  subscriptionTier: 'free' | 'premium';
  points: number;
  likedPromptIds: string[];
}

export interface Prompt {
  id: string;
  title: string;
  prompt: string;
  isFavorite: boolean;
  category: string;
  type: PromptType;
  technique?: PromptTechnique;
  imageUrl?: string;
  isShared: boolean;
}

export interface LibraryPrompt {
  id: string;
  title: string;
  prompt: string;
  goal: string;
  category: string;
  llmModels: LLMModel[];
  technique: PromptTechnique;
  tokens: number;
  temperature: number;
  tags: string[];
  views: number;
  shares: number;
  type: PromptType;
  createdAt?: number;
}

export interface CommunityPrompt {
  id: string;
  originalPromptId: string;
  authorId: string;
  authorName: string;
  title: string;
  prompt: string;
  category: string;
  type: PromptType;
  technique?: PromptTechnique;
  createdAt: number;
  likes: number;
  forks: number;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  timestamp: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  promptIds: string[];
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  promptIds: string[];
}

export interface UserContext {
  id: string;
  title: string;
  content: string;
}

// For OptimizerView
export interface PromptBlock {
  label: string;
  content: string;
}

export interface OptimizerSubCategory {
  name: string;
  blocks: PromptBlock[];
}

export interface OptimizerCategory {
  name: string;
  subCategories: OptimizerSubCategory[];
}

export const OPTIMIZER_CATEGORIES: OptimizerCategory[] = [
    {
        name: 'Content Creation',
        subCategories: [
            {
                name: 'Blog Post',
                blocks: [
                    { label: 'Topic', content: 'The future of renewable energy.' },
                    { label: 'Keywords', content: 'solar power, wind energy, battery storage' },
                    { label: 'Target Audience', content: 'General public interested in technology and sustainability.' },
                    { label: 'Tone', content: 'Informative and optimistic.' },
                    { label: 'Format', content: 'A 1000-word blog post with an introduction, 3 main sections, and a conclusion.' },
                ],
            },
            {
                name: 'Social Media',
                blocks: [
                    { label: 'Platform', content: 'Twitter' },
                    { label: 'Goal', content: 'Announce a new product feature.' },
                    { label: 'Key Message', content: 'Our new feature lets you collaborate in real-time.' },
                    { label: 'Call to Action', content: 'Try it now!' },
                    { label: 'Tone', content: 'Excited and concise.' },
                ],
            },
        ],
    },
    {
        name: 'Marketing',
        subCategories: [
            {
                name: 'Ad Copy',
                blocks: [
                    { label: 'Product', content: 'A new brand of sparkling water.' },
                    { label: 'Target Audience', content: 'Health-conscious millennials.' },
                    { label: 'Unique Selling Proposition', content: 'Zero calories, zero sugar, made with real fruit.' },
                    { label: 'Framework', content: 'AIDA (Attention, Interest, Desire, Action)' },
                ],
            },
        ],
    },
];
