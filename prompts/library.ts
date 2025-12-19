
import { LibraryPrompt, LLMModel, PromptTechnique, PromptType } from './collection';

export const LIBRARY_CATEGORIES = [
    'Content Writing',
    'Marketing',
    'Business',
    'Strategy',
    'Product Management',
    'Coding',
    'Creative',
    'Education',
    'Image & Video'
];

export const PROMPT_TECHNIQUES = [
    'Zero-shot',
    'Few-shot',
    'One-shot',
    'Chain-of-Thought (CoT)',
    'ReAct (Reason + Act)',
    'Self-Consistency',
    'Tree-of-Thought (ToT)',
    'Meta Prompting',
    'Automatic Prompt Engineer (APE)',
    'Generated Knowledge',
    'Prompt Chaining',
    'Reflexion',
    'Contrastive Prompting',
    'Instruction-based',
    'Role-based',
    'Multimodal',
    'Contextual',
    'Iterative Prompting',
    'Dynamic Prompting',
    'Instruction and Example Hybrid',
];

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const LIBRARY_PROMPTS: LibraryPrompt[] = [
  {
    id: 'lib-cw-1',
    title: 'Blog Post Ideas Generator',
    prompt: 'Act as a content strategist. Generate 5 unique and engaging blog post ideas for a company in the [industry] niche. For each idea, provide a catchy title, a target keyword, and a brief 2-sentence outline.',
    goal: 'To quickly brainstorm a variety of relevant and SEO-friendly blog post ideas.',
    category: 'Content Writing',
    llmModels: ['Gemini', 'ChatGPT', 'Claude'],
    technique: 'Zero-shot',
    tokens: 70,
    temperature: 0.8,
    tags: ['#blogging', '#seo', '#ideation'],
    views: 5000, // High views for trending
    shares: 800,
    type: 'text',
    createdAt: now - 30 * day, // Older
  },
  {
    id: 'lib-cw-2',
    title: 'Professional Email Drafter',
    prompt: 'Write a professional email to [recipient] regarding [subject]. The tone should be [tone, e.g., polite, assertive, urgent]. Include a clear call to action and a professional sign-off.',
    goal: 'Automate repetitive professional communication.',
    category: 'Content Writing',
    llmModels: ['Gemini', 'ChatGPT', 'Claude'],
    technique: 'Instruction-based',
    tokens: 50,
    temperature: 0.5,
    tags: ['#email', '#productivity', '#communication'],
    views: 1200,
    shares: 120,
    type: 'text',
    createdAt: now - 1 * day, // Very recent
  },
  {
    id: 'lib-img-3',
    title: 'Surreal Landscape Master',
    prompt: 'Create a prompt for a surreal landscape where [Element 1] and [Element 2] are merged in a [style] art style. Include "vivid colors, octane render, 8k".',
    goal: 'High-concept digital art.',
    category: 'Image & Video',
    llmModels: ['Imagen', 'Midjourney'],
    technique: 'Zero-shot',
    tokens: 100,
    temperature: 1.0,
    tags: ['#art', '#surreal', '#digital'],
    views: 10000, // Top trending
    shares: 2500,
    type: 'image',
    createdAt: now - 5 * day,
  },
  ...Array.from({ length: 40 }).map((_, i): LibraryPrompt => ({
    id: `lib-bulk-${i}`,
    title: `Expert ${LIBRARY_CATEGORIES[i % LIBRARY_CATEGORIES.length]} Assistant #${i + 1}`,
    prompt: `Analyze the following scenario as a specialist in ${LIBRARY_CATEGORIES[i % LIBRARY_CATEGORIES.length]}. Focus on core metrics and long-term sustainability.`,
    goal: `Provide domain-specific assistance in ${LIBRARY_CATEGORIES[i % LIBRARY_CATEGORIES.length]}.`,
    category: LIBRARY_CATEGORIES[i % LIBRARY_CATEGORIES.length],
    llmModels: ['Gemini', 'ChatGPT', 'Claude'] as LLMModel[],
    technique: PROMPT_TECHNIQUES[i % PROMPT_TECHNIQUES.length] as PromptTechnique,
    tokens: 100,
    temperature: 0.7,
    tags: ['#helper', '#pro'],
    views: Math.floor(Math.random() * 2000),
    shares: Math.floor(Math.random() * 500),
    type: (i % 3 === 0 ? 'image' : i % 3 === 1 ? 'video' : 'text') as PromptType,
    createdAt: now - (i * 2 * day),
  }))
];
