
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { generateLessonContent } from '../services/geminiService';
import { Message, Topic, UserRole } from '../types';
import { Header } from '../components/Header';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useLanguage } from '../contexts/LanguageContext';

const ChatScreen: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | undefined>();
  const [gradeName, setGradeName] = useState<string>('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role') as UserRole;
    if (storedRole) setRole(storedRole);
    
    if (topicId) {
      const foundTopic = dbService.getTopicById(topicId);
      setTopic(foundTopic);
      
      if (foundTopic) {
        // Resolve grade name for AI context
        const subject = dbService.getSubjectById(foundTopic.subjectId);
        if (subject) {
          const grade = dbService.getGrades().find(g => g.id === subject.gradeId);
          if (grade) setGradeName(grade.name);
        }
      }
    }
  }, [topicId]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleAction = async (actionKey: string, actionLabel: string) => {
    if (!topic) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: actionLabel, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setInputText('');

    const responseText = await generateLessonContent(
      topic.name, 
      topic.content, 
      topic.images,
      role, 
      gradeName || "Unknown Grade", // Provide grade context to AI
      actionKey, 
      language
    );
    
    const aiMsg: Message = { id: crypto.randomUUID(), role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
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
    <div className="flex flex-col h-full bg-white dark:bg-gptDark-bg theme-transition">
      <Header title={topic?.name || t.chat_title} showBack={true} />
      
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8 no-scrollbar"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold dark:text-white">{topic?.name}</h2>
            <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-gray-400 dark:text-gray-500">{gradeName}</p>
                {topic?.images && (
                <p className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                    {topic.images.length} расми контекстӣ мавҷуд аст
                </p>
                )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs">{t.start_prompt}</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
                  AI
                </div>
              )}
              <div className={`text-base leading-relaxed ${msg.role === 'user' ? 'bg-gray-100 dark:bg-gptDark-bubble px-4 py-2 rounded-2xl text-gray-800 dark:text-gray-200' : 'text-gray-800 dark:text-gray-100 mt-1'}`}>
                {msg.role === 'model' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
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
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold animate-pulse">
              AI
            </div>
            <div className="flex items-center space-x-1 mt-3">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:px-8 pb-6 bg-white dark:bg-gptDark-bg">
        <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                    {actions.map((action) => (
                    <button
                        key={action.key}
                        onClick={() => handleAction(action.key, action.label)}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gptDark-bubble text-gray-600 dark:text-gray-400 transition-colors"
                    >
                        {action.label}
                    </button>
                    ))}
                </div>
            )}

            <form onSubmit={handleSend} className="relative group">
                <textarea
                    ref={inputRef}
                    rows={1}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.ask_placeholder}
                    className="w-full bg-gray-100 dark:bg-gptDark-input border-none rounded-3xl py-4 pl-5 pr-14 text-base focus:ring-2 focus:ring-blue-500/50 outline-none resize-none dark:text-white placeholder-gray-500 transition-all max-h-40 no-scrollbar"
                />
                <button 
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="absolute right-2.5 bottom-2.5 p-2 bg-black dark:bg-white text-white dark:text-black rounded-full disabled:opacity-30 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 4v16m0-16l-5 5m5-5l5 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </form>
            <p className="text-[10px] text-center text-gray-400 dark:text-gray-600 mt-2">
                Мактаб AI метавонад хато кунад. Маълумоти муҳимро тафтиш кунед.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
