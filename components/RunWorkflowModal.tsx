import React, { useState, useMemo } from 'react';
import { Workflow, Prompt } from '../prompts/collection';
import { generatePrompt } from '../services/geminiService';

interface RunWorkflowModalProps {
    workflow: Workflow;
    userCollection: Prompt[];
    onClose: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

export const RunWorkflowModal: React.FC<RunWorkflowModalProps> = ({ workflow, userCollection, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [outputs, setOutputs] = useState<(string | null)[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const prompts = useMemo(() => {
        return workflow.promptIds.map(id => userCollection.find(p => p.id === id)).filter((p): p is Prompt => !!p);
    }, [workflow, userCollection]);

    const handleRunStep = async () => {
        setIsLoading(true);
        setError(null);
        
        let promptText = prompts[currentStep].prompt;
        outputs.forEach((output, index) => {
            if (output) {
                const regex = new RegExp(`{{\\s*output_${index + 1}\\s*}}`, 'g');
                promptText = promptText.replace(regex, output);
            }
        });
        
        try {
            // FIX: generatePrompt expects 3 arguments (prompt, temperature, topP). Using default values.
            const result = await generatePrompt(promptText, 0.8, 0.95);
            setOutputs(prev => {
                const newOutputs = [...prev];
                newOutputs[currentStep] = result;
                return newOutputs;
            });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
            setOutputs(prev => {
                const newOutputs = [...prev];
                newOutputs[currentStep] = null;
                return newOutputs;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const isLastStep = currentStep >= prompts.length - 1;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-fuchsia-500/30 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold gradient-text">Running Workflow: {workflow.title}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Step {currentStep + 1} of {prompts.length}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Close</button>
                </header>

                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                    {prompts.map((prompt, index) => (
                         <div key={`${prompt.id}-${index}`} className={`p-4 rounded-lg border-2 ${currentStep === index ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'bg-gray-50 dark:bg-gray-800/40 border-transparent'}`}>
                            <h3 className="font-bold text-gray-800 dark:text-gray-200">Step {index + 1}: {prompt.title}</h3>
                            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-2 whitespace-pre-wrap">{prompt.prompt}</p>
                            {outputs.length > index && outputs[index] !== null && (
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Output</h4>
                                    <p className="text-sm bg-white dark:bg-gray-900/50 p-2 rounded whitespace-pre-wrap">{outputs[index]}</p>
                                </div>
                            )}
                         </div>
                    ))}
                </div>
                
                <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700/50 space-y-2">
                    {error && <p className="text-sm text-red-500 text-center mb-2">{error}</p>}
                    <div className="flex justify-end items-center gap-4">
                        <button 
                            onClick={handleRunStep} 
                            disabled={isLoading || outputs[currentStep] !== undefined}
                            className="px-5 py-2.5 text-base font-bold rounded-md text-gray-800 bg-gray-200 hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Running...' : outputs[currentStep] !== undefined ? 'Step Complete' : `Run Step ${currentStep + 1}`}
                        </button>
                        <button
                            onClick={isLastStep ? onClose : () => setCurrentStep(c => c + 1)}
                            disabled={isLoading || outputs[currentStep] === undefined || outputs[currentStep] === null}
                            className="px-5 py-2.5 text-base font-bold rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLastStep ? 'Finish' : 'Next Step'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};