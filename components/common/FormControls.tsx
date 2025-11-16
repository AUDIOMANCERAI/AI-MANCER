import React from 'react';

interface FormGroupProps {
  label: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ label, children, htmlFor }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={htmlFor} className="font-bold text-fuchsia-400">{label}</label>
    {children}
  </div>
);

const baseInputClasses = "w-full p-3 border-2 border-fuchsia-900/50 rounded-lg bg-slate-900/70 text-fuchsia-300 placeholder:text-violet-500/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition";

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`${baseInputClasses} ${props.className}`} />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <div className="relative">
        <select {...props} className={`${baseInputClasses} appearance-none pr-10 ${props.className}`}>
            {props.children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-fuchsia-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
        </div>
    </div>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} className={`${baseInputClasses} min-h-[100px] resize-y ${props.className}`} />
);