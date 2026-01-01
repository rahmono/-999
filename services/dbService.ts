import { Grade, Subject, Topic, TopicImage } from '../types';

const STORAGE_KEY = 'maktab_ai_db_v7';

interface DBSchema {
  grades: Grade[];
  subjects: Subject[];
  topics: Topic[];
}

const initialData: DBSchema = {
  grades: [
    { id: 'g1', name: 'Синфи 9' },
    { id: 'g2', name: 'Синфи 10' },
    { id: 'g3', name: 'Синфи 11' },
  ],
  subjects: [
    { id: 's9_1', gradeId: 'g1', name: 'Алгебра' },
    { id: 's10_1', gradeId: 'g2', name: 'Физика' },
    { id: 's11_1', gradeId: 'g3', name: 'Информатика' },
  ],
  topics: [
    { 
        id: 't9_1', 
        subjectId: 's9_1', 
        name: 'Функсияи квадратӣ', 
        content: 'Функсияи квадратӣ намуди $y = ax^2 + bx + c$ дорад.' 
    }
  ]
};

const getDB = (): DBSchema => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(stored);
};

const saveDB = (db: DBSchema) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const dbService = {
  getGrades: (): Grade[] => getDB().grades,
  addGrade: (name: string) => {
    const db = getDB();
    db.grades.push({ id: crypto.randomUUID(), name });
    saveDB(db);
  },

  getSubjects: (gradeId: string): Subject[] => getDB().subjects.filter(s => s.gradeId === gradeId),
  getSubjectById: (id: string): Subject | undefined => getDB().subjects.find(s => s.id === id),
  addSubject: (gradeId: string, name: string) => {
    const db = getDB();
    db.subjects.push({ id: crypto.randomUUID(), gradeId, name });
    saveDB(db);
  },

  getTopics: (subjectId: string): Topic[] => getDB().topics.filter(t => t.subjectId === subjectId),
  getTopicById: (topicId: string): Topic | undefined => getDB().topics.find(t => t.id === topicId),
  addTopic: (subjectId: string, name: string, content?: string, images?: TopicImage[]) => {
    const db = getDB();
    db.topics.push({ 
      id: crypto.randomUUID(), 
      subjectId, 
      name, 
      content, 
      images: images && images.length > 0 ? images : undefined 
    });
    saveDB(db);
  },
  
  getAllGrades: (): Grade[] => getDB().grades,
  getAllSubjects: (): Subject[] => getDB().subjects,
};