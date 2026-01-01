
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { Topic } from '../types';
import { SelectionList } from '../components/SelectionList';
import { Header } from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';

const TopicScreen: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (subjectId) {
      dbService.getTopics(subjectId).then(data => {
        setTopics(data);
        setLoading(false);
      });
    }
  }, [subjectId]);

  const handleBack = async () => {
    if (subjectId) {
        const s = await dbService.getSubjectById(subjectId);
        if (s && s.gradeId) {
            navigate(`/subjects/${s.gradeId}`);
            return;
        }
    }
    navigate('/grades');
  };

  const filteredTopics = topics.filter(topic => 
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors">
      <Header 
        title={t.select_topic} 
        showBack={true}
        onBack={handleBack}
      />
      
      <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search_placeholder}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 dark:text-white transition-all outline-none placeholder-gray-500 dark:placeholder-gray-400"
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
            <div className="p-8 text-center text-gray-500">{t.loading}</div>
        ) : (
            <SelectionList 
              items={filteredTopics} 
              onSelect={(topic) => navigate(`/chat/${topic.id}`)}
              emptyMessage={t.empty_list}
            />
        )}
      </div>
    </div>
  );
};

export default TopicScreen;
