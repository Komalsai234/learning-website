export type TaskStatus = 'todo' | 'completed' | 'holiday';

export interface Resource {
  url: string;
  label: string;
}

export interface Task {
  date: string;
  day: string;
  studyTime: string;
  task: string;
  isHoliday: boolean;
  hasMeet: boolean;
  meetLink?: string;
  resource?: string;
  resources?: Resource[];
  status: TaskStatus;
  voiceNote?: string;
}

export interface Week {
  id: number;
  title: string;
  dates: string;
  description: string;
  tasks: Task[];
}

export interface Toast {
  id: number;
  message: string;
  icon: string;
}

export interface MessageReply {
  id: number;
  text: string;
  from: 'komal' | 'aardra';
  ts: number;
}

export interface Message {
  id: number;
  text: string;
  read: boolean;
  replies: MessageReply[];
}

// ── Quiz ────────────────────────────────────────────────────────
export type QuestionType = 'text' | 'single' | 'multiple';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options: QuizOption[];
  required: boolean;
  userAnswer: string | string[] | null;
  remark?: string | null;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
  createdAt: number;
}
