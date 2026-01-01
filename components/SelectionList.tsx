import React from 'react';

interface Item {
  id: string;
  name: string;
}

interface SelectionListProps {
  items: Item[];
  onSelect: (item: Item) => void;
  emptyMessage?: string;
}

export const SelectionList: React.FC<SelectionListProps> = ({ items, onSelect, emptyMessage = "No items found." }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className="flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors group dark:hover:bg-gray-800"
        >
          <span className="font-medium text-gray-800 text-lg dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.name}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className="w-5 h-5 text-gray-300 group-hover:text-blue-500 dark:text-gray-600 dark:group-hover:text-blue-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      ))}
    </div>
  );
};