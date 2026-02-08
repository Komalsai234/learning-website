export function EmptyState() {
  return (
    <div className="text-center py-16 px-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-[#d9cfc1] shadow-lg animate-fadeInUp">
      <div className="text-6xl mb-6">📚</div>
      <h2 className="text-2xl font-bold text-[#2c1810] mb-3">
        No Learning Weeks Yet
      </h2>
      <p className="text-lg text-[#5c4a3a]">
        Click "New Week" to start tracking your learning journey!
      </p>
    </div>
  );
}
