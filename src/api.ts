import type { Week, Task, TaskStatus } from '@/types';
import { getSharedDataRef } from '@/firebase';
import { setDoc, onSnapshot } from 'firebase/firestore';

// In-memory cache
let memoryCache: Week[] = [];
let unsubscribe: (() => void) | null = null;

// Initialize real-time listener
export const initDataListener = (callback: (weeks: Week[]) => void) => {
  // Unsubscribe from previous listener if exists
  if (unsubscribe) {
    unsubscribe();
  }
  
  const sharedRef = getSharedDataRef();
  
  unsubscribe = onSnapshot(sharedRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      memoryCache = data.weeks || [];
      callback(memoryCache);
    } else {
      // Initialize with empty data
      memoryCache = [];
      callback(memoryCache);
    }
  }, (error) => {
    console.error('Firebase listener error:', error);
    callback(memoryCache);
  });
  
  return unsubscribe;
};

// Get data from memory cache
const getData = (): Week[] => memoryCache;

// Save data to Firebase
const saveData = async (weeks: Week[]) => {
  memoryCache = weeks;
  try {
    const sharedRef = getSharedDataRef();
    await setDoc(sharedRef, { weeks, lastUpdated: Date.now() });
  } catch (e) {
    console.error('Error saving to Firebase:', e);
  }
};

// Check for overlapping dates
const hasOverlappingWeek = (weeks: Week[], newStartDate: string, newEndDate: string, excludeId?: number): boolean => {
  const newStart = new Date(newStartDate).getTime();
  const newEnd = new Date(newEndDate).getTime();

  return weeks.some(week => {
    if (excludeId && week.id === excludeId) return false;
    
    const dateMatch = week.dates.match(/(\d{2})\/(\d{2})\/(\d{2})/g);
    if (!dateMatch || dateMatch.length < 2) return false;
    
    const [startDay, startMonth, startYear] = dateMatch[0].split('/').map(Number);
    const [endDay, endMonth, endYear] = dateMatch[1].split('/').map(Number);
    
    const existingStart = new Date(2000 + startYear, startMonth - 1, startDay).getTime();
    const existingEnd = new Date(2000 + endYear, endMonth - 1, endDay).getTime();
    
    return (newStart <= existingEnd && newEnd >= existingStart);
  });
};

// Format dates as dd/mm/yy
const formatDate = (date: string): string => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
};

export const api = {
  // Get all weeks - returns current cache
  async getWeeks(): Promise<Week[]> {
    return getData();
  },

  // Create new week
  async createWeek(weekData: { title: string; startDate: string; endDate: string; description?: string }): Promise<Week> {
    const weeks = getData();
    
    // Check for overlapping weeks
    if (hasOverlappingWeek(weeks, weekData.startDate, weekData.endDate)) {
      throw new Error('A week already exists for these dates');
    }

    const newWeek: Week = {
      id: Date.now(),
      title: weekData.title,
      dates: `${formatDate(weekData.startDate)} - ${formatDate(weekData.endDate)}`,
      description: weekData.description || '',
      tasks: []
    };

    const updatedWeeks = [...weeks, newWeek];
    await saveData(updatedWeeks);
    
    return newWeek;
  },

  // Delete week
  async deleteWeek(weekId: number): Promise<void> {
    const weeks = getData();
    const filtered = weeks.filter(w => w.id !== weekId);
    await saveData(filtered);
  },

  // Add task to week
  async addTask(weekId: number, taskData: Omit<Task, 'day'>): Promise<Task> {
    const weeks = getData();
    const weekIndex = weeks.findIndex(w => w.id === weekId);
    
    if (weekIndex === -1) {
      throw new Error('Week not found');
    }

    const selectedDate = new Date(taskData.date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const autoDay = dayNames[selectedDate.getDay()];

    const newTask: Task = {
      ...taskData,
      day: autoDay,
      status: taskData.isHoliday ? 'holiday' : (taskData.status || 'todo')
    };

    const updatedWeeks = [...weeks];
    updatedWeeks[weekIndex].tasks.push(newTask);
    await saveData(updatedWeeks);
    
    return newTask;
  },

  // Update task
  async updateTask(weekId: number, taskIndex: number, taskData: Task): Promise<Task> {
    const weeks = getData();
    const weekIndex = weeks.findIndex(w => w.id === weekId);
    
    if (weekIndex === -1) {
      throw new Error('Week not found');
    }
    
    if (taskIndex < 0 || taskIndex >= weeks[weekIndex].tasks.length) {
      throw new Error('Task not found');
    }

    const selectedDate = new Date(taskData.date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const autoDay = dayNames[selectedDate.getDay()];

    const updatedWeeks = [...weeks];
    updatedWeeks[weekIndex].tasks[taskIndex] = {
      ...taskData,
      day: autoDay
    };
    
    await saveData(updatedWeeks);
    return updatedWeeks[weekIndex].tasks[taskIndex];
  },

  // Delete task
  async deleteTask(weekId: number, taskIndex: number): Promise<void> {
    const weeks = getData();
    const weekIndex = weeks.findIndex(w => w.id === weekId);
    
    if (weekIndex === -1) {
      throw new Error('Week not found');
    }
    
    if (taskIndex < 0 || taskIndex >= weeks[weekIndex].tasks.length) {
      throw new Error('Task not found');
    }
    
    const updatedWeeks = [...weeks];
    updatedWeeks[weekIndex].tasks.splice(taskIndex, 1);
    await saveData(updatedWeeks);
  },

  // Update task status
  async updateTaskStatus(weekId: number, taskIndex: number, status: TaskStatus): Promise<Task> {
    const weeks = getData();
    const weekIndex = weeks.findIndex(w => w.id === weekId);
    
    if (weekIndex === -1) {
      throw new Error('Week not found');
    }
    
    if (taskIndex < 0 || taskIndex >= weeks[weekIndex].tasks.length) {
      throw new Error('Task not found');
    }
    
    const updatedWeeks = [...weeks];
    updatedWeeks[weekIndex].tasks[taskIndex].status = status;
    await saveData(updatedWeeks);
    
    return updatedWeeks[weekIndex].tasks[taskIndex];
  }
};
