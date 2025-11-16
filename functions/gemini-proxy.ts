// FIX: Use a namespace import for express to prevent type conflicts with global DOM types.
import * as express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Explicitly type the 'res' parameter with express.Response to ensure access to Express-specific methods.
const handleStream = async (res: express.Response, stream: AsyncGenerator<any>) => {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');
    for await (const chunk of stream) {
        res.write(JSON.stringify(chunk));
        res.write('\n');
    }
    res.end();
};

// FIX: Explicitly type the 'req' and 'res' parameters to use the Express types.
app.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const { action, payload } = req.body;

        switch (action) {
            case 'wizardStream': {
                const { prompt, useSearch } = payload;
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
                 const response = await ai.models.generateContent({
                     model: 'gemini-2.5-flash',
                     contents: prompt,
                 });
                 return res.status(200).json(response);
            }

            case 'enhanceMidi': {
                 const { prompt } = payload;
                 const response = await ai.models.generateContent({
                     model: 'gemini-2.5-flash',
                     contents: prompt,
                 });
                 return res.status(200).json(response);
            }

            case 'generatePrompt': {
                 const { intent } = payload;
                 const response = await ai.models.generateContent({
                     model: 'gemini-2.5-flash',
                     contents: intent,
                 });
                 return res.status(200).json(response);
            }
            
            case 'generatePromptFromSong': {
                 const { intent } = payload;
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