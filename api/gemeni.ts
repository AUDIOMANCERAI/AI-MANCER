import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key from environment variable
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API key not configured. Please add GOOGLE_AI_API_KEY or GEMINI_API_KEY to your Vercel environment variables.' 
      });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the model (you can make this configurable)
    const model = genAI.getGenerativeModel({ 
      model: req.body.model || 'gemini-pro' 
    });

    // Extract prompt and other parameters from request body
    const { prompt, history, systemInstruction } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Start chat or generate content
    if (history && Array.isArray(history)) {
      const chat = model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: req.body.maxTokens || 2048,
          temperature: req.body.temperature || 0.7,
        },
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      return res.status(200).json({ 
        text,
        response: response 
      });
    } else {
      // Simple generation
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return res.status(200).json({ 
        text,
        response: response 
      });
    }

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
}