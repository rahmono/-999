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
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (gradeId) {
      setSubjects(dbService.getSubjects(gradeId));
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
        <SelectionList 
          items={subjects} 
          onSelect={(subject) => navigate(`/topics/${subject.id}`)}
          emptyMessage={t.empty_list}
        />
      </div>
    </div>
  );
};

export default SubjectScreen;