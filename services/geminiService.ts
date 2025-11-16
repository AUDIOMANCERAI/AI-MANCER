import { GoogleGenAI } from '@google/genai';
import type { MidiNote, GenerationType, NoteName, Scale } from '../types';

const apiKey = process.env.API_KEY;

if (!apiKey) {
    throw new Error("API key not found. Please ensure it is configured in the execution environment.");
}

const ai = new GoogleGenAI({ apiKey });

const parseJsonFromMarkdown = (markdown: string): any => {
    const match = markdown.match(/```json\n([\s\S]*?)\n```|(\[[\s\S]*\])/);
    if (match) {
        try {
            return JSON.parse(match[1] || match[2]);
        } catch (e) {
            console.error("Failed to parse JSON from markdown:", e);
        }
    }
    try {
        return JSON.parse(markdown);
    } catch (e) {
        console.error("Failed to parse raw string as JSON:", e);
        return null;
    }
}

export const generateWizardResponseStream = (prompt: string, useSearch: boolean) => {
    return ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            tools: useSearch ? [{ googleSearch: {} }] : undefined,
        }
    });
};

export const generateMidiPattern = async (type: GenerationType, key: NoteName, scale: Scale, tempo: number, bars: number, userPrompt: string): Promise<MidiNote[] | null> => {
     const prompt = `Generate a MIDI pattern based on the following description: "${userPrompt}".

This pattern should be a ${type}, in the key of ${key} ${scale}, at ${tempo} BPM, and be ${bars} bars long.
            
Return ONLY a JSON array of notes in this exact format:
[{"note": 60, "step": 0, "duration": 1}, {"note": 64, "step": 2, "duration": 1}]

Where:
- note: MIDI note number (C2=36, C3=48, C4=60, C5=72, C6=84)
- step: Position in the sequence (0-${bars * 8 - 1})
- duration: How many steps the note lasts (usually 1-4)

For ${type}:
${type === 'melody' ? '- Use higher notes (60-84)\n- Create melodic patterns with rhythm' : ''}
${type === 'bassline' ? '- Use lower notes (36-48)\n- Create groovy, rhythmic bass patterns' : ''}
${type === 'drums' ? '- Use notes for: Kick(36), Snare(38), Hi-hat closed(42), Hi-hat open(46)\n- Create drum patterns with typical rhythms' : ''}
${type === 'harmony' ? '- Use chord notes (48-72)\n- Create chord progressions with multiple simultaneous notes' : ''}

Adhere strictly to the user's description: "${userPrompt}".
Return ONLY the JSON array, no other text or markdown backticks.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const json = parseJsonFromMarkdown(response.text);
     if (Array.isArray(json)) {
             return json.map(n => ({
                note: n.note,
                step: n.step,
                duration: n.duration || 1
            }));
        }
    return null;
};

export const enhanceMidiPattern = async (notes: MidiNote[], type: GenerationType, key: NoteName, scale: Scale): Promise<MidiNote[] | null> => {
    const prompt = `Enhance this MIDI pattern subtly. Keep the core melody/rhythm but make small improvements:

Current notes: ${JSON.stringify(notes)}

Key: ${key} ${scale}
Type: ${type}

Make SUBTLE improvements like:
- Fix any notes that are out of scale
- Add small rhythmic variations
- Improve transitions between notes
- Add occasional passing tones

Return ONLY the enhanced JSON array in the same format, no other text or markdown backticks.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const json = parseJsonFromMarkdown(response.text);
    if (Array.isArray(json)) {
        return json.map(n => ({
            note: n.note,
            step: n.step,
            duration: n.duration || 1
        }));
    }
    return null;
}


export const generateMusicPrompt = async (intent: string) => {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: intent }] }],
     });
    return response.text;
};

export const generatePromptFromSong = async (songQuery: string): Promise<string> => {
    const intent = `As an expert music producer and analyst, analyze the following song: "${songQuery}".

Based on your analysis, generate a single, detailed paragraph for an AI music generator prompt. This prompt should capture the essence of the song's:
- Genre, subgenre, and overall vibe.
- Key instrumentation and sound design (e.g., "a distorted 808 bass", "reverb-drenched female vocals", "a classic Roland TR-909 drum pattern").
- Rhythmic structure and tempo.
- Melodic and harmonic characteristics.
- Overall song structure and dynamics (e.g., "builds from a sparse intro into a high-energy chorus").

Weave these elements together into an evocative, creative, and slightly exaggerated paragraph. The goal is to inspire an AI to create a new track in a similar style, not just copy it. Start the prompt directly with the description. Do not include headings, lists, or technical specs like BPM. Just the creative paragraph.`;
    
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: intent }] }],
     });
    return response.text;
};
