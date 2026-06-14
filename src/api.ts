import type { Week, Task, TaskStatus, Message, Quiz, QuizQuestion, Project } from '@/types';
import { getSharedDataRef } from '@/firebase';
import { setDoc, onSnapshot } from 'firebase/firestore';

let memoryCache: Week[] = [];
let messageCache: Message[] = [];
let quizCache: Quiz[] = [];
let projectCache: Project[] = [];
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

export const initDataListener = (callback: (weeks: Week[], messages: Message[], quizzes: Quiz[], projects: Project[]) => void) => {
  if (unsubscribe) unsubscribe();
  const sharedRef = getSharedDataRef();
  unsubscribe = onSnapshot(sharedRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      memoryCache = data.weeks || [];
      messageCache = data.messages || [];
      quizCache = data.quizzes || [];
      projectCache = data.projects || [];
      callback(memoryCache, messageCache, quizCache, projectCache);
    } else {
      memoryCache = []; messageCache = []; quizCache = []; projectCache = [];
      callback([], [], [], []);
    }
  }, (error) => {
    console.error('Firebase listener error:', error);
    callback(memoryCache, messageCache, quizCache, projectCache);
  });
  return unsubscribe;
};

const getData = (): Week[] => memoryCache;
const getMessages = (): Message[] => messageCache;
const getQuizzes = (): Quiz[] => quizCache;
const getProjects = (): Project[] => projectCache;

const saveData = async (weeks: Week[], messages?: Message[], quizzes?: Quiz[], projects?: Project[]) => {
  memoryCache = weeks;
  if (messages !== undefined) messageCache = messages;
  if (quizzes !== undefined) quizCache = quizzes;
  if (projects !== undefined) projectCache = projects;
  try {
    const sharedRef = getSharedDataRef();
    await setDoc(sharedRef, {
      weeks: removeUndefined(weeks),
      messages: removeUndefined(messages !== undefined ? messages : messageCache),
      quizzes: removeUndefined(quizzes !== undefined ? quizzes : quizCache),
      projects: removeUndefined(projects !== undefined ? projects : projectCache),
      lastUpdated: Date.now(),
    });
  } catch (e) {
    console.error('Error saving to Firebase:', e);
    throw e;
  }
};

const hasOverlappingWeek = (weeks: Week[], newStartDate: string, newEndDate: string, excludeId?: number): boolean => {
  const newStart = new Date(newStartDate).getTime();
  const newEnd = new Date(newEndDate).getTime();
  return weeks.some(week => {
    if (excludeId && week.id === excludeId) return false;
    const existingStart = new Date(week.dates.split(' - ')[0]).getTime();
    const existingEnd = new Date(week.dates.split(' - ')[1]).getTime();
    return (newStart <= existingEnd && newEnd >= existingStart);
  });
};

const formatDate = (date: string): string => {
  const d = new Date(date);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

export const api = {
  // ── Weeks ──────────────────────────────────────────────────────
  async getWeeks(): Promise<Week[]> { return getData(); },

  async createWeek(weekData: { title: string; startDate: string; endDate: string; description?: string }): Promise<Week> {
    const weeks = getData();
    if (hasOverlappingWeek(weeks, weekData.startDate, weekData.endDate)) {
      throw new Error('A week already exists for these dates');
    }
    const newWeek: Week = {
      id: Date.now(), title: weekData.title,
      dates: `${formatDate(weekData.startDate)} - ${formatDate(weekData.endDate)}`,
      description: weekData.description || '', tasks: [],
    };
    await saveData([...weeks, newWeek]);
    return newWeek;
  },

  async deleteWeek(weekId: number): Promise<void> {
    await saveData(getData().filter(w => w.id !== weekId));
  },

  async addTask(weekId: number, taskData: Omit<Task, 'day'>): Promise<Task> {
    const weeks = getData();
    const weekIndex = weeks.findIndex(w => w.id === weekId);
    if (weekIndex === -1) throw new Error('Week not found');
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const newTask: Task = {
      ...taskData,
      day: dayNames[new Date(taskData.date).getDay()],
      status: taskData.isHoliday ? 'holiday' : (taskData.status || 'todo'),
      isHoliday: taskData.isHoliday || false,
      hasMeet: taskData.hasMeet || false,
      resources: taskData.resources && taskData.resources.length > 0 ? taskData.resources : [],
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
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const updatedTask: Task = {
      ...taskData,
      day: dayNames[new Date(taskData.date).getDay()],
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
    const updatedWeeks = weeks.map((w, i) =>
      i === weekIndex ? { ...w, tasks: w.tasks.filter((_, ti) => ti !== taskIndex) } : w
    );
    await saveData(updatedWeeks);
  },

  async updateTaskStatus(weekId: number, taskIndex: number, status: TaskStatus): Promise<Task> {
    const weeks = getData();
    const weekIndex = weeks.findIndex(w => w.id === weekId);
    if (weekIndex === -1) throw new Error('Week not found');
    const updatedWeeks = [...weeks];
    updatedWeeks[weekIndex].tasks[taskIndex].status = status;
    await saveData(updatedWeeks);
    return updatedWeeks[weekIndex].tasks[taskIndex];
  },

  // ── Messages ───────────────────────────────────────────────────
  async getMessages(): Promise<Message[]> { return getMessages(); },
  async saveMessages(messages: Message[]): Promise<void> {
    await saveData(getData(), messages);
  },

  // ── Quizzes ────────────────────────────────────────────────────
  async getQuizzes(): Promise<Quiz[]> { return getQuizzes(); },

  async createQuiz(quizData: { title: string; description: string; questions: QuizQuestion[] }): Promise<Quiz> {
    const quizzes = getQuizzes();
    const newQuiz: Quiz = {
      id: Date.now(), title: quizData.title,
      description: quizData.description, questions: quizData.questions,
      createdAt: Date.now(),
    };
    await saveData(getData(), getMessages(), [...quizzes, newQuiz]);
    return newQuiz;
  },

  async updateQuiz(quiz: Quiz): Promise<void> {
    const quizzes = getQuizzes();
    const idx = quizzes.findIndex(q => q.id === quiz.id);
    if (idx === -1) throw new Error('Quiz not found');
    const updated = [...quizzes];
    updated[idx] = quiz;
    await saveData(getData(), getMessages(), updated);
  },

  async deleteQuiz(quizId: number): Promise<void> {
    await saveData(getData(), getMessages(), getQuizzes().filter(q => q.id !== quizId));
  },

  // ── Projects ───────────────────────────────────────────────────
  async getProjects(): Promise<Project[]> { return getProjects(); },

  async createProject(data: { name: string; content: string }): Promise<Project> {
    const project: Project = { id: Date.now(), name: data.name, content: data.content, createdAt: Date.now() };
    await saveData(getData(), getMessages(), getQuizzes(), [...getProjects(), project]);
    return project;
  },

  async updateProject(projectId: number, content: string): Promise<void> {
    const updated = getProjects().map(p => p.id === projectId ? { ...p, content } : p);
    await saveData(getData(), getMessages(), getQuizzes(), updated);
  },

  async deleteProject(projectId: number): Promise<void> {
    await saveData(getData(), getMessages(), getQuizzes(), getProjects().filter(p => p.id !== projectId));
  },
};
