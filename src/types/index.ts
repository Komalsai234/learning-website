export type TaskStatus = 'todo' | 'completed' | 'holiday';

export interface Resource {
  id: string;
  title: string;
  url: string;
  addedAt: string;
}

export interface Task {
  date: string;
  day: string;
  studyTime: string;
  task: string;
  isHoliday?: boolean;
  hasMeet?: boolean;
  status: TaskStatus;
}

export interface Week {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  dates: string;
  description?: string;
  tasks: Task[];
  resources: Resource[];
}

export interface Toast {
  id: number;
  message: string;
  icon: string;
}