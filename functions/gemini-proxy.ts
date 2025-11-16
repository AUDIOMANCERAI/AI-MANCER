
import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors({ origin: true }));
// FIX: Explicitly typing req and res in the route handler below helps TypeScript correctly resolve middleware signatures.
app.use(express.json());

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Use the explicitly imported `Response` type from Express.
const handleStream = async (res: Response, stream: AsyncGenerator<any>) => {
    // FIX: setHeader exists on express.Response
    res.setHeader('Content-Type', 'text/plain');
    // FIX: setHeader exists on express.Response
    res.setHeader('Transfer-Encoding', 'chunked');
    for await (const chunk of stream) {
        // FIX: write exists on express.Response
        res.write(JSON.stringify(chunk));
        // FIX: write exists on express.Response
        res.write('\n');
    }
    // FIX: end exists on express.Response
    res.end();
};

// FIX: Use the explicitly imported `Request` and `Response` types from Express.
app.post('/', async (req: Request, res: Response) => {
    try {
        const { action, payload } = req.body;

        switch (action) {
            case 'wizardStream': {
                const { prompt, useSearch } = payload;
                const stream = await ai.models.generateContentStream({
                    model: 'gemini-2.5-flash',
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: {
                        tools: useSearch ? [{ googleSearch: {} }] : undefined,
                    }
                });
                return handleStream(res, stream);
            }
            
            case 'generateMidi': {
                 const { prompt } = payload;
                 const response = await ai.models.generateContent({
                     model: 'gemini-2.5-flash',
                     contents: [{ role: 'user', parts: [{ text: prompt }] }],
                 });
                 return res.status(200).json(response);
            }

            case 'enhanceMidi': {
                 const { prompt } = payload;
                 const response = await ai.models.generateContent({
                     model: 'gemini-2.5-flash',
                     contents: [{ role: 'user', parts: [{ text: prompt }] }],
                 });
                 return res.status(200).json(response);
            }

            case 'generatePrompt': {
                 const { intent } = payload;
                 const response = await ai.models.generateContent({
                     model: 'gemini-2.5-flash',
                     contents: [{ role: 'user', parts: [{ text: intent }] }],
                 });
                 return res.status(200).json(response);
            }
            
            case 'generatePromptFromSong': {
                 const { intent } = payload;
                 const response = await ai.models.generateContent({
                     model: 'gemini-2.5-flash',
                     contents: [{ role: 'user', parts: [{ text: intent }] }],
                 });
                 return res.status(200).json(response);
            }

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Error in proxy:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});


export const geminiProxy = app;
