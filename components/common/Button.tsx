import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  as?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({ as: Component = 'button', variant = 'primary', children, className, ...props }) => {
  const baseClasses = 'px-6 py-3 font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-black';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white hover:opacity-90 hover:scale-105',
    secondary: 'bg-gradient-to-r from-gray-700 to-gray-800 text-violet-300 hover:from-gray-600 hover:to-gray-700',
  };

  return (
    // FIX: Render component Polymorphically and cast props to any to avoid type conflicts between button and other element attributes.
    <Component className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props as any}>
      {children}
    </Component>
  );
};
