// FIX: Import Request and Response types with aliases to resolve conflicts with global DOM types.
import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors({ origin: true }));
// The explicit typing of `req` and `res` in the route handler below helps TypeScript correctly resolve middleware signatures.
app.use(express.json());

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Use the imported `ExpressResponse` type for the 'res' parameter to ensure correct typing.
const handleStream = async (res: ExpressResponse, stream: AsyncGenerator<any>) => {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');
    for await (const chunk of stream) {
        res.write(JSON.stringify(chunk));
        res.write('\n');
    }
    res.end();
};

// FIX: Use the imported `ExpressRequest` and `ExpressResponse` types for 'req' and 'res' parameters to ensure correct typing.
app.post('/', async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const { action, payload } = req.body;

        switch (action) {
            case 'wizardStream': {
                const { prompt, useSearch } = payload;
                // FIX: Updated `contents` to be a simple string for text prompts.
                const stream = await ai.models.generateContentStream({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        tools: useSearch ? [{ googleSearch: {} }] : undefined,
                    }
                });
                return handleStream(res, stream);
            }
            
            case 'generateMidi': {
                 const { prompt } = payload;
                 // FIX: Updated `contents` to be a simple string for text prompts.
                 const response = await ai.models.generateContent({
                     model: 'gemini-2.5-flash',
                     contents: prompt,
                 });
                 return res.status(200).json(response);
            }

            case 'enhanceMidi': {
                 const { prompt } = payload;
                 // FIX: Updated `contents` to be a simple string for text prompts.
                 const response = await ai.models.generateContent({
                     model: 'gemini-2.5-flash',
                     contents: prompt,
                 });
                 return res.status(200).json(response);
            }

            case 'generatePrompt': {
                 const { intent } = payload;
                 // FIX: Updated `contents` to be a simple string for text prompts.
                 const response = await ai.models.generateContent({
                     model: 'gemini-2.5-flash',
                     contents: intent,
                 });
                 return res.status(200).json(response);
            }
            
            case 'generatePromptFromSong': {
                 const { intent } = payload;
                 // FIX: Updated `contents` to be a simple string for text prompts.
                 const response = await ai.models.generateContent({
                     model: 'gemini-2.5-flash',
                     contents: intent,
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