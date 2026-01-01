import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const BookScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // The Book layer has been removed from the schema.
    // Redirect users to the start of the selection flow.
    navigate('/grades');
  }, [navigate]);

  return (
    <div className="flex flex-col h-full bg-white justify-center items-center">
      <span className="text-gray-500">{t.loading}</span>
    </div>
  );
};

export default BookScreen;