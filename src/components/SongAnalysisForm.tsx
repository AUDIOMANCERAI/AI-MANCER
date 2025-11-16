import React, { useState } from 'react';
import { Button } from './common/Button';
import { Input } from './common/FormControls';

const SpotifyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-10 h-10">
        <path fill="#1DB954" d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z"></path><path fill="#FFF" d="M34.238,33.041c-0.586,0.979-1.748,1.31-2.727,0.724c-4.725-2.848-10.685-3.48-17.653-1.92 c-0.932,0.208-1.859-0.287-2.066-1.22c-0.208-0.932,0.287-1.859,1.22-2.066c7.732-1.722,14.328-1.001,19.66,2.14 c0.979,0.586,1.31,1.748,0.724,2.727C35.155,32.964,34.477,33.116,34.238,33.041z M36.338,26.467 c-0.696,1.168-2.086,1.564-3.254,0.868c-5.26-3.132-13.279-4.14-18.528-2.288c-1.109,0.392-2.296-0.176-2.688-1.284 c-0.392-1.109,0.176-2.296,1.284-2.688c6.035-2.126,14.8-1.023,20.73,2.574C35.049,24.227,35.445,25.414,36.338,26.467z M36.562,19.498c-6.082-3.504-16.143-3.832-21.203-1.623c-1.284,0.56-2.801-0.128-3.361-1.412 c-0.56-1.284,0.128-2.801,1.412-3.361c5.857-2.544,16.822-2.158,23.63,1.644c1.196,0.672,1.636,2.184,0.964,3.38 c-0.672,1.196-2.184,1.636-3.38,0.964C36.602,19.513,36.582,19.505,36.562,19.498z"></path>
    </svg>
);

const YouTubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-10 h-10">
        <path fill="#FF3D00" d="M43.2,33.9c-0.4,2.1-2.1,3.7-4.2,4c-3.3,0.3-8.9,0.4-15,0.4s-11.7-0.1-15-0.4c-2.1-0.3-3.8-1.9-4.2-4C4.4,31.6,4,28.2,4,24c0-4.2,0.4-7.6,0.8-9.9c0.4-2.1,2.1-3.7,4.2-4C12.3,9.8,17.9,9.7,24,9.7s11.7,0.1,15,0.4c2.1,0.3,3.8,1.9,4.2,4c0.4,2.3,0.8,5.7,0.8,9.9C44,28.2,43.6,31.6,43.2,33.9z"></path><path fill="#FFF" d="M20 31L20 17 32 24z"></path>
    </svg>
);

interface SongAnalysisFormProps {
  onAnalyze: (query: string) => void;
  isLoading: boolean;
}

export const SongAnalysisForm: React.FC<SongAnalysisFormProps> = ({ onAnalyze, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onAnalyze(query);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-cyan-400 mb-2">Analyze a Song</h3>
      <p className="text-violet-400 mb-4">Enter a song title & artist, or paste a link. The AI will analyze it and generate a detailed prompt.</p>
      <div className="flex justify-center gap-4 mb-4">
        <SpotifyIcon />
        <YouTubeIcon />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'Bohemian Rhapsody by Queen' or a URL"
            disabled={isLoading}
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading || !query.trim()} className="w-full sm:w-auto">
            {isLoading ? 'Analyzing...' : 'Analyze 🎵'}
          </Button>
        </div>
      </form>
    </div>
  );
};