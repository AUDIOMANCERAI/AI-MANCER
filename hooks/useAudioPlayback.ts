
import { useState, useRef, useCallback, useEffect } from 'react';
import type { MidiNote, GenerationType } from '../types';
import { MIDI_NOTE_OFFSET } from '../constants';

export const useAudioPlayback = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const stopPlaybackRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        // Initialize AudioContext on mount after user interaction
        const initAudioContext = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            document.removeEventListener('click', initAudioContext);
        };
        document.addEventListener('click', initAudioContext);

        return () => {
            document.removeEventListener('click', initAudioContext);
            audioContextRef.current?.close();
        };
    }, []);

    const play = useCallback((notes: MidiNote[], tempo: number, type: GenerationType) => {
        if (isPlaying || !audioContextRef.current || notes.length === 0) {
            return;
        }

        const audioContext = audioContextRef.current;
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        setIsPlaying(true);
        const scheduledEvents: (OscillatorNode | GainNode)[] = [];
        const stepDuration = (60 / tempo) / 2; // 8th notes

        notes.forEach(note => {
            const startTime = audioContext.currentTime + note.step * stepDuration;
            const stopTime = startTime + (note.duration || 1) * stepDuration * 0.9;
            const freq = 440 * Math.pow(2, (note.note + MIDI_NOTE_OFFSET - 69) / 12);

            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(audioContext.destination);

            osc.type = type === 'bassline' ? 'sawtooth' : type === 'harmony' ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
            gainNode.gain.setValueAtTime(0.3, stopTime - 0.05);
            gainNode.gain.linearRampToValueAtTime(0, stopTime);
            
            osc.start(startTime);
            osc.stop(stopTime);

            scheduledEvents.push(osc, gainNode);
        });

        const totalDuration = (Math.max(...notes.map(n => n.step)) + 4) * stepDuration;
        const endTimeout = setTimeout(() => {
            setIsPlaying(false);
        }, totalDuration * 1000);

        stopPlaybackRef.current = () => {
            scheduledEvents.forEach(node => {
                try {
                    if (node instanceof OscillatorNode) node.stop();
                    node.disconnect();
                } catch (e) {
                    // Ignore errors from stopping already stopped nodes
                }
            });
            clearTimeout(endTimeout);
            setIsPlaying(false);
        };

    }, [isPlaying]);

    const stop = useCallback(() => {
        if (stopPlaybackRef.current) {
            stopPlaybackRef.current();
            stopPlaybackRef.current = null;
        }
    }, []);

    return { isPlaying, play, stop };
};
