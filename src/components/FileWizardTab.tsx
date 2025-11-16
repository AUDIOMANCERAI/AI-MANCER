
import React, { useState, useCallback } from 'react';
import type { Message } from '../types';
import { Button } from './common/Button';
import { Input } from './common/FormControls';

export const FileWizardTab: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [question, setQuestion] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (selectedFile: File | null) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setMessages([
            { role: 'wizard', content: `🧙 File "${selectedFile.name}" loaded! Ask me questions about this file...`, id: 'file-loaded' }
        ]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleAsk = () => {
        if (!question.trim() || !file) return;
        const newMessages: Message[] = [
            ...messages,
            { role: 'user', content: question, id: `user-${Date.now()}` },
            { role: 'wizard', content: `(Simulated Analysis) Based on your question about "${file.name}": "${question}", here is a generated answer. In a real application, the file content would be analyzed by the AI.`, id: `wizard-${Date.now()}` }
        ];
        setMessages(newMessages);
        setQuestion('');
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-fuchsia-400 mb-5">📁 File Analysis Wizard</h2>
            
            {!file && (
                 <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    className={`text-center p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isDragOver ? 'border-cyan-500 bg-cyan-500/10' : 'border-fuchsia-900/50 bg-slate-900/60 hover:border-fuchsia-500 hover:bg-fuchsia-500/10'}`}
                    onClick={() => document.getElementById('fileInput')?.click()}
                >
                    <p className="text-5xl mb-4">📂</p>
                    <h3 className="text-xl font-bold text-fuchsia-400 mb-2">Drop your music file here</h3>
                    <p className="text-violet-400">or click to browse</p>
                    <p className="text-slate-500 text-sm mt-3">Supports: MIDI, WAV, MP3, PDF (sheet music), TXT</p>
                </div>
            )}
            <input type="file" id="fileInput" className="hidden" accept=".mid,.midi,.wav,.mp3,.pdf,.txt" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} />
            
            {file && (
                <div className="bg-slate-900/60 border-2 border-fuchsia-900/50 rounded-2xl p-4">
                    <div className="mb-4 p-3 bg-slate-800 rounded-lg">
                         <h3 className="text-lg font-bold text-cyan-400">File Loaded</h3>
                         <p><strong>📄 File:</strong> {file.name}</p>
                         <p><strong>📏 Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
                         <p><strong>📝 Type:</strong> {file.type || 'Unknown'}</p>
                         <Button variant="secondary" onClick={() => setFile(null)} className="py-1 px-3 text-sm mt-2">Change File</Button>
                    </div>

                    <div className="space-y-4 mb-4 h-64 overflow-y-auto p-2">
                        {messages.map(msg => (
                             <div key={msg.id} className={`p-3 rounded-lg max-w-lg ${msg.role === 'wizard' ? 'bg-fuchsia-900/30 text-left' : 'bg-cyan-900/30 ml-auto text-right'}`}>
                                {msg.content}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <Input 
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                            placeholder="Ask about this file..."
                            className="flex-grow"
                        />
                        <Button onClick={handleAsk}>Ask ✨</Button>
                    </div>
                </div>
            )}
        </div>
    );
};