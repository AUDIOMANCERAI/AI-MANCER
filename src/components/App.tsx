
import React, { useState } from 'react';
import { WizardTab } from './components/WizardTab';
import { MidiGeneratorTab } from './components/MidiGeneratorTab';
import { PromptGeneratorTab } from './components/PromptGeneratorTab';
import { FileWizardTab } from './components/FileWizardTab';
import type { Tab } from './types';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'wizard', label: 'Wizard', icon: '🧙' },
  { id: 'midi', label: 'MIDI Generator', icon: '🎹' },
  { id: 'prompt', label: 'Prompt Generator', icon: '✍️' },
  { id: 'file', label: 'File Wizard', icon: '📁' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('wizard');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wizard':
        return <WizardTab />;
      case 'midi':
        return <MidiGeneratorTab />;
      case 'prompt':
        return <PromptGeneratorTab />;
      case 'file':
        return <FileWizardTab />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-transparent bg-clip-text mb-2">
          🎵 Audiomancer
        </h1>
        <p className="text-violet-400 mb-8">Your AI Music Creation Suite</p>
      </header>

      <div className="flex gap-1.5 mb-5 border-b-2 border-fuchsia-900/50">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`py-3 px-6 bg-transparent border-b-4 text-sm md:text-base font-semibold transition-all duration-300 rounded-t-lg ${
              activeTab === id
                ? 'border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/20'
                : 'border-transparent text-violet-400 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <main>
        {renderTabContent()}
      </main>
    </div>
  );
};

export default App;