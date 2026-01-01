import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack = true, rightAction, onBack }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10 gap-3 dark:bg-gray-900 dark:border-gray-800 transition-colors">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {showBack && (
          <button 
            onClick={onBack || (() => navigate(-1))} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 shrink-0 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900 truncate dark:text-white transition-colors">{title}</h1>
      </div>
      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </div>
  );
};