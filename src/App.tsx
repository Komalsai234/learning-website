import { useState, useEffect } from 'react';
import type { Week, Task, Toast, TaskStatus } from '@/types';
import { api, initDataListener } from '@/api';
import { Navbar } from '@/components/Navbar';
import { Greeting } from '@/components/Greeting';
import { WeekCard } from '@/components/WeekCard';
import { TasksPageView } from '@/components/TasksPageView';
import { AddWeekModal } from '@/components/AddWeekModal';
import { AddTaskModal } from '@/components/AddTaskModal';
import { EditTaskModal } from '@/components/EditTaskModal';
import { StatusChangeModal } from '@/components/StatusChangeModal';
import { ToastContainer } from '@/components/ToastContainer';
import { EmptyState } from '@/components/EmptyState';
import { Footer } from '@/components/Footer';
import { Loader2 } from 'lucide-react';

function App() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddWeekModalOpen, setIsAddWeekModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [currentWeekIndex, setCurrentWeekIndex] = useState<number | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number | null>(null);
  const [viewingWeekIndex, setViewingWeekIndex] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Initialize Firebase real-time listener
  useEffect(() => {
    setIsLoading(true);
    
    // Set up real-time listener
    const unsubscribe = initDataListener((data) => {
      setWeeks(data);
      setIsLoading(false);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.viewingWeek !== undefined) {
        setViewingWeekIndex(event.state.viewingWeek);
      } else {
        setViewingWeekIndex(null);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const showToast = (message: string, icon: string = '✓') => {
    const newToast: Toast = {
      id: Date.now(),
      message,
      icon
    };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 3000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleAddWeek = async (weekData: { title: string; startDate: string; endDate: string; description: string }) => {
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
    if (confirm('Are you sure you want to delete this entire week? This action cannot be undone.')) {
      try {
        const week = weeks[weekIndex];
        await api.deleteWeek(week.id);
        showToast('Week deleted', '🗑️');
      } catch (error) {
        showToast('Failed to delete week', '❌');
      }
    }
  };

  const handleViewTasks = (weekIndex: number) => {
    setViewingWeekIndex(weekIndex);
    // Push state to browser history
    window.history.pushState({ viewingWeek: weekIndex }, '', `#week-${weekIndex}`);
  };

  const handleCloseTasksView = () => {
    setViewingWeekIndex(null);
    // Go back in browser history
    if (window.history.state?.viewingWeek !== undefined) {
      window.history.back();
    }
  };

  const handleAddTask = async (task: Task) => {
    if (currentWeekIndex !== null) {
      try {
        const week = weeks[currentWeekIndex];
        await api.addTask(week.id, task);
        showToast('Task added successfully!', '✅');
      } catch (error) {
        showToast('Failed to add task', '❌');
      }
    }
  };

  const handleEditTask = async (task: Task) => {
    if (currentWeekIndex !== null && currentTaskIndex !== null) {
      try {
        const week = weeks[currentWeekIndex];
        await api.updateTask(week.id, currentTaskIndex, task);
        showToast('Task updated successfully!', '✏️');
      } catch (error) {
        showToast('Failed to update task', '❌');
      }
    }
  };

  const handleDeleteTask = async () => {
    if (currentWeekIndex !== null && currentTaskIndex !== null) {
      try {
        const week = weeks[currentWeekIndex];
        await api.deleteTask(week.id, currentTaskIndex);
        showToast('Task deleted', '🗑️');
        setIsEditTaskModalOpen(false);
      } catch (error) {
        showToast('Failed to delete task', '❌');
      }
    }
  };

  const handleChangeStatus = async (status: TaskStatus) => {
    if (currentWeekIndex !== null && currentTaskIndex !== null) {
      try {
        const week = weeks[currentWeekIndex];
        await api.updateTaskStatus(week.id, currentTaskIndex, status);
        
        const messages: Record<string, string> = {
          'todo': 'Task marked as To Do',
          'completed': 'Great job! Task completed! 🎉',
          'holiday': 'Marked as holiday'
        };
        showToast(messages[status], status === 'completed' ? '✅' : '⏳');
      } catch (error) {
        showToast('Failed to update status', '❌');
      }
    }
  };

  const openAddTaskModal = (weekIndex: number) => {
    setCurrentWeekIndex(weekIndex);
    setIsAddTaskModalOpen(true);
  };

  const openEditTaskModal = (weekIndex: number, taskIndex: number) => {
    setCurrentWeekIndex(weekIndex);
    setCurrentTaskIndex(taskIndex);
    setIsEditTaskModalOpen(true);
  };

  const openStatusModal = (weekIndex: number, taskIndex: number) => {
    setCurrentWeekIndex(weekIndex);
    setCurrentTaskIndex(taskIndex);
    setIsStatusModalOpen(true);
  };

  const currentTask = currentWeekIndex !== null && currentTaskIndex !== null 
    ? weeks[currentWeekIndex]?.tasks[currentTaskIndex] 
    : null;
  const viewingWeek = viewingWeekIndex !== null ? weeks[viewingWeekIndex] : null;

  // Check if we're viewing tasks (to hide navbar)
  const isViewingTasks = viewingWeekIndex !== null && viewingWeek;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4ede4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#ab6e47] animate-spin" />
          <p className="text-[#5c4a3a] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4ede4]">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#f4ede4] to-[#ece4da]">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#ab6e47]/10 rounded-full blur-3xl animate-[float_20s_infinite_ease-in-out]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#c28659]/10 rounded-full blur-3xl animate-[float_25s_infinite_ease-in-out_-5s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#9b6b4f]/10 rounded-full blur-3xl animate-[float_18s_infinite_ease-in-out_-10s]" />
      </div>

      {/* Only show navbar when NOT viewing tasks */}
      {!isViewingTasks && <Navbar onAddWeek={() => setIsAddWeekModalOpen(true)} />}
      
      {isViewingTasks ? (
        <TasksPageView
          week={viewingWeek!}
          weekIndex={viewingWeekIndex}
          onClose={handleCloseTasksView}
          onAddTask={openAddTaskModal}
          onEditTask={openEditTaskModal}
          onChangeStatus={openStatusModal}
        />
      ) : (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <Greeting />
          
          {weeks.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-8">
              {weeks.map((week, index) => (
                <WeekCard
                  key={week.id}
                  week={week}
                  weekIndex={index}
                  onViewTasks={handleViewTasks}
                  onDeleteWeek={handleDeleteWeek}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {!isViewingTasks && <Footer />}

      <AddWeekModal
        isOpen={isAddWeekModalOpen}
        onClose={() => setIsAddWeekModalOpen(false)}
        onSave={handleAddWeek}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => {
          setIsAddTaskModalOpen(false);
          setCurrentWeekIndex(null);
        }}
        onSave={handleAddTask}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => {
          setIsEditTaskModalOpen(false);
          setCurrentWeekIndex(null);
          setCurrentTaskIndex(null);
        }}
        onSave={handleEditTask}
        onDelete={handleDeleteTask}
        task={currentTask}
      />

      <StatusChangeModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setCurrentWeekIndex(null);
          setCurrentTaskIndex(null);
        }}
        onChangeStatus={handleChangeStatus}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;