import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'tj' | 'ru';

export const translations = {
  tj: {
    app_title: "Мактаб AI",
    app_subtitle: "Ёрдамчии таълимии шумо.",
    phone_label: "Рақами телефон",
    enter_btn: "Ворид шудан",
    admin_btn: "Админ",
    select_grade: "Интихоби синф",
    select_subject: "Интихоби фан",
    select_topic: "Интихоби мавзӯъ",
    empty_list: "Рӯйхат холи аст.",
    chat_title: "Чат",
    who_are_you: "Шумо кистед?",
    role_teacher: "Омӯзгор",
    role_student: "Хонанда",
    loading: "Интизор шавед...",
    ai_error: "Хатогӣ ҳангоми пайвастшавӣ.",
    start_prompt: "Савол диҳед ё аз имкониятҳои зер истифода баред.",
    
    // Actions
    act_lesson_plan: "Нақшаи дарс",
    act_quiz: "Тест (Саволҳо)",
    act_activities: "Фаъолиятҳо",
    act_explain: "Фаҳмондан",
    act_examples: "Мисолҳо",
    act_summary: "Хулоса",

    // Admin
    admin_panel: "Панели идоракунӣ",
    add: "Илова кардан",
    success_add: "Бо муваффақият илова шуд!",
    fill_error: "Лутфан ҳамаи майдонҳоро пур кунед.",
    grade: "Синф",
    subject: "Фан",
    topic: "Мавзӯъ",
    name_ph: "Номро ворид кунед",
    content_ph: "Матни мавзӯъро ворид кунед (барои AI)",
    select_ph: "Интихоб кунед",
    
    // Lang
    select_lang: "Забонро интихоб кунед",
    
    // Search
    search_placeholder: "Ҷустуҷӯ...",
    
    // Chat Input
    ask_placeholder: "Саволи худро нависед...",
    send: "Ирсол",

    // Profile
    profile_title: "Профили корбар",
    save_btn: "Сабт кардан",
    logout: "Баромадан",
    change_role_desc: "Нақши худро интихоб кунед",
    
    // Theme
    appearance: "Намуди зоҳирӣ",
    theme_light: "Рӯзона",
    theme_dark: "Шабона"
  },
  ru: {
    app_title: "Maktab AI",
    app_subtitle: "Ваш учебный ассистент.",
    phone_label: "Номер телефона",
    enter_btn: "Войти",
    admin_btn: "Админ",
    select_grade: "Выберите класс",
    select_subject: "Выберите предмет",
    select_topic: "Выберите тему",
    empty_list: "Список пуст.",
    chat_title: "Чат",
    who_are_you: "Вы кто?",
    role_teacher: "Учитель",
    role_student: "Ученик",
    loading: "Загрузка...",
    ai_error: "Ошибка соединения.",
    start_prompt: "Задайте вопрос или выберите действие.",

    // Actions
    act_lesson_plan: "План урока",
    act_quiz: "Тест",
    act_activities: "Задания",
    act_explain: "Объяснить",
    act_examples: "Примеры",
    act_summary: "Итог",

    // Admin
    admin_panel: "Панель управления",
    add: "Добавить",
    success_add: "Успешно добавлено!",
    fill_error: "Заполните все поля.",
    grade: "Класс",
    subject: "Предмет",
    topic: "Тема",
    name_ph: "Введите название",
    content_ph: "Введите текст темы (для ИИ)",
    select_ph: "Выберите",

    // Lang
    select_lang: "Выберите язык",

    // Search
    search_placeholder: "Поиск...",

    // Chat Input
    ask_placeholder: "Напишите свой вопрос...",
    send: "Отправить",

    // Profile
    profile_title: "Профиль",
    save_btn: "Сохранить",
    logout: "Выйти",
    change_role_desc: "Выберите свою роль",

    // Theme
    appearance: "Внешний вид",
    theme_light: "Светлая",
    theme_dark: "Темная"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)['tj'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
     return (localStorage.getItem('app_lang') as Language) || 'tj';
  });

  useEffect(() => {
    localStorage.setItem('app_lang', language);
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};