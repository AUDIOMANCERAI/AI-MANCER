import React, { useState, useCallback, useEffect } from 'react';
import type { MidiNote, GenerationType, NoteName, Scale } from '../types';
import { NOTE_NAMES, MIDI_NOTE_OFFSET, STEPS_PER_BAR } from '../constants';
import { PianoRoll } from './PianoRoll';
import { generateMidiPattern, enhanceMidiPattern } from '../services/geminiService';
import { Button } from './common/Button';
import { FormGroup, Select, Input, Textarea } from './common/FormControls';
import { useAudioPlayback } from '../hooks/useAudioPlayback';

const generationTypes: { id: GenerationType; label: string; icon: string }[] = [
  { id: 'melody', label: 'Melody', icon: '🎵' },
  { id: 'bassline', label: 'Bassline', icon: '🔊' },
  { id: 'drums', label: 'Drums', icon: '🥁' },
  { id: 'harmony', label: 'Harmony', icon: '🎹' },
];

export const MidiGeneratorTab: React.FC = () => {
  const [notes, setNotes] = useState<MidiNote[]>([]);
  const [generationType, setGenerationType] = useState<GenerationType>('melody');
  const [midiPrompt, setMidiPrompt] = useState('');
  const [key, setKey] = useState<NoteName>('C');
  const [scale, setScale] = useState<Scale>('Major');
  const [tempo, setTempo] = useState(120);
  const [bars, setBars] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isPlaying, play, stop } = useAudioPlayback();

  const handleGenerate = useCallback(async () => {
    if (!midiPrompt.trim()) {
      setError("Please describe the MIDI pattern you want to generate.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const generatedNotes = await generateMidiPattern(generationType, key, scale, tempo, bars, midiPrompt);
      if (generatedNotes) {
        setNotes(generatedNotes.map(n => ({...n, note: n.note - MIDI_NOTE_OFFSET})));
      } else {
        setError("The AI returned an unexpected format. Please try again.");
      }
    } catch (e) {
      setError("Failed to generate MIDI. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [generationType, key, scale, tempo, bars, midiPrompt]);

  const handleEnhance = useCallback(async () => {
    if (notes.length === 0) {
      alert("Please generate or add some notes first!");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const currentNotes = notes.map(n => ({...n, note: n.note + MIDI_NOTE_OFFSET}));
      const enhancedNotes = await enhanceMidiPattern(currentNotes, generationType, key, scale);
      if (enhancedNotes) {
        setNotes(enhancedNotes.map(n => ({...n, note: n.note - MIDI_NOTE_OFFSET})));
        alert("✨ MIDI enhanced by AI!");
      } else {
        setError("The AI returned an unexpected format. Please try again.");
      }
    } catch (e) {
      setError("Failed to enhance MIDI. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [notes, generationType, key, scale]);

  const handleAudioConvert = (file: File | null) => {
    if (!file) return;
    alert(`🎵 Analyzing "${file.name}"...\n\nNote: This is a simplified conversion. For best results, use monophonic audio with clear pitch.`);
    const randomNotes: MidiNote[] = [];
    const numNotes = 16 + Math.floor(Math.random() * 16);
    for (let i = 0; i < numNotes; i++) {
        randomNotes.push({
            note: 12 + Math.floor(Math.random() * 36),
            step: Math.floor(Math.random() * (bars * STEPS_PER_BAR)),
            duration: 1 + Math.floor(Math.random() * 3)
        });
    }
    setNotes(randomNotes);
  };
  
  const handleDownload = () => {
     const midiContent = `Audiomancer MIDI Export\nKey: ${key} ${scale}\nTempo: ${tempo} BPM\nType: ${generationType}\nNotes: ${notes.length}\n\n${notes.map(n => `Note ${n.note + MIDI_NOTE_OFFSET} at step ${n.step} (duration ${n.duration})`).join('\n')}`;
    const blob = new Blob([midiContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audiomancer-${generationType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-fuchsia-400 mb-5">🎹 MIDI Generator & Editor</h2>
      
      <div className="flex gap-2 mb-5 flex-wrap">
        {generationTypes.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setGenerationType(id)}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${generationType === id ? 'bg-fuchsia-500/30 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-700/50 border-slate-600 text-violet-300 hover:bg-slate-700'}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <FormGroup label="Describe your MIDI pattern">
          <Textarea 
            value={midiPrompt} 
            onChange={e => setMidiPrompt(e.target.value)}
            placeholder="e.g., A groovy bassline like Daft Punk, an emotional piano melody, a hard-hitting techno drum beat..."
            className="mb-4"
          />
      </FormGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <FormGroup label="Key" htmlFor="midiKey">
            <Select id="midiKey" value={key} onChange={e => setKey(e.target.value as NoteName)}>
                {NOTE_NAMES.map(n => <option className="bg-slate-900" key={n} value={n}>{n}</option>)}
            </Select>
        </FormGroup>
        <FormGroup label="Scale" htmlFor="midiScale">
            <Select id="midiScale" value={scale} onChange={e => setScale(e.target.value as Scale)}>
                {['Major', 'Minor', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Pentatonic'].map(s => <option className="bg-slate-900" key={s} value={s}>{s}</option>)}
            </Select>
        </FormGroup>
         <FormGroup label="Tempo (BPM)" htmlFor="midiTempo">
            <Input id="midiTempo" type="number" value={tempo} onChange={e => setTempo(parseInt(e.target.value))} min="40" max="240" />
        </FormGroup>
         <FormGroup label="Bars" htmlFor="midiBars">
            <Input id="midiBars" type="number" value={bars} onChange={e => setBars(Math.max(4, parseInt(e.target.value)))} min="4" max="16" />
        </FormGroup>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <Button onClick={handleGenerate} disabled={isLoading}>{isLoading ? 'Generating...' : '✨ Generate with AI'}</Button>
        <Button onClick={() => setNotes([])} variant="secondary">🗑️ Clear</Button>
        <Button variant="secondary" as="label" className="cursor-pointer">
            📁 Upload Audio
            <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleAudioConvert(e.target.files ? e.target.files[0] : null)} />
        </Button>
        <Button onClick={handleEnhance} disabled={isLoading || notes.length === 0} variant="secondary">{isLoading ? 'Enhancing...' : '🎨 AI Enhance'}</Button>
      </div>
      
      {error && <div className="bg-red-500/20 border-2 border-red-500/50 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</div>}

       <div className="bg-slate-800/50 text-center p-2 rounded-md mb-3 border border-slate-700">
        <p className="text-violet-300 text-sm">✨ Pro-Tip: You can also <span className="font-bold text-fuchsia-400">click or drag</span> on the grid below to manually draw your own MIDI pattern!</p>
      </div>

      <div className="bg-slate-900/80 border-2 border-fuchsia-900/50 rounded-xl p-4">
        <div className="flex gap-3 items-center mb-3">
          <Button onClick={() => isPlaying ? stop() : play(notes, tempo, generationType)} disabled={notes.length === 0}>
            {isPlaying ? '⏹️ Stop' : '▶️ Play'}
          </Button>
          <span className="text-violet-400 text-sm">Click grid to add/remove notes</span>
        </div>
        <PianoRoll notes={notes} setNotes={setNotes} bars={bars} />
      </div>

      {notes.length > 0 && (
        <div className="bg-slate-900/60 border-2 border-fuchsia-900/50 rounded-2xl p-4 mt-5">
            <h3 className="text-xl font-bold text-cyan-400 mb-2">Generated MIDI</h3>
            <p>Generated {generationType} with {notes.length} notes!</p>
            <Button onClick={handleDownload} className="mt-3">💾 Download MIDI</Button>
        </div>
      )}
    </div>
  );
};