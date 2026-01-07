
import { Grade, Subject, Topic, TopicImage } from '../types';

const API_BASE = '/api';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        let errorMsg = `Server Error: ${res.status} ${res.statusText}`;
        try {
            const text = await res.text();
            try {
                const json = JSON.parse(text);
                errorMsg = json.error || json.message || errorMsg;
            } catch (e) {
                errorMsg = text.slice(0, 100) || errorMsg;
            }
        } catch (e) {}
        throw new Error(errorMsg);
    }
    return res.json();
};

export const dbService = {
  // Upload
  uploadSubjectPDF: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    const res = await fetch(`${API_BASE}/admin/upload`, {
        method: 'POST',
        body: formData
    }).catch(e => { throw new Error(`Network failed: ${e.message}`); });
    
    const data = await handleResponse(res);
    return data.uri;
  },

  // Grades
  getGrades: async (): Promise<Grade[]> => {
    const res = await fetch(`${API_BASE}/grades`).catch(e => { throw new Error(`Network failed: ${e.message}`); });
    return handleResponse(res);
  },
  addGrade: async (name: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/grades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: generateId(), name })
    }).catch(e => { throw new Error(`Network failed: ${e.message}`); });
    return handleResponse(res);
  },
  updateGrade: async (id: string, name: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/grades/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    }).catch(e => { throw new Error(`Network failed: ${e.message}`); });
    return handleResponse(res);
  },
  deleteGrade: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/grades/${id}`, { method: 'DELETE' })
      .catch(e => { throw new Error(`Network failed: ${e.message}`); });
    return handleResponse(res);
  },

  // Subjects
  getSubjects: async (gradeId: string): Promise<Subject[]> => {
    const res = await fetch(`${API_BASE}/subjects/${gradeId}`).catch(e => { throw new Error(`Network failed: ${e.message}`); });
    return handleResponse(res);
  },
  getAllSubjects: async (): Promise<Subject[]> => {
    const res = await fetch(`${API_BASE}/subjects`).catch(e => { throw new Error(`Network failed: ${e.message}`); });
    return handleResponse(res);
  },
  getSubjectById: async (id: string): Promise<Subject | undefined> => {
    try {
        const res = await fetch(`${API_BASE}/subject/${id}`);
        if (!res.ok) return undefined;
        return await res.json();
    } catch (e) { return undefined; }
  },
  addSubject: async (gradeId: string, name: string, pdfUri?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: generateId(), gradeId, name, pdfUri })
    }).catch(e => { throw new Error(`Network failed: ${e.message}`); });
    return handleResponse(res);
  },
  updateSubject: async (id: string, gradeId: string, name: string, pdfUri?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gradeId, name, pdfUri })
    }).catch(e => { throw new Error(`Network failed: ${e.message}`); });
    return handleResponse(res);
  },
  deleteSubject: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/subjects/${id}`, { method: 'DELETE' })
      .catch(e => { throw new Error(`Network failed: ${e.message}`); });
    return handleResponse(res);
  },

  // Topics (Kept for compatibility, though less used now)
  getTopics: async (subjectId: string): Promise<Topic[]> => {
    const res = await fetch(`${API_BASE}/topics/${subjectId}`).catch(e => { throw new Error(`Network failed: ${e.message}`); });
    return handleResponse(res);
  },
  getTopicById: async (topicId: string): Promise<Topic | undefined> => {
    const res = await fetch(`${API_BASE}/topic/${topicId}`).catch(e => { throw new Error(`Network failed: ${e.message}`); });
    if (!res.ok) return undefined;
    return res.json();
  },
  addTopic: async (subjectId: string, name: string, content?: string, images?: TopicImage[]): Promise<void> => {
    const res = await fetch(`${API_BASE}/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: generateId(), subjectId, name, content, images })
    }).catch(e => { throw new Error(`Network failed: ${e.message}`); });
    return handleResponse(res);
  },
  updateTopic: async (id: string, subjectId: string, name: string, content?: string, images?: TopicImage[]): Promise<void> => {
    const res = await fetch(`${API_BASE}/topics/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectId, name, content, images })
    }).catch(e => { throw new Error(`Network failed: ${e.message}`); });
    return handleResponse(res);
  },
  deleteTopic: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/topics/${id}`, { method: 'DELETE' })
      .catch(e => { throw new Error(`Network failed: ${e.message}`); });
    return handleResponse(res);
  },
  
  getAllGrades: async (): Promise<Grade[]> => {
    return dbService.getGrades();
  },
};
