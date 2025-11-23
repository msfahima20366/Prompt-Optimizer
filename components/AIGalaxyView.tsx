
import React, { useState, useEffect, useRef } from 'react';
import { generatePromptStream } from '../services/geminiService';

// --- Types & Interfaces ---

type PipelineStage = 'idle' | 'scanning' | 'tokenizing' | 'embedding' | 'thinking' | 'streaming' | 'complete';
type ViewMode = 'text' | 'matrix' | 'binary' | 'vector';

interface Token {
  id: number;
  text: string;
  tokenId: number;
  attentionScore: number; // 0-1 for Heatmap
  type: 'text' | 'special';
}

interface LogEntry {
  timestamp: number;
  stage: PipelineStage;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

interface TopKCandidate {
  token: string;
  prob: number;
}

// --- Icons ---
const Icons = {
  Play: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Shield: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Zap: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Cube: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Eye: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Bug: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2m0 0h2m0 0h8m-8 0a2 2 0 100 4h8a2 2 0 100-4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" /></svg>,
  Download: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
};

// --- Utils ---
const formatBytes = (str: string) => str.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
const formatHex = (str: string) => str.split('').map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');
const randomProb = () => Math.random() * 0.9;

export const AIGalaxyView: React.FC = () => {
    // --- State: Controls ---
    const [prompt, setPrompt] = useState('Explain the theory of relativity in one sentence.');
    const [systemInstruction, setSystemInstruction] = useState('You are a physics expert.');
    const [temperature, setTemperature] = useState(0.7);
    const [speed, setSpeed] = useState(1.0); // 0.5x to 2x
    const [errorInjection, setErrorInjection] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('text');

    // --- State: Pipeline ---
    const [stage, setStage] = useState<PipelineStage>('idle');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [tokens, setTokens] = useState<Token[]>([]);
    const [activeLayer, setActiveLayer] = useState<number>(-1);
    const [output, setOutput] = useState('');
    const [topKCandidates, setTopKCandidates] = useState<TopKCandidate[]>([]);
    
    // --- State: Metrics ---
    const [latency, setLatency] = useState(0);
    const [totalTokens, setTotalTokens] = useState(0);
    const [estimatedCost, setEstimatedCost] = useState(0);
    const [contextUsage, setContextUsage] = useState(0);

    const scrollRef = useRef<HTMLDivElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);

    // --- Helpers ---
    const addLog = (message: string, type: LogEntry['type'] = 'info', stageVal: PipelineStage = stage) => {
        setLogs(prev => [...prev, { timestamp: Date.now(), stage: stageVal, message, type }].slice(-50));
    };

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms / speed));

    // --- Core: Live Trace Simulation ---
    const runSimulation = async () => {
        if (!prompt) return;
        
        // Reset
        setStage('scanning');
        setLogs([]);
        setTokens([]);
        setOutput('');
        setLatency(0);
        setTotalTokens(0);
        setEstimatedCost(0);
        setContextUsage(0);
        setActiveLayer(-1);

        const startTime = Date.now();
        addLog('Initializing trace session...', 'info', 'scanning');

        // Stage 1: Security Scan (Visual Feature: Security Shield, Bias Detector)
        await delay(800);
        if (prompt.toLowerCase().includes('hack') || prompt.toLowerCase().includes('exploit')) {
             if (!errorInjection) { // If error injection is OFF, we block it for demo
                 addLog('Security Shield triggered: Malicious intent detected.', 'error', 'scanning');
                 setStage('idle');
                 return;
             }
        }
        addLog('Bias check passed. Safety protocols active.', 'success', 'scanning');

        // Stage 2: Tokenization (Visual Feature: Data Metamorphosis)
        setStage('tokenizing');
        await delay(600);
        const inputWords = prompt.split(/(\s+)/);
        const newTokens = inputWords.map((w, i) => ({
            id: i,
            text: w,
            tokenId: Math.floor(Math.random() * 50000),
            attentionScore: Math.random(),
            type: 'text' as const
        }));
        setTokens(newTokens);
        setContextUsage(newTokens.length);
        addLog(`Tokenization complete. ${newTokens.length} tokens created.`, 'info', 'tokenizing');
        await delay(800);

        // Stage 3: Embedding (Visual Feature: 3D Vector Cloud)
        setStage('embedding');
        addLog('Mapping tokens to high-dimensional vector space...', 'info', 'embedding');
        await delay(1500);

        // Stage 4: Neural Processing (Visual Feature: Layerwise Activation)
        setStage('thinking');
        addLog('Forward pass started through 12 transformer layers.', 'info', 'thinking');
        for (let i = 0; i < 12; i++) {
            setActiveLayer(i);
            await delay(100 + Math.random() * 100);
        }
        addLog('Context vector computed. Decoding started.', 'success', 'thinking');

        // Stage 5: Streaming Output (Visual Feature: Top-K, Streaming)
        setStage('streaming');
        try {
            const stream = await generatePromptStream(prompt, temperature, 0.95, systemInstruction);
            let fullText = '';
            let tokenCount = 0;

            for await (const chunk of stream) {
                // Simulate Error Injection
                let textChunk = chunk;
                if (errorInjection && Math.random() > 0.8) {
                    textChunk = chunk.split('').map(c => Math.random() > 0.5 ? String.fromCharCode(c.charCodeAt(0) + 1) : c).join('');
                    addLog('Warning: Memory corruption detected (Error Injection)', 'warn', 'streaming');
                }

                fullText += textChunk;
                setOutput(fullText);
                tokenCount++;
                setTotalTokens(prev => prev + 1);
                setEstimatedCost(prev => prev + 0.0000005);
                setLatency(Date.now() - startTime);

                // Simulate Top-K for visualization
                const candidates = [
                    { token: textChunk.trim() || ' ', prob: 0.7 + Math.random() * 0.2 },
                    { token: '...', prob: Math.random() * 0.1 },
                    { token: 'the', prob: Math.random() * 0.05 },
                ].sort((a,b) => b.prob - a.prob);
                setTopKCandidates(candidates);

                // Auto-scroll output
                if (outputRef.current) {
                    outputRef.current.scrollTop = outputRef.current.scrollHeight;
                }
            }
            addLog('Stream finished successfully.', 'success', 'complete');
        } catch (e) {
            addLog(`API Error: ${e instanceof Error ? e.message : 'Unknown'}`, 'error', 'streaming');
        } finally {
            setStage('complete');
            setActiveLayer(-1);
        }
    };

    const handleExport = () => {
        const report = `AI Galaxy Trace Report\nTimestamp: ${new Date().toISOString()}\n\nLogs:\n${logs.map(l => `[${l.type.toUpperCase()}] ${l.message}`).join('\n')}\n\nOutput:\n${output}`;
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'trace_report.txt';
        a.click();
    };

    // --- Sub-Components (Internal) ---

    // 1. Pipeline Progress Bar
    const ProgressBar = () => {
        const steps = ['scanning', 'tokenizing', 'embedding', 'thinking', 'streaming'];
        const currentIndex = steps.indexOf(stage === 'complete' || stage === 'idle' ? (stage === 'complete' ? 'streaming' : 'none') : stage);
        
        return (
            <div className="flex items-center justify-between mb-6 px-4">
                {steps.map((s, i) => {
                    const isActive = i <= currentIndex;
                    const isCurrent = i === currentIndex;
                    return (
                        <div key={s} className="flex flex-col items-center relative z-10 w-full">
                            <div className={`w-full h-1 absolute top-1/2 left-[-50%] -z-10 ${i === 0 ? 'hidden' : ''} ${isActive ? 'bg-indigo-500' : 'bg-gray-700'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${isActive ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-gray-800 border-gray-600 text-gray-500'}`}>
                                {isCurrent && stage !== 'complete' ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> : (i + 1)}
                            </div>
                            <span className={`text-[10px] mt-2 uppercase font-bold ${isActive ? 'text-indigo-300' : 'text-gray-600'}`}>{s}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    // 2. The Holographic Stage
    const HolographicStage = () => {
        return (
            <div className="flex-1 bg-black/80 rounded-2xl border border-indigo-500/30 relative overflow-hidden flex flex-col shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
                
                {/* Status Header */}
                <div className="flex justify-between items-center p-3 bg-indigo-900/20 border-b border-indigo-500/20 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${stage === 'idle' ? 'bg-gray-500' : 'bg-green-500 animate-pulse'}`}></div>
                        <span className="text-xs font-mono text-indigo-300 uppercase">Live Viewport: {stage.toUpperCase()}</span>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={() => setViewMode('text')} className={`text-xs px-2 py-0.5 rounded ${viewMode === 'text' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>TXT</button>
                         <button onClick={() => setViewMode('matrix')} className={`text-xs px-2 py-0.5 rounded ${viewMode === 'matrix' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>HEX</button>
                         <button onClick={() => setViewMode('binary')} className={`text-xs px-2 py-0.5 rounded ${viewMode === 'binary' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>BIN</button>
                    </div>
                </div>

                {/* VISUALIZATION CONTENT */}
                <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
                    
                    {stage === 'idle' && (
                        <div className="text-center opacity-40">
                             <div className="text-6xl mb-4 animate-bounce">🌌</div>
                             <p className="text-sm font-mono text-indigo-300">SYSTEM READY. INITIALIZE PROMPT.</p>
                        </div>
                    )}

                    {stage === 'scanning' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-1 bg-red-500 absolute top-1/2 shadow-[0_0_20px_#ef4444] animate-[scan_2s_ease-in-out_infinite]"></div>
                            <div className="bg-black/80 border border-red-500 text-red-400 px-6 py-4 rounded-lg z-10 flex items-center gap-3">
                                <Icons.Shield />
                                <span className="font-mono text-lg">SECURITY SCANNING...</span>
                            </div>
                        </div>
                    )}

                    {stage === 'tokenizing' && (
                        <div className="flex flex-wrap justify-center gap-2 max-w-2xl animate-fade-in">
                            {tokens.map((t) => (
                                <div key={t.id} className="group relative">
                                    <span className="px-3 py-1.5 bg-indigo-900/60 border border-indigo-500/50 rounded text-indigo-100 text-sm font-mono hover:bg-indigo-600 transition-colors cursor-help">
                                        {t.text}
                                    </span>
                                    {/* Feature: Node Inspector (Hover) */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black border border-indigo-500 p-2 rounded text-[10px] text-gray-300 hidden group-hover:block z-20 shadow-xl">
                                        ID: {t.tokenId}<br/>
                                        Attn: {t.attentionScore.toFixed(3)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {stage === 'embedding' && (
                        <div className="relative w-64 h-64 [perspective:1000px]">
                            <div className="w-full h-full relative [transform-style:preserve-3d] animate-[spin-slow_10s_linear_infinite]">
                                {/* Feature: 3D Vector Cloud */}
                                {[...Array(30)].map((_, i) => (
                                    <div key={i} className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" style={{
                                        left: '50%', top: '50%',
                                        transform: `rotateY(${i * 12}deg) rotateX(${i * 20}deg) translateZ(100px)`
                                    }}></div>
                                ))}
                                <div className="absolute inset-0 border border-indigo-500/20 rounded-full [transform:rotateX(90deg)]"></div>
                            </div>
                            <p className="absolute -bottom-8 left-0 right-0 text-center text-xs font-mono text-cyan-400">768-DIMENSIONAL SPACE</p>
                        </div>
                    )}

                    {stage === 'thinking' && (
                        <div className="w-full h-full flex items-center justify-center">
                            {/* Feature: Layerwise Activation */}
                            <div className="grid grid-cols-6 gap-x-8 gap-y-4">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className={`w-12 h-12 rounded-lg border flex items-center justify-center text-xs font-bold transition-all duration-200 ${activeLayer === i ? 'bg-purple-600 border-purple-400 text-white scale-110 shadow-[0_0_20px_#9333ea]' : 'bg-gray-900 border-gray-800 text-gray-700'}`}>
                                        L{i+1}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(stage === 'streaming' || stage === 'complete') && (
                        <div className="absolute inset-0 p-4 font-mono text-sm leading-relaxed overflow-y-auto" ref={outputRef}>
                            {viewMode === 'text' && <span className="text-gray-200 whitespace-pre-wrap">{output}</span>}
                            {viewMode === 'matrix' && <span className="text-green-500 break-all">{formatHex(output)}</span>}
                            {viewMode === 'binary' && <span className="text-green-500 break-all">{formatBytes(output)}</span>}
                            {stage === 'streaming' && <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse ml-1 align-middle"></span>}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-140px)] min-h-[600px] w-full bg-gray-950 text-gray-200 font-sans p-4 rounded-xl border border-gray-800 shadow-2xl flex flex-col gap-4">
             {/* --- Header --- */}
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                        <Icons.Cube />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">AI GALAXY <span className="text-indigo-400">LAB</span></h1>
                        <p className="text-xs text-gray-500">Live LLM Trace & Telemetry System</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     {/* Feature: Export Report */}
                     <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-xs font-bold text-gray-300 transition-colors">
                        <Icons.Download /> EXPORT TRACE
                     </button>
                </div>
            </div>

            {/* --- Main Workspace --- */}
            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
                
                {/* 1. LEFT: COMMAND DECK */}
                <div className="w-full lg:w-72 flex flex-col gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800 overflow-y-auto">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Input Prompt</label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-24 bg-black border border-gray-700 rounded p-2 text-xs text-gray-300 focus:border-indigo-500 focus:outline-none resize-none"
                        />
                    </div>
                    
                    {/* Feature: Custom System Prompt */}
                    <div className="space-y-1">
                         <label className="text-[10px] font-bold text-indigo-400 uppercase">System Instruction</label>
                         <textarea 
                            value={systemInstruction}
                            onChange={(e) => setSystemInstruction(e.target.value)}
                            className="w-full h-16 bg-indigo-900/10 border border-indigo-500/30 rounded p-2 text-xs text-indigo-200 focus:border-indigo-500 focus:outline-none resize-none"
                        />
                    </div>

                    <div className="space-y-4 pt-2 border-t border-gray-800">
                         {/* Feature: Temperature Slider */}
                         <div>
                            <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold">
                                <span>Temperature (Chaos)</span>
                                <span className="text-indigo-400">{temperature}</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-2" />
                        </div>

                        {/* Feature: Speed Control */}
                         <div>
                            <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold">
                                <span>Simulation Speed</span>
                                <span className="text-green-400">{speed}x</span>
                            </div>
                            <input type="range" min="0.5" max="2" step="0.5" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-2" />
                        </div>

                        {/* Feature: Error Injection */}
                        <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-gray-800">
                             <div className="flex items-center gap-2">
                                <span className="text-red-500"><Icons.Bug /></span>
                                <span className="text-xs font-bold text-gray-400">Error Injection</span>
                             </div>
                             <button onClick={() => setErrorInjection(!errorInjection)} className={`w-8 h-4 rounded-full relative transition-colors ${errorInjection ? 'bg-red-600' : 'bg-gray-700'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${errorInjection ? 'left-4.5' : 'left-0.5'}`}></div>
                             </button>
                        </div>
                    </div>

                    <button 
                        onClick={runSimulation} 
                        disabled={stage !== 'idle' && stage !== 'complete'}
                        className="mt-auto w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {stage === 'idle' || stage === 'complete' ? <><Icons.Play /> INITIALIZE SEQUENCE</> : 'PROCESSING...'}
                    </button>
                </div>

                {/* 2. CENTER: HOLOGRAPHIC STAGE */}
                <div className="flex-1 flex flex-col min-w-0">
                    <ProgressBar />
                    <HolographicStage />
                </div>

                {/* 3. RIGHT: TELEMETRY DASHBOARD */}
                <div className="w-full lg:w-64 bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex flex-col gap-4 overflow-y-auto">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">Live Telemetry</h3>

                    {/* Feature: Top-K Probability Chart */}
                    <div className="bg-black/40 rounded border border-gray-800 p-3">
                         <div className="flex items-center gap-2 mb-2">
                             <Icons.Eye />
                             <span className="text-xs font-bold text-indigo-400">Next Token Prob (Top-K)</span>
                         </div>
                         <div className="space-y-1">
                            {topKCandidates.length === 0 ? <p className="text-[10px] text-gray-600">Waiting for inference...</p> : topKCandidates.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px]">
                                    <div className="w-10 text-right font-mono text-gray-400 truncate">{c.token}</div>
                                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${c.prob * 100}%` }}></div>
                                    </div>
                                    <div className="w-8 text-right text-gray-500">{(c.prob * 100).toFixed(0)}%</div>
                                </div>
                            ))}
                         </div>
                    </div>

                    {/* Feature: Memory Context Window */}
                    <div className="bg-black/40 rounded border border-gray-800 p-3">
                        <span className="text-xs font-bold text-blue-400 block mb-1">Context Window</span>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-1">
                             <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${Math.min((contextUsage / 128) * 100, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500">
                            <span>{contextUsage} tokens</span>
                            <span>Limit: 1M</span>
                        </div>
                    </div>

                    {/* Metrics Grid (Cost, Latency) */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/40 p-2 rounded border border-gray-800">
                             <span className="text-[10px] text-gray-500 block">Latency</span>
                             <span className="text-sm font-mono text-yellow-400">{latency}ms</span>
                        </div>
                        <div className="bg-black/40 p-2 rounded border border-gray-800">
                             <span className="text-[10px] text-gray-500 block">Tokens</span>
                             <span className="text-sm font-mono text-green-400">{totalTokens}</span>
                        </div>
                         <div className="bg-black/40 p-2 rounded border border-gray-800 col-span-2">
                             <span className="text-[10px] text-gray-500 block">Est. Cost</span>
                             <span className="text-sm font-mono text-gray-300">${estimatedCost.toFixed(7)}</span>
                        </div>
                    </div>

                    {/* Feature: Attention Heatmap (Mini) */}
                    <div className="bg-black/40 rounded border border-gray-800 p-3 flex-1 min-h-[100px]">
                         <span className="text-xs font-bold text-red-400 block mb-2">Attention Heatmap</span>
                         <div className="flex flex-wrap gap-0.5">
                             {tokens.map((t, i) => (
                                 <div key={i} className="w-2 h-2 rounded-sm" style={{ backgroundColor: `rgba(248, 113, 113, ${t.attentionScore})` }} title={`Attn: ${t.attentionScore.toFixed(2)}`}></div>
                             ))}
                             {tokens.length === 0 && <span className="text-[10px] text-gray-600">No active attention heads</span>}
                         </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes scan { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
                @keyframes spin-slow { from { transform: rotateY(0deg) rotateX(0deg); } to { transform: rotateY(360deg) rotateX(360deg); } }
            `}</style>
        </div>
    );
};
