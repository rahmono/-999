import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { UserRole } from '../types';
import { Button } from '../components/Button';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role') as UserRole;
    if (storedRole) setRole(storedRole);
  }, []);

  const handleSave = () => {
    if (role) {
      localStorage.setItem('user_role', role);
      navigate(-1); // Go back
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors">
      <Header title={t.profile_title} showBack={true} />
      
      <div className="p-6 flex flex-col gap-6 overflow-y-auto">
        
        {/* Role Section */}
        <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{t.change_role_desc}</h2>
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => setRole(UserRole.TEACHER)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        role === UserRole.TEACHER 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <span className="font-medium">{t.role_teacher}</span>
                </button>
                <button 
                    onClick={() => setRole(UserRole.STUDENT)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        role === UserRole.STUDENT 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="font-medium">{t.role_student}</span>
                </button>
            </div>
        </div>

        {/* Theme Section */}
        <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{t.appearance}</h2>
            <div className="flex gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <button 
                    onClick={() => setTheme('light')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        theme === 'light' 
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                    {t.theme_light}
                </button>
                <button 
                    onClick={() => setTheme('dark')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        theme === 'dark' 
                        ? 'bg-gray-700 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                    {t.theme_dark}
                </button>
            </div>
        </div>

        {/* Language Section */}
        <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{t.select_lang}</h2>
            <div className="flex gap-4">
                <button 
                    onClick={() => setLanguage('tj')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors border ${
                        language === 'tj' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700'
                    }`}
                >
                    🇹🇯 Тоҷикӣ
                </button>
                <button 
                    onClick={() => setLanguage('ru')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors border ${
                        language === 'ru' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700'
                    }`}
                >
                    🇷🇺 Русский
                </button>
            </div>
        </div>

        <div className="mt-auto space-y-3">
             <Button onClick={handleSave} fullWidth>{t.save_btn}</Button>
             <button onClick={handleLogout} className="w-full text-red-500 py-3 text-sm font-medium hover:text-red-600">{t.logout}</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;