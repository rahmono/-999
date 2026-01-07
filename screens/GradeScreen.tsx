
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { Grade } from '../types';
import { SelectionList } from '../components/SelectionList';
import { Header } from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';

const GradeScreen: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    dbService.getGrades()
      .then(data => {
        setGrades(data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError(t.ai_error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [t.ai_error]);

  const ProfileButton = (
    <button onClick={() => navigate('/profile')} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-9.536-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors">
      <Header 
        title={t.select_grade} 
        showBack={false} 
        rightAction={ProfileButton}
      />
      <div className="flex-1 overflow-y-auto">
        {loading ? (
            <div className="p-8 text-center text-gray-500">{t.loading}</div>
        ) : error ? (
            <div className="p-8 text-center text-red-500 flex flex-col items-center gap-4">
                <p>{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                >
                    Retry
                </button>
            </div>
        ) : (
            <SelectionList 
              items={grades} 
              onSelect={(grade) => navigate(`/subjects/${grade.id}`)}
              emptyMessage={t.empty_list}
            />
        )}
      </div>
    </div>
  );
};

export default GradeScreen;
