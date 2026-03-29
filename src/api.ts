// src/api.ts
import type { Week, Task, TaskStatus, Message } from '@/types';
import { getSharedDataRef } from '@/firebase';
import { setDoc, onSnapshot } from 'firebase/firestore';

// In-memory cache
let memoryCache: Week[] = [];
let messageCache: Message[] = [];
let unsubscribe: (() => void) | null = null;

const removeUndefined = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(item => removeUndefined(item));
  if (typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined) cleaned[key] = removeUndefined(value);
    });
    return cleaned;
  }
  return obj;
};

// Initialize real-time listener — now also returns messages
export const initDataListener = (callback: (weeks: Week[], messages: Message[]) => void) => {
  if (unsubscribe) unsubscribe();

  const sharedRef = getSharedDataRef();

  unsubscribe = onSnapshot(sharedRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      memoryCache = data.weeks || [];
      messageCache = data.messages || [];
      callback(memoryCache, messageCache);
    } else {
      memoryCache = [];
      messageCache = [];
      callback(memoryCache, messageCache);
    }
  }, (error) => {
    console.error('Firebase listener error:', error);
    callback(memoryCache, messageCache);
  });

  return unsubscribe;
};

const getData = (): Week[] => memoryCache;
const getMessages = (): Message[] => messageCache;

const saveData = async (weeks: Week[], messages?: Message[]) => {
  memoryCache = weeks;
  if (messages !== undefined) messageCache = messages;
  try {
    const sharedRef = getSharedDataRef();
    await setDoc(sharedRef, {
      weeks: removeUndefined(weeks),
      messages: removeUndefined(messages !== undefined ? messages : messageCache),
      lastUpdated: Date.now(),
    });
  } catch (e) {
    console.error('Error saving to Firebase:', e);
  }
};

const hasOverlappingWeek = (weeks: Week[], newStartDate: string, newEndDate: string, excludeId?: number): boolean => {
  const newStart = new Date(newStartDate).getTime();
  const newEnd = new Date(newEndDate).getTime();
  return weeks.some(week => {
    if (excludeId && week.id === excludeId) return false;
    const dateMatch = week.dates.match(/(\w{3})\s(\d{1,2})\s-\s(\w{3})\s(\d{1,2})/);
    if (!dateMatch) return false;
    const existingStart = new Date(week.dates.split(' - ')[0]).getTime();
    const existingEnd = new Date(week.dates.split(' - ')[1]).getTime();
    return (newStart <= existingEnd && newEnd >= existingStart);
  });
};

const formatDate = (date: string): string => {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

export const api = {
  async getWeeks(): Promise<Week[]> {
    return getData();
  },

  async createWeek(weekData: { title: string; startDate: string; endDate: string; description?: string }): Promise<Week> {
    const weeks = getData();
    if (hasOverlappingWeek(weeks, weekData.startDate, weekData.endDate)) {
      throw new Error('A week already exists for these dates');
    }
    const newWeek: Week = {
      id: Date.now(),
      title: weekData.title,
      dates: `${formatDate(weekData.startDate)} - ${formatDate(weekData.endDate)}`,
      description: weekData.description || '',
      tasks: [],
    };
    await saveData([...weeks, newWeek]);
    return newWeek;
  },

  async deleteWeek(weekId: number): Promise<void> {
    const weeks = getData();
    await saveData(weeks.filter(w => w.id !== weekId));
  },

  async addTask(weekId: number, taskData: Omit<Task, 'day'>): Promise<Task> {
    const weeks = getData();
    const weekIndex = weeks.findIndex(w => w.id === weekId);
    if (weekIndex === -1) throw new Error('Week not found');

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const newTask: Task = {
      date: taskData.date,
      day: dayNames[new Date(taskData.date).getDay()],
      studyTime: taskData.studyTime,
      task: taskData.task,
      status: taskData.isHoliday ? 'holiday' : (taskData.status || 'todo'),
      isHoliday: taskData.isHoliday || false,
      hasMeet: taskData.hasMeet || false,
      ...(taskData.resource?.trim() ? { resource: taskData.resource.trim() } : {}),
      ...(taskData.meetLink?.trim() ? { meetLink: taskData.meetLink.trim() } : {}),
    };

    const updatedWeeks = [...weeks];
    updatedWeeks[weekIndex].tasks.push(newTask);
    await saveData(updatedWeeks);
    return newTask;
  },

  async updateTask(weekId: number, taskIndex: number, taskData: Task): Promise<Task> {
    const weeks = getData();
    const weekIndex = weeks.findIndex(w => w.id === weekId);
    if (weekIndex === -1) throw new Error('Week not found');
    if (taskIndex < 0 || taskIndex >= weeks[weekIndex].tasks.length) throw new Error('Task not found');

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const updatedTask: Task = {
      date: taskData.date,
      day: dayNames[new Date(taskData.date).getDay()],
      studyTime: taskData.studyTime,
      task: taskData.task,
      status: taskData.status,
      isHoliday: taskData.isHoliday || false,
      hasMeet: taskData.hasMeet || false,
      ...(taskData.resource?.trim() ? { resource: taskData.resource.trim() } : {}),
      ...(taskData.meetLink?.trim() ? { meetLink: taskData.meetLink.trim() } : {}),
    };

    const updatedWeeks = [...weeks];
    updatedWeeks[weekIndex].tasks[taskIndex] = updatedTask;
    await saveData(updatedWeeks);
    return updatedTask;
  },

  async deleteTask(weekId: number, taskIndex: number): Promise<void> {
    const weeks = getData();
    const weekIndex = weeks.findIndex(w => w.id === weekId);
    if (weekIndex === -1) throw new Error('Week not found');
    if (taskIndex < 0 || taskIndex >= weeks[weekIndex].tasks.length) throw new Error('Task not found');
    const updatedWeeks = [...weeks];
    updatedWeeks[weekIndex].tasks.splice(taskIndex, 1);
    await saveData(updatedWeeks);
  },

  async updateTaskStatus(weekId: number, taskIndex: number, status: TaskStatus): Promise<Task> {
    const weeks = getData();
    const weekIndex = weeks.findIndex(w => w.id === weekId);
    if (weekIndex === -1) throw new Error('Week not found');
    if (taskIndex < 0 || taskIndex >= weeks[weekIndex].tasks.length) throw new Error('Task not found');
    const updatedWeeks = [...weeks];
    updatedWeeks[weekIndex].tasks[taskIndex].status = status;
    await saveData(updatedWeeks);
    return updatedWeeks[weekIndex].tasks[taskIndex];
  },

  // ── Messages ──────────────────────────────────────────────────
  async getMessages(): Promise<Message[]> {
    return getMessages();
  },

  async saveMessages(messages: Message[]): Promise<void> {
    await saveData(getData(), messages);
  },
};