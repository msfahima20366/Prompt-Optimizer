import { LibraryPrompt } from './collection';

export const LIBRARY_CATEGORIES = [
    'Content Writing',
    'Marketing',
    'Business',
    'Coding',
    'Creative',
    'Education',
    'Image & Video'
];

export const PROMPT_TECHNIQUES = [
    // Core
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
    // Advanced / Specialized
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

export const LIBRARY_PROMPTS: LibraryPrompt[] = [
  // --- CONTENT WRITING ---
  {
    id: 'lib-cw-1',
    title: 'Blog Post Ideas Generator',
    prompt: 'Act as a content strategist. Generate 5 unique and engaging blog post ideas for a company in the [industry] niche. For each idea, provide a catchy title, a target keyword, and a brief 2-sentence outline explaining the angle of the post.',
    goal: 'To quickly brainstorm a variety of relevant and SEO-friendly blog post ideas with a clear starting point for writing.',
    category: 'Content Writing',
    llmModels: ['Gemini', 'ChatGPT', 'Claude'],
    technique: 'Zero-shot',
    tokens: 70,
    temperature: 0.8,
    tags: ['#blogging', '#seo', '#ideation'],
    views: 1250,
    shares: 312,
    type: 'text'
  },
  {
    id: 'lib-cw-2',
    title: 'Article Rewriter and Enhancer',
    prompt: 'Rewrite the following article to have a more [e.g., professional, casual, witty] tone. Improve the flow and clarity, correct any grammatical errors, and suggest a more compelling headline. Do not change the core information or data presented.\n\n---\n\n[Paste article text here]',
    goal: 'To repurpose existing content by changing its tone and improving its readability without altering the factual information.',
    category: 'Content Writing',
    llmModels: ['Gemini', 'Claude', 'Llama'],
    technique: 'Zero-shot',
    tokens: 80,
    temperature: 0.7,
    tags: ['#editing', '#rewriting', '#tone'],
    views: 980,
    shares: 155,
    type: 'text'
  },
  {
    id: 'lib-cw-3',
    title: 'FAQ Content Creator',
    prompt: 'Generate a list of 10 frequently asked questions (FAQs) for a website that sells [product/service]. For each question, provide a clear, concise, and helpful answer. The tone should be supportive and easy to understand for a non-expert audience.',
    goal: 'To create a comprehensive FAQ section that addresses common customer questions, reducing support tickets and building trust.',
    category: 'Content Writing',
    llmModels: ['Gemini', 'ChatGPT', 'Co-pilot'],
    technique: 'Zero-shot',
    tokens: 65,
    temperature: 0.6,
    tags: ['#faq', '#support', '#website-content'],
    views: 1100,
    shares: 230,
    type: 'text'
  },

  // --- MARKETING ---
  {
    id: 'lib-mkt-1',
    title: 'AIDA Framework Ad Copy',
    prompt: 'Write a compelling short-form ad copy for a new [product] using the AIDA framework.\n\n- Attention: Grab the attention of [target audience].\n- Interest: Pique their interest by highlighting a key problem or benefit.\n- Desire: Create desire by explaining the unique value proposition.\n- Action: End with a clear and urgent call to action.',
    goal: 'To create a persuasive and structured ad copy that effectively guides a potential customer towards taking a desired action.',
    category: 'Marketing',
    llmModels: ['Gemini', 'ChatGPT', 'Claude'],
    technique: 'Chain-of-Thought (CoT)',
    tokens: 85,
    temperature: 0.9,
    tags: ['#advertising', '#copywriting', '#aida'],
    views: 2100,
    shares: 520,
    type: 'text'
  },
  {
    id: 'lib-mkt-2',
    title: 'Social Media Content Calendar',
    prompt: 'Create a 5-day social media content calendar for an Instagram account focused on [topic]. The goal is to increase engagement. For each day, provide a content theme (e.g., "Myth-busting Monday"), a specific post idea, a compelling caption, and 3-5 relevant hashtags.',
    goal: 'To generate a structured and engaging content plan for social media, saving time and ensuring consistent posting.',
    category: 'Marketing',
    llmModels: ['Gemini', 'ChatGPT'],
    technique: 'Zero-shot',
    tokens: 80,
    temperature: 0.8,
    tags: ['#social-media', '#instagram', '#content-planning'],
    views: 1800,
    shares: 450,
    type: 'text'
  },
  {
    id: 'lib-mkt-3',
    title: 'Value Proposition Builder',
    prompt: 'Analyze the following product description and extract a clear and concise value proposition. Frame it in a single sentence that answers the question: "What does this product do and for whom, and why is it better than alternatives?"\n\nProduct Description: [Paste a detailed product description here]',
    goal: 'To distill a complex product description into a powerful, single-sentence value proposition for use in marketing materials.',
    category: 'Marketing',
    llmModels: ['Gemini', 'Claude'],
    technique: 'Zero-shot',
    tokens: 70,
    temperature: 0.6,
    tags: ['#branding', '#strategy', '#value-proposition'],
    views: 1400,
    shares: 280,
    type: 'text'
  },

  // --- BUSINESS ---
  {
    id: 'lib-biz-1',
    title: 'Elevator Pitch Generator',
    prompt: 'I am a [your role] at a company that [what your company does]. Our target customer is [target customer]. The main problem we solve is [problem]. Our unique solution is [unique solution]. Condense this information into a compelling 30-second elevator pitch.',
    goal: 'To create a concise, memorable, and persuasive summary of a business or project for networking and sales.',
    category: 'Business',
    llmModels: ['Gemini', 'ChatGPT'],
    technique: 'Zero-shot',
    tokens: 65,
    temperature: 0.7,
    tags: ['#sales', '#networking', '#pitch'],
    views: 1950,
    shares: 400,
    type: 'text'
  },
  {
    id: 'lib-biz-2',
    title: 'SWOT Analysis Assistant',
    prompt: 'Conduct a SWOT analysis for a [type of business, e.g., local coffee shop, SaaS startup] in the current market. Provide at least 3 bullet points for each of the following categories:\n\n- Strengths (Internal, positive factors)\n- Weaknesses (Internal, negative factors)\n- Opportunities (External, positive factors)\n- Threats (External, negative factors)',
    goal: 'To perform a structured strategic analysis, identifying key internal and external factors that can impact a business.',
    category: 'Business',
    llmModels: ['Gemini', 'Claude'],
    technique: 'Chain-of-Thought (CoT)',
    tokens: 90,
    temperature: 0.6,
    tags: ['#strategy', '#business-analysis', '#swot'],
    views: 2200,
    shares: 380,
    type: 'text'
  },

  // --- CODING ---
  {
    id: 'lib-code-1',
    title: 'Code Explainer (ELI5)',
    prompt: 'Explain the following code snippet to me as if I were a 5-year-old (ELI5). Use a simple analogy and avoid technical jargon.\n\n```[language]\n[Paste code snippet here]\n```',
    goal: 'To understand complex code by breaking it down into a simple, easy-to-grasp explanation using an analogy.',
    category: 'Coding',
    llmModels: ['Gemini', 'Claude', 'DeepSeek'],
    technique: 'Zero-shot',
    tokens: 60,
    temperature: 0.5,
    tags: ['#learning', '#debugging', '#eli5'],
    views: 3500,
    shares: 950,
    type: 'text'
  },
  {
    id: 'lib-code-2',
    title: 'Regex Pattern Generator',
    prompt: 'Generate a regular expression (regex) pattern that can be used to validate a [type of input, e.g., strong password, YouTube URL, username].\n\nHere are some examples of strings it should match:\n- "[example 1]"\n- "[example 2]"\n\nHere are some examples of strings it should NOT match:\n- "[example 3]"\n- "[example 4]"\n\nAlso, provide a brief explanation of how the regex works.',
    goal: 'To create a precise regex pattern based on examples of what should and should not match, including an explanation.',
    category: 'Coding',
    llmModels: ['Gemini', 'ChatGPT', 'Grok'],
    technique: 'Few-shot',
    tokens: 95,
    temperature: 0.4,
    tags: ['#regex', '#validation', '#development'],
    views: 4100,
    shares: 1100,
    type: 'text'
  },
  {
    id: 'lib-code-3',
    title: 'API Response to Interface Converter',
    prompt: 'Act as a senior developer. Based on the following JSON API response, generate a corresponding interface or type definition in [language, e.g., TypeScript, Python dataclass].\n\nJSON Response:\n```json\n[Paste JSON object here]\n```',
    goal: 'To automatically generate code interfaces or types from a sample JSON response, saving time and reducing errors in development.',
    category: 'Coding',
    llmModels: ['Gemini', 'ChatGPT', 'Claude'],
    technique: 'Zero-shot',
    tokens: 60,
    temperature: 0.3,
    tags: ['#api', '#typescript', '#python', '#automation'],
    views: 2800,
    shares: 840,
    type: 'text'
  },

  // --- CREATIVE ---
  {
    id: 'lib-creative-1',
    title: 'Story Starter with a Twist',
    prompt: 'Write the opening three paragraphs of a story in the [genre] genre. The story should begin with a common trope (e.g., "a detective gets a mysterious case"), but the third paragraph must introduce a completely unexpected twist that subverts the reader\'s expectations.',
    goal: 'To generate a creative and engaging story opening that hooks the reader with a familiar setup and then surprises them with a unique twist.',
    category: 'Creative',
    llmModels: ['Gemini', 'Claude'],
    technique: 'Zero-shot',
    tokens: 70,
    temperature: 1.0,
    tags: ['#writing', '#fiction', '#storytelling'],
    views: 1500,
    shares: 420,
    type: 'text'
  },

  // --- EDUCATION ---
  {
    id: 'lib-edu-1',
    title: 'Concept Explainer with Analogy',
    prompt: 'Explain the complex scientific concept of [concept, e.g., "quantum entanglement", "photosynthesis"] to a high school student. First, provide a textbook-style definition. Then, create a simple and memorable real-world analogy to help solidify their understanding.',
    goal: 'To make a complex topic easier to understand by providing both a formal definition and a relatable analogy.',
    category: 'Education',
    llmModels: ['Gemini', 'Claude'],
    technique: 'Chain-of-Thought (CoT)',
    tokens: 75,
    temperature: 0.6,
    tags: ['#learning', '#teaching', '#analogy'],
    views: 1800,
    shares: 350,
    type: 'text'
  },

  // --- IMAGE & VIDEO ---
  {
    id: 'lib-img-1',
    title: 'Cinematic Image Prompt',
    prompt: 'Create a highly detailed text-to-image prompt for an epic, cinematic shot. The scene is: [describe the scene, e.g., "a lone astronaut on a red desert planet"]. Include details about the lighting (e.g., "dramatic, low-key lighting"), camera angle (e.g., "low-angle shot"), and overall mood (e.g., "sense of isolation and wonder"). Specify "photorealistic, 8k, octane render" for style.',
    goal: 'To generate a rich, detailed prompt for text-to-image models that produces a specific, cinematic, and high-quality result.',
    category: 'Image & Video',
    llmModels: ['Imagen', 'Midjourney', 'Stable Diffusion', 'DALL-E'],
    technique: 'Zero-shot',
    tokens: 90,
    temperature: 0.8,
    tags: ['#midjourney', '#stable-diffusion', '#image-prompt'],
    views: 5200,
    shares: 1300,
    type: 'image'
  },
  {
    id: 'lib-vid-1',
    title: 'Short Video Script Outline',
    prompt: 'Create a shot-by-shot script outline for a 30-second promotional video about [product/service]. The video should be fast-paced and engaging for social media. For each shot (5-7 shots total), describe the visual and any accompanying text overlay or voiceover.',
    goal: 'To quickly create a structured outline for a short, engaging video, making the production process more efficient.',
    category: 'Image & Video',
    llmModels: ['Gemini', 'Sora', 'Veo', 'RunwayML'],
    technique: 'Zero-shot',
    tokens: 80,
    temperature: 0.7,
    tags: ['#video', '#script', '#social-media'],
    views: 1600,
    shares: 390,
    type: 'video'
  },
];