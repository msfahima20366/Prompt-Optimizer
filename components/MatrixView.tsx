import React, { useState, useMemo } from 'react';
import { generatePrompt } from '../services/geminiService';

interface Result {
    prompt: string;
    output: string;
    error?: string;
}

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
);

export const MatrixView: React.FC = () => {
    const [basePrompt, setBasePrompt] = useState('Create a marketing slogan for a {{product}} with a {{tone}} tone.');
    const [variableValues, setVariableValues] = useState<{ [key: string]: string }>({ product: 'coffee shop, ergonomic chair', tone: 'witty, professional' });
    const [results, setResults] = useState<Result[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const variables = useMemo(() => {
        const regex = /{{\s*(\w+)\s*}}/g;
        const matches = [...basePrompt.matchAll(regex)];
        return [...new Set(matches.map(match => match[1]))];
    }, [basePrompt]);

    const handleVariableChange = (variable: string, value: string) => {
        setVariableValues(prev => ({ ...prev, [variable]: value }));
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setResults([]);

        const combinations: { [key: string]: string }[] = [];
        const varLists: { [key: string]: string[] } = {};

        for (const variable of variables) {
            varLists[variable] = (variableValues[variable] || '').split(',').map(s => s.trim()).filter(Boolean);
        }

        const generateCombinations = (index: number, currentCombination: { [key: string]: string }) => {
            if (index === variables.length) {
                combinations.push({ ...currentCombination });
                return;
            }

            const variable = variables[index];
            const values = varLists[variable].length > 0 ? varLists[variable] : [''];

            for (const value of values) {
                currentCombination[variable] = value;
                generateCombinations(index + 1, currentCombination);
            }
        };

        generateCombinations(0, {});

        if (combinations.length === 0) {
            setError('No prompt combinations could be generated. Please check your variables and values.');
            setIsLoading(false);
            return;
        }

        const generatedPrompts = combinations.map(combo => {
            return basePrompt.replace(/{{\s*(\w+)\s*}}/g, (_, varName) => combo[varName] || '');
        });
        
        const promises = generatedPrompts.map(prompt => 
            // FIX: generatePrompt expects 3 arguments (prompt, temperature, topP). Using default values.
            generatePrompt(prompt, 0.8, 0.95)
                .then(output => ({ prompt, output }))
                .catch(e => ({ prompt, output: '', error: e.message || 'Failed to generate' }))
        );

        const settledResults = await Promise.all(promises);
        setResults(settledResults);
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold gradient-text mb-2">Matrix Generator</h2>
                {/* Fix: Wrapped the example variable in a JS expression to avoid a TSX parsing error. */}
                <p className="text-sm text-gray-600 dark:text-gray-400">Create a prompt template with variables like {'`{{variable_name}}`'}, then provide comma-separated values to generate all combinations.</p>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="base-prompt" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">1. Base Prompt Template</label>
                    <textarea
                        id="base-prompt"
                        rows={4}
                        value={basePrompt}
                        onChange={e => setBasePrompt(e.target.value)}
                        className="w-full bg-white dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">2. Variable Values</h3>
                    {variables.length > 0 ? (
                        <div className="space-y-3 p-4 bg-gray-100/50 dark:bg-gray-800/40 rounded-lg">
                            {variables.map(variable => (
                                <div key={variable}>
                                    <label htmlFor={`var-${variable}`} className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{`{{${variable}}}`}</label>
                                    <input
                                        type="text"
                                        id={`var-${variable}`}
                                        value={variableValues[variable] || ''}
                                        onChange={e => handleVariableChange(variable, e.target.value)}
                                        placeholder="e.g., value1, value2, value3"
                                        className="w-full bg-white dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-500">No variables found in the base prompt.</p>
                    )}
                </div>

                <div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isLoading && <LoadingSpinner />}
                        Generate Combinations
                    </button>
                    {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold gradient-text">Results</h3>
                {isLoading && <p className="text-center text-gray-500 dark:text-gray-400">Generating... this may take a moment.</p>}
                {results.length > 0 && (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {results.map((result, index) => (
                            <div key={index} className="p-4 bg-gray-100/50 dark:bg-gray-800/40 rounded-lg">
                                <p className="text-xs font-mono text-gray-500 dark:text-gray-500 mb-2">{result.prompt}</p>
                                <div className="p-3 bg-white dark:bg-gray-900/50 rounded-md">
                                    {result.error ? (
                                        <p className="text-sm text-red-500">{result.error}</p>
                                    ) : (
                                        <p className="text-sm text-gray-800 dark:text-gray-200">{result.output}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};