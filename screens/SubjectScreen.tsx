
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { Subject } from '../types';
import { SelectionList } from '../components/SelectionList';
import { Header } from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';

const SubjectScreen: React.FC = () => {
  const { gradeId } = useParams<{ gradeId: string }>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (gradeId) {
      dbService.getSubjects(gradeId).then(data => {
        setSubjects(data);
        setLoading(false);
      });
    }
  }, [gradeId]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors">
      <Header 
        title={t.select_subject} 
        showBack={true}
        onBack={() => navigate('/grades')}
      />
      <div className="flex-1 overflow-y-auto">
        {loading ? (
            <div className="p-8 text-center text-gray-500">{t.loading}</div>
        ) : (
            <SelectionList 
              items={subjects} 
              onSelect={(subject) => navigate(`/chat/${subject.id}`)}
              emptyMessage={t.empty_list}
            />
        )}
      </div>
    </div>
  );
};

export default SubjectScreen;
