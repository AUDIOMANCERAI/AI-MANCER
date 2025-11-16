import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const percentage = Math.max(0, (currentStep -1) / (totalSteps-1) * 100);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-violet-300">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-semibold text-fuchsia-400">{Math.round((currentStep / totalSteps) * 100)}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};