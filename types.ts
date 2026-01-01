export interface Grade {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  gradeId: string;
  name: string;
}

export interface TopicImage {
  data: string; // base64 string
  mimeType: string;
  order: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  content?: string;
  images?: TopicImage[];
}

export enum UserRole {
  TEACHER = 'Teacher',
  STUDENT = 'Student',
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}