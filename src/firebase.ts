import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue, remove } from 'firebase/database';
import type { Week, Task, TaskStatus, Resource } from '@/types';
import { formatWeekRange } from '@/utils/dateUtils';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDO5rsYlgaDIiCDpB9XHABUQgcHHuxXi2s",
  authDomain: "aardra-s-learnings.firebaseapp.com",
  databaseURL: "https://aardra-s-learnings-default-rtdb.firebaseio.com",
  projectId: "aardra-s-learnings",
  storageBucket: "aardra-s-learnings.firebasestorage.app",
  messagingSenderId: "969013634799",
  appId: "1:969013634799:web:d60da789c9e08d2bb3ec4c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const api = {
  // Create a new week
  async createWeek(weekData: { title: string; startDate: string; endDate: string; description: string }) {
    try {
      // Check for overlapping weeks
      const weeksRef = ref(database, 'weeks');
      const snapshot = await new Promise<any>((resolve) => {
        onValue(weeksRef, resolve, { onlyOnce: true });
      });

      const existingWeeks = snapshot.val();
      if (existingWeeks) {
        const newStart = new Date(weekData.startDate);
        const newEnd = new Date(weekData.endDate);

        for (const key in existingWeeks) {
          const week = existingWeeks[key];
          const existingStart = new Date(week.startDate);
          const existingEnd = new Date(week.endDate);

          if (
            (newStart >= existingStart && newStart <= existingEnd) ||
            (newEnd >= existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)
          ) {
            throw new Error('A week already exists for these dates');
          }
        }
      }

      const newWeekRef = push(weeksRef);
      const weekId = newWeekRef.key!;

      const formattedDates = formatWeekRange(weekData.startDate, weekData.endDate);

      const week: Week = {
        id: weekId,
        title: weekData.title,
        startDate: weekData.startDate,
        endDate: weekData.endDate,
        dates: formattedDates,
        description: weekData.description,
        tasks: [],
        resources: []
      };

      await set(newWeekRef, week);
      return week;
    } catch (error) {
      throw error;
    }
  },

  // Delete a week
  async deleteWeek(weekId: string) {
    const weekRef = ref(database, `weeks/${weekId}`);
    await remove(weekRef);
  },

  // Add a task to a week
  async addTask(weekId: string, task: Task) {
    const tasksRef = ref(database, `weeks/${weekId}/tasks`);
    const newTaskRef = push(tasksRef);
    await set(newTaskRef, task);
  },

  // Update a task
  async updateTask(weekId: string, taskIndex: number, task: Task) {
    const taskRef = ref(database, `weeks/${weekId}/tasks/${taskIndex}`);
    await set(taskRef, task);
  },

  // Delete a task
  async deleteTask(weekId: string, taskIndex: number) {
    const taskRef = ref(database, `weeks/${weekId}/tasks/${taskIndex}`);
    await remove(taskRef);
  },

  // Update task status
  async updateTaskStatus(weekId: string, taskIndex: number, status: TaskStatus) {
    const taskRef = ref(database, `weeks/${weekId}/tasks/${taskIndex}/status`);
    await set(taskRef, status);
  },

  // Add a resource to a week
  async addResource(weekId: string, resource: Resource) {
    const resourcesRef = ref(database, `weeks/${weekId}/resources`);
    const newResourceRef = push(resourcesRef);
    await set(newResourceRef, resource);
  },

  // Delete a resource
  async deleteResource(weekId: string, resourceId: string) {
    const weekRef = ref(database, `weeks/${weekId}/resources`);
    
    // Get all resources
    const snapshot = await new Promise<any>((resolve) => {
      onValue(weekRef, resolve, { onlyOnce: true });
    });

    const resources = snapshot.val();
    if (resources) {
      // Find the key that matches the resourceId
      for (const key in resources) {
        if (resources[key].id === resourceId) {
          const resourceRef = ref(database, `weeks/${weekId}/resources/${key}`);
          await remove(resourceRef);
          break;
        }
      }
    }
  }
};

// Initialize real-time listener for weeks data
export function initDataListener(callback: (weeks: Week[]) => void) {
  const weeksRef = ref(database, 'weeks');
  
  const unsubscribe = onValue(weeksRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const weeksArray: Week[] = Object.keys(data).map(key => ({
        ...data[key],
        id: key,
        tasks: data[key].tasks ? Object.values(data[key].tasks) : [],
        resources: data[key].resources ? Object.values(data[key].resources) : []
      }));
      
      // Sort weeks by start date (most recent first)
      weeksArray.sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateB.getTime() - dateA.getTime();
      });
      
      callback(weeksArray);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
}