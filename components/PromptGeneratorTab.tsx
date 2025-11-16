import React, { useState, useMemo } from 'react';
import { genres, moods, instruments, synths } from '../constants';
import { generateMusicPrompt, generatePromptFromSong } from '../services/geminiService';
import { Button } from './common/Button';
import { FormGroup, Textarea } from './common/FormControls';
import { OptionGrid } from './OptionGrid';
import { ProgressBar } from './ProgressBar';
import { SongAnalysisForm } from './SongAnalysisForm';

const TOTAL_STEPS = 6;

const stepTitles: { [key: number]: string } = {
    1: "Choose a Genre Category",
    2: "Choose Subgenre(s)",
    3: "What's the Mood?",
    4: "Pick some Instruments",
    5: "Add Synths & Sound Design",
    6: "Final Review & Details"
};

export const PromptGeneratorTab: React.FC = () => {
    const [mode, setMode] = useState<'choice' | 'manual' | 'analysis'>('choice');
    
    // Wizard state
    const [step, setStep] = useState(1);

    // Selections state
    const [genreCategory, setGenreCategory] = useState('');
    const [selectedSubgenres, setSelectedSubgenres] = useState<string[]>([]);
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
    const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
    const [selectedSynths, setSelectedSynths] = useState<string[]>([]);
    const [details, setDetails] = useState('');

    // API state
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState('');

    const subgenres = useMemo(() => genreCategory ? genres[genreCategory] : [], [genreCategory]);

    const handleGenreSelect = (option: string) => {
        setGenreCategory(option);
        setSelectedSubgenres([]);
        setStep(2);
    };

    const createMultiSelectHandler = (
        selected: string[],
        setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => (option: string) => {
        setter(prev => prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]);
    };
    
    const handleManualGenerate = async () => {
        setIsLoading(true);
        setGeneratedPrompt('🧙 The Wizard is crafting your perfect prompt...');
        
        const selections = [
            `Genre: ${genreCategory}`,
            selectedSubgenres.length > 0 && `Subgenre(s): ${selectedSubgenres.join(', ')}`,
            selectedMoods.length > 0 && `Mood/Atmosphere: ${selectedMoods.join(', ')}`,
            selectedInstruments.length > 0 && `Instruments: ${selectedInstruments.join(', ')}`,
            selectedSynths.length > 0 && `Synths/Sounds: ${selectedSynths.join(', ')}`,
            details && `Details: ${details}`
        ].filter(Boolean).join('. ');

        const userIntent = `Create a music production prompt for an AI.
        
Lead with the genre and subgenre. The music MUST strictly follow the conventions of ${genreCategory}.

Weave the following elements into a single, creative, and slightly exaggerated paragraph: ${selections}.

The output should be just one paragraph. Do NOT add extra sections for BPM, arrangement, structure, or mixing notes. Just the evocative description.`;

        try {
            const prompt = await generateMusicPrompt(userIntent);
            setGeneratedPrompt(prompt);
        } catch (error) {
            setGeneratedPrompt('Error generating prompt. Please check your connection and API key.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnalyze = async (query: string) => {
      setIsLoading(true);
      setGeneratedPrompt('🧙 The Wizard is analyzing the song...');

      try {
        const prompt = await generatePromptFromSong(query);
        setGeneratedPrompt(prompt);
      } catch (error) {
        setGeneratedPrompt('Error generating prompt from song analysis. Please check your connection and API key.');
      } finally {
        setIsLoading(false);
      }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPrompt).then(() => {
            alert('Prompt copied to clipboard! ✨');
        });
    };

    const resetWizard = () => {
        setStep(1);
        setGenreCategory('');
        setSelectedSubgenres([]);
        setSelectedMoods([]);
        setSelectedInstruments([]);
        setSelectedSynths([]);
        setDetails('');
        setGeneratedPrompt('');
        setMode('choice');
    };

    const renderSummaryItem = (title: string, items: string[]) => {
        if (items.length === 0) return null;
        return (
            <div>
                <h4 className="font-semibold text-fuchsia-400">{title}</h4>
                <p className="text-violet-300 text-sm">{items.join(', ')}</p>
            </div>
        )
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return <OptionGrid title={stepTitles[step]} options={Object.keys(genres)} selectedOptions={[genreCategory]} onSelect={handleGenreSelect} multiSelect={false} />;
            case 2:
                return <OptionGrid title={`${stepTitles[step]} for ${genreCategory}`} options={subgenres} selectedOptions={selectedSubgenres} onSelect={createMultiSelectHandler(selectedSubgenres, setSelectedSubgenres)} />;
            case 3:
                return <OptionGrid title={stepTitles[step]} options={moods} selectedOptions={selectedMoods} onSelect={createMultiSelectHandler(selectedMoods, setSelectedMoods)} />;
            case 4:
                return <OptionGrid title={stepTitles[step]} options={instruments} selectedOptions={selectedInstruments} onSelect={createMultiSelectHandler(selectedInstruments, setSelectedInstruments)} />;
            case 5:
                return <OptionGrid title={stepTitles[step]} options={synths} selectedOptions={selectedSynths} onSelect={createMultiSelectHandler(selectedSynths, setSelectedSynths)} />;
            case 6:
                return (
                    <div>
                         <h3 className="text-xl font-bold text-cyan-400 mb-4">{stepTitles[step]}</h3>
                         <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700 mb-4">
                            {renderSummaryItem("Genre", [genreCategory])}
                            {renderSummaryItem("Subgenres", selectedSubgenres)}
                            {renderSummaryItem("Moods", selectedMoods)}
                            {renderSummaryItem("Instruments", selectedInstruments)}
                            {renderSummaryItem("Synths", selectedSynths)}
                         </div>
                         <FormGroup label="Additional Details (optional)">
                            <Textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Any specific requirements..."/>
                        </FormGroup>
                    </div>
                )
            default:
                return null;
        }
    };

    const renderContent = () => {
        if (generatedPrompt) {
            return (
                <div className="bg-slate-900/60 border-2 border-fuchsia-900/50 rounded-2xl p-4 mt-5 animate-fade-in">
                    <h3 className="text-xl font-bold text-cyan-400 mb-2">Your AI Music Prompt</h3>
                    <Textarea value={generatedPrompt} readOnly className="min-h-[200px] bg-slate-800/80"/>
                    <div className="flex gap-3 mt-3">
                         <Button onClick={copyToClipboard}>Copy to Clipboard 📋</Button>
                         <Button onClick={resetWizard} variant="secondary">Start Over</Button>
                    </div>
                </div>
            );
        }

        switch (mode) {
            case 'choice':
                return (
                    <div className="text-center p-8 bg-slate-900/60 border-2 border-fuchsia-900/50 rounded-2xl animate-fade-in">
                        <h3 className="text-xl font-bold text-cyan-400 mb-4">How would you like to start?</h3>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <Button onClick={() => setMode('manual')} className="w-full md:w-auto">✍️ Build Manually (Step-by-Step)</Button>
                            <Button onClick={() => setMode('analysis')} variant="secondary" className="w-full md:w-auto">🎵 Analyze a Song</Button>
                        </div>
                    </div>
                );
            case 'manual':
                 return (
                    <div className="bg-slate-900/60 border-2 border-fuchsia-900/50 rounded-2xl p-6">
                        <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
                        <div className="min-h-[300px]">
                            {renderStepContent()}
                        </div>
                        <div className="flex justify-between items-center mt-6 border-t border-slate-700 pt-4">
                            <div>
                                <Button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} variant="secondary">Back</Button>
                                <Button onClick={() => setMode('choice')} variant="secondary" className="ml-2">Home</Button>
                            </div>
                            
                            {step === TOTAL_STEPS ? (
                                <Button onClick={handleManualGenerate} disabled={isLoading}>{isLoading ? 'Generating...' : 'Generate Prompt ✨'}</Button>
                            ) : (
                                <Button onClick={() => setStep(s => Math.min(TOTAL_STEPS, s + 1))} disabled={(step === 1 && !genreCategory) || (step === 2 && !genreCategory) }>Next</Button>
                            )}
                        </div>
                    </div>
                );
            case 'analysis':
                 return (
                    <div className="bg-slate-900/60 border-2 border-fuchsia-900/50 rounded-2xl p-6 animate-fade-in">
                        <SongAnalysisForm onAnalyze={handleAnalyze} isLoading={isLoading} />
                        <div className="mt-6 border-t border-slate-700 pt-4">
                            <Button onClick={() => setMode('choice')} variant="secondary">Back</Button>
                        </div>
                    </div>
                 );
        }
    }


    return (
        <div>
            <h2 className="text-2xl font-bold text-fuchsia-400 mb-2">✍️ AI Prompt Generator</h2>
            <p className="text-violet-400 mb-5">Build your perfect music prompt step-by-step, or analyze an existing song.</p>
            {renderContent()}
        </div>
    );
};
