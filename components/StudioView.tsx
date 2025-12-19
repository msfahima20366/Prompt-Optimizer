
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

interface PromptBuilderViewProps {
    onGenerateImage: (prompt: string) => void;
    isGenerating: boolean;
    generatedImage: string | null;
    error: string | null;
    onSavePrompt: (prompt: string) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-4 bg-islamic-emerald/5 dark:bg-islamic-emerald/10 p-6 mihrab-shape border border-islamic-gold/10">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-islamic-gold">{title}</h3>
        {children}
    </div>
);

const MultiSelect: React.FC<{ label: string; options: string[], selected: string[], toggle: (option: string) => void }> = ({ label, options, selected, toggle }) => (
    <div>
        <label className="block text-[9px] font-bold text-islamic-emerald/50 dark:text-islamic-gold/50 uppercase tracking-[0.3em] mb-3">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    key={option}
                    onClick={() => toggle(option)}
                    className={`px-4 py-2 text-[9px] font-bold uppercase tracking-tighter rounded-full border transition-all duration-500 ${selected.includes(option) ? 'bg-islamic-emerald text-islamic-gold border-islamic-gold shadow-mihrab' : 'bg-transparent text-islamic-emerald dark:text-islamic-gold border-islamic-gold/20 hover:border-islamic-gold'}`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);


export const PromptBuilderView: React.FC<PromptBuilderViewProps> = ({ onGenerateImage, isGenerating, generatedImage, error, onSavePrompt }) => {
    const [subject, setSubject] = useState('A celestial garden of emerald and gold');
    const [styles, setStyles] = useState<string[]>(['Photorealistic']);
    const [artists, setArtists] = useState<string[]>([]);
    const [adjectives, setAdjectives] = useState<string[]>(['Epic']);
    const [verbs, setVerbs] = useState<string[]>([]);
    const [nouns, setNouns] = useState<string[]>([]);
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar">
                <Section title="Sacred Subject">
                    <textarea
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="Define the primary visual anchor..."
                        className="w-full h-24 bg-white dark:bg-slate-900/50 border border-islamic-gold/20 rounded-2xl p-4 text-islamic-emerald dark:text-islamic-gold font-serif italic text-xl outline-none focus:border-islamic-gold transition-all"
                    />
                </Section>
                <Section title="Adornments">
                    <MultiSelect label="Adjectives" options={ADJECTIVES} selected={adjectives} toggle={toggleFactory(setAdjectives)} />
                    <MultiSelect label="Artistic Influence" options={IMAGE_STYLES} selected={styles} toggle={toggleFactory(setStyles)} />
                </Section>
                <Section title="Illumination & Perspective">
                    <MultiSelect label="Radiance" options={LIGHTING} selected={lighting} toggle={toggleFactory(setLighting)} />
                    <MultiSelect label="Celestial Angle" options={COMPOSITION} selected={composition} toggle={toggleFactory(setComposition)} />
                </Section>
                <Section title="Atomic Detail">
                    <MultiSelect label="Render Quality" options={DETAILS} selected={details} toggle={toggleFactory(setDetails)} />
                     <input
                        type="text"
                        value={custom}
                        onChange={e => setCustom(e.target.value)}
                        placeholder="APPEND CUSTOM SCROLL TAGS (COMMA SEPARATED)"
                        className="w-full bg-white dark:bg-slate-900/50 border border-islamic-gold/20 rounded-xl px-4 py-3 text-[9px] font-bold uppercase tracking-[0.2em] text-islamic-emerald dark:text-islamic-gold outline-none focus:border-islamic-gold"
                    />
                </Section>
            </div>

            <div className="space-y-10">
                <h3 className="text-2xl font-serif italic text-islamic-emerald dark:text-islamic-gold border-b border-islamic-gold/20 pb-4">Illuminated Result</h3>
                <div className="relative group">
                    <textarea
                        readOnly
                        value={finalPrompt}
                        className="w-full h-40 bg-islamic-cream/30 dark:bg-black/20 border border-islamic-gold/20 rounded-[2rem] p-8 text-sm text-islamic-emerald dark:text-islamic-gold/80 font-medium leading-relaxed resize-none outline-none"
                    />
                     <div className="absolute top-4 right-4 flex flex-col gap-3">
                        <button onClick={handleCopy} className="p-3 bg-white dark:bg-islamic-emerald text-islamic-gold rounded-full shadow-lg hover:scale-110 transition-all border border-islamic-gold/20">
                            {isCopied ? <CheckIcon /> : <CopyIcon />}
                        </button>
                        <button onClick={() => onSavePrompt(finalPrompt)} className="p-3 bg-white dark:bg-islamic-emerald text-islamic-gold rounded-full shadow-lg hover:scale-110 transition-all border border-islamic-gold/20">
                            <SaveIcon />
                        </button>
                    </div>
                </div>
                
                <button 
                    onClick={() => onGenerateImage(finalPrompt)}
                    disabled={isGenerating || !finalPrompt}
                    className="w-full h-20 gradient-gold text-white font-bold uppercase tracking-[0.4em] text-xs rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-gold border-b-4 border-yellow-800"
                >
                    {isGenerating ? "Summoning Visuals..." : "Initialize Illumination"}
                </button>

                <div className="w-full aspect-square bg-white dark:bg-islamic-emerald/10 mihrab-shape flex items-center justify-center border-2 border-dashed border-islamic-gold/30 overflow-hidden relative shadow-mihrab group">
                    {isGenerating && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-2 border-islamic-gold border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-islamic-gold animate-pulse">Painting from thought...</p>
                        </div>
                    )}
                    {error && !isGenerating && <p className="text-red-600 font-bold uppercase text-[10px] tracking-widest text-center p-8">{error}</p>}
                    {generatedImage && !isGenerating && <img src={generatedImage} alt="Generated result" className="w-full h-full object-cover animate-fade-in" />}
                    {!generatedImage && !isGenerating && !error && (
                        <div className="text-center space-y-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <div className="text-6xl">🕌</div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.6em] text-islamic-emerald dark:text-islamic-gold">Visual Sanctuary</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
