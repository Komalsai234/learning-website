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
  resource?: string;       // legacy single resource (kept for backward compat)
  resources?: Resource[];  // new multiple resources
  status: TaskStatus;
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