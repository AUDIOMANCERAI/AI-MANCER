
import React from 'react';
import type { MidiNote } from '../types';
import { NOTE_NAMES, PIANO_ROLL_OCTAVES, STEPS_PER_BAR } from '../constants';

interface PianoRollProps {
  notes: MidiNote[];
  setNotes: React.Dispatch<React.SetStateAction<MidiNote[]>>;
  bars: number;
}

const PianoKey: React.FC<{ noteIndex: number }> = ({ noteIndex }) => {
    const octave = Math.floor(noteIndex / 12) + 2; // Starting from C2
    const noteName = NOTE_NAMES[noteIndex % 12];
    const isBlack = noteName.includes('#');
    
    return (
        <div className={`h-5 border-y border-r border-slate-700 flex items-center justify-center text-xs ${isBlack ? 'bg-gray-800 text-violet-400' : 'bg-slate-600 text-violet-300'}`}>
            {noteName}{octave}
        </div>
    );
};

const GridCell: React.FC<{ noteIndex: number, step: number, isActive: boolean, isBeat: boolean, onToggle: () => void }> = React.memo(({ noteIndex, step, isActive, isBeat, onToggle }) => {
    return (
        <div
            className={`
                border-b border-r 
                ${isBeat ? 'border-r-fuchsia-800/50' : 'border-r-slate-700/50'} 
                ${noteIndex % 12 === 0 ? 'border-b-slate-500/80' : 'border-b-slate-700/50'}
                cursor-pointer transition-colors duration-75
                ${isActive ? 'bg-gradient-to-br from-fuchsia-500 to-cyan-500' : 'hover:bg-fuchsia-500/20'}
            `}
            onClick={onToggle}
        />
    );
});


export const PianoRoll: React.FC<PianoRollProps> = ({ notes, setNotes, bars }) => {
    const totalSteps = bars * STEPS_PER_BAR;
    const totalNotes = PIANO_ROLL_OCTAVES * 12;

    const toggleNote = (noteIndex: number, step: number) => {
        setNotes(prevNotes => {
            const existingNoteIndex = prevNotes.findIndex(n => n.note === noteIndex && n.step === step);
            if (existingNoteIndex !== -1) {
                return prevNotes.filter((_, index) => index !== existingNoteIndex);
            } else {
                return [...prevNotes, { note: noteIndex, step, duration: 1 }];
            }
        });
    };

    const noteMap = new Set(notes.map(n => `${n.note}-${n.step}`));

    return (
        <div className="flex overflow-x-auto">
            <div className="flex-shrink-0">
                {Array.from({ length: totalNotes }).map((_, i) => (
                    <PianoKey key={i} noteIndex={totalNotes - 1 - i} />
                ))}
            </div>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${totalSteps}, 30px)`, gridTemplateRows: `repeat(${totalNotes}, 20px)`}}>
                 {Array.from({ length: totalNotes }).map((_, noteIdx) => 
                     Array.from({ length: totalSteps }).map((_, stepIdx) => {
                        const noteIndex = totalNotes - 1 - noteIdx;
                        return (
                            <GridCell
                                key={`${noteIndex}-${stepIdx}`}
                                noteIndex={noteIndex}
                                step={stepIdx}
                                isActive={noteMap.has(`${noteIndex}-${stepIdx}`)}
                                isBeat={stepIdx % STEPS_PER_BAR === 0}
                                onToggle={() => toggleNote(noteIndex, stepIdx)}
                            />
                        )
                     })
                 )}
            </div>
        </div>
    );
};