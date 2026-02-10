// types/index.ts
export type TaskStatus = 'todo' | 'completed' | 'holiday';

export interface Task {
  date: string;
  day: string;
  studyTime: string;
  task: string;
  isHoliday?: boolean;
  hasMeet?: boolean;
  resource?: string; // URL to learning resource
  status: TaskStatus;
}

export interface Week {
  id: number;
  title: string;
  dates: string;
  description?: string;
  tasks: Task[];
}

export interface Toast {
  id: number;
  message: string;
  icon: string;
}