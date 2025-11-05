

import React, { useState, useEffect } from 'react';
import { ARTISTS, COMPOSITION, DETAILS, IMAGE_STYLES, LIGHTING, ADJECTIVES, VERBS, NOUNS } from '../prompts/imagePrompts';

// --- ICONS ---
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
// --- END ICONS ---


interface PromptBuilderViewProps {
    onGenerateImage: (prompt: string) => void;
    isGenerating: boolean;
    generatedImage: string | null;
    error: string | null;
    onSavePrompt: (prompt: string) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-3 bg-gray-100/50 dark:bg-gray-800/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700/50">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        {children}
    </div>
);

// FIX: Added 'label' to the props interface and rendered it.
const MultiSelect: React.FC<{ label: string; options: string[], selected: string[], toggle: (option: string) => void }> = ({ label, options, selected, toggle }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    key={option}
                    onClick={() => toggle(option)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-colors ${selected.includes(option) ? 'bg-amber-500 text-white border-amber-500' : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-amber-500'}`}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4 max-h-[75vh] lg:max-h-[70vh] overflow-y-auto pr-2">
                <Section title="Subject">
                    <textarea
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="e.g., A majestic lion in a futuristic city"
                        className="w-full h-24 bg-white dark:bg-gray-800/80 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </Section>
                <Section title="Modifiers">
                    <MultiSelect label="Adjectives" options={ADJECTIVES} selected={adjectives} toggle={toggleFactory(setAdjectives)} />
                    <MultiSelect label="Verbs" options={VERBS} selected={verbs} toggle={toggleFactory(setVerbs)} />
                    <MultiSelect label="Nouns" options={NOUNS} selected={nouns} toggle={toggleFactory(setNouns)} />
                </Section>
                <Section title="Style & Artist">
                    <MultiSelect label="Visual Style" options={IMAGE_STYLES} selected={styles} toggle={toggleFactory(setStyles)} />
                    <MultiSelect label="Artist Influence" options={ARTISTS} selected={artists} toggle={toggleFactory(setArtists)} />
                </Section>
                <Section title="Lighting & Composition">
                    <MultiSelect label="Lighting" options={LIGHTING} selected={lighting} toggle={toggleFactory(setLighting)} />
                    <MultiSelect label="Composition" options={COMPOSITION} selected={composition} toggle={toggleFactory(setComposition)} />
                </Section>
                <Section title="Details & Customization">
                    <MultiSelect label="Quality & Render" options={DETAILS} selected={details} toggle={toggleFactory(setDetails)} />
                     <input
                        type="text"
                        value={custom}
                        onChange={e => setCustom(e.target.value)}
                        placeholder="Add your own custom tags, comma separated"
                        className="w-full bg-white dark:bg-gray-800/80 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </Section>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold gradient-text">Final Prompt & Image</h3>
                <div className="relative">
                    <textarea
                        readOnly
                        value={finalPrompt}
                        className="w-full h-32 bg-white dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg shadow-inner p-3 text-sm text-gray-900 dark:text-gray-300 resize-none"
                    />
                     <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <button onClick={handleCopy} className="p-2 bg-gray-200 dark:bg-gray-700/80 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" title="Copy Prompt">
                            {isCopied ? <CheckIcon /> : <CopyIcon />}
                        </button>
                        <button onClick={() => onSavePrompt(finalPrompt)} className="p-2 bg-gray-200 dark:bg-gray-700/80 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" title="Save Prompt">
                            <SaveIcon />
                        </button>
                    </div>
                </div>
                <button 
                    onClick={() => onGenerateImage(finalPrompt)}
                    disabled={isGenerating || !finalPrompt}
                    className="w-full h-14 flex items-center justify-center gap-3 text-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait"
                >
                    {isGenerating ? <LoadingSpinner /> : '🍌 Generate Image 🍌'}
                </button>
                <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 overflow-hidden">
                    {isGenerating && <p className="text-gray-500 dark:text-gray-400 animate-pulse">Generating your masterpiece...</p>}
                    {error && !isGenerating && <p className="text-red-500 text-center p-4">{error}</p>}
                    {generatedImage && !isGenerating && <img src={generatedImage} alt="Generated prompt" className="w-full h-full object-contain" />}
                    {!generatedImage && !isGenerating && !error && <p className="text-gray-500 dark:text-gray-400">Your image will appear here</p>}
                </div>
            </div>
        </div>
    );
};
