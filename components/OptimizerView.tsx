
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { UserContext, OPTIMIZER_CATEGORIES, OptimizerSubCategory, PromptBlock } from '../prompts/collection';
import { generatePrompt, optimizePrompt } from '../services/geminiService';
import { ComposerBlock } from './ComposerBlock';
import { OutputDisplay } from './OutputDisplay';

interface OptimizerViewProps {
    userContexts: UserContext[];
    onSaveNewContext: () => void;
    onDeleteContext: (contextId: string) => void;
    onSavePrompt: (prompt: string) => void;
    addToHistory: (prompt: string) => void;
}

interface ActiveBlock extends PromptBlock {
    id: number;
    isContext?: boolean;
}

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);


export const OptimizerView: React.FC<OptimizerViewProps> = ({ userContexts, onSaveNewContext, onDeleteContext, onSavePrompt, addToHistory }) => {
    const [mainCategory, setMainCategory] = useState(OPTIMIZER_CATEGORIES[0].name);
    const [subCategory, setSubCategory] = useState(OPTIMIZER_CATEGORIES[0].subCategories[0].name);
    const [activeBlocks, setActiveBlocks] = useState<ActiveBlock[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState('');
    const [outputTitle, setOutputTitle] = useState('');
    const [error, setError] = useState<string | null>(null);

    const subCategoryOptions = useMemo(() => {
        return OPTIMIZER_CATEGORIES.find(cat => cat.name === mainCategory)?.subCategories || [];
    }, [mainCategory]);

    const templateBlocks = useMemo(() => {
        return subCategoryOptions.find(sub => sub.name === subCategory)?.blocks || [];
    }, [subCategory, subCategoryOptions]);

    useEffect(() => {
        const defaultSubCategory = OPTIMIZER_CATEGORIES.find(c => c.name === mainCategory)?.subCategories[0];
        if (defaultSubCategory) {
            setSubCategory(defaultSubCategory.name);
        }
    }, [mainCategory]);

    const addBlock = (block: PromptBlock, isContext: boolean = false) => {
        const newBlock: ActiveBlock = { ...block, id: Date.now(), isContext };
        setActiveBlocks(prev => [...prev, newBlock]);
    };

    const removeBlock = (id: number) => {
        setActiveBlocks(prev => prev.filter(b => b.id !== id));
    };

    const updateBlockContent = (id: number, content: string) => {
        setActiveBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
    };
    
    const moveBlock = (id: number, direction: 'up' | 'down') => {
        setActiveBlocks(prev => {
            const index = prev.findIndex(b => b.id === id);
            if (index === -1) return prev;
            const newBlocks = [...prev];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= newBlocks.length) return prev;
            [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
            return newBlocks;
        });
    };

    const getComposedPrompt = useCallback(() => {
        return activeBlocks.map(block => {
            if (block.isContext) {
                return `<context title="${block.label}">\n${block.content}\n</context>`;
            }
            return `${block.label}:\n${block.content}`;
        }).join('\n\n');
    }, [activeBlocks]);

    const handleOptimize = async () => {
        const prompt = getComposedPrompt();
        if (!prompt.trim()) return;
        setIsLoading(true);
        setOutput('');
        setError(null);
        setOutputTitle("Optimized 'Meta-Prompt'");
        try {
            const result = await optimizePrompt(prompt);
            setOutput(result);
            addToHistory(prompt);
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerate = async () => {
        const prompt = getComposedPrompt();
        if (!prompt.trim()) return;
        setIsLoading(true);
        setOutput('');
        setError(null);
        setOutputTitle("Generated Output");
        try {
            // Using default temp/topP, but could be customizable in the future
            const result = await generatePrompt(prompt, 0.8, 0.95);
            setOutput(result);
            addToHistory(prompt);
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const clearAll = () => {
        setActiveBlocks([]);
        setOutput('');
        setError(null);
    }
    
    const composedPrompt = getComposedPrompt();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4 max-h-[75vh] lg:max-h-[70vh] overflow-y-auto pr-2">
                <div className="p-4 bg-gray-100/50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700/50 space-y-3">
                    <h3 className="font-bold text-lg gradient-text">1. Choose a Template</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <select value={mainCategory} onChange={e => setMainCategory(e.target.value)} className="w-full bg-white dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            {OPTIMIZER_CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                        </select>
                        <select value={subCategory} onChange={e => setSubCategory(e.target.value)} className="w-full bg-white dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                           {subCategoryOptions.map(sub => <option key={sub.name} value={sub.name}>{sub.name}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                         {templateBlocks.map(block => (
                            <button key={block.label} onClick={() => addBlock(block)} className="px-3 py-1.5 text-xs font-semibold rounded-full border-2 bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-500 transition-colors">
                                + {block.label}
                            </button>
                        ))}
                    </div>
                </div>
                 <div className="p-4 bg-gray-100/50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700/50 space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg gradient-text">2. Inject Context (Optional)</h3>
                        <button onClick={onSaveNewContext} className="px-3 py-1 text-xs font-bold rounded-md text-white bg-purple-600 hover:bg-purple-500 transition-colors">+ Add New</button>
                    </div>
                    {userContexts.length === 0 ? <p className="text-sm text-gray-500">No contexts saved. Add one to reuse brand guidelines, user personas, and more.</p> : (
                        <div className="space-y-2">
                            {userContexts.map(ctx => (
                                <div key={ctx.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900/50 rounded-md">
                                    <span className="text-sm font-semibold truncate pr-2">{ctx.title}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => addBlock({label: ctx.title, content: ctx.content}, true)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Inject</button>
                                        <button onClick={() => onDeleteContext(ctx.id)} className="text-red-500 hover:text-red-700"><TrashIcon/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="space-y-3">
                    <h3 className="font-bold text-lg gradient-text">3. Compose Your Prompt</h3>
                    {activeBlocks.length === 0 ? <p className="text-sm text-gray-500">Add blocks from a template or inject context to start building your prompt.</p> :
                     activeBlocks.map((block, index) => (
                        <ComposerBlock 
                            key={block.id}
                            id={block.id}
                            label={block.label}
                            content={block.content}
                            onContentChange={updateBlockContent}
                            onRemove={removeBlock}
                            onMove={moveBlock}
                            isFirst={index === 0}
                            isLast={index === activeBlocks.length - 1}
                            isContext={block.isContext}
                        />
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                 <h3 className="font-bold text-lg gradient-text">4. Execute & Refine</h3>
                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleOptimize} disabled={isLoading || !composedPrompt} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">Optimize Prompt</button>
                    <button onClick={handleGenerate} disabled={isLoading || !composedPrompt} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">Generate</button>
                 </div>
                 {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                 <OutputDisplay
                    prompt={output}
                    isLoading={isLoading}
                    onClear={clearAll}
                    onSave={() => onSavePrompt(composedPrompt)}
                    showActions={{ save: true, clear: true }}
                    title={outputTitle}
                 />
            </div>
        </div>
    );
};
