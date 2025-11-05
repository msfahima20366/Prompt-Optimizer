import React, { useState, useMemo } from 'react';
import { generatePrompt } from '../services/geminiService';

interface Result {
    prompt: string;
    output: string;
    params: { temp: number; topP: number };
    error?: string;
}

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
);

export const MatrixView: React.FC = () => {
    const [basePrompt, setBasePrompt] = useState('Create a marketing slogan for a {{product}} with a {{tone}} tone.');
    const [variableValues, setVariableValues] = useState<{ [key: string]: string }>({ product: 'coffee shop, ergonomic chair', tone: 'witty, professional' });
    const [temperatures, setTemperatures] = useState('0.7, 1.0');
    const [topPs, setTopPs] = useState('0.95');
    
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

        const varLists: { [key: string]: string[] } = {};
        for (const variable of variables) {
            varLists[variable] = (variableValues[variable] || '').split(',').map(s => s.trim()).filter(Boolean);
        }

        const promptCombinations: { [key: string]: string }[] = [];
        const generatePromptCombinations = (index: number, currentCombination: { [key: string]: string }) => {
            if (index === variables.length) {
                promptCombinations.push({ ...currentCombination });
                return;
            }
            const variable = variables[index];
            const values = varLists[variable].length > 0 ? varLists[variable] : [''];
            for (const value of values) {
                currentCombination[variable] = value;
                generatePromptCombinations(index + 1, currentCombination);
            }
        };
        generatePromptCombinations(0, {});

        const tempValues = temperatures.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n >= 0 && n <= 1);
        const topPValues = topPs.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n >= 0 && n <= 1);

        if (promptCombinations.length === 0 || tempValues.length === 0 || topPValues.length === 0) {
            setError('Please provide valid variables and parameters.');
            setIsLoading(false);
            return;
        }

        const allRuns: { prompt: string; params: { temp: number; topP: number } }[] = [];
        promptCombinations.forEach(combo => {
            const promptText = basePrompt.replace(/{{\s*(\w+)\s*}}/g, (_, varName) => combo[varName] || '');
            tempValues.forEach(temp => {
                topPValues.forEach(topP => {
                    allRuns.push({ prompt: promptText, params: { temp, topP } });
                });
            });
        });
        
        const promises = allRuns.map(run => 
            generatePrompt(run.prompt, run.params.temp, run.params.topP)
                .then(output => ({ ...run, output }))
                .catch(e => ({ ...run, output: '', error: e instanceof Error ? e.message : 'Failed to generate' }))
        );

        const settledResults = await Promise.all(promises);
        setResults(settledResults);
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold gradient-text mb-2">Parameter Matrix</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Test prompt templates with multiple variables AND AI parameters to find the optimal combination for your needs.</p>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">2. Variable Values</h3>
                        {variables.length > 0 ? (
                            <div className="space-y-3 p-4 bg-gray-100/50 dark:bg-gray-800/40 rounded-lg h-full">
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
                            <p className="text-xs text-gray-500 dark:text-gray-500 p-4 bg-gray-100/50 dark:bg-gray-800/40 rounded-lg">No variables found in the base prompt.</p>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">3. AI Parameters</h3>
                         <div className="space-y-3 p-4 bg-gray-100/50 dark:bg-gray-800/40 rounded-lg h-full">
                            <div>
                                <label htmlFor="param-temp" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Temperature (0.0 - 1.0)</label>
                                <input
                                    type="text"
                                    id="param-temp"
                                    value={temperatures}
                                    onChange={e => setTemperatures(e.target.value)}
                                    placeholder="e.g., 0.7, 1.0"
                                    className="w-full bg-white dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                             <div>
                                <label htmlFor="param-topp" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Top-P (0.0 - 1.0)</label>
                                <input
                                    type="text"
                                    id="param-topp"
                                    value={topPs}
                                    onChange={e => setTopPs(e.target.value)}
                                    placeholder="e.g., 0.95"
                                    className="w-full bg-white dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
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
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-gray-500 dark:text-gray-500 mb-2">
                                    <span>{result.prompt}</span>
                                    <span className="font-semibold">Temp: {result.params.temp}</span>
                                    <span className="font-semibold">TopP: {result.params.topP}</span>
                                </div>
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
