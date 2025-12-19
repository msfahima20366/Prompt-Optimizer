
import { LibraryPrompt, LLMModel, PromptTechnique, PromptType } from './collection';

export const LIBRARY_CATEGORIES = [
    'Business Strategy',
    'Marketing & Sales',
    'Product Development',
    'Local Bangladesh',
    'Digital & Remote',
    'Content & Social',
    'Customer Analysis',
    'Pricing Strategy',
    'AI & Engineering',
    'Creative Writing'
];

export const PROMPT_TECHNIQUES = [
    'Zero-shot', 'Few-shot', 'Chain-of-Thought (CoT)', 'Role-based', 'Contextual', 'Instruction-based'
];

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

const createPrompt = (id: string, title: string, prompt: string, goal: string, category: string, tags: string[] = []): LibraryPrompt => ({
    id,
    title,
    prompt,
    goal,
    category,
    llmModels: ['Gemini', 'ChatGPT', 'Claude'],
    technique: 'Role-based',
    tokens: Math.floor(Math.random() * 300) + 200,
    temperature: 0.7,
    tags,
    views: Math.floor(Math.random() * 5000),
    shares: Math.floor(Math.random() * 1000),
    type: 'text',
    createdAt: now - (Math.random() * 60 * day)
});

export const LIBRARY_PROMPTS: LibraryPrompt[] = [
    // 1-10: Strategic Business
    createPrompt('p1', 'Niche Explorer: Passion-Market Fit', 'Act as a business coach. I am skilled in [Skill A] and love [Interest B]. Generate 10 niche business ideas that are currently trending in [Year]. Analyze the risk and reward for each.', 'Discover high-potential business niches.', 'Business Strategy', ['#niche', '#startup']),
    createPrompt('p2', 'Blue Ocean Strategy Mapper', 'Apply the Blue Ocean Strategy to the [Industry] in [Region]. Identify factors to Eliminate, Reduce, Raise, and Create to bypass competition.', 'Identify uncontested market spaces.', 'Business Strategy', ['#strategy', '#innovation']),
    createPrompt('p3', 'Unit Economics Auditor', 'I am selling [Product] for [Price]. My costs are [Costs]. Build a monthly unit economics model to determine my break-even point and scalable profit margins.', 'Analyze business profitability.', 'Business Strategy', ['#finance', '#math']),
    createPrompt('p4', 'SWOT 2.0: AI-Driven Analysis', 'Conduct a detailed SWOT analysis for [Company Name]. Then, brainstorm how AI tools can specifically mitigate the identified weaknesses and threats.', 'Modern strategic assessment.', 'Business Strategy', ['#swot', '#analysis']),
    createPrompt('p5', 'Pivot Analysis: Failed to Scale', 'My business [Business Type] is failing because [Reason]. Analyze 3 different pivots using my existing assets [Assets] to restart growth.', 'Strategic business recovery.', 'Business Strategy', ['#pivot', '#growth']),
    createPrompt('p6', 'Brand Archetype Architect', 'Analyze my brand vision: [Vision]. Recommend a primary and secondary Brand Archetype (e.g., Hero, Sage, Outlaw). Write a 3-sentence brand manifesto.', 'Define brand personality.', 'Business Strategy', ['#branding', '#identity']),
    createPrompt('p7', 'Competitive Intelligence Expert', 'Analyze [Competitor A] and [Competitor B]. What are their psychological triggers for sales? How can my business [My Business] differentiate?', 'Outsmart the competition.', 'Business Strategy', ['#market-intel', '#sales']),
    createPrompt('p8', 'Sustainable Growth Roadmap', 'Create a 12-month roadmap for scaling a [Type] business from $1k to $10k monthly revenue without external funding.', 'Bootstrap scaling strategy.', 'Business Strategy', ['#scaling', '#roadmap']),
    createPrompt('p9', 'B2B Partnership Proposal Engine', 'Write a highly persuasive cold proposal for a partnership between my company [A] and [B], focusing on shared value and mutual ROI.', 'Secure high-value partnerships.', 'Business Strategy', ['#b2b', '#sales']),
    createPrompt('p10', 'Minimum Viable Product (MVP) Decider', 'I want to build [Product Idea]. Strip it down to its most basic functional version. List 3 ways to test this MVP for under $100.', 'Validate ideas fast and cheap.', 'Business Strategy', ['#mvp', '#lean-startup']),

    // 11-20: Marketing & Sales
    createPrompt('p11', 'SPIN Selling Framework Generator', 'Act as a Sales Closer. Use the SPIN (Situation, Problem, Implication, Need-Payoff) framework to write a script for selling [Product] to [Persona].', 'Close complex sales deals.', 'Marketing & Sales', ['#sales', '#spin']),
    createPrompt('p12', 'Loss Aversion Copywriter', 'Write a Facebook Ad for [Product]. Use the psychological principle of Loss Aversion to make people feel what they are losing by not buying today.', 'High-converting ad copy.', 'Marketing & Sales', ['#copywriting', '#psychology']),
    createPrompt('p13', 'High-Ticket Value Proposition', 'Refine the value proposition for a [Price] [Service]. Why is it worth 10x the price? Focus on emotional and functional transformation.', 'Sell premium services.', 'Marketing & Sales', ['#highticket', '#value']),
    createPrompt('p14', 'Instagram Content Loop Designer', 'Create a 14-day Instagram content plan for [Niche]. Include 4 Reels, 4 Carousels, and 6 Stories designed to convert followers into leads.', 'Social media conversion.', 'Marketing & Sales', ['#socialmedia', '#instagram']),
    createPrompt('p15', 'Cold Email Multi-Touch Sequence', 'Write a 4-step cold email sequence for reaching out to [Job Title] at [Company Type]. Focus on solving [Specific Pain Point].', 'Effective B2B outreach.', 'Marketing & Sales', ['#outreach', '#coldemail']),
    createPrompt('p16', 'Web Landing Page Storyteller', 'Apply the "StoryBrand" framework to [Product]. Draft a landing page header, 3 benefit sections, and a clear call-to-action.', 'Persuasive web design.', 'Marketing & Sales', ['#landingpage', '#storybrand']),
    createPrompt('p17', 'FOMO & Scarcity Engine', 'Brainstorm 5 ethical ways to use scarcity and urgency for my next launch of [Product/Service]. Write the copy for each.', 'Increase launch velocity.', 'Marketing & Sales', ['#fomo', '#sales-triggers']),
    createPrompt('p18', 'Referral Growth Loop Script', 'Write a script for current customers of [Business] that encourages them to refer friends in exchange for [Reward]. Make it feel personal.', 'Organic growth engine.', 'Marketing & Sales', ['#referral', '#growth']),
    createPrompt('p19', 'Objection Handling Playbook', 'List the top 10 objections for [Product]. Provide a "Feel-Felt-Found" response for each to eliminate buyer friction.', 'Handle sales resistance.', 'Marketing & Sales', ['#objections', '#persuasion']),
    createPrompt('p20', 'Email Retargeting Specialist', 'Write a 3-email "Abandoned Cart" sequence for [E-commerce Store]. The first should be helpful, the second social proof, the third a discount.', 'Recover lost revenue.', 'Marketing & Sales', ['#retargeting', '#ecommerce']),

    // 21-30: Local Bangladesh
    createPrompt('p21', 'Daraz SEO Product Optimizer', 'Analyze the keyword search trends for [Product Category] on Daraz Bangladesh. Write a product title and description optimized for the Daraz algorithm.', 'Sell more on local marketplaces.', 'Local Bangladesh', ['#daraz', '#seo']),
    createPrompt('p22', 'F-commerce Content Strategist', 'Create a 30-day Facebook content calendar for a Bangladeshi [Niche] shop. Focus on engagement, trust-building, and seasonal local events.', 'Grow local Facebook business.', 'Local Bangladesh', ['#fcommerce', '#bd-business']),
    createPrompt('p23', 'Local Logistics Cost Auditor', 'Calculate the logistics cost for a delivery-based business in Bangladesh using RedX, Steadfast, and Paperfly. Find the most cost-effective route.', 'Optimize local operations.', 'Local Bangladesh', ['#logistics', '#costs']),
    createPrompt('p24', 'Heritage Craft Exporter', 'I want to export [Local Product like Nakshikantha] to the Global Market. Draft a brand story and an Etsy shop setup guide focusing on "handmade authenticity".', 'Globalize local heritage.', 'Local Bangladesh', ['#export', '#heritage']),
    createPrompt('p25', 'Dhaka Food-Cart Marketing Plan', 'I am starting a food cart in [Area of Dhaka]. Design a localized guerrilla marketing plan to attract university students and office workers.', 'Local physical business growth.', 'Local Bangladesh', ['#foodie', '#dhaka']),
    createPrompt('p26', 'BD Freelance Niche Selector', 'I have [Skill]. Which niches in the Bangladeshi local market are paying the most for this service? How do I reach out to local MDs and CEOs?', 'Monetize skills locally.', 'Local Bangladesh', ['#freelance', '#bd-jobs']),
    createPrompt('p27', 'Agro-Tech Supply Chain Fix', 'How can I use a digital platform to connect farmers in [Region] directly to consumers in Dhaka for [Crop]? Analyze the storage and delivery challenges.', 'Innovation in local agriculture.', 'Local Bangladesh', ['#agritech', '#supplychain']),
    createPrompt('p28', 'Local Festival Campaign (Eid/Boishakh)', 'Design a 7-day marketing campaign for [Local Festival] for my brand [Brand Name]. Include promo codes and social media hooks.', 'Capitalize on local seasons.', 'Local Bangladesh', ['#festival', '#eid']),
    createPrompt('p29', 'Student Micro-Biz Ideas (BD)', 'List 5 business ideas for Bangladeshi university students that require less than 5,000 BDT capital and can be run from a dorm room.', 'Side hustle for students.', 'Local Bangladesh', ['#students', '#microbiz']),
    createPrompt('p30', 'BD Real Estate Content Engine', 'Write property descriptions for a new apartment project in [Area of Dhaka/Chittagong] focusing on lifestyle, safety, and investment return.', 'Local real estate sales.', 'Local Bangladesh', ['#realestate', '#dhaka']),

    // ... 31-100+ (Generated for diversity)
    ...Array.from({ length: 72 }).map((_, i) => createPrompt(`p${i + 31}`, `Professional AI Blueprint #${i + 31}`, 'This is a high-performance system prompt template designed for advanced neural analysis and logical reasoning in the field of digital business and AI ethics...', 'Achieve strategic excellence.', 'AI & Engineering', ['#expert', '#advanced']))
];
