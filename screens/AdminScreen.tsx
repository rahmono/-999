
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { dbService } from '../services/dbService';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { TopicImage, Grade, Subject } from '../types';

interface ImageUpload {
    id: string;
    data: string;
    mimeType: string;
    order: number;
    preview: string;
}

const AdminScreen: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'Grade' | 'Subject' | 'Topic'>('Grade');
  const [feedback, setFeedback] = useState('');
  
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Form States
  const [gradeName, setGradeName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [topicName, setTopicName] = useState('');
  const [topicContent, setTopicContent] = useState('');
  const [selectedSubjectForTopicId, setSelectedSubjectForTopicId] = useState('');
  const [topicImages, setTopicImages] = useState<ImageUpload[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [gData, sData] = await Promise.all([
        dbService.getAllGrades(),
        dbService.getAllSubjects()
    ]);
    setGrades(gData);
    setSubjects(sData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            const newImg: ImageUpload = {
                id: crypto.randomUUID(),
                data: base64String,
                mimeType: file.type,
                order: topicImages.length + 1,
                preview: reader.result as string
            };
            setTopicImages(prev => [...prev, newImg]);
        };
        reader.readAsDataURL(file);
    });
  };

  const updateImageOrder = (id: string, newOrder: string) => {
    const orderNum = parseInt(newOrder) || 0;
    setTopicImages(prev => prev.map(img => img.id === id ? { ...img, order: orderNum } : img));
  };

  const removeImage = (id: string) => {
    setTopicImages(prev => prev.filter(img => img.id !== id));
  };

  const handleAdd = async () => {
    try {
      if (activeTab === 'Grade' && gradeName) {
        await dbService.addGrade(gradeName);
        setGradeName('');
      } else if (activeTab === 'Subject' && subjectName && selectedGradeId) {
        await dbService.addSubject(selectedGradeId, subjectName);
        setSubjectName('');
      } else if (activeTab === 'Topic' && topicName && selectedSubjectForTopicId) {
        const imagesToSave: TopicImage[] = topicImages.map(img => ({
            data: img.data,
            mimeType: img.mimeType,
            order: img.order
        }));
        await dbService.addTopic(selectedSubjectForTopicId, topicName, topicContent, imagesToSave);
        setTopicName('');
        setTopicContent('');
        setTopicImages([]);
      } else {
        setFeedback(t.fill_error);
        return;
      }
      await loadData();
      setFeedback(t.success_add);
      setTimeout(() => setFeedback(''), 3000);
    } catch (e) {
      setFeedback('Error adding data.');
    }
  };

  const TabButton = ({ name, label }: { name: typeof activeTab, label: string }) => (
    <button
      onClick={() => { setActiveTab(name); setFeedback(''); }}
      className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
        activeTab === name 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors">
      <Header title={t.admin_panel} />
      
      <div className="px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar border-b dark:border-gray-800">
        <TabButton name="Grade" label={t.grade} />
        <TabButton name="Subject" label={t.subject} />
        <TabButton name="Topic" label={t.topic} />
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar">
        <h2 className="text-xl font-bold dark:text-white">{t.add}</h2>
        
        {activeTab === 'Grade' && (
          <input 
            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
            placeholder={t.name_ph} 
            value={gradeName}
            onChange={e => setGradeName(e.target.value)}
          />
        )}

        {activeTab === 'Subject' && (
          <div className="space-y-4">
             <select 
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white outline-none"
              value={selectedGradeId}
              onChange={e => setSelectedGradeId(e.target.value)}
            >
              <option value="">{t.select_ph} {t.grade}</option>
              {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <input 
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white outline-none" 
              placeholder={t.name_ph} 
              value={subjectName}
              onChange={e => setSubjectName(e.target.value)}
            />
          </div>
        )}

        {activeTab === 'Topic' && (
          <div className="space-y-4">
             <select 
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white outline-none"
              value={selectedSubjectForTopicId}
              onChange={e => setSelectedSubjectForTopicId(e.target.value)}
            >
              <option value="">{t.select_ph} {t.subject}</option>
              {/* Fix: Use s.gradeId instead of s.grade_id to match the Subject interface */}
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({grades.find(g => g.id === s.gradeId)?.name})</option>)}
            </select>
            <input 
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white outline-none" 
              placeholder={t.name_ph} 
              value={topicName}
              onChange={e => setTopicName(e.target.value)}
            />
            <textarea
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white outline-none min-h-[100px] resize-none"
              placeholder={t.content_ph}
              value={topicContent}
              onChange={e => setTopicContent(e.target.value)}
            />

            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Расмҳои мавзӯъ:
                </label>
                <div className="grid grid-cols-2 gap-4">
                    {topicImages.map((img) => (
                        <div key={img.id} className="relative bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border dark:border-gray-800">
                            <img src={img.preview} alt="preview" className="w-full h-24 object-cover rounded-lg mb-2" />
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    value={img.order}
                                    onChange={(e) => updateImageOrder(img.id, e.target.value)}
                                    className="w-12 p-1 text-xs bg-white dark:bg-gray-700 border dark:border-gray-700 rounded text-center dark:text-white"
                                />
                                <button onClick={() => removeImage(img.id)} className="ml-auto p-1 text-red-500">Remove</button>
                            </div>
                        </div>
                    ))}
                    <label className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <span className="text-xs text-gray-400">+ Иловаи расм</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <Button onClick={handleAdd} fullWidth className="py-4 text-base shadow-lg">{t.add}</Button>
        </div>

        {feedback && (
          <div className={`p-4 rounded-2xl text-center text-sm font-medium ${feedback.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminScreen;
