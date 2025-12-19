
import React, { useState, useEffect } from 'react';
import { ARTISTS, COMPOSITION, DETAILS, IMAGE_STYLES, LIGHTING, ADJECTIVES, VERBS, NOUNS } from '../prompts/imagePrompts';

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z" /></svg>
);
const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);
const SaveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);
const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
);

interface PromptBuilderViewProps {
    onGenerateImage: (prompt: string) => void;
    isGenerating: boolean;
    generatedImage: string | null;
    error: string | null;
    onSavePrompt: (prompt: string) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode, tooltip?: string }> = ({ title, children, tooltip }) => (
    <div className="space-y-4 bg-amber-50/20 dark:bg-stone-900/30 p-6 rounded-[2rem] border border-amber-100/50 dark:border-stone-800" title={tooltip}>
        <h3 className="text-sm font-black uppercase tracking-widest text-orange-600 dark:text-amber-500 ">{title}</h3>
        {children}
    </div>
);

const MultiSelect: React.FC<{ label: string; options: string[], selected: string[], toggle: (option: string) => void, tooltip?: string }> = ({ label, options, selected, toggle, tooltip }) => (
    <div title={tooltip}>
        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    key={option}
                    onClick={() => toggle(option)}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-tighter rounded-xl border-2 transition-all duration-300 ${selected.includes(option) ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-transparent text-stone-600 dark:text-stone-400 border-stone-100 dark:border-stone-800 hover:border-amber-400'}`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);


export const PromptBuilderView: React.FC<PromptBuilderViewProps> = ({ onGenerateImage, isGenerating, generatedImage, error, onSavePrompt }) => {
    const [subject, setSubject] = useState('An epic photo of a banana warrior');
    const [styles, setStyles] = useState<string[]>(['Photorealistic']);
    const [artists, setArtists] = useState<string[]>(['Greg Rutkowski']);
    const [adjectives, setAdjectives] = useState<string[]>(['Epic']);
    const [verbs, setVerbs] = useState<string[]>(['Standing']);
    const [nouns, setNouns] = useState<string[]>(['Mountain']);
    const [lighting, setLighting] = useState<string[]>(['Cinematic Lighting']);
    const [composition, setComposition] = useState<string[]>(['Medium Shot']);
    const [details, setDetails] = useState<string[]>(['8K', 'Highly Detailed']);
    const [custom, setCustom] = useState('');

    const [finalPrompt, setFinalPrompt] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        const parts = [
            subject.trim(),
            ...styles,
            ...artists.map(a => `by ${a}`),
            ...adjectives,
            ...verbs,
            ...nouns,
            ...lighting,
            ...composition,
            ...details,
            ...custom.trim().split(',').map(s => s.trim()).filter(Boolean),
        ];
        setFinalPrompt(parts.filter(p => p).join(', '));
    }, [subject, styles, artists, adjectives, verbs, nouns, lighting, composition, details, custom]);

    const toggleFactory = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (option: string) => {
        setter(prev => prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(finalPrompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6 max-h-[75vh] lg:max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                <Section title="Neural Subject" tooltip="Define the central entity or action of your image">
                    <textarea
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="Define the primary visual anchor..."
                        className="w-full h-24 bg-white dark:bg-stone-900 border border-amber-100 dark:border-stone-800 rounded-2xl p-4 text-brand-navy dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder-amber-100 dark:placeholder-stone-800"
                    />
                </Section>
                <Section title="Logic Modifiers" tooltip="Refine the behavior and setting of your subject">
                    <MultiSelect label="Adjectives" options={ADJECTIVES} selected={adjectives} toggle={toggleFactory(setAdjectives)} />
                    <MultiSelect label="Verbs" options={VERBS} selected={verbs} toggle={toggleFactory(setVerbs)} />
                    <MultiSelect label="Nouns" options={NOUNS} selected={nouns} toggle={toggleFactory(setNouns)} />
                </Section>
                <Section title="Aesthetic Engine" tooltip="Control the art style and artistic influence">
                    <MultiSelect label="Visual Style" options={IMAGE_STYLES} selected={styles} toggle={toggleFactory(setStyles)} />
                    <MultiSelect label="Artist Influence" options={ARTISTS} selected={artists} toggle={toggleFactory(setArtists)} />
                </Section>
                <Section title="Optical Composition" tooltip="Adjust lighting, camera lenses, and framing">
                    <MultiSelect label="Lighting" options={LIGHTING} selected={lighting} toggle={toggleFactory(setLighting)} />
                    <MultiSelect label="Camera Lens / Angle" options={COMPOSITION} selected={composition} toggle={toggleFactory(setComposition)} />
                </Section>
                <Section title="Synthesized Details" tooltip="Set the final render quality and technical tags">
                    <MultiSelect label="Quality & Render" options={DETAILS} selected={details} toggle={toggleFactory(setDetails)} />
                     <input
                        type="text"
                        value={custom}
                        onChange={e => setCustom(e.target.value)}
                        placeholder="APPEND CUSTOM MATRIX TAGS (COMMA SEPARATED)"
                        className="w-full bg-white dark:bg-stone-900 border border-amber-100 dark:border-stone-800 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-brand-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </Section>
            </div>

            <div className="space-y-8">
                <h3 className="text-xl font-black tracking-tighter uppercase text-orange-600 dark:text-amber-500">Synthesized Inference</h3>
                <div className="relative group">
                    <textarea
                        readOnly
                        value={finalPrompt}
                        className="w-full h-40 bg-white/50 dark:bg-stone-900/50 border border-amber-100 dark:border-stone-800 rounded-[2rem] shadow-inner p-6 text-sm text-stone-800 dark:text-stone-300 font-medium  leading-relaxed resize-none transition-all focus:ring-0"
                    />
                     <div className="absolute top-4 right-4 flex flex-col gap-3">
                        <button onClick={handleCopy} className="p-3 bg-white dark:bg-stone-800 text-orange-600 dark:text-amber-500 rounded-2xl shadow-xl hover:scale-110 transition-all border border-amber-100 dark:border-stone-700" title="Copy the assembled image prompt">
                            {isCopied ? <CheckIcon /> : <CopyIcon />}
                        </button>
                        <button onClick={() => onSavePrompt(finalPrompt)} className="p-3 bg-white dark:bg-stone-800 text-orange-600 dark:text-amber-500 rounded-2xl shadow-xl hover:scale-110 transition-all border border-amber-100 dark:border-stone-700" title="Save this image prompt to collection">
                            <SaveIcon />
                        </button>
                    </div>
                </div>
                
                <button 
                    onClick={() => onGenerateImage(finalPrompt)}
                    disabled={isGenerating || !finalPrompt}
                    title="Transmit this prompt to the Imagen-4 neural core for image synthesis"
                    className="w-full h-20 flex items-center justify-center gap-4 text-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black uppercase tracking-[0.2em] rounded-[2rem] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-wait shadow-2xl shadow-amber-500/30 border-b-8 border-orange-800"
                >
                    {isGenerating ? <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white"></div> : 'INITIALIZE GENERATION'}
                </button>

                <div className="w-full aspect-square bg-amber-50/30 dark:bg-stone-900/30 rounded-[3rem] flex items-center justify-center border-4 border-dashed border-amber-100 dark:border-stone-800 overflow-hidden relative shadow-2xl">
                    {isGenerating && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 animate-pulse">Rendering Neural Data...</p>
                        </div>
                    )}
                    {error && !isGenerating && <p className="text-red-500 font-bold uppercase text-xs tracking-widest text-center p-8">{error}</p>}
                    {generatedImage && !isGenerating && <img src={generatedImage} alt="Generated prompt" className="w-full h-full object-cover animate-fade-in" />}
                    {!generatedImage && !isGenerating && !error && (
                        <div className="text-center space-y-4 opacity-20">
                            <div className="text-6xl ">🖼️</div>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Observatory Standby</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
