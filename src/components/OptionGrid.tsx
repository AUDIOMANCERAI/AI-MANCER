import React from 'react';

interface OptionGridProps {
  options: string[];
  selectedOptions: string[];
  onSelect: (option: string) => void;
  multiSelect?: boolean;
  title: string;
}

export const OptionGrid: React.FC<OptionGridProps> = ({ options, selectedOptions, onSelect, title }) => {
  if (!options || options.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold text-cyan-400 mb-4">{title}</h3>
        <div className="text-center p-8 bg-slate-800/50 rounded-lg">
          <p className="text-violet-400">No options available for this category.</p>
          <p className="text-sm text-slate-500">Please go back and select a genre first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-bold text-cyan-400 mb-4">{title}</h3>
      <div className="flex flex-wrap gap-2 md:gap-3 max-h-[45vh] overflow-y-auto pr-2 -mr-2">
        {options.map(option => {
          const isSelected = selectedOptions.includes(option);
          return (
            <button
              key={option}
              onClick={() => onSelect(option)}
              className={`px-3 py-2 md:px-4 md:py-2 rounded-lg border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-fuchsia-500 ${
                isSelected
                  ? 'bg-fuchsia-500/40 border-fuchsia-500 text-fuchsia-200 font-semibold'
                  : 'bg-slate-700/50 border-slate-600 text-violet-300 hover:bg-slate-700 hover:border-fuchsia-600'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};