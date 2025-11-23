
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generatePromptStream } from '../services/geminiService';

// --- Types & Interfaces ---

type PipelineStage = 
    | 'idle' 
    | 'input_guard' 
    | 'tokenization' 
    | 'embedding_lookup'
    | 'positional_encoding'
    | 'self_attention' // The "Context Understanding" phase
    | 'feed_forward' 
    | 'logits_calc'
    | 'sampling_decoding'
    | 'detokenization'
    | 'finished';

interface TokenData {
    id: number;
    text: string;
    tokenId: number;
    color: string;
    vector: number[];
}

interface SimulationState {
    input: string;
    tokens: TokenData[];
    attentionMatrix: number[][]; // 2D array for heatmap
    logits: { token: string; score: number; prob: number }[];
    currentOutput: string;
    stepLog: string[];
}

interface StepInfo {
    title: string;
    description: string;
    math: string;
    analogy: string;
}

// --- Icons ---
const Icons = {
    Play: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>,
    Pause: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
    Next: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>,
    Reset: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    Check: () => <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
    Brain: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    Lock: () => <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
};

// --- Constants ---

const COLORS = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
    'bg-lime-500', 'bg-green-500', 'bg-teal-500', 'bg-cyan-500', 
    'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'
];

const STAGE_DETAILS: Record<PipelineStage, StepInfo> = {
    idle: {
        title: "Ready to Start",
        description: "The Large Language Model (LLM) is in standby mode, waiting for your prompt.",
        math: "State = Idle",
        analogy: "A library waiting for a reader to ask a question."
    },
    input_guard: {
        title: "1. Input Guardrails",
        description: "Scanning for safety violations, PII, and prompt injections before processing.",
        math: "Score = Classifier(Input); if(Score < Threshold) Allow()",
        analogy: "A security guard checking bags before entering the venue."
    },
    tokenization: {
        title: "2. Tokenization",
        description: "The engine doesn't read words. It breaks text into 'Tokens' (sub-words) and assigns each a unique numeric ID.",
        math: "T = Tokenizer(Text) -> [1042, 9921, 311]",
        analogy: "Converting a sentence into a series of barcodes."
    },
    embedding_lookup: {
        title: "3. Embedding Lookup",
        description: "Each Token ID is swapped for a long list of numbers (a vector) from a massive lookup table. This represents the 'meaning'.",
        math: "E[t] = Matrix[TokenID_t]",
        analogy: "Looking up the definition of a word in a dictionary, but the definition is coordinates on a map."
    },
    positional_encoding: {
        title: "4. Positional Encoding",
        description: "The model adds information about the order of words. Without this, 'Dog bites Man' and 'Man bites Dog' would look the same.",
        math: "PE(pos, 2i) = sin(pos/10000^(2i/d))",
        analogy: "Numbering the pages of a book so you know which comes first."
    },
    self_attention: {
        title: "5. Self-Attention (Context)",
        description: "The CORE step. Every token looks at every other token to figure out context. 'Bank' looks at 'River' to know it's not a financial bank.",
        math: "Attention(Q,K,V) = softmax(QK^T / √d)V",
        analogy: "A group of people discussing a topic, deciding who to listen to based on relevance."
    },
    feed_forward: {
        title: "6. Feed Forward Network",
        description: "The gathered information is processed through dense neural layers to extract complex patterns and reasoning.",
        math: "FFN(x) = max(0, xW1 + b1)W2 + b2",
        analogy: "Digesting the information to form a conclusion."
    },
    logits_calc: {
        title: "7. Logits Calculation",
        description: "The model outputs a raw score (logit) for every single word in its dictionary (vocabulary) as a candidate for the NEXT word.",
        math: "Logits = Model(HiddenState)",
        analogy: "Brainstorming a list of possible next words and scoring them."
    },
    sampling_decoding: {
        title: "8. Sampling & Decoding",
        description: "Raw scores are converted to probabilities (Softmax). The model picks one based on Temperature (Creativity) and Top-K settings.",
        math: "P = Softmax(Logits/Temp); Next = Sample(P)",
        analogy: "Rolling a weighted dice to pick the next word."
    },
    detokenization: {
        title: "9. Detokenization",
        description: "The selected Token ID is converted back into human-readable text.",
        math: "Word = Vocabulary[SelectedID]",
        analogy: "Translating the barcode back into a word."
    },
    finished: {
        title: "Process Complete",
        description: "The response generation loop is finished.",
        math: "Output = Concat(Tokens)",
        analogy: "The final essay is written."
    }
};

// --- Helper Functions ---
const getRandomVector = (dim: number) => Array.from({ length: dim }, () => parseFloat((Math.random() * 2 - 1).toFixed(2)));

export const AIGalaxyView: React.FC = () => {
    // --- State ---
    const [promptText, setPromptText] = useState("Explain how AI learns.");
    const [isAutoMode, setIsAutoMode] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [stage, setStage] = useState<PipelineStage>('idle');
    const [simState, setSimState] = useState<SimulationState>({
        input: "",
        tokens: [],
        attentionMatrix: [],
        logits: [],
        currentOutput: "",
        stepLog: []
    });

    const isAutoRef = useRef(isAutoMode);
    const isPlayingRef = useRef(isPlaying);
    const resolveNextStep = useRef<(() => void) | null>(null);
    const abortController = useRef<AbortController | null>(null);

    // Sync refs for use in async loop
    useEffect(() => { isAutoRef.current = isAutoMode; }, [isAutoMode]);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

    // --- The Wait Logic (Fixes the Stuck Bug) ---
    const wait = async (ms: number) => {
        if (abortController.current?.signal.aborted) throw new Error("Aborted");

        // Loop to check pause state or manual mode
        while (true) {
            if (abortController.current?.signal.aborted) throw new Error("Aborted");

            if (isAutoRef.current) {
                // Auto Mode: Just sleep if playing, else spin wait
                if (isPlayingRef.current) {
                    await new Promise(r => setTimeout(r, ms));
                    return; // Done waiting
                } else {
                    await new Promise(r => setTimeout(r, 100)); // Check again shortly
                }
            } else {
                // Manual Mode: Wait for User Click
                // If we are already "playing" (clicked next), we proceed. 
                // But usually Manual mode stops after each visual step.
                await new Promise<void>(resolve => {
                    resolveNextStep.current = resolve;
                });
                resolveNextStep.current = null;
                return;
            }
        }
    };

    const addLog = (msg: string) => {
        setSimState(prev => ({ ...prev, stepLog: [...prev.stepLog, `[${new Date().toLocaleTimeString().split(' ')[0]}] ${msg}`].slice(-5) }));
    };

    // --- Main Simulation Loop ---
    const runSimulation = async () => {
        if (abortController.current) abortController.current.abort();
        abortController.current = new AbortController();
        
        setIsPlaying(true);
        setSimState({ input: promptText, tokens: [], attentionMatrix: [], logits: [], currentOutput: "", stepLog: [] });
        
        try {
            // 1. Input Guard
            setStage('input_guard');
            addLog("Scanning input for safety...");
            await wait(1500);

            // 2. Tokenization
            setStage('tokenization');
            addLog("Breaking text into tokens...");
            // Simulate sub-word tokenization
            const rawWords = promptText.split(" ");
            const tokens: TokenData[] = [];
            let idCounter = 0;
            
            for (const word of rawWords) {
                // Simple heuristic to split long words for visual effect
                if (word.length > 5) {
                    tokens.push({ id: idCounter++, text: word.slice(0, 3), tokenId: Math.floor(Math.random()*10000), color: COLORS[idCounter % COLORS.length], vector: getRandomVector(4) });
                    tokens.push({ id: idCounter++, text: word.slice(3), tokenId: Math.floor(Math.random()*10000), color: COLORS[idCounter % COLORS.length], vector: getRandomVector(4) });
                } else {
                    tokens.push({ id: idCounter++, text: word, tokenId: Math.floor(Math.random()*10000), color: COLORS[idCounter % COLORS.length], vector: getRandomVector(4) });
                }
            }
            
            for (const t of tokens) {
                setSimState(prev => ({ ...prev, tokens: [...prev.tokens, t] }));
                await wait(isAutoRef.current ? 300 : 0);
            }
            await wait(1000);

            // 3. Embedding
            setStage('embedding_lookup');
            addLog("Retrieving vectors from latent space...");
            await wait(2000);

            // 4. Positional Encoding
            setStage('positional_encoding');
            addLog("Injecting sinusoidal position data...");
            await wait(2000);

            // 5. Attention
            setStage('self_attention');
            addLog("Calculating Q, K, V attention scores...");
            // Generate a fake attention matrix
            const size = tokens.length;
            const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => Math.random()));
            setSimState(prev => ({ ...prev, attentionMatrix: matrix }));
            await wait(2500);

            // 6. Feed Forward
            setStage('feed_forward');
            addLog("Passing through dense layers...");
            await wait(1500);

            // 7. Logits (Streaming Start)
            // We call Gemini here to get the real text, then simulate the internal steps for each chunk
            setStage('logits_calc');
            addLog("Calculating candidate scores...");
            
            const stream = await generatePromptStream(promptText, 0.7, 0.9, "You are a helpful AI assistant. Be concise.");
            
            for await (const chunk of stream) {
                if (abortController.current?.signal.aborted) break;

                // For every chunk, we briefly show the generation lifecycle
                
                // A. Logits
                setStage('logits_calc');
                // Fake top candidates
                const candidates = [
                    { token: chunk.trim() || " ", score: 12.5, prob: 0.85 },
                    { token: "the", score: 8.2, prob: 0.05 },
                    { token: "is", score: 7.1, prob: 0.03 },
                    { token: "...", score: 5.4, prob: 0.02 }
                ];
                setSimState(prev => ({ ...prev, logits: candidates }));
                await wait(isAutoRef.current ? 200 : 0);

                // B. Sampling
                setStage('sampling_decoding');
                await wait(isAutoRef.current ? 200 : 0);

                // C. Detokenization
                setStage('detokenization');
                await wait(isAutoRef.current ? 100 : 0);

                // Update Output
                setSimState(prev => ({ ...prev, currentOutput: prev.currentOutput + chunk }));
            }

            setStage('finished');
            addLog("Generation complete.");
            setIsPlaying(false);

        } catch (e) {
            if ((e as Error).message !== "Aborted") {
                console.error("Simulation error", e);
            }
        }
    };

    const handleNext = () => {
        if (resolveNextStep.current) {
            resolveNextStep.current();
        } else if (stage === 'idle' || stage === 'finished') {
            runSimulation();
        }
    };

    const handleReset = () => {
        if (abortController.current) abortController.current.abort();
        setStage('idle');
        setIsPlaying(false);
        setSimState({ input: "", tokens: [], attentionMatrix: [], logits: [], currentOutput: "", stepLog: [] });
    };

    // --- Visualization Renderers ---

    const renderMatrix = () => {
        const size = simState.tokens.length;
        if (size === 0) return null;
        
        return (
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                {simState.attentionMatrix.flat().map((val, i) => (
                    <div 
                        key={i} 
                        className="aspect-square rounded-sm transition-all duration-500 hover:scale-150 z-0 hover:z-10"
                        style={{ backgroundColor: `rgba(99, 102, 241, ${val})` }}
                        title={`Attention Score: ${val.toFixed(2)}`}
                    ></div>
                ))}
            </div>
        );
    };

    const renderVisualizer = () => {
        switch (stage) {
            case 'idle':
                return (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 animate-pulse">
                        <Icons.Brain />
                        <p className="mt-4 font-mono uppercase tracking-widest">Awaiting Prompt...</p>
                    </div>
                );
            case 'input_guard':
                return (
                    <div className="h-full flex flex-col items-center justify-center relative">
                        <Icons.Lock />
                        <div className="mt-6 w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 animate-[scan_1.5s_ease-in-out_infinite] w-1/3"></div>
                        </div>
                        <p className="mt-4 font-mono text-green-400">Policy Check: PASSED</p>
                    </div>
                );
            case 'tokenization':
                return (
                    <div className="h-full p-8 flex flex-col items-center justify-center overflow-y-auto">
                        <div className="flex flex-wrap gap-3 justify-center">
                            {simState.tokens.map((t) => (
                                <div key={t.id} className="flex flex-col items-center animate-[popIn_0.3s_ease-out]">
                                    <div className={`px-4 py-2 rounded-lg text-white font-bold text-lg shadow-lg ${t.color} border border-white/20`}>
                                        {t.text}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-mono mt-1 bg-gray-900 px-1 rounded">ID: {t.tokenId}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'embedding_lookup':
                return (
                    <div className="h-full p-8 flex flex-col items-center justify-center overflow-y-auto">
                        <div className="w-full max-w-3xl space-y-2">
                            {simState.tokens.map((t) => (
                                <div key={t.id} className="flex items-center gap-4 animate-fade-in">
                                    <span className="font-mono text-gray-400 w-16 text-right">{t.tokenId}</span>
                                    <div className="h-0.5 w-8 bg-gray-700"></div>
                                    <div className="flex-1 bg-gray-900 p-2 rounded font-mono text-[10px] text-green-400 overflow-hidden whitespace-nowrap border border-green-500/30">
                                        [{t.vector.join(', ')}, ...]
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'positional_encoding':
                return (
                    <div className="h-full p-8 flex flex-col items-center justify-center">
                         <div className="relative w-full max-w-2xl h-64 border-b border-l border-gray-700">
                             {/* Mock Wave visualization */}
                             <svg className="w-full h-full overflow-visible">
                                 <path d="M0,100 Q100,0 200,100 T400,100" fill="none" stroke="cyan" strokeWidth="2" className="animate-[pulse_3s_infinite]" />
                                 <path d="M0,100 Q50,50 100,100 T200,100" fill="none" stroke="magenta" strokeWidth="2" className="animate-[pulse_2s_infinite]" opacity="0.6" />
                             </svg>
                             <div className="absolute inset-0 flex items-end justify-around pb-2">
                                 {simState.tokens.map((t, i) => (
                                     <div key={i} className="flex flex-col items-center">
                                         <div className="h-32 w-0.5 bg-gray-800 border-l border-dashed border-gray-600"></div>
                                         <span className="text-xs mt-2 text-gray-400">Pos {i}</span>
                                     </div>
                                 ))}
                             </div>
                         </div>
                         <p className="mt-4 text-sm text-gray-400">Adding sine/cosine waves to vectors to indicate order.</p>
                    </div>
                );
            case 'self_attention':
                return (
                    <div className="h-full p-4 flex flex-col items-center justify-center">
                        <div className="flex gap-8 items-start">
                            {/* Input Tokens */}
                            <div className="flex flex-col gap-1">
                                {simState.tokens.map(t => (
                                    <div key={t.id} className="text-xs px-2 py-1 text-gray-400 font-mono">{t.text}</div>
                                ))}
                            </div>
                            {/* Matrix */}
                            <div className="w-64 h-64 bg-gray-900 border border-gray-700 p-1">
                                {renderMatrix()}
                            </div>
                            {/* Contextualized Output */}
                            <div className="flex flex-col gap-1">
                                {simState.tokens.map(t => (
                                    <div key={t.id} className={`text-xs px-2 py-1 rounded ${t.color} text-white font-bold shadow-lg`}>{t.text}</div>
                                ))}
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-gray-500">Darker squares = Stronger relationship</p>
                    </div>
                );
            case 'logits_calc':
            case 'sampling_decoding':
                return (
                    <div className="h-full flex items-center justify-center p-8">
                        <div className="w-full max-w-2xl bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-2xl">
                            <h3 className="text-sm font-bold text-gray-400 mb-4 border-b border-gray-700 pb-2">Next Token Probabilities</h3>
                            <div className="space-y-3">
                                {simState.logits.map((item, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="flex justify-between text-sm mb-1 z-10 relative">
                                            <span className="font-mono text-white">"{item.token}"</span>
                                            <span className="text-indigo-400 font-bold">{(item.prob * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="h-6 w-full bg-gray-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${idx === 0 ? 'bg-indigo-500' : 'bg-gray-700'}`} 
                                                style={{ width: `${item.prob * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {stage === 'sampling_decoding' && (
                                <div className="mt-6 text-center animate-bounce">
                                    <span className="inline-block bg-green-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                                        Selected: "{simState.logits[0]?.token}"
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'detokenization':
            case 'finished':
                return (
                    <div className="h-full flex flex-col p-6">
                        <div className="flex-1 bg-black rounded-lg p-6 font-mono text-lg leading-relaxed overflow-y-auto border border-gray-800 shadow-inner">
                            <span className="text-gray-500 select-none">{promptText} </span>
                            <span className="text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]">{simState.currentOutput}</span>
                            {stage !== 'finished' && <span className="inline-block w-2 h-5 bg-green-500 ml-1 animate-pulse"></span>}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const PipelineStep: React.FC<{ s: PipelineStage; idx: number }> = ({ s, idx }) => {
        const isActive = stage === s;
        const stageIndex = Object.keys(STAGE_DETAILS).indexOf(stage);
        const thisIndex = Object.keys(STAGE_DETAILS).indexOf(s);
        const isPast = stageIndex > thisIndex;

        if (s === 'idle' || s === 'finished') return null;

        return (
            <div className="flex flex-col items-center min-w-[60px] relative group cursor-help">
                <div className={`w-3 h-3 rounded-full mb-2 transition-all duration-300
                    ${isActive ? 'bg-indigo-500 scale-150 ring-4 ring-indigo-500/30' : isPast ? 'bg-green-500' : 'bg-gray-700'}
                `}></div>
                <div className={`text-[9px] font-bold uppercase tracking-tighter text-center transition-colors
                    ${isActive ? 'text-indigo-300' : 'text-gray-600'}
                `}>
                    {s.split('_')[0]}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-32 bg-black border border-gray-700 p-2 rounded text-[10px] text-gray-300 z-30">
                    {STAGE_DETAILS[s].title}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col">
            
            {/* --- HEADER --- */}
            <div className="h-16 border-b border-gray-800 bg-gray-900/40 backdrop-blur-md flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-600 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                        <Icons.Brain />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white">AI Galaxy <span className="text-indigo-500">Deep Dive</span></h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Live Inference Trace</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Prompt Input */}
                    <div className="relative group">
                        <input 
                            type="text" 
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                            disabled={stage !== 'idle' && stage !== 'finished'}
                            className="bg-black/50 border border-gray-700 rounded-full py-1.5 px-4 w-64 text-sm focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                        />
                         {stage === 'idle' || stage === 'finished' ? (
                            <button onClick={() => runSimulation()} className="absolute right-1 top-1 bottom-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 rounded-full text-xs font-bold transition-all">
                                Run
                            </button>
                        ) : (
                            <button onClick={handleReset} className="absolute right-1 top-1 bottom-1 bg-red-900/80 text-white px-2 rounded-full flex items-center justify-center hover:bg-red-700 transition-all">
                                <Icons.Reset />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT GRID --- */}
            <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
                
                {/* LEFT: MAIN STAGE (8 Cols) */}
                <div className="col-span-12 lg:col-span-9 flex flex-col border-r border-gray-800 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900/50 via-gray-950 to-black">
                    
                    {/* Progress Track */}
                    <div className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-black/20">
                        {(Object.keys(STAGE_DETAILS) as PipelineStage[]).map((s, i) => (
                            <PipelineStep key={s} s={s} idx={i} />
                        ))}
                    </div>

                    {/* Visualizer Viewport */}
                    <div className="flex-1 relative overflow-hidden">
                         {/* Grid Background */}
                         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                         
                         {renderVisualizer()}

                         {/* Playback Controls Overlay */}
                         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-xl border border-gray-700 p-2 rounded-2xl flex items-center gap-4 shadow-2xl z-30">
                            <div className="flex bg-black/50 rounded-lg p-1">
                                <button 
                                    onClick={() => setIsAutoMode(true)} 
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${isAutoMode ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Auto
                                </button>
                                <button 
                                    onClick={() => setIsAutoMode(false)} 
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${!isAutoMode ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Manual
                                </button>
                            </div>

                            {(!isAutoMode || !isPlaying) && stage !== 'idle' && stage !== 'finished' && (
                                <button 
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse"
                                >
                                    Next Step <Icons.Next />
                                </button>
                            )}

                             {isAutoMode && stage !== 'idle' && stage !== 'finished' && (
                                <button 
                                    onClick={() => { setIsPlaying(!isPlaying); if(!isPlaying) handleNext(); }}
                                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                                >
                                    {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                                </button>
                            )}
                         </div>
                    </div>
                </div>

                {/* RIGHT: INFO PANEL (4 Cols) */}
                <div className="col-span-12 lg:col-span-3 bg-gray-950 flex flex-col h-full overflow-hidden">
                    
                    {/* Step Details */}
                    <div className="p-6 border-b border-gray-800 flex-shrink-0">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest border border-indigo-500/30 px-2 py-0.5 rounded">Current Phase</span>
                        <h2 className="text-2xl font-bold text-white mt-3 mb-2">{STAGE_DETAILS[stage].title}</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">{STAGE_DETAILS[stage].description}</p>
                    </div>

                    {/* Educational Modules */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        
                        {/* Math Box */}
                        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 relative group">
                            <div className="absolute top-0 right-0 p-2 opacity-50">
                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            </div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">The Math</h3>
                            <code className="font-mono text-xs text-green-400 block bg-black/30 p-2 rounded border border-green-500/20">
                                {STAGE_DETAILS[stage].math}
                            </code>
                        </div>

                        {/* Analogy Box */}
                        <div className="bg-amber-900/10 border border-amber-500/20 rounded-lg p-4">
                            <h3 className="text-xs font-bold text-amber-500 uppercase mb-2">Simple Analogy</h3>
                            <p className="text-sm text-amber-200/80 italic">"{STAGE_DETAILS[stage].analogy}"</p>
                        </div>

                        {/* Logs */}
                        <div className="bg-black border border-gray-800 rounded-lg p-3">
                            <h3 className="text-[10px] font-bold text-gray-600 uppercase mb-2">System Log</h3>
                            <div className="font-mono text-[10px] space-y-1 text-gray-400">
                                {simState.stepLog.length === 0 && <span className="opacity-30">Waiting for start...</span>}
                                {simState.stepLog.map((log, i) => (
                                    <div key={i} className="border-l-2 border-indigo-500 pl-2 opacity-80">{log}</div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
            
            <style>{`
                @keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
                @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
};
