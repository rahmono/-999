
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { generateLessonContent } from '../services/geminiService';
import { Message, Subject, UserRole } from '../types';
import { Header } from '../components/Header';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useLanguage } from '../contexts/LanguageContext';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const ChatScreen: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [subject, setSubject] = useState<Subject | undefined>();
  const [gradeName, setGradeName] = useState<string>('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role') as UserRole;
    if (storedRole) setRole(storedRole);
    
    if (subjectId) {
      dbService.getSubjectById(subjectId).then(async (foundSubject) => {
        if (foundSubject) {
          setSubject(foundSubject);
          // Fetch grade name for context
          const grades = await dbService.getAllGrades();
          const g = grades.find(g => g.id === foundSubject.gradeId);
          setGradeName(g?.name || "Синф");
        }
      });
    }
  }, [subjectId]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleAction = async (actionKey: string, actionLabel: string) => {
    if (!subject) return;

    const userMsg: Message = { 
        id: generateId(), 
        role: 'user', 
        text: actionLabel,
        timestamp: Date.now() 
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setInputText('');

    try {
        const responseText = await generateLessonContent(
          actionLabel,
          subject.id,
          role, 
          gradeName,
          actionKey, 
          language
        );
        
        const aiMsg: Message = { 
            id: generateId(), 
            role: 'model', 
            text: responseText, 
            timestamp: Date.now() 
        };
        setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
        console.error("Chat error:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim() && !isLoading) {
      handleAction(inputText, inputText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBack = () => {
     if(subject) navigate(`/subjects/${subject.gradeId}`);
     else navigate('/grades');
  }

  const actions = role === UserRole.TEACHER 
    ? [
        { key: 'act_lesson_plan', label: t.act_lesson_plan },
        { key: 'act_quiz', label: t.act_quiz },
        { key: 'act_activities', label: t.act_activities }
      ]
    : [
        { key: 'act_explain', label: t.act_explain },
        { key: 'act_examples', label: t.act_examples },
        { key: 'act_summary', label: t.act_summary }
      ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors overflow-hidden pb-[safe-bottom]">
      <Header title={subject?.name || t.chat_title} showBack={true} onBack={handleBack} />
      
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 no-scrollbar"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-full text-center space-y-4 px-4 py-8">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold dark:text-white break-words w-full">{subject?.name}</h2>
            <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-gray-400 dark:text-gray-500">{gradeName}</p>
                {subject?.pdfUri ? (
                    <p className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                       </svg>
                       Китоби дарсӣ пайваст аст
                    </p>
                ) : (
                    <p className="text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full">
                       Бе китоби дарсӣ
                    </p>
                )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs">{t.start_prompt}</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`text-base leading-relaxed break-words max-w-[95%] ${
                msg.role === 'user' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 px-4 py-2 rounded-2xl text-gray-800 dark:text-gray-200 shadow-sm' 
                  : 'text-gray-800 dark:text-gray-100 whitespace-normal'
              }`}>
                {msg.role === 'model' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-full overflow-x-hidden">
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-4 last:mb-0 break-words" {...props} />,
                        ul: ({node, ...props}) => <ul className="mb-4 list-disc pl-5" {...props} />,
                        ol: ({node, ...props}) => <ol className="mb-4 list-decimal pl-5" {...props} />,
                      }}
                    >
                        {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start items-center space-x-1.5 py-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
          </div>
        )}
      </div>

      <div className="p-4 md:px-6 pb-2 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
        <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                    {actions.map((action) => (
                    <button
                        key={action.key}
                        onClick={() => handleAction(action.key, action.label)}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors whitespace-nowrap"
                    >
                        {action.label}
                    </button>
                    ))}
                </div>
            )}

            <form onSubmit={handleSend} className="relative group">
                <textarea
                    rows={1}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.ask_placeholder}
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-3xl py-4 pl-5 pr-14 text-base focus:ring-2 focus:ring-blue-500/50 outline-none resize-none dark:text-white placeholder-gray-500 transition-all max-h-40 no-scrollbar"
                />
                <button 
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="absolute right-2.5 bottom-2.5 p-2 bg-black dark:bg-white text-white dark:text-black rounded-full disabled:opacity-30 transition-all shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 4v16m0-16l-5 5m5-5l5 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
