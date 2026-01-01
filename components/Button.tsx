import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "px-4 py-3 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
    secondary: "bg-gray-800 text-white hover:bg-gray-900 shadow-sm",
    outline: "border-2 border-gray-200 text-gray-700 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
