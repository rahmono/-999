
import { Grade, Subject, Topic, TopicImage } from '../types';

const API_BASE = '/api';

export const dbService = {
  getGrades: async (): Promise<Grade[]> => {
    const res = await fetch(`${API_BASE}/grades`);
    return res.json();
  },

  addGrade: async (name: string): Promise<void> => {
    await fetch(`${API_BASE}/grades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: crypto.randomUUID(), name })
    });
  },

  getSubjects: async (gradeId: string): Promise<Subject[]> => {
    const res = await fetch(`${API_BASE}/subjects/${gradeId}`);
    return res.json();
  },

  getSubjectById: async (id: string): Promise<Subject | undefined> => {
    const res = await fetch(`${API_BASE}/subjects`);
    const subjects: Subject[] = await res.json();
    return subjects.find(s => s.id === id);
  },

  addSubject: async (gradeId: string, name: string): Promise<void> => {
    await fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: crypto.randomUUID(), gradeId, name })
    });
  },

  getTopics: async (subjectId: string): Promise<Topic[]> => {
    const res = await fetch(`${API_BASE}/topics/${subjectId}`);
    return res.json();
  },

  getTopicById: async (topicId: string): Promise<Topic | undefined> => {
    const res = await fetch(`${API_BASE}/topic/${topicId}`);
    if (!res.ok) return undefined;
    return res.json();
  },

  addTopic: async (subjectId: string, name: string, content?: string, images?: TopicImage[]): Promise<void> => {
    await fetch(`${API_BASE}/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: crypto.randomUUID(), subjectId, name, content, images })
    });
  },
  
  getAllGrades: async (): Promise<Grade[]> => {
    const res = await fetch(`${API_BASE}/grades`);
    return res.json();
  },

  getAllSubjects: async (): Promise<Subject[]> => {
    const res = await fetch(`${API_BASE}/subjects`);
    return res.json();
  },
};
