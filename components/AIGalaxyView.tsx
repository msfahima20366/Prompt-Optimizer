
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
    Brain: () => <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
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
        subtitle: "Awaiting Neural Trigger",
        description: "The core processing unit is in an idle state. Input injection is required to wake the latent space.",
        math: "f(x) = 0",
        analogy: "A library at night, filled with knowledge but silent until someone opens a book."
    },
    input_guard: {
        title: "Input Guardrails",
        subtitle: "Neural Safety Filtering",
        description: "Executing real-time toxicity analysis and PII masking to ensure the prompt adheres to safety protocols.",
        math: "P(Safe | Input) > Threshold",
        analogy: "A specialized white-glove security team vetting visitors at the entrance of a high-security vault."
    },
    tokenization: {
        title: "Tokenization",
        subtitle: "Semantic Decomposition",
        description: "Deconstructing the input string into discrete sub-word units. These are the atomic elements of LLM understanding.",
        math: "S → {t₁, t₂, ..., tₙ}",
        analogy: "Taking a complex puzzle apart into individual pieces so it can be transported and analyzed."
    },
    embedding_lookup: {
        title: "Embedding Lookup",
        subtitle: "Vector Space Projection",
        description: "Mapping discrete token IDs to dense, continuous vector representations in a multi-dimensional semantic space.",
        math: "E = EmbeddingMatrix[TokenID]",
        analogy: "Assigning every word a unique latitude and longitude in a 'map of all human concepts'."
    },
    positional_encoding: {
        title: "Positional Encoding",
        subtitle: "Sequence Context Injection",
        description: "Applying sinusoidal frequency functions to the embeddings to give the model a sense of order and structure.",
        math: "x = Embedding + PE(position)",
        analogy: "Adding timestamps to video frames so the player knows exactly which one comes after another."
    },
    self_attention: {
        title: "Self-Attention",
        subtitle: "Relational Weighting",
        description: "Tokens perform a cross-query of the entire sequence to determine which other tokens are most relevant to their meaning.",
        math: "Softmax(QKᵀ / √dₖ)V",
        analogy: "A group of experts in a room, each focusing their attention on the person who has the most relevant info for them."
    },
    feed_forward: {
        title: "Feed Forward Network",
        subtitle: "Non-Linear Synthesis",
        description: "Information passes through dense layers of activated neurons to extract high-level semantic features and reasoning patterns.",
        math: "ReLU(xW₁ + b₁)W₂ + b₂",
        analogy: "A complex factory assembly line where raw parts are combined into sophisticated, finished products."
    },
    logits_calc: {
        title: "Logits Calculation",
        subtitle: "Vocabulary Probability Distribution",
        description: "Projecting the final hidden states back into the full vocabulary space to calculate the raw likelihood of every possible next word.",
        math: "y = x · W_unembed",
        analogy: "A candidate list of 50,000 words, each given a 'score' based on how well it fits the current sentence."
    },
    sampling_decoding: {
        title: "Sampling & Decoding",
        subtitle: "Stochastic Selection",
        description: "Converting raw logits into a probability distribution and selecting a single winner based on the temperature parameter.",
        math: "NextToken = Sample(P(Vocab))",
        analogy: "Spinning a wheel of fortune where the sizes of the wedges are determined by the model's confidence."
    },
    detokenization: {
        title: "Detokenization",
        subtitle: "Human Language Synthesis",
        description: "Reassembling the chosen token ID back into a human-readable string and updating the global context.",
        math: "String = Map(TokenID → Text)",
        analogy: "Translating a machine code '001' back into the word 'Apple' for the user to read."
    },
    finished: {
        title: "Trace Complete",
        subtitle: "Generation Cycle Finalized",
        description: "The sequence generation has reached its logical conclusion or maximum capacity.",
        math: "∀t: Result += NextToken",
        analogy: "The final curtain call after a perfectly executed performance."
    }
};

const getRandomVector = (dim: number) => Array.from({ length: dim }, () => parseFloat(Math.random().toFixed(2)));

// --- Components ---

const NeuralNetworkVisual: React.FC = () => (
    <div className="flex justify-center items-center gap-12 h-64 w-full opacity-100">
        {[4, 6, 6, 4].map((count, layerIdx) => (
            <div key={layerIdx} className="flex flex-col gap-4 relative">
                {Array.from({ length: count }).map((_, nodeIdx) => (
                    <div key={nodeIdx} className="w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] relative z-10 animate-pulse">
                        {layerIdx < 3 && Array.from({ length: [4, 6, 6, 4][layerIdx + 1] }).map((__, nextNodeIdx) => (
                            <div 
                                key={nextNodeIdx}
                                className="absolute top-2.5 left-2.5 h-[1px] bg-cyan-500/40 origin-top-left"
                                style={{ 
                                    width: '3.5rem', 
                                    transform: `rotate(${((nextNodeIdx - nodeIdx) * 12)}deg) scaleX(1.4)`
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {Array.from({ length: 30 }).map((_, i) => (
            <div 
                key={i} 
                className="absolute text-[12px] font-mono text-cyan-500 animate-[fall_3s_linear_infinite] drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]"
                style={{ 
                    left: `${i * 3.3}%`, 
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 4}s`
                }}
            >
                {Array.from({ length: 15 }).map((__, j) => (
                    <div key={j}>{Math.random() > 0.5 ? '1' : '0'}</div>
                ))}
            </div>
        ))}
    </div>
);

export const AIGalaxyView: React.FC = () => {
    const [promptText, setPromptText] = useState("Explain the concept of quantum entanglement.");
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

    useEffect(() => { isAutoRef.current = isAutoMode; }, [isAutoMode]);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

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

    const runSimulation = async () => {
        if (abortController.current) abortController.current.abort();
        abortController.current = new AbortController();
        
        setIsPlaying(true);
        setSimState({ input: promptText, tokens: [], attentionMatrix: [], logits: [], currentOutput: "", stepLog: [] });
        
        try {
            setStage('input_guard');
            addLog("Executing Neural Guardrails...");
            await wait(2000);

            setStage('tokenization');
            addLog("Tokenizing stream input...");
            const rawWords = promptText.split(" ");
            const tokens: TokenData[] = [];
            let idCounter = 0;
            for (const word of rawWords) {
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
            addLog(`Sequence complete: ${tokens.length} semantic units.`);
            await wait(1000);

            setStage('embedding_lookup');
            addLog("Projecting units into 1536-dimensional space...");
            await wait(2500);

            setStage('positional_encoding');
            addLog("Injecting sequence frequency patterns...");
            await wait(2000);

            setStage('self_attention');
            addLog("Computing contextual relevance matrix...");
            const size = tokens.length;
            const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => Math.random()));
            setSimState(prev => ({ ...prev, attentionMatrix: matrix }));
            await wait(3000);

            setStage('feed_forward');
            addLog("Synthesizing reasoning pathways via FFN...");
            await wait(2500);

            const stream = await generatePromptStream(promptText, 0.7, 0.9, "You are a helpful AI assistant. Be concise.");
            
            for await (const chunk of stream) {
                if (abortController.current?.signal.aborted) break;

                setStage('logits_calc');
                addLog("Calculating candidate token distribution...");
                const candidates = [
                    { token: chunk.trim() || " ", score: 12.5, prob: 0.85 },
                    { token: "the", score: 8.2, prob: 0.05 },
                    { token: "is", score: 7.1, prob: 0.03 },
                    { token: "of", score: 5.4, prob: 0.02 }
                ];
                setSimState(prev => ({ ...prev, logits: candidates }));
                await wait(isAutoRef.current ? 500 : 0);

                setStage('sampling_decoding');
                addLog(`Stochastic selection: "${chunk}"`);
                await wait(isAutoRef.current ? 500 : 0);

                setStage('detokenization');
                await wait(isAutoRef.current ? 300 : 0);

                setSimState(prev => ({ ...prev, currentOutput: prev.currentOutput + chunk }));
            }

            setStage('finished');
            addLog("Inference cycle successfully terminated.");
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

    const renderVisualizer = () => {
        switch (stage) {
            case 'idle':
                return (
                    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                        <div className="relative">
                            <div className="absolute inset-0 bg-cyan-500 blur-[80px] opacity-30 animate-pulse"></div>
                            <div className="relative p-12 border-2 border-cyan-500/50 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.2)] bg-black">
                                <div className="text-cyan-400"><Icons.Brain /></div>
                            </div>
                        </div>
                        <h3 className="mt-8 text-2xl font-black text-white tracking-[0.3em] uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Neural Core Ready</h3>
                        <p className="text-cyan-500/60 font-mono text-sm mt-4 tracking-widest animate-pulse">INIT_PROMPT_SEQUENCE_REQUESTED...</p>
                    </div>
                );
            case 'input_guard':
                return (
                    <div className="flex flex-col items-center justify-center h-full relative">
                        <div className="w-full max-w-xl p-8 border-2 border-cyan-500/30 bg-gray-900/40 rounded-[2rem] relative overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.1)]">
                            <p className="font-mono text-cyan-100 text-lg text-center leading-relaxed italic">"{simState.input}"</p>
                            <div className="absolute top-0 bottom-0 w-4 bg-cyan-400/30 blur-xl animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>
                        <div className="mt-12 flex items-center gap-12">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-400 shadow-[0_0_20px_#10b981]"></div>
                                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-tighter">Safety_Verified</span>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-400 shadow-[0_0_20px_#10b981]"></div>
                                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-tighter">Intent_Authorized</span>
                            </div>
                        </div>
                    </div>
                );
            case 'tokenization':
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8">
                        <div className="flex flex-wrap gap-6 justify-center">
                            {simState.tokens.map((t, idx) => (
                                <div key={idx} className="group relative animate-[popIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]">
                                    <div className={`px-6 py-4 rounded-2xl font-mono font-black text-white shadow-[0_10px_25px_rgba(0,0,0,0.5)] ${t.color} border-t border-white/40 transform group-hover:-translate-y-2 transition-transform duration-300`}>
                                        {t.text}
                                    </div>
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[11px] font-black font-mono text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] opacity-100 transition-opacity">
                                        #{t.tokenId}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-16 text-cyan-500 font-black text-xs uppercase tracking-[0.5em] animate-pulse">Building_Context_Units</p>
                    </div>
                );
            case 'embedding_lookup':
                return (
                    <div className="relative h-full w-full flex flex-col items-center justify-center p-8 overflow-hidden">
                        <MatrixRain />
                        <div className="z-10 w-full max-w-2xl space-y-4 max-h-full overflow-y-auto pr-2 custom-scrollbar">
                            {simState.tokens.map((t) => (
                                <div key={t.id} className="flex items-center gap-6 p-4 bg-black/60 border border-cyan-500/20 rounded-2xl animate-fade-in backdrop-blur-md hover:border-cyan-500/50 transition-colors group">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white ${t.color} shadow-lg`}>{t.tokenId}</div>
                                    <div className="text-cyan-500 font-bold text-lg">→</div>
                                    <div className="flex-1 font-mono text-[11px] text-cyan-300 tracking-widest overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-white transition-colors">
                                        [{t.vector.join(', ')}, -0.4221, 0.8192, 0.1002, ...]
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'positional_encoding':
                return (
                    <div className="h-full flex flex-col items-center justify-center p-8">
                        <div className="relative w-full max-w-4xl h-80 border-b-2 border-cyan-500/30 flex items-end justify-between px-12">
                            <svg className="absolute inset-0 w-full h-full opacity-80" preserveAspectRatio="none">
                                <path d="M0,40 Q150,100 300,40 T600,40 T900,40" fill="none" stroke="cyan" strokeWidth="3" className="animate-[wave_3s_linear_infinite] drop-shadow-[0_0_10px_#0ff]" />
                                <path d="M0,60 Q120,20 240,60 T480,60 T720,60" fill="none" stroke="#f0f" strokeWidth="3" className="animate-[wave_4s_linear_infinite] drop-shadow-[0_0_10px_#f0f]" />
                            </svg>
                            {simState.tokens.map((t, i) => (
                                <div key={i} className="flex flex-col items-center z-10">
                                    <div className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_20px_rgba(255,255,255,0.3)]`}>{i}</div>
                                    <div className="h-32 w-[2px] bg-gradient-to-t from-cyan-500 to-transparent my-4 opacity-50"></div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-12 text-white font-black text-sm uppercase tracking-[0.6em] drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">Sequence_Frequency_Mapping</p>
                    </div>
                );
            case 'self_attention':
                return (
                    <div className="h-full flex items-center justify-center p-8">
                        <div className="relative w-[560px] h-[560px] animate-[spin_60s_linear_infinite]">
                            {simState.tokens.map((t, i) => {
                                const angle = (i / simState.tokens.length) * 2 * Math.PI;
                                const radius = 230;
                                const x = 280 + radius * Math.cos(angle);
                                const y = 280 + radius * Math.sin(angle);
                                return (
                                    <div 
                                        key={t.id} 
                                        className={`absolute w-14 h-14 -ml-7 -mt-7 rounded-2xl ${t.color} flex items-center justify-center text-[11px] font-black text-white shadow-[0_0_20px_rgba(0,0,0,0.5)] z-20 transform hover:scale-125 transition-transform`}
                                        style={{ left: x, top: y }}
                                    >
                                        {t.text}
                                    </div>
                                );
                            })}
                            
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                                {simState.attentionMatrix.map((row, i) => 
                                    row.map((val, j) => {
                                        if (val < 0.25) return null;
                                        const angleI = (i / simState.tokens.length) * 2 * Math.PI;
                                        const angleJ = (j / simState.tokens.length) * 2 * Math.PI;
                                        const r = 230;
                                        const x1 = 280 + r * Math.cos(angleI);
                                        const y1 = 280 + r * Math.sin(angleI);
                                        const x2 = 280 + r * Math.cos(angleJ);
                                        const y2 = 280 + r * Math.sin(angleJ);
                                        return (
                                            <line 
                                                key={`${i}-${j}`} 
                                                x1={x1} y1={y1} x2={x2} y2={y2} 
                                                stroke="white" 
                                                strokeWidth={val * 4} 
                                                strokeOpacity={val * 0.7} 
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
                        <div className="mt-12 font-mono text-cyan-400 text-sm font-black uppercase tracking-[0.8em] animate-pulse">Processing_Hidden_Features</div>
                    </div>
                );
            case 'logits_calc':
            case 'sampling_decoding':
                return (
                    <div className="h-full flex flex-col items-center justify-center p-8">
                        <div className="w-full max-w-xl space-y-6">
                            {simState.logits.map((item, idx) => (
                                <div key={idx} className="relative group animate-[fadeUp_0.4s_ease-out]">
                                    <div className="flex justify-between text-[11px] font-black font-mono text-cyan-100 mb-2 z-10 relative px-2">
                                        <span className={`${idx === 0 ? 'text-white text-base scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'opacity-60'}`}>"{item.token}"</span>
                                        <span className={`${idx === 0 ? 'text-emerald-400' : 'opacity-60'}`}>{(item.prob * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-10 w-full bg-gray-900 border border-white/5 rounded-2xl overflow-hidden relative shadow-inner">
                                        <div 
                                            className={`h-full ${idx === 0 ? 'bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)]' : 'bg-gray-800 opacity-30'} transition-all duration-700 ease-out`}
                                            style={{ width: `${item.prob * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {stage === 'sampling_decoding' && (
                            <div className="mt-16 text-center animate-bounce">
                                <div className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.4em] mb-4">Winner_Selected</div>
                                <span className="inline-block bg-emerald-500 text-black px-10 py-4 rounded-[2rem] font-black shadow-[0_0_40px_rgba(16,185,129,0.5)] text-2xl uppercase tracking-tighter">
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
                        <div className="w-full max-w-4xl bg-black border-2 border-cyan-500/20 rounded-[2.5rem] p-12 shadow-[0_20px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-600 via-emerald-400 to-violet-600"></div>
                             <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/5 blur-[100px]"></div>
                             <p className="font-mono text-2xl leading-relaxed tracking-tight">
                                <span className="text-white/30 font-light italic">{simState.input} </span>
                                <span className="text-white font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{simState.currentOutput}</span>
                                {stage !== 'finished' && <span className="inline-block w-3 h-8 bg-cyan-400 ml-2 animate-pulse align-middle shadow-[0_0_15px_#0ff]"></span>}
                             </p>
                        </div>
                        {stage === 'finished' && (
                            <button 
                              onClick={handleReset} 
                              className="mt-12 px-10 py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-4 shadow-[0_10px_30px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95"
                            >
                                <Icons.Reset /> Start_Next_Trace
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
              className="flex flex-col items-center gap-3 min-w-[100px] group cursor-default"
              title={`${STAGE_DETAILS[s].title}: ${STAGE_DETAILS[s].subtitle}`}
            >
                <div className={`w-4 h-4 rounded-full transition-all duration-700 ${isActive ? 'bg-cyan-400 scale-150 shadow-[0_0_20px_#0ff]' : isPast ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-gray-800'}`}></div>
                <div className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isActive ? 'text-cyan-400' : isPast ? 'text-emerald-500/60' : 'text-gray-700'}`}>
                    {s.split('_')[0]}
                </div>
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-120px)] bg-[#020202] text-white font-sans flex flex-col overflow-hidden rounded-[3rem] border border-white/5 shadow-2xl">
            {/* Header */}
            <div className="h-20 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 z-20">
                <div className="flex items-center gap-4">
                    <div className="bg-cyan-500/10 p-3 rounded-2xl text-cyan-400 shadow-inner border border-cyan-500/20"><Icons.Cpu /></div>
                    <h1 className="font-black text-2xl tracking-tighter uppercase">Inference <span className="text-cyan-500 font-light opacity-80">Galaxy_Trace</span></h1>
                </div>
                <div className="flex items-center gap-6 bg-black p-1.5 rounded-[2rem] border border-white/10 shadow-2xl">
                    <input 
                        className="bg-transparent border-none text-sm px-6 w-96 focus:ring-0 placeholder-gray-700 font-bold text-cyan-100"
                        value={promptText}
                        onChange={e => setPromptText(e.target.value)}
                        placeholder="Inject System Prompt..."
                        disabled={isPlaying}
                    />
                    <button 
                        onClick={() => !isPlaying && runSimulation()}
                        disabled={isPlaying}
                        className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white px-8 py-2.5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 shadow-lg active:scale-95"
                    >
                        {isPlaying ? 'Computing...' : 'Initialize'}
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 grid grid-cols-12 overflow-hidden">
                {/* Visualizer (Left) */}
                <div className="col-span-12 lg:col-span-8 relative bg-[#050505] flex flex-col">
                    <div className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-black/40 overflow-x-auto no-scrollbar">
                         {(Object.keys(STAGE_DETAILS) as PipelineStage[]).map((s, i) => <PipelineStep key={s} s={s} idx={i} />)}
                    </div>
                    
                    <div className="flex-1 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#082f49_0%,transparent_70%)] opacity-20 pointer-events-none"></div>
                        {renderVisualizer()}

                        {/* Controls */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-gray-950/90 border border-white/10 px-6 py-3 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-30">
                            <div className="flex bg-black/60 rounded-full p-1.5 border border-white/5">
                                <button onClick={() => setIsAutoMode(true)} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${isAutoMode ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}>Auto</button>
                                <button onClick={() => setIsAutoMode(false)} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${!isAutoMode ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}>Manual</button>
                            </div>
                            {(!isAutoMode || !isPlaying) && stage !== 'idle' && stage !== 'finished' && (
                                <button 
                                  onClick={handleNext} 
                                  className="flex items-center gap-3 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg animate-pulse"
                                >
                                    Proceed <Icons.Next />
                                </button>
                            )}
                            {isAutoMode && stage !== 'idle' && stage !== 'finished' && (
                                <button 
                                  onClick={() => { setIsPlaying(!isPlaying); if(!isPlaying) handleNext(); }} 
                                  className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-cyan-400 border border-white/10"
                                >
                                    {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Educational Panel (Right) */}
                <div className="col-span-12 lg:col-span-4 bg-[#080808] border-l border-white/5 flex flex-col h-full overflow-hidden">
                    <div className="p-10 border-b border-white/5 bg-gradient-to-b from-cyan-900/10 to-transparent">
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] border-l-4 border-cyan-500 pl-4 py-1">
                            Neural_Phase // 0{Object.keys(STAGE_DETAILS).indexOf(stage)}
                        </span>
                        <h2 className="text-4xl font-black text-white mt-8 mb-3 tracking-tighter uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{STAGE_DETAILS[stage].title}</h2>
                        <h3 className="text-xl text-cyan-400/80 font-light mb-6 lowercase tracking-widest">:: {STAGE_DETAILS[stage].subtitle}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium bg-white/5 p-6 rounded-2xl border-l-2 border-cyan-500 italic">"{STAGE_DETAILS[stage].description}"</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        {/* Math */}
                        <div className="bg-gray-950 border border-cyan-500/20 rounded-3xl p-8 relative overflow-hidden group hover:border-cyan-500/50 transition-all shadow-xl">
                            <div className="absolute -top-10 -right-10 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity text-cyan-400"><Icons.Cpu /></div>
                            <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-5">Calculus_Ops_Matrix</h4>
                            <code className="block bg-black/80 p-6 rounded-2xl text-cyan-100 font-mono text-sm border border-white/5 shadow-2xl leading-relaxed">
                                {STAGE_DETAILS[stage].math}
                            </code>
                        </div>

                        {/* Analogy */}
                        <div className="bg-gradient-to-br from-amber-600/10 to-transparent border border-amber-500/30 rounded-3xl p-8 shadow-lg">
                            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-4">Heuristic_Analogy</h4>
                            <p className="text-base text-amber-100 font-semibold leading-relaxed">"{STAGE_DETAILS[stage].analogy}"</p>
                        </div>

                        {/* Console Log */}
                        <div className="bg-black border border-white/10 rounded-3xl p-6 font-mono text-[11px] h-56 overflow-y-auto shadow-inner custom-scrollbar relative">
                            <div className="sticky top-0 bg-black/90 text-cyan-500/40 mb-4 border-b border-white/5 pb-2 font-black uppercase tracking-widest text-[9px] z-10">System_Inference_Log::Live</div>
                            {simState.stepLog.map((log, i) => (
                                <div key={i} className="mb-2 text-cyan-100/70 animate-fade-in flex gap-3">
                                    <span className="text-cyan-600 font-black shrink-0">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                                    <span className="leading-tight">{log}</span>
                                </div>
                            ))}
                            <div className="w-2 h-4 bg-cyan-400 animate-pulse inline-block mt-2 shadow-[0_0_10px_#0ff]"></div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scan { 0% { top: -100%; } 100% { top: 200%; } }
                @keyframes popIn { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                @keyframes fall { 0% { top: -20%; opacity: 0; } 10% { opacity: 1; } 100% { top: 120%; opacity: 0; } }
                @keyframes wave { 0% { transform: translateX(0); } 100% { transform: translateX(-33.3%); } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #111; border-radius: 10px; border: 1px solid #222; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #222; }
            `}</style>
        </div>
    );
};
