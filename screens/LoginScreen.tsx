import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { UserRole } from '../types';

const LoginScreen: React.FC = () => {
  const [phone, setPhone] = useState('');
  // Set default role to STUDENT as requested
  const [role] = useState<UserRole>(UserRole.STUDENT);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length > 0) {
      // Save the default role (Student) to localStorage
      localStorage.setItem('user_role', role);
      navigate('/grades');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 p-8 transition-colors">
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-sm mx-auto">
        
        {/* Logo Section */}
        <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 p-5 bg-blue-600 rounded-3xl shadow-lg shadow-blue-200 dark:shadow-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">{t.app_title}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-center text-sm">{t.app_subtitle}</p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400 dark:text-gray-500 ml-1">
              {t.phone_label}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="992 000 00 00 00"
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              required
              autoFocus
            />
          </div>
          <Button type="submit" fullWidth className="py-4 text-lg rounded-2xl">
            {t.enter_btn}
          </Button>
        </form>
      </div>
      
      {/* Admin Panel Link */}
      <div className="mt-auto pt-6 flex justify-center">
        <button 
          onClick={() => navigate('/admin')}
          className="text-sm text-gray-400 hover:text-blue-600 dark:text-gray-600 dark:hover:text-blue-400 flex items-center gap-2 transition-colors font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l-.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {t.admin_btn}
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;