
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Message } from '../types';
import { generateWizardResponseStream } from '../services/geminiService';
import { Button } from './common/Button';
import { Input } from './common/FormControls';

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isWizard = message.role === 'wizard';
  return (
    <div className={`flex items-start gap-3 my-4 ${isWizard ? 'justify-start' : 'justify-end'}`}>
      <div className={`p-4 rounded-xl max-w-xl ${isWizard ? 'bg-fuchsia-900/40 border border-fuchsia-800/50 rounded-bl-none' : 'bg-cyan-900/40 border border-cyan-800/50 rounded-br-none'}`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

const HINTS = [
    { icon: '🧑‍🏫', text: 'Explain the other tools in this app' },
    { icon: '🎤', text: 'Make me a prompt for a Michael Jackson sounding song, but with a modern trap beat' },
    { icon: '🎶', text: 'What are some common chord progressions in C Minor?' },
    { icon: '🎛️', text: 'How do I use sidechain compression on a bassline?' },
];

export const WizardTab: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'wizard', content: '🧙 Greetings! I am the Audiomancer AI Wizard. I can answer your music theory questions, help with production techniques, or even generate creative prompts for you. Check out some examples below or ask me anything!', id: 'initial' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useSearch, setUseSearch] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = useCallback(async (promptToSubmit: string) => {
    if (!promptToSubmit.trim() || isLoading) return;

    if (showHints) {
        setShowHints(false);
    }

    const newUserMessage: Message = { role: 'user', content: promptToSubmit, id: Date.now().toString() };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    const wizardMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { role: 'wizard', content: '', id: wizardMessageId }]);

    try {
      const stream = await generateWizardResponseStream(promptToSubmit, useSearch);
      
      let text = '';
      for await (const chunk of stream) {
        text += chunk.text;
        setMessages(prev => prev.map(msg => msg.id === wizardMessageId ? { ...msg, content: text } : msg));
      }
    } catch (err) {
      setError('Failed to get a response from the wizard. Please check your API key and try again.');
       setMessages(prev => prev.filter(msg => msg.id !== wizardMessageId));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, useSearch, showHints]);
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(input);
  }

  return (
    <div className="flex flex-col h-[75vh]">
      <div id="messages" className="flex-grow bg-slate-900/60 border-2 border-fuchsia-900/50 rounded-2xl p-4 overflow-y-auto mb-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {showHints && (
             <div className="flex flex-col items-start gap-2 my-4 animate-fade-in">
                {HINTS.map((hint, index) => (
                    <button
                        key={index}
                        onClick={() => handleSubmit(hint.text)}
                        className="bg-slate-800/70 border border-slate-700 text-violet-300 px-4 py-2 rounded-full text-sm text-left hover:bg-slate-700 hover:border-fuchsia-600 transition-all focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    >
                        <span className="mr-2">{hint.icon}</span>{hint.text}
                    </button>
                ))}
            </div>
        )}
        {isLoading && messages[messages.length-1]?.role === 'wizard' && <div className="animate-pulse text-fuchsia-400">🧙 Casting spell...</div> }
        <div ref={messagesEndRef} />
      </div>

      {error && <div className="bg-red-500/20 border-2 border-red-500/50 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</div>}

      <div className="flex justify-center mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={useSearch} onChange={(e) => setUseSearch(e.target.checked)} className="form-checkbox h-5 w-5 rounded bg-slate-700 border-slate-500 text-cyan-500 focus:ring-cyan-500"/>
          <span className="font-semibold text-violet-300">🌐 Web Search</span>
        </label>
      </div>

      <form onSubmit={handleFormSubmit} className="flex gap-3">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about music theory, chords, production..."
          disabled={isLoading}
          className="flex-grow"
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? 'Thinking...' : 'Send ✨'}
        </Button>
      </form>
    </div>
  );
};