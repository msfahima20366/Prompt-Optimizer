
import React, { useState, useEffect } from 'react';
import { ARTISTS, CAMERA_ANGLES, CAMERA_LENSES, DETAILS, IMAGE_STYLES, LIGHTING } from '../prompts/imagePrompts';

interface ImageStudioViewProps {
    onUsePrompt: (prompt: string) => void;
}

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z" /></svg>
);
const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-3 bg-gray-100/50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700/50">
        <h3 className="font-bold text-gray-800 dark:text-gray-200">{title}</h3>
        {children}
    </div>
);

const TagInput: React.FC<{ label: string, value: string, onChange: (value: string) => void, placeholder: string }> = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{label}</label>
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white dark:bg-gray-800/80 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
    </div>
);

const MultiSelect: React.FC<{ label: string, options: string[], selected: string[], toggle: (option: string) => void }> = ({ label, options, selected, toggle }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    key={option}
                    onClick={() => toggle(option)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-colors ${selected.includes(option) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-500'}`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

export const ImageStudioView: React.FC<ImageStudioViewProps> = ({ onUsePrompt }) => {
    const [subject, setSubject] = useState('');
    const [styles, setStyles] = useState<string[]>(['Photorealistic']);
    const [artists, setArtists] = useState<string[]>(['Greg Rutkowski']);
    const [lighting, setLighting] = useState<string[]>(['Cinematic Lighting']);
    const [lenses, setLenses] = useState<string[]>([]);
    const [angles, setAngles] = useState<string[]>(['Medium Shot']);
    const [details, setDetails] = useState<string[]>(['8K', 'Highly Detailed']);
    const [custom, setCustom] = useState('');

    const [finalPrompt, setFinalPrompt] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        const parts = [
            subject.trim(),
            ...styles,
            ...artists.map(a => `by ${a}`),
            ...lighting,
            ...lenses,
            ...angles,
            ...details,
            custom.trim()
        ];
        setFinalPrompt(parts.filter(p => p).join(', '));
    }, [subject, styles, artists, lighting, lenses, angles, details, custom]);

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
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <Section title="1. Subject & Core Idea">
                    <TagInput label="What do you want to see?" value={subject} onChange={setSubject} placeholder="e.g., A majestic lion in a futuristic city" />
                </Section>
                <Section title="2. Style & Artist">
                    <MultiSelect label="Visual Style" options={IMAGE_STYLES} selected={styles} toggle={toggleFactory(setStyles)} />
                    <MultiSelect label="Artist Influence" options={ARTISTS} selected={artists} toggle={toggleFactory(setArtists)} />
                </Section>
                <Section title="3. Composition">
                    <MultiSelect label="Lighting" options={LIGHTING} selected={lighting} toggle={toggleFactory(setLighting)} />
                    <MultiSelect label="Camera Lens" options={CAMERA_LENSES} selected={lenses} toggle={toggleFactory(setLenses)} />
                    <MultiSelect label="Camera Angle" options={CAMERA_ANGLES} selected={angles} toggle={toggleFactory(setAngles)} />
                </Section>
                 <Section title="4. Details & Customization">
                    <MultiSelect label="Quality & Render" options={DETAILS} selected={details} toggle={toggleFactory(setDetails)} />
                    <TagInput label="Custom Tags" value={custom} onChange={setCustom} placeholder="e.g., vibrant colors, --ar 16:9" />
                </Section>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-bold gradient-text">Final Prompt</h3>
                <div className="relative">
                    <textarea
                        readOnly
                        value={finalPrompt}
                        className="w-full h-64 bg-white dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg shadow-inner p-4 text-gray-900 dark:text-gray-300 resize-none"
                    />
                     <button onClick={handleCopy} className="absolute top-3 right-3 p-2 bg-gray-200 dark:bg-gray-700/80 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        {isCopied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                </div>
                <button 
                    onClick={() => onUsePrompt(finalPrompt)}
                    className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
                    disabled={!finalPrompt}
                >
                    Use in Studio
                </button>
                 <p className="text-center text-xs text-gray-500 dark:text-gray-500">
                    Note: The Studio is text-based. Copy this prompt to your favorite image generation tool.
                </p>
            </div>
        </div>
    );
};
