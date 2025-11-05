export type PromptType = 'image' | 'text' | 'video';
export type LLMModel = 'Gemini' | 'ChatGPT' | 'Claude' | 'Other';
export type PromptTechnique = 'Zero-shot' | 'Few-shot' | 'Chain-of-Thought' | 'Other';


export interface Prompt {
  id: string;
  title: string;
  prompt: string;
  isFavorite?: boolean;
  category?: string;
  type?: PromptType;
  imageUrl?: string;
  isShared?: boolean; // New: To prevent re-sharing
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
}


export interface UserContext {
  id:string;
  title: string;
  content: string;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  timestamp: number;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  promptIds: string[];
}

export interface Workflow {
  id: string;
  title: string;
  description?: string;
  promptIds: string[]; // Ordered list of prompt IDs
}

// --- NEW: Community & User Structures ---

export type SubscriptionTier = 'free' | 'premium';

export interface User {
  id: string;
  name: string;
  subscriptionTier: SubscriptionTier;
  points: number;
  likedPromptIds: string[]; // To track likes
}

export interface CommunityPrompt {
  id: string;
  originalPromptId: string; // The user's original prompt ID
  authorId: string;
  authorName: string;
  title: string;
  prompt: string;
  category?: string;
  type?: PromptType;
  createdAt: number;
  likes: number;
  forks: number;
}


// --- Structures for Optimizer ---
export interface PromptBlock {
  label: string;
  content: string;
}

export interface OptimizerSubCategory {
  name: string;
  blocks: PromptBlock[];
}

export interface OptimizerMainCategory {
  name: string;
  subCategories: OptimizerSubCategory[];
}
// --- END Structures for Optimizer ---


export const OPTIMIZER_CATEGORIES: OptimizerMainCategory[] = [
    {
        name: "Content Writing",
        subCategories: [
            {
                name: "Blog Post",
                blocks: [
                    { label: "Topic", content: "The blog post will be about [topic]." },
                    { label: "Catchy Hook", content: "Start with a surprising statistic or a rhetorical question related to the topic." },
                    { label: "Introduction", content: "Briefly introduce the topic, state the post's purpose, and outline what the reader will learn." },
                    { label: "Key Talking Points", content: "Elaborate on 3-4 main points. For each point, provide a clear explanation and a supporting example. Point 1: [Specify Point 1], Point 2: [Specify Point 2]." },
                    { label: "Conclusion", content: "Summarize the key takeaways and provide a concluding thought." },
                    { label: "Call to Action", content: "Encourage readers to leave a comment, share the post, or subscribe to the newsletter." },
                ]
            },
            {
                name: "Email Newsletter",
                blocks: [
                    { label: "Subject Line", content: "Write a compelling and curiosity-inducing subject line for an email about [product/offer/topic]." },
                    { label: "Opening", content: "Personalize the greeting (e.g., 'Hi [Name]') and immediately state the value proposition." },
                    { label: "Main Story/Feature", content: "Share an engaging story, valuable tip, or an update related to [topic]." },
                    { label: "Secondary Content", content: "Include 1-2 smaller content blocks, like a link to a recent blog post or a quick tip." },
                    { label: "Call to Action", content: "Create a clear, primary call-to-action, such as 'Read More' or 'Shop the Sale'." },
                ]
            },
            {
                name: "Website Landing Page Copy",
                blocks: [
                    { label: "Headline", content: "A powerful headline that clearly states the main benefit of [product/service]." },
                    { label: "Sub-headline", content: "A short sentence that elaborates on the headline and hooks the reader." },
                    { label: "Key Features & Benefits", content: "List 3-5 key features and translate them into tangible benefits for the user." },
                    { label: "Social Proof", content: "Incorporate a section for customer testimonials or logos of companies you've worked with." },
                    { label: "Call to Action", content: "A prominent and compelling call-to-action button, like 'Get Started for Free' or 'Download the Guide'." },
                ]
            },
            {
                name: "YouTube Video Script",
                blocks: [
                    { label: "Video Title Idea", content: "Brainstorm a clickable and SEO-friendly title for a video about [topic]." },
                    { label: "Hook", content: "Write a strong hook for the first 15 seconds to grab the viewer's attention." },
                    { label: "Introduction", content: "Introduce the topic and what the viewer will learn or see in the video." },
                    { label: "Main Content Sections", content: "Outline the key segments of the video. Segment 1: [Description], Segment 2: [Description]." },
                    { label: "Outro & Call to Action", content: "Summarize the video and ask viewers to like, comment, and subscribe." },
                ]
            },
            {
                name: "Podcast Script Outline",
                blocks: [
                    { label: "Episode Title", content: "A catchy and descriptive title for a podcast episode about [topic]." },
                    { label: "Intro Music/Soundbite", content: "Note for intro music and a brief, engaging soundbite from the episode." },
                    { label: "Host Introduction", content: "A short intro by the host(s) introducing the episode's topic and any guests." },
                    { label: "Discussion Segments", content: "Break down the conversation into 3-4 key segments with guiding questions for each." },
                    { label: "Mid-roll Ad Spot", content: "Indicate where a mid-roll advertisement break should occur." },
                    { label: "Conclusion & Outro", content: "Summarize the discussion and provide final thoughts. Tease the next episode." },
                ]
            },
            {
                name: "Press Release",
                blocks: [
                    { label: "Headline", content: "A formal headline announcing [the news, e.g., a product launch, company milestone]." },
                    { label: "Dateline", content: "City, State – Date –" },
                    { label: "Introduction", content: "A summary of the announcement (who, what, when, where, why) in the first paragraph." },
                    { label: "Body Paragraphs", content: "Provide more details, context, and quotes from key people (e.g., the CEO)." },
                    { label: "Boilerplate", content: "A standard 'About [Company Name]' section." },
                    { label: "Media Contact", content: "Name, title, email, and phone number for media inquiries." },
                ]
            },
            {
                name: "E-book Chapter",
                blocks: [
                    { label: "E-book Topic", content: "The e-book is about [main topic]." },
                    { label: "Chapter Title", content: "The title for this chapter is '[Chapter Title]'." },
                    { label: "Chapter Introduction", content: "An introduction that sets the stage for the chapter and connects it to the previous one." },
                    { label: "Key Concepts", content: "Explain [number] key concepts within this chapter, using clear headings for each." },
                    { label: "Practical Example/Case Study", content: "Include a real-world example or a short case study to illustrate the concepts." },
                    { label: "Chapter Summary", content: "A concluding paragraph that summarizes the chapter's main takeaways." },
                ]
            },
            {
                name: "White Paper",
                blocks: [
                    { label: "Title", content: "An authoritative title for a white paper on [complex topic]." },
                    { label: "Abstract/Executive Summary", content: "A brief overview of the problem, methodology, and key findings." },
                    { label: "Problem Statement", content: "A detailed description of the industry problem or challenge being addressed." },
                    { label: "Proposed Solution/Methodology", content: "An in-depth explanation of a new solution, technology, or process." },
                    { label: "Conclusion", content: "Summarize the findings and suggest future implications or next steps." },
                ]
            },
            {
                name: "Case Study",
                blocks: [
                    { label: "Customer", content: "[Customer Name], a company in the [Industry] sector." },
                    { label: "Challenge", content: "Describe the specific challenge or problem the customer was facing." },
                    { label: "Solution", content: "Detail how your [product/service] was implemented to solve the customer's problem." },
                    { label: "Results", content: "Showcase the quantifiable results and benefits the customer achieved (e.g., '25% increase in efficiency')." },
                    { label: "Customer Quote", content: "Include a powerful quote from the customer endorsing your solution." },
                ]
            },
            {
                name: "FAQ Page Content",
                blocks: [
                    { label: "Product/Service", content: "The FAQ page is for [product/service name]." },
                    { label: "Question 1", content: "What is [product/service]?" },
                    { label: "Answer 1", content: "A clear and concise explanation of what it is and who it's for." },
                    { label: "Question 2", content: "How does [key feature] work?" },
                    { label: "Answer 2", content: "A step-by-step explanation of the feature." },
                    { label: "Question 3", content: "What is the pricing?" },
                    { label: "Answer 3", content: "An overview of the pricing plans or a link to the pricing page." },
                ]
            }
        ]
    },
    {
        name: "Marketing & Sales",
        subCategories: [
            {
                name: "Facebook Ad Copy",
                blocks: [
                    { label: "Product/Service", content: "The ad is for [product/service]." },
                    { label: "Target Audience", content: "The target audience is [describe audience, e.g., working mothers aged 30-45]." },
                    { label: "Ad Hook", content: "Start with a question or a bold statement that addresses a pain point of the target audience." },
                    { label: "Body Copy", content: "Clearly describe the main benefit of the product and how it solves the problem." },
                    { label: "Call to Action", content: "Use a strong action verb to tell the user exactly what to do next (e.g., 'Shop Now', 'Sign Up Free')." },
                ]
            },
            {
                name: "Google Ads Copy",
                blocks: [
                    { label: "Keyword Group", content: "The ad is for the keyword group '[keywords]'." },
                    { label: "Headline 1", content: "A headline that includes the primary keyword." },
                    { label: "Headline 2", content: "A headline that highlights a key benefit or feature." },
                    { label: "Headline 3", content: "A headline that includes a call-to-action or a special offer." },
                    { label: "Description 1", content: "A description that elaborates on the benefits and includes secondary keywords." },
                    { label: "Description 2", content: "A description that builds trust or creates urgency." },
                ]
            },
            {
                name: "SEO Content Brief",
                blocks: [
                    { label: "Primary Keyword", content: "The primary target keyword is '[keyword]'." },
                    { label: "Secondary Keywords", content: "Include the following secondary keywords: [list of keywords]." },
                    { label: "Search Intent", content: "The user's search intent is [informational, commercial, navigational, transactional]." },
                    { label: "Target Audience", content: "The article is for [describe audience]." },
                    { label: "Outline", content: "Create a detailed H2/H3 outline for the article, covering key subtopics." },
                    { label: "Internal Linking", content: "Suggest 2-3 existing articles on my site to link to." },
                ]
            },
            {
                name: "Product Description",
                blocks: [
                    { label: "Product Name", content: "[Product Name]." },
                    { label: "Catchy Opening", content: "An engaging opening sentence that describes the product's main appeal." },
                    { label: "Feature/Benefit Bullets", content: "Write 3-5 bullet points. Each one should state a feature and then explain the direct benefit to the customer." },
                    { label: "Story/Usage Scenario", content: "A short paragraph describing who the product is perfect for or a scenario where it would be used." },
                    { label: "Closing Statement", content: "A final persuasive sentence to encourage the purchase." },
                ]
            },
            {
                name: "Sales Email (Cold Outreach)",
                blocks: [
                    { label: "Prospect Profile", content: "The prospect is a [Job Title] at a [Industry] company." },
                    { label: "Subject Line", content: "A personalized and intriguing subject line, e.g., 'Question about [Prospect's Company]'." },
                    { label: "Opening Line", content: "A line that shows you've done research, e.g., 'I saw your recent post on LinkedIn about...'." },
                    { label: "Value Proposition", content: "A concise statement on how your product/service can solve a specific problem for them." },
                    { label: "Call to Action", content: "A low-friction call to action, like 'Are you open to a brief 15-minute call next week?'." },
                ]
            },
            {
                name: "Influencer Marketing Brief",
                blocks: [
                    { label: "Campaign Goal", content: "The goal is to [e.g., drive awareness, generate sales] for [product]." },
                    { label: "Influencer Niche", content: "The influencer should be in the [e.g., fitness, beauty, tech] niche." },
                    { label: "Key Message", content: "The core message to convey is [main message about the product]." },
                    { label: "Content Requirements", content: "The influencer needs to create [e.g., 1 Instagram Reel, 3 Stories]." },
                    { label: "Dos and Don'ts", content: "List specific things the influencer should do (e.g., mention the discount code) and avoid (e.g., mention competitors)." },
                ]
            },
            {
                name: "Affiliate Program Description",
                blocks: [
                    { label: "Program Overview", content: "An exciting overview of our affiliate program for [product/brand]." },
                    { label: "Commission Structure", content: "Clearly state the commission rate (e.g., 'Earn 20% on every sale you refer')." },
                    { label: "Benefits for Affiliates", content: "List the key benefits, such as high conversion rates, dedicated support, and marketing materials." },
                    { label: "Ideal Affiliate Partner", content: "Describe who you are looking for (e.g., 'bloggers, YouTubers, and content creators in the [niche] space')." },
                    { label: "Call to Action", content: "A clear call-to-action to 'Join Our Affiliate Program Today'." },
                ]
            },
            {
                name: "A/B Test Copy Variations",
                blocks: [
                    { label: "Element to Test", content: "We are A/B testing the [headline/CTA button/email subject line] for [campaign]." },
                    { label: "Control (Version A)", content: "The original copy is: '[Original Copy]'." },
                    { label: "Variation (Version B)", content: "Create a new version that focuses on a different angle, such as [e.g., scarcity, social proof, a different benefit]." },
                    { label: "Hypothesis", content: "My hypothesis is that Version B will perform better because [reason]." },
                ]
            },
            {
                name: "Brand Voice & Tone Guidelines",
                blocks: [
                    { label: "Brand Personality", content: "Our brand is [e.g., innovative, trustworthy, playful, sophisticated]." },
                    { label: "Our Voice Is", content: "List 3-4 adjectives (e.g., 'Confident, but not arrogant. Helpful, but not patronizing.')." },
                    { label: "Our Tone Adapts", content: "Describe how the tone changes for different contexts (e.g., 'On social media, we are more casual. In support docs, we are more formal.')." },
                    { label: "Vocabulary (Do's and Don'ts)", content: "List words to use (e.g., 'collaborate', 'streamline') and words to avoid (e.g., 'synergy', 'utilize')." },
                ]
            },
            {
                name: "Slogan & Tagline Generation",
                blocks: [
                    { label: "Company/Product", content: "[Company/Product Name]." },
                    { label: "Core Value Proposition", content: "Our main value is [e.g., making complex data simple]." },
                    { label: "Target Audience", content: "[Target Audience]." },
                    { label: "Keywords", content: "Include keywords like [e.g., 'effortless', 'powerful', 'secure']." },
                    { label: "Task", content: "Generate 10 catchy slogans or taglines based on this information." },
                ]
            },
        ]
    },
    {
        name: "Coding & Development",
        subCategories: [
            {
                name: "Function/Method Generation",
                blocks: [
                    { label: "Role", content: "Act as a senior software engineer." },
                    { label: "Task", content: "Write a function in [language, e.g., Python] that accomplishes the following: [describe function's purpose]." },
                    { label: "Parameters", content: "The function should accept the following parameters: [list parameters and their types]." },
                    { label: "Return Value", content: "It should return [describe return value and its type]." },
                    { label: "Code Comments", content: "Include clear comments explaining the logic of the code." },
                ]
            },
            {
                name: "Code Debugging",
                blocks: [
                    { label: "Language", content: "The code is written in [language]." },
                    { label: "Code Snippet", content: "[Paste the problematic code snippet here]." },
                    { label: "Expected Behavior", content: "The code is supposed to [describe what it should do]." },
                    { label: "Actual Behavior/Error", content: "Instead, it is [describe the error message or incorrect behavior]." },
                    { label: "Task", content: "Analyze the code, explain the bug, and provide a corrected version." },
                ]
            },
            {
                name: "Code Refactoring",
                blocks: [
                    { label: "Code Snippet", content: "[Paste the working but inefficient/unclean code here]." },
                    { label: "Goal", content: "The goal of refactoring is to improve [e.g., readability, performance, maintainability]." },
                    { label: "Task", content: "Refactor this code. Do not change its external behavior, but improve its internal structure. Add comments explaining the improvements." },
                ]
            },
            {
                name: "API Documentation",
                blocks: [
                    { label: "Endpoint", content: "The API endpoint is `[e.g., GET /api/users/{id}]`." },
                    { label: "Description", content: "This endpoint [describe what it does, e.g., retrieves a specific user's profile]." },
                    { label: "Request Parameters", content: "Describe any path, query, or body parameters, including their type and if they are required." },
                    { label: "Successful Response", content: "Provide an example of a successful `200 OK` JSON response." },
                    { label: "Error Responses", content: "Describe potential error responses, like `404 Not Found`." },
                ]
            },
            {
                name: "Database Schema Design",
                blocks: [
                    { label: "Application Type", content: "I am building a [e.g., social media, e-commerce, blogging] application." },
                    { label: "Key Entities", content: "The main entities are [e.g., Users, Posts, Comments, Likes]." },
                    { label: "Relationships", content: "Describe the relationships (e.g., 'A User can have many Posts. A Post can have many Comments.')." },
                    { label: "Task", content: "Generate the SQL schema (CREATE TABLE statements) for these entities, including primary keys, foreign keys, and appropriate data types." },
                ]
            },
            {
                name: "Unit Test Generation",
                blocks: [
                    { label: "Language/Framework", content: "The tests should be written in [language] using the [testing framework, e.g., Jest, pytest]." },
                    { label: "Function to Test", content: "[Paste the function code here]." },
                    { label: "Task", content: "Write a suite of unit tests for this function. Include a test for the happy path, edge cases, and invalid input." },
                ]
            },
            {
                name: "Regex Pattern Generation",
                blocks: [
                    { label: "Goal", content: "I need a regular expression to validate [e.g., an email address, a strong password, a URL]." },
                    { label: "Matching Examples", content: "The regex should match strings like: '[example 1]', '[example 2]'." },
                    { label: "Non-matching Examples", content: "The regex should NOT match strings like: '[example 3]', '[example 4]'." },
                    { label: "Task", content: "Provide the regex pattern and explain how it works." },
                ]
            },
            {
                name: "Algorithm Explanation",
                blocks: [
                    { label: "Algorithm Name", content: "Explain the [e.g., Bubble Sort, Dijkstra's, Binary Search] algorithm." },
                    { label: "Analogy", content: "Use a simple, real-world analogy to explain the core concept." },
                    { label: "Step-by-Step", content: "Provide a step-by-step breakdown of how the algorithm works." },
                    { label: "Complexity", content: "Explain its time and space complexity (Big O notation)." },
                    { label: "Use Case", content: "Describe a practical use case where this algorithm is suitable." },
                ]
            },
            {
                name: "DevOps / CI/CD Pipeline",
                blocks: [
                    { label: "Project Type", content: "The project is a [e.g., Node.js web app, Python library]." },
                    { label: "Platform", content: "The CI/CD pipeline should be for [e.g., GitHub Actions, GitLab CI]." },
                    { label: "Pipeline Stages", content: "The pipeline should include the following stages: 1. Build, 2. Test, 3. Lint, 4. Deploy." },
                    { label: "Deployment Target", content: "The application should be deployed to [e.g., AWS S3, Heroku]." },
                    { label: "Task", content: "Write the YAML configuration file for this pipeline." },
                ]
            },
            {
                name: "Technical Explanation (ELI5)",
                blocks: [
                    { label: "Complex Topic", content: "Explain the technical concept of [e.g., 'blockchain', 'machine learning', 'cloud computing']." },
                    { label: "Target Audience", content: "Explain it to a 5-year-old (ELI5) or a non-technical beginner." },
                    { label: "Analogy", content: "Use a very simple analogy to make the concept understandable." },
                    { label: "Core Idea", content: "Focus on the absolute core idea without getting bogged down in technical jargon." },
                ]
            },
        ]
    },
    {
        name: "Business & Professional",
        subCategories: [
            {
                name: "Business Plan Outline",
                blocks: [
                    { label: "Company Idea", content: "A business idea for a [type of company] in the [industry] market." },
                    { label: "Task", content: "Create a comprehensive business plan outline including these sections: Executive Summary, Company Description, Market Analysis, Organization & Management, Products or Services, Marketing & Sales Strategy, and Financial Projections." },
                ]
            },
            {
                name: "SWOT Analysis",
                blocks: [
                    { label: "Company/Product", content: "The SWOT analysis is for [Company Name or Product]." },
                    { label: "Task", content: "Conduct a SWOT analysis. Identify and list potential Strengths, Weaknesses, Opportunities, and Threats." },
                ]
            },
            {
                name: "Meeting Agenda",
                blocks: [
                    { label: "Meeting Purpose", content: "The purpose of the meeting is [e.g., weekly project sync, Q3 strategy planning]." },
                    { label: "Attendees", content: "List the names or roles of attendees." },
                    { label: "Date & Time", content: "The meeting is on [Date] at [Time] for [Duration]." },
                    { label: "Agenda Items", content: "Create a list of agenda items with an estimated time for each. Include topics like: [Topic 1], [Topic 2]." },
                ]
            },
            {
                name: "Job Description",
                blocks: [
                    { label: "Job Title", content: "[Job Title]." },
                    { label: "Company Overview", content: "A brief, exciting overview of [Company Name]." },
                    { label: "Responsibilities", content: "List the key responsibilities for this role using action verbs." },
                    { label: "Qualifications", content: "List the required skills, experience, and education." },
                    { label: "Benefits", content: "Mention key benefits or perks of working at the company." },
                ]
            },
            {
                name: "Performance Review Feedback",
                blocks: [
                    { label: "Employee Role", content: "The employee is a [Job Title]." },
                    { label: "Area of Strength", content: "The employee excels at [describe a specific strength with an example]." },
                    { label: "Area for Improvement", content: "The employee needs to develop their skills in [describe a specific area for improvement]." },
                    { label: "Constructive Feedback", content: "Provide specific, actionable feedback on how they can improve." },
                    { label: "Future Goals", content: "Suggest one or two measurable goals for the next quarter." },
                ]
            },
            {
                name: "Project Proposal",
                blocks: [
                    { label: "Project Title", content: "[Project Title]." },
                    { label: "Problem Statement", content: "Clearly define the problem that this project aims to solve." },
                    { label: "Proposed Solution", content: "Describe your proposed solution in detail." },
                    { label: "Key Deliverables", content: "List the tangible outcomes or deliverables of the project." },
                    { label: "Timeline & Budget", content: "Provide a high-level timeline and estimated budget." },
                ]
            },
            {
                name: "Stakeholder Update Email",
                blocks: [
                    { label: "Project Name", content: "[Project Name]." },
                    { label: "Reporting Period", content: "This is an update for the period [e.g., last week, month of May]." },
                    { label: "Key Accomplishments", content: "List 3-5 key accomplishments during this period in bullet points." },
                    { label: "Upcoming Priorities", content: "List the main priorities for the next period." },
                    { label: "Risks/Blockers", content: "Mention any potential risks or blockers and the plan to mitigate them." },
                ]
            },
            {
                name: "Elevator Pitch",
                blocks: [
                    { label: "My Role/Company", content: "I am a [Your Role] at [Your Company]." },
                    { label: "Problem We Solve", content: "We help [Target Audience] to solve [Problem] by [Our Solution]." },
                    { label: "Unique Differentiator", content: "Unlike our competitors, we [Unique Selling Proposition]." },
                    { label: "Goal", content: "Combine this into a concise and compelling 30-second elevator pitch." },
                ]
            },
            {
                name: "Professional Bio",
                blocks: [
                    { label: "Name & Title", content: "[Your Name], [Your Title]." },
                    { label: "Key Expertise", content: "My area of expertise is [e.g., digital marketing, software development]." },
                    { label: "Major Accomplishment", content: "I am known for [mention a key achievement]." },
                    { label: "Current Focus/Passion", content: "I am currently focused on [your current work or passion project]." },
                    { label: "Task", content: "Write a short, professional bio (around 100 words) in the third person." },
                ]
            },
            {
                name: "Formalize Meeting Notes",
                blocks: [
                    { label: "Raw Notes", content: "[Paste raw, messy meeting notes here]." },
                    { label: "Task", content: "Organize these notes into a professional summary with sections for: Attendees, Key Decisions Made, and Action Items (with assigned owners and deadlines)." },
                ]
            },
        ]
    },
    {
        name: "Creative Writing",
        subCategories: [
            { name: "Story Idea Generation", blocks: [{ label: "Genre", content: "The genre is [e.g., Sci-Fi, Fantasy, Mystery]." }, { label: "Core Elements", content: "I want to combine the elements of [element 1, e.g., an ancient artifact] and [element 2, e.g., a futuristic city]." }, { label: "Task", content: "Generate 5 unique story ideas based on these elements." }] },
            { name: "Character Profile", blocks: [{ label: "Role", content: "The character is the [protagonist/antagonist/sidekick]." }, { label: "Core Trait", content: "Their defining trait is [e.g., reluctant heroism, ruthless ambition]." }, { label: "Backstory", content: "Provide a brief backstory including a key event that shaped them." }, { label: "Internal Conflict", content: "Describe their main internal conflict (e.g., 'duty vs. desire')." }] },
            { name: "Plot Outline", blocks: [{ label: "Story Idea", content: "A story about [brief story summary]." }, { label: "Structure", content: "Outline a plot using the three-act structure: Act I (Setup), Act II (Confrontation), and Act III (Resolution)." }] },
            { name: "Dialogue Scene", blocks: [{ label: "Characters", content: "A scene between [Character A] and [Character B]." }, { label: "Setting", content: "The scene takes place at [location]." }, { label: "Conflict/Goal", content: "[Character A] wants to [goal], but [Character B] is [obstacle]." }, { label: "Subtext", content: "The underlying tension is about [the unspoken issue]." }] },
            { name: "World Building", blocks: [{ label: "World Concept", content: "A [genre] world where the main rule is [e.g., magic is fading, gravity is inconsistent]." }, { label: "Key Factions", content: "Describe two opposing factions within this world." }, { label: "Unique Location", content: "Detail one unique and memorable location." }] },
            { name: "Poetry", blocks: [{ label: "Theme", content: "The poem is about [theme, e.g., loss, nature, technology]." }, { label: "Poetic Form", content: "Write it in the form of a [e.g., sonnet, haiku, free verse]." }, { label: "Key Imagery", content: "Use imagery related to [e.g., the ocean, a bustling city]." }] },
            { name: "Screenplay Scene", blocks: [{ label: "Scene Heading", content: "INT. COFFEE SHOP - DAY" }, { label: "Action", content: "Describe the setting and what the characters are doing." }, { label: "Character Dialogue", content: "Write the dialogue for a scene where a character reveals a secret." }] },
            { name: "First Paragraph Hook", blocks: [{ label: "Story Idea", content: "The story is about [brief summary]." }, { label: "Task", content: "Write a compelling opening paragraph that introduces a character and a mystery, making the reader want to know more." }] },
            { name: "Twist Ending Idea", blocks: [{ label: "Story Setup", content: "The story is about a detective hunting a serial killer." }, { label: "Task", content: "Brainstorm 3 surprising and satisfying twist endings for this story." }] },
            { name: "Mythology Creation", blocks: [{ label: "Core Concept", content: "Create a creation myth for a fantasy world." }, { label: "Deities", content: "Describe the primary gods or goddesses and their domains." }, { label: "Legendary Event", content: "Narrate one legendary event from this mythology, like a great war or a cataclysm." }] },
        ]
    },
    {
        name: "Education & Learning",
        subCategories: [
            { name: "Lesson Plan", blocks: [{ label: "Subject/Topic", content: "A lesson plan for a [grade level] class on [topic]." }, { label: "Learning Objectives", content: "By the end of the lesson, students will be able to [objective 1] and [objective 2]." }, { label: "Activities", content: "Outline a starter activity, a main learning activity, and a concluding plenary." }, { label: "Assessment", content: "How will student understanding be assessed (e.g., quiz, group discussion, exit ticket)?" }] },
            { name: "Quiz/Test Questions", blocks: [{ label: "Topic", content: "Questions for a quiz on [specific topic]." }, { label: "Question Types", content: "Generate [number] multiple-choice questions, [number] true/false questions, and [number] short-answer questions." }, { label: "Task", content: "Provide the questions and their correct answers." }] },
            { name: "Complex Topic Explanation", blocks: [{ label: "Topic", content: "Explain the concept of [e.g., quantum physics, supply and demand]." }, { label: "Target Audience", content: "The explanation should be for a [e.g., high school student, beginner adult]." }, { label: "Analogy", content: "Use a simple, relatable analogy to explain the core idea." }] },
            { name: "Study Guide Outline", blocks: [{ label: "Subject/Exam", content: "A study guide for the upcoming exam on [subject]." }, { label: "Key Topics", content: "List the main topics that will be covered on the exam." }, { label: "Outline Structure", content: "For each topic, create a section with key definitions, important concepts, and sample practice questions." }] },
            { name: "Summarize Text", blocks: [{ label: "Text", content: "[Paste a long article or text here]." }, { label: "Task", content: "Summarize this text into [number] key bullet points or a short paragraph of about [word count] words." }] },
            { name: "Flashcard Generation", blocks: [{ label: "Topic", content: "Generate flashcards for studying [subject, e.g., Spanish vocabulary]." }, { label: "Content", content: "For a list of terms [term 1, term 2], provide the corresponding definitions." }, { label: "Format", content: "Format the output as 'Term: Definition' on each line." }] },
            { name: "Create a Mnemonic", blocks: [{ label: "Information to Memorize", content: "I need to remember the order of [list of items, e.g., the planets, a historical sequence]." }, { label: "Task", content: "Create a memorable mnemonic sentence to help me remember the order." }] },
            { name: "Role-Playing Scenario", blocks: [{ label: "Subject", content: "A role-playing scenario for a [e.g., history, literature] class." }, { label: "Scenario", content: "Create a scenario where students take on the roles of [e.g., historical figures debating an issue, characters from a novel]." }, { label: "Objective", content: "The objective is for students to understand different perspectives." }] },
            { name: "Lab Experiment Outline", blocks: [{ label: "Scientific Concept", content: "A lab experiment to demonstrate [e.g., chemical reactions, photosynthesis]." }, { label: "Hypothesis", content: "State a clear hypothesis for the experiment." }, { label: "Materials", content: "List the necessary materials." }, { label: "Procedure", content: "Provide a step-by-step procedure for students to follow." }] },
            { name: "Curriculum Development", blocks: [{ label: "Course Title", content: "An introductory course on [subject]." }, { label: "Course Duration", content: "The course is [e.g., 8 weeks long]." }, { label: "Task", content: "Outline a week-by-week curriculum for the course, including the topic for each week and a suggested assignment." }] },
        ]
    },
    {
        name: "Research & Analysis",
        subCategories: [
            { name: "Literature Review Outline", blocks: [{ label: "Research Question", content: "My research question is: [question]." }, { label: "Key Themes", content: "I have identified the following key themes in the existing literature: [theme 1], [theme 2]." }, { label: "Task", content: "Create an outline for a literature review that synthesizes these themes in relation to my research question." }] },
            { name: "Data Analysis Plan", blocks: [{ label: "Dataset Description", content: "I have a dataset with the following columns: [list column names]." }, { label: "Research Goal", content: "My goal is to understand [e.g., the factors that predict customer churn]." }, { label: "Task", content: "Suggest 3 interesting questions I could ask of this data and what statistical methods or visualizations I could use to answer them." }] },
            { name: "Hypothesis Generation", blocks: [{ label: "Observation", content: "I have observed that [e.g., users who use feature X are more likely to remain subscribed]." }, { label: "Task", content: "Generate three testable hypotheses to explain this observation." }] },
            { name: "Survey Question Design", blocks: [{ label: "Survey Goal", content: "The survey aims to measure [e.g., customer satisfaction with a new product]." }, { label: "Key Areas", content: "I need to ask about [area 1, e.g., ease of use] and [area 2, e.g., pricing]." }, { label: "Task", content: "Write 5 well-formulated survey questions (e.g., Likert scale, multiple choice) to address these areas." }] },
            { name: "Competitor Analysis", blocks: [{ label: "My Company/Product", content: "[My Company/Product Name]." }, { label: "Key Competitors", content: "My main competitors are [Competitor 1] and [Competitor 2]." }, { label: "Task", content: "Conduct a brief analysis of their strengths and weaknesses compared to my product." }] },
            { name: "Argumentative Essay Outline", blocks: [{ label: "Thesis Statement", content: "My thesis is: '[thesis statement]'." }, { label: "Supporting Points", content: "I will support this with three main arguments: [Point 1], [Point 2], [Point 3]." }, { label: "Task", content: "Create a five-paragraph essay outline based on this structure." }] },
            { name: "Counter-Argument Analysis", blocks: [{ label: "My Argument", content: "My argument is that [your argument]." }, { label: "Task", content: "Identify the strongest potential counter-argument to my position and then provide a rebuttal to that counter-argument." }] },
            { name: "Summarize Research Paper", blocks: [{ label: "Paper Abstract/Text", content: "[Paste the abstract or full text of a research paper]." }, { label: "Task", content: "Summarize the paper's key findings, methodology, and implications in a few clear bullet points." }] },
            { name: "Thematic Analysis", blocks: [{ label: "Source Material", content: "I have a collection of [e.g., customer reviews, interview transcripts]." }, { label: "Task", content: "Act as a qualitative researcher. Read the following text and identify 3-5 recurring themes or patterns.\n\n[Paste text here]" }] },
            { name: "Brainstorm Research Questions", blocks: [{ label: "Broad Topic", content: "My broad area of interest is [e.g., the impact of social media on mental health]." }, { label: "Task", content: "Generate 5 specific and researchable questions related to this topic." }] },
        ]
    },
    {
        name: "Design & UI/UX",
        subCategories: [
            { name: "User Persona Generation", blocks: [{ label: "Product", content: "A mobile app that helps users [app's purpose, e.g., learn a new language]." }, { label: "Task", content: "Create a detailed user persona. Include demographics, goals, frustrations, and a short bio." }] },
            { name: "User Flow Outline", blocks: [{ label: "Task/Goal", content: "The user wants to [e.g., sign up for a new account, purchase an item]." }, { label: "Task", content: "Outline the key screens and steps the user would take to complete this task." }] },
            { name: "A/B Testing Ideas", blocks: [{ label: "Screen/Feature", content: "I want to improve the [e.g., pricing page, onboarding flow]." }, { label: "Goal", content: "The goal is to increase [metric, e.g., conversion rate, user retention]." }, { label: "Task", content: "Brainstorm 3 A/B test ideas for this screen, including a clear hypothesis for each." }] },
            { name: "UI Microcopy Writing", blocks: [{ label: "UI Element", content: "I need microcopy for a [e.g., 'delete confirmation' modal, an empty state screen]." }, { label: "Context", content: "The user is about to permanently delete their project." }, { label: "Task", content: "Write clear, concise, and reassuring microcopy (headline, body text, button labels) for this element." }] },
            { name: "Design Feedback Request", blocks: [{ label: "Design Link", content: "[Link to Figma/image of the design]." }, { label: "Context", content: "This is a new design for the [e.g., user dashboard]." }, { label: "Feedback Focus", content: "I am specifically looking for feedback on the [e.g., visual hierarchy, clarity of information]." }, { label: "Task", content: "Formulate this into a clear and concise request for feedback from my team." }] },
            { name: "Heuristic Evaluation", blocks: [{ label: "Website/App", content: "I am evaluating [website/app name]." }, { label: "Heuristic", content: "Evaluate the design based on Nielsen's heuristic of 'Consistency and standards'." }, { label: "Task", content: "Identify one positive example and one potential violation of this heuristic in the design." }] },
            { name: "Brainstorm App Ideas", blocks: [{ label: "Core Concepts", content: "I want to combine the concepts of '[concept 1, e.g., local community]' and '[concept 2, e.g., sustainable living]'." }, { label: "Task", content: "Brainstorm 3 unique mobile app ideas based on these concepts." }] },
            { name: "Mood Board Concept", blocks: [{ label: "Brand Adjectives", content: "The brand should feel [e.g., 'minimal', 'bold', 'organic']." }, { label: "Task", content: "Describe the key visual elements (colors, typography, imagery style) for a mood board that captures these adjectives." }] },
            { name: "Accessibility Review", blocks: [{ label: "UI Component", content: "A sign-up form with input fields and a button." }, { label: "Task", content: "Provide a checklist of key accessibility considerations for this component (e.g., color contrast, keyboard navigation, screen reader labels)." }] },
            { name: "Information Architecture", blocks: [{ label: "Website Type", content: "An e-commerce website selling [product type]." }, { label: "Task", content: "Propose a logical primary navigation structure (the main menu items) for this website." }] },
        ]
    },
    {
        name: "Personal Productivity & Self-Help",
        subCategories: [
            { name: "Break Down a Project", blocks: [{ label: "Project Goal", content: "My project is to [e.g., 'launch a personal blog', 'run a 5k race']." }, { label: "Task", content: "Break this project down into smaller, actionable tasks and sub-tasks." }] },
            { name: "Prioritize Tasks", blocks: [{ label: "Task List", content: "I have the following tasks for today: [list of tasks]." }, { label: "Task", content: "Help me prioritize these tasks using the Eisenhower Matrix (Urgent/Important vs. Not Urgent/Not Important)." }] },
            { name: "Set SMART Goals", blocks: [{ label: "General Goal", content: "I want to [e.g., 'get better at coding']." }, { label: "Task", content: "Transform this general goal into a SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound)." }] },
            { name: "Create a Habit Plan", blocks: [{ label: "New Habit", content: "I want to start the habit of '[e.g., reading 30 minutes every day]'." }, { label: "Task", content: "Create a simple plan to help me stick to it. Include tips for tracking, staying motivated, and overcoming common obstacles." }] },
            { name: "Journaling Prompts", blocks: [{ label: "Focus Area", content: "I want to journal about [e.g., 'gratitude', 'overcoming a challenge', 'planning my week']." }, { label: "Task", content: "Provide 5 thoughtful journaling prompts related to this focus area." }] },
            { name: "Overcome Procrastination", blocks: [{ label: "Task I'm Avoiding", content: "I'm procrastinating on [the specific task]." }, { label: "Task", content: "Help me apply the 'Pomodoro Technique'. Break down the first step and write a script for me to start the first 25-minute timer." }] },
            { name: "Decision Making", blocks: [{ label: "Decision", content: "I need to decide between [Option A] and [Option B]." }, { label: "Task", content: "Create a 'Pros and Cons' table framework for me to fill out for each option to help clarify my thinking." }] },
            { name: "Mindfulness Exercise", blocks: [{ label: "Situation", content: "I'm feeling [e.g., 'stressed', 'anxious'] right now." }, { label: "Task", content: "Guide me through a simple 3-minute mindfulness exercise I can do at my desk." }] },
            { name: "Weekly Review", blocks: [{ label: "Task", content: "Provide a template with key questions for a weekly review, covering: What went well? What didn't go well? What did I learn? What will I do differently next week?" }] },
            { name: "Book Summary & Action Plan", blocks: [{ label: "Book Title", content: "[Book Title, e.g., 'Atomic Habits']." }, { label: "Task", content: "Summarize the single most important concept from this book and suggest one immediate action I can take to apply it to my life." }] },
        ]
    },
    {
        name: "Customer Support",
        subCategories: [
            { name: "Empathetic Response Template", blocks: [{ label: "Customer Issue", content: "A customer is frustrated because [e.g., their order is delayed, a feature is not working]." }, { label: "Task", content: "Draft a polite and empathetic customer support template that acknowledges their frustration, apologizes, and explains the next steps." }] },
            { name: "FAQ Generation", blocks: [{ label: "Product/Service", content: "A new SaaS product that provides [service]." }, { label: "Task", content: "Generate 5 common FAQ questions and their clear, concise answers for this product." }] },
            { name: "Chatbot Conversation Flow", blocks: [{ label: "User Goal", content: "The user wants to [e.g., 'reset their password', 'check order status']." }, { label: "Task", content: "Design a simple, step-by-step conversation flow for a chatbot to handle this request." }] },
            { name: "Handling Angry Customers", blocks: [{ label: "Customer Complaint", content: "A customer wrote: '[Paste angry customer email/message]'." }, { label: "Task", content: "De-escalate the situation. Write a response that validates their feelings, takes responsibility (where appropriate), and offers a clear resolution." }] },
            { name: "Bug Report Triage", blocks: [{ label: "User Bug Report", content: "'[User's description of the bug]'" }, { label: "Task", content: "Turn this user report into a structured bug ticket for developers. Include sections for: Summary, Steps to Reproduce, Expected Result, Actual Result." }] },
            { name: "Feature Request Response", blocks: [{ label: "Customer Request", content: "A customer requested [a new feature]." }, { label: "Task", content: "Write a template for responding to feature requests that thanks the customer, explains how you handle feedback, and doesn't make a false promise." }] },
            { name: "Refund Policy Explanation", blocks: [{ label: "Task", content: "Explain a standard 30-day refund policy in simple, easy-to-understand language. Create one version for the website and a shorter version for a support macro." }] },
            { name: "Proactive Support Message", blocks: [{ label: "Situation", content: "We are about to have some scheduled maintenance that will cause a 1-hour outage." }, { label: "Task", content: "Write a proactive announcement to inform users about the upcoming maintenance, explaining when it will happen and why." }] },
            { name: "Onboarding Email Series", blocks: [{ label: "Product", content: "[Product Name]." }, { label: "Task", content: "Outline a 3-email onboarding series for new users. Email 1: Welcome. Email 2: Introduce a key feature. Email 3: Share a pro-tip or resource." }] },
            { name: "Internal Knowledge Base Article", blocks: [{ label: "Topic", content: "How to process a manual refund for a customer." }, { label: "Task", content: "Write a clear, step-by-step internal knowledge base article for new support agents on this topic." }] },
        ]
    },
    {
        name: "Health & Fitness",
        subCategories: [
            { name: "Workout Plan", blocks: [{ label: "Goal", content: "My fitness goal is [e.g., build muscle, lose weight, improve cardio]." }, { label: "Experience Level", content: "I am a [beginner/intermediate/advanced]." }, { label: "Frequency", content: "I can work out [number] days per week." }, { label: "Task", content: "Create a weekly workout plan with specific exercises, sets, and reps." }] },
            { name: "Meal Plan", blocks: [{ label: "Dietary Goal", content: "I want a meal plan for [e.g., weight loss, muscle gain]." }, { label: "Dietary Restrictions", content: "I have the following restrictions: [e.g., vegetarian, gluten-free]." }, { label: "Calories", content: "My target daily calorie intake is [number]." }, { label: "Task", content: "Generate a 3-day sample meal plan (breakfast, lunch, dinner, snacks)." }] },
            { name: "Explain a Fitness Concept", blocks: [{ label: "Concept", content: "Explain [e.g., 'progressive overload', 'HIIT', 'macronutrients']." }, { label: "Audience", content: "Explain it to a complete beginner." }, { label: "Analogy", content: "Use a simple analogy to make it easy to understand." }] },
            { name: "Recipe Finder", blocks: [{ label: "Ingredients I Have", content: "I have [list of ingredients]." }, { label: "Meal Type", content: "I want to make [e.g., a quick dinner, a healthy breakfast]." }, { label: "Task", content: "Suggest a healthy recipe I can make with these ingredients." }] },
            { name: "Meditation Guide Script", blocks: [{ label: "Goal", content: "A guided meditation for [e.g., reducing anxiety, improving focus]." }, { label: "Duration", content: "The meditation should be [number] minutes long." }, { label: "Task", content: "Write a script for the guided meditation, including instructions for breathing and visualization." }] },
            { name: "Injury Prevention Tips", blocks: [{ label: "Activity", content: "I do a lot of [e.g., running, weightlifting]." }, { label: "Task", content: "Provide 5 key tips to prevent common injuries associated with this activity." }] },
            { name: "Yoga Flow Sequence", blocks: [{ label: "Focus", content: "A yoga sequence to [e.g., wake up in the morning, wind down before bed]." }, { label: "Level", content: "Suitable for beginners." }, { label: "Task", content: "List a sequence of 5-7 yoga poses with brief instructions for each." }] },
            { name: "Healthy Habit Integration", blocks: [{ label: "Goal", content: "I want to incorporate the habit of [e.g., 'drinking more water', 'walking 10,000 steps'] into my daily routine." }, { label: "Task", content: "Suggest 3 practical strategies to make this habit easier to adopt." }] },
            { name: "Supplement Information", blocks: [{ label: "Supplement Name", content: "What is [e.g., Creatine, Vitamin D] used for?" }, { label: "Task", content: "Provide a brief, evidence-based summary of its benefits, common dosages, and potential side effects." }] },
            { name: "Mental Health Check-in", blocks: [{ label: "Task", content: "Create a list of 5 self-reflection questions for a daily mental health check-in, focusing on emotions, energy levels, and self-care." }] },
        ]
    },
    {
        name: "Food & Cooking",
        subCategories: [
            { name: "Recipe Generation", blocks: [{ label: "Dish", content: "I want to make [e.g., chicken parmesan, vegan chili]." }, { label: "Skill Level", content: "The recipe should be for a [beginner/intermediate] cook." }, { label: "Task", content: "Generate a recipe with a list of ingredients and step-by-step instructions." }] },
            { name: "Weekly Meal Plan", blocks: [{ label: "Goal", content: "Create a meal plan for a week that is [e.g., budget-friendly, quick and easy, healthy]." }, { label: "Task", content: "Outline a 5-day dinner plan and generate a corresponding grocery list." }] },
            { name: "Ingredient Substitution", blocks: [{ label: "Original Ingredient", content: "I'm making a recipe that calls for [ingredient], but I don't have it." }, { label: "Task", content: "Suggest 3 suitable substitutions and explain any adjustments I might need to make." }] },
            { name: "Cooking Technique Explained", blocks: [{ label: "Technique", content: "Explain the cooking technique of [e.g., 'braising', 'sautéing', 'emulsifying']." }, { label: "Audience", content: "Explain it simply for a home cook." }, { label: "Example", content: "Provide an example of a dish where this technique is used." }] },
            { name: "Food Pairing Ideas", blocks: [{ label: "Main Dish/Ingredient", content: "What goes well with [e.g., grilled salmon, a bold Cabernet Sauvignon]?" }, { label: "Task", content: "Suggest 3 food or drink pairings and explain why they work." }] },
            { name: "Convert Measurements", blocks: [{ label: "Measurement", content: "Convert [e.g., '1 cup of flour to grams', '1 tablespoon to mL']." }, { label: "Task", content: "Provide the conversion." }] },
            { name: "Kitchen Tool Usage", blocks: [{ label: "Tool", content: "What are the best uses for a [e.g., Dutch oven, immersion blender]?" }, { label: "Task", content: "List 3 primary uses for this kitchen tool." }] },
            { name: "Holiday Menu Planning", blocks: [{ label: "Holiday", content: "I'm planning a menu for [e.g., Thanksgiving, a summer BBQ]." }, { label: "Number of Guests", content: "There will be [number] guests." }, { label: "Task", content: "Suggest a full menu, including an appetizer, main course, two side dishes, and a dessert." }] },
            { name: "Flavor Profile Creation", blocks: [{ label: "Cuisine", content: "I want to create a dish with a [e.g., Thai, Mexican, Italian] flavor profile." }, { label: "Task", content: "List the key herbs, spices, and ingredients that define this flavor profile." }] },
            { name: "Leftover Transformation", blocks: [{ label: "Leftovers", content: "I have leftover [e.g., roast chicken, rice, vegetables]." }, { label: "Task", content: "Suggest a new and interesting meal I can make with these leftovers." }] },
        ]
    },
    {
        name: "Travel & Tourism",
        subCategories: [
            { name: "Travel Itinerary", blocks: [{ label: "Destination", content: "A trip to [City, Country]." }, { label: "Duration", content: "[Number] days." }, { label: "Interests", content: "My interests are [e.g., history, food, nature, art]." }, { label: "Task", content: "Create a day-by-day itinerary with suggestions for activities, sights, and restaurants." }] },
            { name: "Packing List", blocks: [{ label: "Destination & Season", content: "I'm packing for a trip to [Destination] in the [Season]." }, { label: "Trip Type", content: "It's a [e.g., beach vacation, city break, hiking trip]." }, { label: "Task", content: "Generate a comprehensive packing list." }] },
            { name: "Budget Planning", blocks: [{ label: "Destination", content: "[Destination]." }, { label: "Travel Style", content: "My travel style is [e.g., budget backpacker, mid-range, luxury]." }, { label: "Duration", content: "[Number] days." }, { label: "Task", content: "Provide a sample daily budget, breaking down costs for accommodation, food, activities, and transport." }] },
            { name: "Cultural Etiquette Tips", blocks: [{ label: "Country", content: "I am traveling to [Country]." }, { label: "Task", content: "Provide 5 essential cultural etiquette tips regarding greetings, dining, and tipping." }] },
            { name: "Local Phrases", blocks: [{ label: "Language/Country", content: "I need some basic phrases for my trip to [Country]." }, { label: "Task", content: "Provide 10 essential phrases for travelers, including 'Hello', 'Thank you', 'How much is this?', and their phonetic pronunciation." }] },
            { name: "Find Hidden Gems", blocks: [{ label: "City", content: "I'm visiting [City] and want to avoid the main tourist traps." }, { label: "Task", content: "Suggest 3 lesser-known 'hidden gem' attractions, cafes, or neighborhoods." }] },
            { name: "Travel Blog Post Idea", blocks: [{ label: "Destination", content: "[Destination]." }, { label: "Angle", content: "I want to write a blog post with a unique angle, not just a list of things to do." }, { label: "Task", content: "Brainstorm 3 creative blog post titles and a brief concept for each." }] },
            { name: "Compare Destinations", blocks: [{ label: "Choice", content: "I can't decide between [Destination A] and [Destination B] for a [trip type]." }, { label: "Priorities", content: "My main priorities are [e.g., budget, beaches, nightlife]." }, { label: "Task", content: "Compare the two destinations based on my priorities." }] },
            { name: "Solo Travel Safety", blocks: [{ label: "Destination", content: "I am traveling solo to [City]." }, { label: "Task", content: "Provide 5 practical safety tips for a solo traveler in this destination." }] },
            { name: "Souvenir Ideas", blocks: [{ label: "Country/Region", content: "[Country/Region]." }, { label: "Task", content: "Suggest authentic and unique souvenirs to bring back, avoiding generic tourist trap items." }] },
        ]
    },
    {
        name: "Finance & Investing",
        subCategories: [
            { name: "Explain a Financial Concept", blocks: [{ label: "Concept", content: "Explain [e.g., 'compound interest', 'asset allocation', 'dollar-cost averaging']." }, { label: "Audience", content: "Explain it to a complete beginner." }, { label: "Analogy", content: "Use a simple analogy." }] },
            { name: "Personal Budgeting", blocks: [{ label: "Income", content: "My monthly take-home pay is [amount]." }, { label: "Goal", content: "I want to create a budget using the 50/30/20 rule (Needs/Wants/Savings)." }, { label: "Task", content: "Break down my income into these three categories and suggest common expense types for each." }] },
            { name: "Investment Strategy", blocks: [{ label: "Investor Profile", content: "I am a [age]-year-old investor with a [e.g., high, medium, low] risk tolerance." }, { label: "Goal", content: "My goal is long-term growth for retirement." }, { label: "Task", content: "Suggest a sample portfolio asset allocation (e.g., percentage in stocks, bonds, etc.)." }] },
            { name: "Compare Investment Options", blocks: [{ label: "Options", content: "Compare a [e.g., 'Roth IRA'] vs. a [e.g., 'Traditional IRA']." }, { label: "Task", content: "Explain the key differences in terms of taxes and withdrawals." }] },
            { name: "Debt Reduction Plan", blocks: [{ label: "Debts", content: "I have the following debts: [list debts with amounts and interest rates]." }, { label: "Task", content: "Explain the 'Debt Snowball' and 'Debt Avalanche' methods and show how I would apply each to my list of debts." }] },
            { name: "Financial Goal Planning", blocks: [{ label: "Goal", content: "I want to save for a [e.g., down payment on a house] of [amount]." }, { label: "Timeline", content: "I want to achieve this in [number] years." }, { label: "Task", content: "Calculate how much I need to save per month to reach this goal." }] },
            { name: "Stock Analysis", blocks: [{ label: "Company", content: "Provide a brief analysis of [Company Name, e.g., Apple Inc.]." }, { label: "Task", content: "Act as a financial analyst and provide a brief summary of its business model, a key strength, and a potential risk." }] },
            { name: "Saving Money Tips", blocks: [{ label: "Expense Category", content: "I want to save money on [e.g., 'groceries', 'utilities']." }, { label: "Task", content: "Provide 5 actionable tips to reduce spending in this category." }] },
            { name: "Retirement Planning", blocks: [{ label: "Current Age", content: "[Age]." }, { label: "Target Retirement Age", content: "[Age]." }, { label: "Task", content: "Provide a simple checklist of key financial steps I should be taking at my age to prepare for retirement." }] },
            { name: "Negotiation Script", blocks: [{ label: "Situation", content: "I need to negotiate [e.g., a higher salary, a lower price on a car]." }, { label: "Task", content: "Create a simple script outline with an opening statement, key talking points based on research, and a closing statement." }] },
        ]
    },
    {
        name: "Legal Services",
        subCategories: [
            { name: "Simplify Legal Jargon", blocks: [{ label: "Legal Term/Clause", content: "Explain the legal term '[term]' or the clause '[clause]' in plain, simple English." }, { label: "Context", content: "The context is a [e.g., rental agreement, terms of service]." }] },
            { name: "Cease and Desist Letter", blocks: [{ label: "Recipient", content: "The letter is addressed to [Recipient Name]." }, { label: "Infringement", content: "For the unauthorized use of [my copyrighted material/trademark]." }, { label: "Demand", content: "Demand that they immediately stop the infringing activity." }, { label: "Task", content: "Draft a formal cease and desist letter." }] },
            { name: "Non-Disclosure Agreement (NDA)", blocks: [{ label: "Parties", content: "An NDA between [Party A] and [Party B]." }, { label: "Confidential Information", content: "To protect confidential information related to [the project]." }, { label: "Task", content: "Outline the key clauses of a basic, mutual NDA." }] },
            { name: "Basic Will & Testament", blocks: [{ label: "Task", content: "Outline the essential sections of a simple last will and testament, including declaration, executor appointment, and beneficiary designations." }] },
            { name: "Small Claims Court Prep", blocks: [{ label: "Dispute", content: "The dispute is about [e.g., an unpaid invoice of $500]." }, { label: "Task", content: "Create a checklist of documents and evidence I should prepare before filing a small claims case." }] },
            { name: "Rental Agreement Clause", blocks: [{ label: "Topic", content: "Draft a clause for a rental agreement regarding [e.g., pet policy, late fees]." }] },
            { name: "Privacy Policy Outline", blocks: [{ label: "Website/App", content: "A website that [describe its function, e.g., sells products, has a newsletter]." }, { label: "Task", content: "Outline the key sections needed for a basic privacy policy (e.g., What Information We Collect, How We Use It, Data Security)." }] },
            { name: "Freelance Contract", blocks: [{ label: "Services", content: "A contract for [freelance service, e.g., web design]." }, { label: "Task", content: "List the essential clauses for a freelance contract, including Scope of Work, Payment Terms, and Ownership of Work." }] },
            { name: "Demand Letter for Payment", blocks: [{ label: "Recipient", content: "A letter to [Debtor Name]." }, { label: "Debt", content: "Regarding an overdue invoice #[invoice number] for [amount]." }, { label: "Task", content: "Draft a formal demand letter requesting immediate payment." }] },
            { name: "Prepare for a Deposition", blocks: [{ label: "My Role", content: "I am being deposed as a witness in a case about [case topic]." }, { label: "Task", content: "Provide 10 key tips on how to behave and answer questions during a deposition." }] },
        ]
    },
    {
        name: "Real Estate",
        subCategories: [
            { name: "Property Listing Description", blocks: [{ label: "Property Type", content: "A [e.g., 3-bedroom, 2-bathroom house]." }, { label: "Key Features", content: "It has a [e.g., newly renovated kitchen, large backyard]." }, { label: "Location", content: "Located in the [neighborhood name] neighborhood." }, { label: "Task", content: "Write a compelling and attractive real estate listing description." }] },
            { name: "Offer Letter to Seller", blocks: [{ label: "Property Address", content: "[Address]." }, { label: "Key Message", content: "We love your home and want to make a strong offer." }, { label: "Personal Touch", content: "Include a brief personal detail (e.g., 'We can imagine our kids playing in the backyard.')." }, { label: "Task", content: "Draft a friendly and persuasive letter to accompany a purchase offer." }] },
            { name: "Open House Checklist", blocks: [{ label: "Task", content: "Create a checklist for a seller on how to prepare their home for an open house, covering cleaning, decluttering, and staging." }] },
            { name: "Neighborhood Guide", blocks: [{ label: "Neighborhood", content: "[Neighborhood Name]." }, { label: "Task", content: "Write a short guide to the neighborhood, highlighting key amenities like parks, schools, and restaurants." }] },
            { name: "Questions for a Home Inspector", blocks: [{ label: "Task", content: "Generate a list of 10 important questions to ask a home inspector during or after the inspection." }] },
            { name: "Rental Application Email", blocks: [{ label: "Property", content: "I am interested in the rental property at [address]." }, { label: "About Me", content: "A brief introduction about myself and any co-applicants." }, { label: "Task", content: "Write a polite and professional email to a landlord to inquire about a rental and request an application." }] },
            { name: "Real Estate Investment Analysis", blocks: [{ label: "Property", content: "A potential rental property with a purchase price of [price] and estimated rent of [rent]." }, { label: "Task", content: "Outline the key metrics to calculate to determine if it's a good investment (e.g., cash flow, cap rate, cash-on-cash return)." }] },
            { name: "Home Staging Tips", blocks: [{ label: "Room", content: "The [e.g., living room, master bedroom]." }, { label: "Goal", content: "Make the room look bigger and more inviting to potential buyers." }, { label: "Task", content: "Provide 5 specific staging tips for this room." }] },
            { name: "Mortgage Concepts Explained", blocks: [{ label: "Concept", content: "Explain the difference between a [e.g., 'fixed-rate' and 'adjustable-rate' mortgage]." }, { label: "Audience", content: "For a first-time homebuyer." }] },
            { name: "Moving Checklist", blocks: [{ label: "Timeline", content: "The move is in [e.g., 4 weeks]." }, { label: "Task", content: "Create a week-by-week moving checklist of key tasks to complete." }] },
        ]
    },
    {
        name: "Science & Technology",
        subCategories: [
            { name: "Explain a Scientific Theory", blocks: [{ label: "Theory", content: "Explain [e.g., Einstein's theory of relativity, the theory of evolution by natural selection]." }, { label: "Audience", content: "To someone with no scientific background." }, { label: "Analogy", content: "Use a simple analogy." }] },
            { name: "Tech Product Review", blocks: [{ label: "Product", content: "A review of the new [product name, e.g., smartphone, laptop]." }, { label: "Key Areas", content: "The review should cover: Design, Performance, Camera, and Battery Life." }, { label: "Verdict", content: "Provide a final summary and recommendation." }] },
            { name: "Future Tech Speculation", blocks: [{ label: "Technology", content: "[e.g., Artificial Intelligence, Quantum Computing]." }, { label: "Timeline", content: "In the next 20 years." }, { label: "Task", content: "Speculate on three potential ways this technology could change daily life." }] },
            { name: "Lab Report Outline", blocks: [{ label: "Experiment", content: "A lab experiment on [topic]." }, { label: "Task", content: "Create a standard outline for a scientific lab report, including sections like Introduction, Methods, Results, Discussion, and Conclusion." }] },
            { name: "Grant Proposal Abstract", blocks: [{ label: "Research Goal", content: "The research aims to [describe the goal]." }, { label: "Methodology", content: "Using [describe the method]." }, { label: "Impact", content: "The potential impact of this research is [describe impact]." }, { label: "Task", content: "Write a concise and compelling abstract for a grant proposal." }] },
            { name: "Compare Two Technologies", blocks: [{ label: "Technologies", content: "Compare [e.g., '5G vs. Wi-Fi 6', 'iOS vs. Android']." }, { label: "Criteria", content: "Compare them based on speed, use cases, and limitations." }] },
            { name: "Ethical Dilemma in Tech", blocks: [{ label: "Topic", content: "The use of [e.g., facial recognition technology by law enforcement]." }, { label: "Task", content: "Outline the main arguments for and against this practice." }] },
            { name: "Science News Article", blocks: [{ label: "Breakthrough", content: "A recent scientific breakthrough in [field]." }, { label: "Task", content: "Write a short news article (200 words) explaining the breakthrough and its significance to the general public." }] },
            { name: "Biography of a Scientist", blocks: [{ label: "Scientist", content: "[e.g., Marie Curie, Alan Turing]." }, { label: "Task", content: "Write a brief biography highlighting their major contributions to science." }] },
            { name: "DIY Science Experiment", blocks: [{ label: "Concept", content: "A simple experiment to demonstrate [e.g., air pressure, density]." }, { label: "Materials", content: "Using common household items." }, { label: "Task", content: "Provide step-by-step instructions for a fun and safe science experiment for kids." }] },
        ]
    },
    {
        name: "Human Resources (HR)",
        subCategories: [
            { name: "Interview Questions", blocks: [{ label: "Role", content: "A [e.g., Software Engineer, Marketing Manager] position." }, { label: "Question Type", content: "Generate a mix of behavioral, technical, and situational questions." }, { label: "Task", content: "Provide 5 interview questions for this role." }] },
            { name: "Job Offer Letter", blocks: [{ label: "Candidate Name", content: "[Name]." }, { label: "Job Title", content: "[Title]." }, { label: "Key Terms", content: "Include sections for salary, start date, and reporting manager." }, { label: "Task", content: "Draft a formal job offer letter template." }] },
            { name: "Employee Onboarding Plan", blocks: [{ label: "Role", content: "A new [Job Title]." }, { label: "Task", content: "Create a 30-day onboarding plan outline, including key meetings, training, and goals for the first month." }] },
            { name: "Company Policy", blocks: [{ label: "Topic", content: "A company policy on [e.g., remote work, use of social media]." }, { label: "Task", content: "Outline the key sections for this policy document." }] },
            { name: "Performance Improvement Plan (PIP)", blocks: [{ label: "Area of Concern", content: "An employee is underperforming in [specific area, e.g., meeting deadlines]." }, { label: "Task", content: "Outline a PIP with sections for: Area of Concern, Expected Standard, Action Plan, and Timeline." }] },
            { name: "Exit Interview Questions", blocks: [{ label: "Task", content: "Generate a list of 5 constructive questions to ask a departing employee in an exit interview." }] },
            { name: "Recruitment Email to Candidate", blocks: [{ label: "Role", content: "We are hiring a [Job Title]." }, { label: "Candidate Profile", content: "I found a promising candidate on LinkedIn." }, { label: "Task", content: "Write a short, personalized email to gauge their interest in the role." }] },
            { name: "Internal Announcement", blocks: [{ label: "Announcement", content: "An internal announcement about [e.g., a new hire, a promotion]." }, { label: "Task", content: "Draft a positive and welcoming internal announcement." }] },
            { name: "Diversity & Inclusion Initiative", blocks: [{ label: "Goal", content: "Our goal is to [e.g., improve diversity in our hiring pipeline]." }, { label: "Task", content: "Brainstorm 3 practical initiatives the company could implement." }] },
            { name: "Conflict Resolution", blocks: [{ label: "Situation", content: "Two team members are having a disagreement over [the issue]." }, { label: "Task", content: "Act as an HR manager and outline the steps you would take to mediate and resolve the conflict." }] },
        ]
    },
    {
        name: "Music & Audio Production",
        subCategories: [
            { name: "Song Lyric Ideas", blocks: [{ label: "Theme", content: "The song is about [e.g., heartbreak, wanderlust, social commentary]." }, { label: "Genre", content: "The style is [e.g., pop, folk, rock]." }, { label: "Task", content: "Generate ideas for a chorus and a first verse." }] },
            { name: "Chord Progression", blocks: [{ label: "Key", content: "The key of [e.g., C Major, A minor]." }, { label: "Mood", content: "The mood should be [e.g., upbeat and happy, melancholic and thoughtful]." }, { label: "Task", content: "Suggest a common 4-chord progression for a verse and a different one for a chorus." }] },
            { name: "Music Production Tutorial", blocks: [{ label: "Topic", content: "A tutorial on [e.g., 'how to sidechain a bass', 'mixing vocals']." }, { label: "DAW", content: "The instructions should be for [e.g., Ableton Live, FL Studio]." }, { label: "Task", content: "Provide a step-by-step guide." }] },
            { name: "Album Review Outline", blocks: [{ label: "Artist/Album", content: "A review of '[Album Name]' by [Artist]." }, { label: "Task", content: "Create an outline for a review, including sections for: Overall Impression, Standout Tracks, Production, and Final Verdict." }] },
            { name: "Podcast Episode Idea", blocks: [{ label: "Podcast Theme", content: "A podcast about [e.g., music history, songwriting]." }, { label: "Task", content: "Brainstorm 5 engaging episode ideas." }] },
            { name: "Sound Design Prompt", blocks: [{ label: "Scene", content: "The sound design is for a scene in a [e.g., 'sci-fi film set in a spaceship', 'fantasy forest']." }, { label: "Task", content: "Describe the key ambient sounds, spot effects, and musical textures needed to create the atmosphere." }] },
            { name: "Press Kit Bio", blocks: [{ label: "Artist/Band", content: "[Artist/Band Name]." }, { label: "Genre", content: "[Genre]." }, { label: "Key Selling Point", content: "They are known for their [e.g., 'powerful live shows', 'unique blend of genres']." }, { label: "Task", content: "Write a short, engaging bio for an electronic press kit (EPK)." }] },
            { name: "DJ Set Curation", blocks: [{ label: "Event Type", content: "A DJ set for a [e.g., 'sunset beach party', 'high-energy club night']." }, { label: "Genre", content: "[e.g., House, Techno, Hip Hop]." }, { label: "Task", content: "Suggest an opening track, a peak-time track, and a closing track for the set." }] },
            { name: "Sample Pack Idea", blocks: [{ label: "Genre", content: "[e.g., Lo-fi Hip Hop, Future Bass]." }, { label: "Task", content: "Brainstorm the contents of a sample pack, including types of drum loops, melodic loops, and one-shots." }] },
            { name: "Music Theory Explained", blocks: [{ label: "Concept", content: "Explain [e.g., 'the circle of fifths', 'time signatures']." }, { label: "Audience", content: "For a beginner musician." }] },
        ]
    },
    {
        name: "Gaming Content",
        subCategories: [
            { name: "Game Review Script", blocks: [{ label: "Game", content: "[Game Name]." }, { label: "Task", content: "Write a script outline for a 10-minute YouTube review, covering: Introduction, Gameplay, Graphics & Sound, Story, and Final Score." }] },
            { name: "Let's Play Video Idea", blocks: [{ label: "Game", content: "[Game Name]." }, { label: "Angle", content: "I want to do a 'Let's Play' series with a specific challenge or role-playing angle." }, { label: "Task", content: "Brainstorm 3 creative ideas for the series (e.g., 'Can you beat Skyrim with only a fork?')." }] },
            { name: "Twitch Stream Title", blocks: [{ label: "Game", content: "I'm streaming [Game Name]." }, { label: "Activity", content: "I'll be [e.g., 'trying to beat a hard boss', 'playing with viewers']." }, { label: "Task", content: "Generate 5 catchy and clickable titles for my Twitch stream." }] },
            { name: "Game Concept Idea", blocks: [{ label: "Genre", content: "[e.g., RPG, Puzzle Platformer]." }, { label: "Core Mechanic", content: "The unique gameplay mechanic is [describe mechanic]." }, { label: "Setting", content: "The game is set in a [describe the world]." }, { label: "Task", content: "Write a short pitch for this game concept." }] },
            { name: "Character Backstory", blocks: [{ label: "Game", content: "A character for a [genre] game." }, { label: "Role", content: "They are a [e.g., 'wise old mentor', 'chaotic rogue']." }, { label: "Task", content: "Write a short backstory for this character." }] },
            { name: "Gaming Guild Recruitment", blocks: [{ label: "Game", content: "[Game Name]." }, { label: "Guild Name", content: "[Guild Name]." }, { label: "Focus", content: "We focus on [e.g., 'raiding', 'PvP', 'casual social play']." }, { label: "Task", content: "Write a recruitment message to post in a community forum or Discord." }] },
            { name: "Esports Commentary", blocks: [{ label: "Game", content: "[Esports Game, e.g., Valorant, League of Legends]." }, { label: "Situation", content: "It's a tense, late-game moment in a final match." }, { label: "Task", content: "Write a few lines of exciting, play-by-play commentary for this moment." }] },
            { name: "Patch Notes Summary", blocks: [{ label: "Game", content: "[Game Name]." }, { label: "Patch Notes Link/Text", content: "[Link to or paste of long patch notes]." }, { label: "Task", content: "Summarize the most important changes (e.g., major buffs, nerfs, new features) for the average player." }] },
            { name: "Video Game Quest", blocks: [{ label: "Game World", content: "A fantasy RPG world." }, { label: "Quest Giver", content: "An old librarian." }, { label: "Task", content: "Design a quest where the player has to find a lost, magical book. Outline the steps of the quest." }] },
            { name: "Gaming Top 10 List", blocks: [{ label: "Topic", content: "A 'Top 10' video about [e.g., 'Hardest Boss Fights of All Time', 'Most Emotional Moments in Gaming']." }, { label: "Task", content: "Brainstorm a list of 10 potential entries for this video." }] },
        ]
    }
];