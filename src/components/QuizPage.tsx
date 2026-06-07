import { Plus, ClipboardList } from 'lucide-react';
import { QuizCard } from './QuizCard';
import type { Quiz } from '@/types';

interface QuizPageProps {
  quizzes: Quiz[];
  onCreateQuiz: () => void;
  onViewQuiz: (quizId: number) => void;
  onEditQuiz: (quizId: number) => void;
  onDeleteQuiz: (quizId: number) => void;
}

export function QuizPage({ quizzes, onCreateQuiz, onViewQuiz, onEditQuiz, onDeleteQuiz }: QuizPageProps) {
  const sorted = [...quizzes].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#1e1208]">Quizzes</h2>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-24 px-6 rounded-2xl"
          style={{ background: 'rgba(253,250,246,0.80)', border: '1px solid #ddd0bc' }}>
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(171,110,71,0.12), rgba(42,97,72,0.08))', border: '1px solid rgba(171,110,71,0.18)' }}>
            <ClipboardList className="w-9 h-9" style={{ color: '#ab6e47' }} />
          </div>
          <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#1e1208] mb-2">No Quizzes Yet</h3>
          <p className="text-[#7a6858] text-sm max-w-xs mx-auto leading-relaxed">
            Create your first quiz to test knowledge with multiple choice, single choice, or text answer questions.
          </p>
        </div>
      ) : (
        <div className="space-y-6 pb-28">
          {sorted.map(quiz => (
            <QuizCard key={quiz.id} quiz={quiz} onView={onViewQuiz} onEdit={onEditQuiz} onDelete={onDeleteQuiz} />
          ))}
        </div>
      )}

      <button onClick={onCreateQuiz}
        className="fixed bottom-7 right-7 w-14 h-14 rounded-2xl text-white flex items-center justify-center z-50 transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)',
          boxShadow: '0 6px 24px rgba(171,110,71,0.42)',
        }}>
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </button>
    </div>
  );
}
