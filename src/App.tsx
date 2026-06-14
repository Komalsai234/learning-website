import { useState, useEffect } from 'react';
import type { Week, Task, Toast, Message, Quiz, Project } from '@/types';
import { api, initDataListener } from '@/api';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Greeting } from '@/components/Greeting';
import { WeekCard } from '@/components/WeekCard';
import { TasksPageView } from '@/components/TasksPageView';
import { MessagesPage } from '@/components/MessagesPage';
import { QuizPage } from '@/components/QuizPage';
import { QuizDetailView } from '@/components/QuizDetailView';
import { CreateQuizModal } from '@/components/CreateQuizModal';
import { ProjectsPage } from '@/components/ProjectsPage';
import { ProjectDetailView } from '@/components/ProjectDetailView';
import { AddProjectModal } from '@/components/AddProjectModal';
import { AddWeekModal } from '@/components/AddWeekModal';
import { AddTaskModal } from '@/components/AddTaskModal';
import { EditTaskModal } from '@/components/EditTaskModal';
import { ToastContainer } from '@/components/ToastContainer';
import { EmptyState } from '@/components/EmptyState';
import { Footer } from '@/components/Footer';
import { Loader2, ChevronDown } from 'lucide-react';

const EXISTING_WEEKS_CUTOFF = new Date('2026-06-02').getTime();

type Page = 'weeks' | 'messages' | 'quiz' | 'projects';

function App() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('weeks');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddWeekModalOpen, setIsAddWeekModalOpen] = useState(false);
  const [oldWeeksOpen, setOldWeeksOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [currentWeekIndex, setCurrentWeekIndex] = useState<number | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number | null>(null);
  const [viewingWeekIndex, setViewingWeekIndex] = useState<number | null>(null);
  const [viewingQuizId, setViewingQuizId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Firebase real-time listener
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = initDataListener((weeksData, messagesData, quizzesData, projectsData) => {
      const sortedWeeks = [...weeksData].sort((a, b) => b.id - a.id);
      setWeeks(sortedWeeks);
      setMessages(messagesData);
      setQuizzes(quizzesData);
      setProjects([...projectsData].sort((a, b) => b.createdAt - a.createdAt));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (viewingWeekIndex !== null && (weeks.length === 0 || viewingWeekIndex >= weeks.length)) {
      setViewingWeekIndex(null);
    }
  }, [weeks, viewingWeekIndex]);

  // Handle browser back button — single tap only
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.viewingWeek !== undefined) {
        setViewingWeekIndex(event.state.viewingWeek);
      } else {
        setViewingWeekIndex(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleViewTasks = (weekIndex: number) => {
    setViewingWeekIndex(weekIndex);
    window.history.pushState({ viewingWeek: weekIndex }, '', `#week-${weekIndex}`);
  };

  const handleCloseTasksView = () => {
    setViewingWeekIndex(null);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const saveMessages = async (updated: Message[]) => {
    setMessages(updated);
    await api.saveMessages(updated);
  };

  const showToast = (message: string, icon: string = '✓') => {
    const newToast: Toast = { id: Date.now(), message, icon };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 3000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleAddWeek = async (weekData: {
    title: string; startDate: string; endDate: string; description: string;
  }) => {
    try {
      await api.createWeek(weekData);
      showToast('Week created successfully!', '🎉');
      return true;
    } catch (error: any) {
      if (error.message === 'A week already exists for these dates') {
        alert('A week already exists for these dates. Please choose different dates.');
      } else {
        showToast('Failed to create week', '❌');
      }
      return false;
    }
  };

  const handleDeleteWeek = async (weekIndex: number) => {
    if (!confirm('Are you sure you want to delete this entire week? This action cannot be undone.')) return;
    try {
      const week = weeks[weekIndex];
      if (!week) return;
      await api.deleteWeek(week.id);
      showToast('Week deleted', '🗑️');
    } catch {
      showToast('Failed to delete week', '❌');
    }
  };

  const handleAddTask = async (task: Task) => {
    if (currentWeekIndex === null) return;
    try {
      const week = weeks[currentWeekIndex];
      if (!week) return;
      await api.addTask(week.id, task);
      showToast('Task added successfully!', '✅');
    } catch {
      showToast('Failed to add task', '❌');
    }
  };

  const handleEditTask = async (task: Task) => {
    if (currentWeekIndex === null || currentTaskIndex === null) return;
    try {
      const week = weeks[currentWeekIndex];
      if (!week) return;
      await api.updateTask(week.id, currentTaskIndex, task);
      showToast('Task updated successfully!', '✏️');
    } catch {
      showToast('Failed to update task', '❌');
    }
  };



  const handleDirectDeleteTask = async (weekIndex: number, taskIndex: number) => {
    if (!confirm('Delete this task?')) return;
    try {
      const week = weeks[weekIndex];
      if (!week) return;
      await api.deleteTask(week.id, taskIndex);
      showToast('Task deleted', '🗑️');
    } catch {
      showToast('Failed to delete task', '❌');
    }
  };

  const handleUpdateTask = async (weekIndex: number, taskIndex: number, updatedTask: Task) => {
    const week = weeks[weekIndex];
    if (!week) return;
    // Optimistic update — reflect change immediately in UI
    setWeeks(prev => prev.map((w, wi) =>
      wi === weekIndex
        ? { ...w, tasks: w.tasks.map((t, ti) => ti === taskIndex ? updatedTask : t) }
        : w
    ));
    try {
      await api.updateTask(week.id, taskIndex, updatedTask);
    } catch {
      showToast('Failed to update task', '❌');
      // Re-fetch from cache to revert optimistic update
      setWeeks(prev => [...prev]);
    }
  };

  // Quiz handlers
  const handleCreateQuiz = async (data: { title: string; description: string; questions: any[] }) => {
    try {
      await api.createQuiz(data);
      showToast('Quiz created!', '🎉');
    } catch {
      showToast('Failed to create quiz', '❌');
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm('Delete this quiz? This cannot be undone.')) return;
    try {
      await api.deleteQuiz(quizId);
      showToast('Quiz deleted', '🗑️');
    } catch {
      showToast('Failed to delete quiz', '❌');
    }
  };

  const handleUpdateQuiz = async (quiz: Quiz) => {
    try {
      await api.updateQuiz(quiz);
    } catch {
      showToast('Failed to save answers', '❌');
    }
  };

  const handleEditQuizSave = async (data: { title: string; description: string; questions: any[] }) => {
    if (editingQuizId === null) return;
    const quiz = quizzes.find(q => q.id === editingQuizId);
    if (!quiz) return;
    try {
      await api.updateQuiz({ ...quiz, ...data });
      showToast('Quiz updated!', '✏️');
      setEditingQuizId(null);
    } catch {
      showToast('Failed to update quiz', '❌');
    }
  };

  const handleCreateProject = async (data: { name: string; content: string }) => {
    try {
      await api.createProject(data);
      showToast('Project created!', '🎉');
    } catch {
      showToast('Failed to create project', '❌');
    }
  };

  const handleModifyProject = async (projectId: number, content: string) => {
    try {
      await api.updateProject(projectId, content);
      showToast('Project updated!', '✏️');
    } catch {
      showToast('Failed to update project', '❌');
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      await api.deleteProject(projectId);
      showToast('Project deleted', '🗑️');
    } catch {
      showToast('Failed to delete project', '❌');
    }
  };

  const openAddTaskModal = (weekIndex: number) => { setCurrentWeekIndex(weekIndex); setIsAddTaskModalOpen(true); };
  const openEditTaskModal = (weekIndex: number, taskIndex: number) => { setCurrentWeekIndex(weekIndex); setCurrentTaskIndex(taskIndex); setIsEditTaskModalOpen(true); };
  const closeAddTaskModal = () => { setIsAddTaskModalOpen(false); setCurrentWeekIndex(null); };
  const closeEditTaskModal = () => { setIsEditTaskModalOpen(false); setCurrentWeekIndex(null); setCurrentTaskIndex(null); };

  const viewingWeek: Week | null =
    viewingWeekIndex !== null && viewingWeekIndex >= 0 && viewingWeekIndex < weeks.length
      ? weeks[viewingWeekIndex] : null;
  const isViewingTasks = viewingWeek !== null;

  const viewingQuiz: Quiz | null = viewingQuizId !== null
    ? quizzes.find(q => q.id === viewingQuizId) ?? null : null;

  const currentTask: Task | null =
    currentWeekIndex !== null && currentTaskIndex !== null && weeks[currentWeekIndex]?.tasks?.[currentTaskIndex]
      ? weeks[currentWeekIndex].tasks[currentTaskIndex] : null;

  const unreadCount = messages.filter(m => !m.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5ede3' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #c28659, #8b5a3c)' }}>
            <Loader2 className="w-7 h-7 text-white animate-spin" />
          </div>
          <p className="text-[#4a3728] font-semibold text-sm">Loading your learning journey…</p>
        </div>
      </div>
    );
  }

  // Full-screen overlays: quiz detail, project detail, and tasks view
  if (viewingProject) {
    return (
      <>
        <ProjectDetailView project={viewingProject} onClose={() => setViewingProject(null)} />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  if (viewingQuiz) {
    return (
      <>
        <QuizDetailView
          quiz={viewingQuiz}
          onClose={() => setViewingQuizId(null)}
          onUpdateQuiz={handleUpdateQuiz}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f5ede3' }}>
      <div className="fixed inset-0 -z-10" style={{ background: 'linear-gradient(160deg, #f5ede3 0%, #ede4d5 100%)' }}>
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(194,134,89,0.12) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'float 22s ease-in-out infinite' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(171,110,71,0.10) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'float 28s ease-in-out infinite -6s' }} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full opacity-40" style={{ background: 'radial-gradient(circle, rgba(155,107,79,0.10) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'float 20s ease-in-out infinite -12s' }} />
      </div>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={(page: string) => { setCurrentPage(page as Page); setSidebarOpen(false); setViewingWeekIndex(null); }}
        onNewWeek={() => { setSidebarOpen(false); setIsAddWeekModalOpen(true); }}
        unreadCount={unreadCount}
      />

      {!isViewingTasks && (
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          unreadCount={unreadCount}
          onGoToMessages={() => setCurrentPage('messages')}
        />
      )}

      {isViewingTasks && viewingWeek ? (
        <TasksPageView
          week={viewingWeek}
          weekIndex={viewingWeekIndex!}
          onClose={handleCloseTasksView}
          onAddTask={openAddTaskModal}
          onEditTask={openEditTaskModal}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDirectDeleteTask}
        />
      ) : currentPage === 'messages' ? (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <MessagesPage messages={messages} onSaveMessages={saveMessages} />
        </main>
      ) : currentPage === 'quiz' ? (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <QuizPage
            quizzes={quizzes}
            onCreateQuiz={() => setIsCreateQuizModalOpen(true)}
            onViewQuiz={id => setViewingQuizId(id)}
            onEditQuiz={id => setEditingQuizId(id)}
            onDeleteQuiz={handleDeleteQuiz}
          />
        </main>
      ) : currentPage === 'projects' ? (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <ProjectsPage
            projects={projects}
            onCreateProject={() => setIsAddProjectModalOpen(true)}
            onViewProject={setViewingProject}
            onModifyProject={handleModifyProject}
            onDeleteProject={handleDeleteProject}
          />
        </main>
      ) : (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <Greeting />
          {weeks.length === 0 ? (
            <EmptyState />
          ) : (() => {
            const newWeeks = weeks.filter(w => w.id >= EXISTING_WEEKS_CUTOFF);
            const oldWeeks = weeks.filter(w => w.id < EXISTING_WEEKS_CUTOFF);
            return (
              <div className="space-y-8">
                {newWeeks.map(week => (
                  <WeekCard key={week.id} week={week} weekIndex={weeks.indexOf(week)} onViewTasks={handleViewTasks} onDeleteWeek={handleDeleteWeek} />
                ))}

                {oldWeeks.length > 0 && (
                  <div className="rounded-2xl overflow-hidden"
                    style={{ border: '1px solid #ddd0bc', background: 'linear-gradient(160deg, #fdfaf6 0%, #faf5ee 100%)', boxShadow: '0 2px 12px rgba(44,24,16,0.07)' }}>
                    <button
                      onClick={() => setOldWeeksOpen(v => !v)}
                      className="w-full flex items-center justify-between px-6 py-4 transition-colors duration-200 hover:bg-[#f0e6da]">
                      <div className="flex items-center gap-3">
                        <span className="font-['Playfair_Display'] font-bold text-lg text-[#1e1208]">Previous Works</span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(171,110,71,0.12)', color: '#8b5a3c' }}>
                          {oldWeeks.length}
                        </span>
                      </div>
                      <ChevronDown className="w-5 h-5 text-[#8b5a3c] transition-transform duration-300"
                        style={{ transform: oldWeeksOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </button>

                    {oldWeeksOpen && (
                      <div className="px-6 pb-6 space-y-6 border-t border-[#e8ddd0] pt-6">
                        {oldWeeks.map(week => (
                          <WeekCard key={week.id} week={week} weekIndex={weeks.indexOf(week)} onViewTasks={handleViewTasks} onDeleteWeek={handleDeleteWeek} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
          <Footer />
        </main>
      )}

      <AddWeekModal isOpen={isAddWeekModalOpen} onClose={() => setIsAddWeekModalOpen(false)} onSave={handleAddWeek} />
      <AddTaskModal isOpen={isAddTaskModalOpen} onClose={closeAddTaskModal} onSave={handleAddTask} />
      <EditTaskModal isOpen={isEditTaskModalOpen} onClose={closeEditTaskModal} onSave={handleEditTask} task={currentTask} />
      <CreateQuizModal isOpen={isCreateQuizModalOpen} onClose={() => setIsCreateQuizModalOpen(false)} onSave={handleCreateQuiz} />
      <CreateQuizModal
        key={editingQuizId ?? 'edit-closed'}
        isOpen={editingQuizId !== null}
        onClose={() => setEditingQuizId(null)}
        onSave={handleEditQuizSave}
        initialData={editingQuizId !== null ? quizzes.find(q => q.id === editingQuizId) : undefined}
      />
      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onSave={handleCreateProject}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
