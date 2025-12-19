
import React, { useState, useEffect, useRef } from 'react';
import { generatePromptStream } from '../services/geminiService';

// --- Types & Interfaces ---

type PipelineStage = 
    | 'idle' 
    | 'input_guard' 
    | 'tokenization' 
    | 'embedding_lookup'
    | 'positional_encoding'
    | 'self_attention' 
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
    attentionMatrix: number[][];
    logits: { token: string; score: number; prob: number }[];
    currentOutput: string;
    stepLog: string[];
}

interface StepInfo {
    title: string;
    subtitle: string;
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
    Brain: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    Lock: () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Cpu: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
};

// --- Constants ---
const COLORS = [
    'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 
    'bg-emerald-500', 'bg-cyan-500', 'bg-blue-500', 
    'bg-violet-500', 'bg-fuchsia-500'
];

const STAGE_DETAILS: Record<PipelineStage, StepInfo> = {
    idle: {
        title: "System Standby",
        subtitle: "Ready for Prompt",
        description: "The neural network is idle, waiting for input to initiate the inference pipeline.",
        math: "State = Wait(Input)",
        analogy: "An engine idling at a red light, ready to accelerate."
    },
    input_guard: {
        title: "Input Guardrails",
        subtitle: "Security & Safety Scan",
        description: "Filters incoming text for malicious intent, bias, and PII before it reaches the model core.",
        math: "Score = σ(W_safety · x + b)",
        analogy: "A metal detector scanning passengers before they enter the terminal."
    },
    tokenization: {
        title: "Tokenization",
        subtitle: "Text → Numbers",
        description: "Raw text is sliced into smaller units called tokens (words/sub-words) and mapped to integers.",
        math: "T = Tokenizer(Str) → [101, 392, ...]",
        analogy: "Crushing a sentence into a pile of Lego bricks (IDs) to build meaning."
    },
    embedding_lookup: {
        title: "Embedding Lookup",
        subtitle: "Numbers → Meaning Vectors",
        description: "Integer IDs are swapped for dense vectors—lists of coordinates representing semantic meaning.",
        math: "E = W_emb[T_indices]",
        analogy: "Replacing the word 'King' with a GPS coordinate in the 'Concept World'."
    },
    positional_encoding: {
        title: "Positional Encoding",
        subtitle: "Adding Sequence Order",
        description: "Injects information about word order, so the model knows 'Dog bites Man' ≠ 'Man bites Dog'.",
        math: "PE(pos, 2i) = sin(pos/10k^(2i/d))",
        analogy: "Stamping page numbers on loose leaves of a book so you can read them in order."
    },
    self_attention: {
        title: "Self-Attention",
        subtitle: "Contextual Understanding",
        description: "Tokens 'look' at each other to resolve ambiguity. 'Bank' looks at 'River' to define its meaning.",
        math: "Attn(Q,K,V) = softmax(QK^T / √d)V",
        analogy: "A networking party where everyone decides who to listen to based on shared interests."
    },
    feed_forward: {
        title: "Feed Forward Network",
        subtitle: "Reasoning & Processing",
        description: "Data passes through dense layers of neurons to synthesize information and extract higher-level features.",
        math: "FFN(x) = ReLU(xW_1 + b_1)W_2 + b_2",
        analogy: "The brain digesting information to form a complex thought."
    },
    logits_calc: {
        title: "Logits Calculation",
        subtitle: "Predicting Next Token",
        description: "The model assigns a raw score (logit) to every word in its vocabulary as a candidate for the next token.",
        math: "z = LayerNorm(x + Sublayer(x))",
        analogy: "Brainstorming a list of possible next words and ranking them by likelihood."
    },
    sampling_decoding: {
        title: "Sampling & Decoding",
        subtitle: "Choosing the Winner",
        description: "Scores are converted to probabilities. The model picks one based on Temperature (Creativity).",
        math: "p_i = exp(z_i/T) / Σ exp(z_j/T)",
        analogy: "Rolling a weighted die to select the next word from the brainstormed list."
    },
    detokenization: {
        title: "Detokenization",
        subtitle: "Numbers → Text",
        description: "The selected token ID is converted back into human-readable text and appended to the output.",
        math: "Str = Vocab[ID]",
        analogy: "Translating the chosen Lego brick back into a written word."
    },
    finished: {
        title: "Inference Complete",
        subtitle: "Response Generated",
        description: "The cycle repeats until the model generates a 'Stop' token or reaches the limit.",
        math: "Output = Concat(tokens)",
        analogy: "The final masterpiece is unveiled."
    }
};

const getRandomVector = (dim: number) => Array.from({ length: dim }, () => parseFloat(Math.random().toFixed(2)));

// --- Components ---

const NeuralNetworkVisual: React.FC = () => (
    <div className="flex justify-center items-center gap-12 h-64 w-full opacity-80">
        {[4, 6, 6, 4].map((count, layerIdx) => (
            <div key={layerIdx} className="flex flex-col gap-4 relative">
                {Array.from({ length: count }).map((_, nodeIdx) => (
                    <div key={nodeIdx} className="w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1] relative z-10 animate-pulse">
                        {/* Connections to next layer */}
                        {layerIdx < 3 && Array.from({ length: [4, 6, 6, 4][layerIdx + 1] }).map((__, nextNodeIdx) => (
                            <div 
                                key={nextNodeIdx}
                                className="absolute top-2 left-2 h-[1px] bg-indigo-500/30 origin-top-left animate-[flow_1s_infinite]"
                                style={{ 
                                    width: '4rem', 
                                    transform: `rotate(${((nextNodeIdx - nodeIdx) * 15)}deg) scaleX(1.2)` // Simplified visual approximation
                                }} 
                            />
                        ))}
                    </div>
                ))}
            </div>
        ))}
    </div>
);

const MatrixRain: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
            <div 
                key={i} 
                className="absolute text-[10px] font-mono text-green-500 animate-[fall_3s_linear_infinite]"
                style={{ 
                    left: `${i * 5}%`, 
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 3}s`
                }}
            >
                {Array.from({ length: 10 }).map((__, j) => (
                    <div key={j}>{Math.random() > 0.5 ? '1' : '0'}</div>
                ))}
            </div>
        ))}
    </div>
);

export const AIGalaxyView: React.FC = () => {
    // --- State ---
    const [promptText, setPromptText] = useState("Why is the sky blue?");
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

    // Refs for simulation loop control
    const isAutoRef = useRef(isAutoMode);
    const isPlayingRef = useRef(isPlaying);
    const resolveNextStep = useRef<(() => void) | null>(null);
    const abortController = useRef<AbortController | null>(null);

    // Sync state to refs
    useEffect(() => { isAutoRef.current = isAutoMode; }, [isAutoMode]);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

    // --- Helpers ---
    const addLog = (msg: string) => {
        setSimState(prev => ({ ...prev, stepLog: [...prev.stepLog, `> ${msg}`].slice(-8) }));
    };

    const wait = async (ms: number) => {
        if (abortController.current?.signal.aborted) throw new Error("Aborted");
        while (true) {
            if (abortController.current?.signal.aborted) throw new Error("Aborted");
            if (isAutoRef.current) {
                if (isPlayingRef.current) {
                    await new Promise(r => setTimeout(r, ms));
                    return;
                } else {
                    await new Promise(r => setTimeout(r, 100));
                }
            } else {
                await new Promise<void>(resolve => { resolveNextStep.current = resolve; });
                resolveNextStep.current = null;
                return;
            }
        }
    };

    // --- Simulation Core ---
    const runSimulation = async () => {
        if (abortController.current) abortController.current.abort();
        abortController.current = new AbortController();
        
        setIsPlaying(true);
        setSimState({ input: promptText, tokens: [], attentionMatrix: [], logits: [], currentOutput: "", stepLog: [] });
        
        try {
            // 1. Input Guard
            setStage('input_guard');
            addLog("Initializing Safety Protocols...");
            addLog("Scanning for PII and Toxicity...");
            await wait(2000);

            // 2. Tokenization
            setStage('tokenization');
            addLog("Splitting input string into sub-word units...");
            const rawWords = promptText.split(" ");
            const tokens: TokenData[] = [];
            let idCounter = 0;
            for (const word of rawWords) {
                // Visual split for effect
                if (word.length > 5) {
                    tokens.push({ id: idCounter++, text: word.slice(0, 3), tokenId: Math.floor(Math.random()*20000), color: COLORS[idCounter % COLORS.length], vector: getRandomVector(4) });
                    tokens.push({ id: idCounter++, text: word.slice(3), tokenId: Math.floor(Math.random()*20000), color: COLORS[idCounter % COLORS.length], vector: getRandomVector(4) });
                } else {
                    tokens.push({ id: idCounter++, text: word, tokenId: Math.floor(Math.random()*20000), color: COLORS[idCounter % COLORS.length], vector: getRandomVector(4) });
                }
            }
            for (const t of tokens) {
                setSimState(prev => ({ ...prev, tokens: [...prev.tokens, t] }));
                await wait(isAutoRef.current ? 400 : 0);
            }
            addLog(`Generated ${tokens.length} tokens.`);
            await wait(1000);

            // 3. Embedding
            setStage('embedding_lookup');
            addLog("Mapping Token IDs to High-Dimensional Vectors...");
            await wait(2500);

            // 4. Positional Encoding
            setStage('positional_encoding');
            addLog("Applying Sinusoidal Positional Embeddings...");
            await wait(2000);

            // 5. Attention
            setStage('self_attention');
            addLog("Computing Self-Attention Matrix (Q · K^T)...");
            const size = tokens.length;
            const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => Math.random()));
            setSimState(prev => ({ ...prev, attentionMatrix: matrix }));
            await wait(3000);

            // 6. Feed Forward
            setStage('feed_forward');
            addLog("Passing Context Vectors through FFN...");
            addLog("Activating ReLU non-linearities...");
            await wait(2500);

            // Streaming Loop
            const stream = await generatePromptStream(promptText, 0.7, 0.9, "You are a helpful AI assistant. Be concise.");
            
            for await (const chunk of stream) {
                if (abortController.current?.signal.aborted) break;

                // 7. Logits
                setStage('logits_calc');
                addLog("Projecting to Vocabulary Space...");
                const candidates = [
                    { token: chunk.trim() || " ", score: 12.5, prob: 0.85 },
                    { token: "the", score: 8.2, prob: 0.05 },
                    { token: "is", score: 7.1, prob: 0.03 },
                    { token: "of", score: 5.4, prob: 0.02 }
                ];
                setSimState(prev => ({ ...prev, logits: candidates }));
                await wait(isAutoRef.current ? 500 : 0);

                // 8. Sampling
                setStage('sampling_decoding');
                addLog(`Sampling with Temp=0.7... Selected: "${chunk}"`);
                await wait(isAutoRef.current ? 500 : 0);

                // 9. Detokenization
                setStage('detokenization');
                await wait(isAutoRef.current ? 300 : 0);

                setSimState(prev => ({ ...prev, currentOutput: prev.currentOutput + chunk }));
            }

            setStage('finished');
            addLog("End of Sequence Token [EOS] generated.");
            setIsPlaying(false);

        } catch (e) {
            if ((e as Error).message !== "Aborted") console.error(e);
        }
    };

    const handleNext = () => {
        if (resolveNextStep.current) resolveNextStep.current();
        else if (stage === 'idle' || stage === 'finished') runSimulation();
    };

    const handleReset = () => {
        if (abortController.current) abortController.current.abort();
        setStage('idle');
        setIsPlaying(false);
        setSimState({ input: "", tokens: [], attentionMatrix: [], logits: [], currentOutput: "", stepLog: [] });
    };

    // --- Visualizers ---

    const renderVisualizer = () => {
        switch (stage) {
            case 'idle':
                return (
                    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
                            <div className="relative p-8 border-2 border-dashed border-gray-700 rounded-full">
                                <Icons.Brain />
                            </div>
                        </div>
                        <h3 className="mt-6 text-xl font-bold text-gray-400 tracking-widest uppercase">System Online</h3>
                        <p className="text-gray-600 text-sm mt-2">Awaiting Prompt Injection...</p>
                    </div>
                );
            case 'input_guard':
                return (
                    <div className="flex flex-col items-center justify-center h-full relative">
                        <div className="w-full max-w-xl p-4 border border-gray-700 bg-gray-900/50 rounded-lg relative overflow-hidden">
                            <p className="font-mono text-gray-300 text-center">{simState.input}</p>
                            <div className="absolute top-0 bottom-0 w-2 bg-green-500/50 blur-md animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                                <span className="text-xs text-green-400 mt-2">PII Safe</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                                <span className="text-xs text-green-400 mt-2">Toxicity Safe</span>
                            </div>
                        </div>
                    </div>
                );
            case 'tokenization':
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8">
                        <div className="flex flex-wrap gap-4 justify-center">
                            {simState.tokens.map((t, idx) => (
                                <div key={idx} className="group relative animate-[popIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
                                    <div className={`px-4 py-3 rounded-lg font-mono font-bold text-white shadow-xl ${t.color} border-t border-white/20 transform group-hover:-translate-y-1 transition-transform`}>
                                        {t.text}
                                    </div>
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        ID:{t.tokenId}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-12 text-gray-500 text-sm animate-pulse">Mapping characters to Vocabulary IDs...</p>
                    </div>
                );
            case 'embedding_lookup':
                return (
                    <div className="relative h-full w-full flex flex-col items-center justify-center p-8 overflow-hidden">
                        <MatrixRain />
                        <div className="z-10 w-full max-w-2xl space-y-3 max-h-full overflow-y-auto pr-2">
                            {simState.tokens.map((t) => (
                                <div key={t.id} className="flex items-center gap-4 p-2 bg-gray-900/80 border border-gray-700 rounded-lg animate-fade-in backdrop-blur-sm">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white ${t.color}`}>{t.tokenId}</div>
                                    <div className="text-gray-500">→</div>
                                    <div className="flex-1 font-mono text-[10px] text-green-400 tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                                        [{t.vector.join(', ')}, -0.42, 0.81, ...]
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'positional_encoding':
                return (
                    <div className="h-full flex flex-col items-center justify-center p-8">
                        <div className="relative w-full max-w-3xl h-64 border-b border-gray-700 flex items-end justify-between px-4">
                            {/* Waves */}
                            <svg className="absolute inset-0 w-full h-full opacity-50" preserveAspectRatio="none">
                                <path d="M0,32 Q100,64 200,32 T400,32 T600,32 T800,32" fill="none" stroke="cyan" strokeWidth="2" className="animate-[wave_3s_linear_infinite]" />
                                <path d="M0,48 Q80,16 160,48 T320,48 T480,48 T640,48" fill="none" stroke="magenta" strokeWidth="2" className="animate-[wave_4s_linear_infinite]" />
                            </svg>
                            {/* Tokens */}
                            {simState.tokens.map((t, i) => (
                                <div key={i} className="flex flex-col items-center z-10">
                                    <div className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>{i}</div>
                                    <div className="h-full w-px bg-gray-700/50 my-2"></div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-8 text-gray-400 text-sm">Injecting sequence order frequencies...</p>
                    </div>
                );
            case 'self_attention':
                return (
                    <div className="h-full flex items-center justify-center p-8">
                        <div className="relative w-[500px] h-[500px]">
                            {simState.tokens.map((t, i) => {
                                const angle = (i / simState.tokens.length) * 2 * Math.PI;
                                const radius = 200;
                                const x = 250 + radius * Math.cos(angle);
                                const y = 250 + radius * Math.sin(angle);
                                return (
                                    <div 
                                        key={t.id} 
                                        className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full ${t.color} flex items-center justify-center text-[10px] font-bold text-white shadow-lg z-20`}
                                        style={{ left: x, top: y }}
                                    >
                                        {t.text}
                                    </div>
                                );
                            })}
                            
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                                {simState.attentionMatrix.map((row, i) => 
                                    row.map((val, j) => {
                                        if (val < 0.3) return null; // Filter weak connections
                                        const angleI = (i / simState.tokens.length) * 2 * Math.PI;
                                        const angleJ = (j / simState.tokens.length) * 2 * Math.PI;
                                        const r = 200;
                                        const x1 = 250 + r * Math.cos(angleI);
                                        const y1 = 250 + r * Math.sin(angleI);
                                        const x2 = 250 + r * Math.cos(angleJ);
                                        const y2 = 250 + r * Math.sin(angleJ);
                                        return (
                                            <line 
                                                key={`${i}-${j}`} 
                                                x1={x1} y1={y1} x2={x2} y2={y2} 
                                                stroke="white" 
                                                strokeWidth={val * 2} 
                                                strokeOpacity={val * 0.5} 
                                                className="animate-pulse"
                                            />
                                        );
                                    })
                                )}
                            </svg>
                        </div>
                    </div>
                );
            case 'feed_forward':
                return (
                    <div className="h-full flex flex-col items-center justify-center">
                        <NeuralNetworkVisual />
                        <div className="mt-8 font-mono text-indigo-400 text-sm animate-pulse">Processing Features...</div>
                    </div>
                );
            case 'logits_calc':
            case 'sampling_decoding':
                return (
                    <div className="h-full flex flex-col items-center justify-center p-8">
                        <div className="w-full max-w-md space-y-3">
                            {simState.logits.map((item, idx) => (
                                <div key={idx} className="relative group">
                                    <div className="flex justify-between text-xs font-mono text-gray-400 mb-1 z-10 relative">
                                        <span className={`${idx === 0 ? 'text-white font-bold' : ''}`}>"{item.token}"</span>
                                        <span>{(item.prob * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-8 w-full bg-gray-800 rounded-r-lg overflow-hidden relative">
                                        <div 
                                            className={`h-full ${idx === 0 ? 'bg-indigo-500 shadow-[0_0_15px_#6366f1]' : 'bg-gray-700 opacity-50'} transition-all duration-500`}
                                            style={{ width: `${item.prob * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {stage === 'sampling_decoding' && (
                            <div className="mt-8 text-center animate-bounce">
                                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Decoded Token</div>
                                <span className="inline-block bg-green-500 text-black px-6 py-2 rounded-lg font-bold shadow-[0_0_20px_#22c55e] text-xl">
                                    {simState.logits[0]?.token}
                                </span>
                            </div>
                        )}
                    </div>
                );
            case 'detokenization':
            case 'finished':
                return (
                    <div className="h-full flex flex-col items-center justify-center p-12">
                        <div className="w-full max-w-3xl bg-black border border-gray-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                             <p className="font-mono text-lg leading-relaxed">
                                <span className="text-gray-500">{promptText} </span>
                                <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{simState.currentOutput}</span>
                                {stage !== 'finished' && <span className="inline-block w-2 h-5 bg-green-500 ml-1 animate-pulse align-middle"></span>}
                             </p>
                        </div>
                        {stage === 'finished' && (
                            <button 
                              onClick={handleReset} 
                              title="Clear current state and reset the inference pipeline"
                              className="mt-8 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-bold transition-all flex items-center gap-2"
                            >
                                <Icons.Reset /> Start New Inference
                            </button>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const PipelineStep: React.FC<{ s: PipelineStage; idx: number }> = ({ s, idx }) => {
        if (s === 'idle' || s === 'finished') return null;
        const isActive = stage === s;
        const isPast = Object.keys(STAGE_DETAILS).indexOf(stage) > Object.keys(STAGE_DETAILS).indexOf(s);
        
        return (
            <div 
              className="flex flex-col items-center gap-2 min-w-[64px]"
              title={`${STAGE_DETAILS[s].title}: ${STAGE_DETAILS[s].subtitle}`}
            >
                <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isActive ? 'bg-indigo-500 scale-150 shadow-[0_0_10px_#6366f1]' : isPast ? 'bg-green-500' : 'bg-gray-800'}`}></div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-400' : 'text-gray-600'}`}>
                    {s.split('_')[0]}
                </div>
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-100px)] bg-[#050505] text-gray-200 font-sans flex flex-col overflow-hidden rounded-xl border border-gray-800 shadow-2xl">
            {/* Header */}
            <div className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600/20 p-2 rounded-lg text-indigo-500"><Icons.Cpu /></div>
                    <h1 className="font-bold text-lg tracking-tight">AI Galaxy <span className="text-indigo-500 font-light">Live Trace</span></h1>
                </div>
                <div className="flex items-center gap-4 bg-black/40 rounded-full p-1 border border-gray-800">
                    <input 
                        className="bg-transparent border-none text-sm px-4 w-64 focus:ring-0 placeholder-gray-600"
                        value={promptText}
                        onChange={e => setPromptText(e.target.value)}
                        placeholder="Enter system prompt..."
                        disabled={isPlaying}
                        title="Enter a query to visualize its neural processing path"
                    />
                    <button 
                        onClick={() => !isPlaying && runSimulation()}
                        disabled={isPlaying}
                        title="Initialize the inference cycle for the given prompt"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all disabled:opacity-50"
                    >
                        {isPlaying ? 'Running...' : 'Initialize'}
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 grid grid-cols-12 overflow-hidden">
                {/* Visualizer (Left) */}
                <div className="col-span-12 lg:col-span-8 relative bg-gradient-to-br from-gray-900 via-[#0a0a0a] to-black flex flex-col">
                    {/* Pipeline Track */}
                    <div className="h-20 border-b border-gray-800 flex items-center justify-between px-8 bg-black/20 overflow-x-auto">
                         {(Object.keys(STAGE_DETAILS) as PipelineStage[]).map((s, i) => <PipelineStep key={s} s={s} idx={i} />)}
                    </div>
                    
                    {/* Viewport */}
                    <div className="flex-1 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
                        {renderVisualizer()}

                        {/* Controls */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-900/90 border border-gray-700 p-2 rounded-xl shadow-xl backdrop-blur-md z-30">
                            <div className="flex bg-black/50 rounded-lg p-1">
                                <button onClick={() => setIsAutoMode(true)} title="Run the simulation automatically" className={`px-3 py-1 text-xs font-bold rounded ${isAutoMode ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>Auto</button>
                                <button onClick={() => setIsAutoMode(false)} title="Control the simulation manually step-by-step" className={`px-3 py-1 text-xs font-bold rounded ${!isAutoMode ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>Manual</button>
                            </div>
                            {(!isAutoMode || !isPlaying) && stage !== 'idle' && stage !== 'finished' && (
                                <button 
                                  onClick={handleNext} 
                                  title="Proceed to the next logical stage of the model's pipeline"
                                  className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold animate-pulse"
                                >
                                    Next Step <Icons.Next />
                                </button>
                            )}
                            {isAutoMode && stage !== 'idle' && stage !== 'finished' && (
                                <button 
                                  onClick={() => { setIsPlaying(!isPlaying); if(!isPlaying) handleNext(); }} 
                                  title={isPlaying ? "Pause the neural trace playback" : "Resume the neural trace playback"}
                                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Educational Panel (Right) */}
                <div className="col-span-12 lg:col-span-4 bg-black border-l border-gray-800 flex flex-col h-full overflow-hidden">
                    <div className="p-8 border-b border-gray-800 bg-gray-900/20">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/30 px-2 py-1 rounded">
                            Phase {Object.keys(STAGE_DETAILS).indexOf(stage)}
                        </span>
                        <h2 className="text-3xl font-bold text-white mt-4 mb-2">{STAGE_DETAILS[stage].title}</h2>
                        <h3 className="text-lg text-gray-400 font-light mb-4">{STAGE_DETAILS[stage].subtitle}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed border-l-2 border-indigo-500 pl-4">{STAGE_DETAILS[stage].description}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Math */}
                        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-50 transition-opacity"><Icons.Cpu /></div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Mathematical Operation</h4>
                            <code className="block bg-black p-3 rounded-lg text-green-400 font-mono text-xs border border-green-900/30 shadow-inner">
                                {STAGE_DETAILS[stage].math}
                            </code>
                        </div>

                        {/* Analogy */}
                        <div className="bg-gradient-to-br from-amber-900/10 to-transparent border border-amber-500/20 rounded-xl p-5">
                            <h4 className="text-xs font-bold text-amber-600 uppercase mb-2">Real World Analogy</h4>
                            <p className="text-sm text-amber-100/80  leading-relaxed">"{STAGE_DETAILS[stage].analogy}"</p>
                        </div>

                        {/* Console Log */}
                        <div className="bg-black border border-gray-800 rounded-xl p-4 font-mono text-[10px] h-48 overflow-y-auto shadow-inner custom-scrollbar">
                            <div className="text-gray-600 mb-2 border-b border-gray-800 pb-1">SYSTEM_LOG_STREAM::v2.4</div>
                            {simState.stepLog.map((log, i) => (
                                <div key={i} className="mb-1 text-gray-400 animate-fade-in">
                                    <span className="text-indigo-500 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                                    {log}
                                </div>
                            ))}
                            <div className="w-2 h-4 bg-indigo-500 animate-pulse inline-block mt-1"></div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scan { 0% { top: -100%; } 100% { top: 200%; } }
                @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                @keyframes fall { 0% { top: -20%; opacity: 0; } 20% { opacity: 1; } 100% { top: 120%; opacity: 0; } }
                @keyframes flow { 0% { background-position: 0 0; opacity: 0.1; } 50% { opacity: 0.8; } 100% { background-position: 100% 0; opacity: 0.1; } }
                @keyframes wave { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { bg: #000; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; rounded: 2px; }
            `}</style>
        </div>
    );
};
