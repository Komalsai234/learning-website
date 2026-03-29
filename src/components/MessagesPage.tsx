import { useState, useRef, useEffect } from 'react';
import { Send, X, BookCheck, Trash2 } from 'lucide-react';
import type { Message } from '@/types';

interface MessagesPageProps {
  messages: Message[];
  onSaveMessages: (messages: Message[]) => void;
}

export function MessagesPage({ messages, onSaveMessages }: MessagesPageProps) {
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState('');
  const [openThreads, setOpenThreads] = useState<Set<number>>(new Set());
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const composeRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (composeOpen) setTimeout(() => composeRef.current?.focus(), 100);
  }, [composeOpen]);

  const sorted = [...messages].sort((a, b) => b.id - a.id);
  const unread = messages.filter(m => !m.read).length;

  const sendMessage = () => {
    const text = composeText.trim();
    if (!text) return;
    onSaveMessages([...messages, { id: Date.now(), text, read: false, replies: [] }]);
    setComposeText('');
    setComposeOpen(false);
  };

  const sendReply = (msgId: number) => {
    const text = (replyTexts[msgId] || '').trim();
    if (!text) return;
    onSaveMessages(messages.map(m =>
      m.id === msgId
        ? { ...m, replies: [...(m.replies || []), { id: Date.now(), text, from: 'aardra' as const, ts: Date.now() }] }
        : m
    ));
    setReplyTexts(prev => ({ ...prev, [msgId]: '' }));
  };

  const toggleThread = (msgId: number, isUnread: boolean) => {
    setOpenThreads(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) { next.delete(msgId); } else { next.add(msgId); if (isUnread) markRead(msgId); }
      return next;
    });
  };

  const markRead = (msgId: number) => {
    onSaveMessages(messages.map(m => m.id === msgId ? { ...m, read: true } : m));
  };

  const deleteMessage = (msgId: number) => {
    if (!confirm('Delete this message thread?')) return;
    onSaveMessages(messages.filter(m => m.id !== msgId));
    setOpenThreads(prev => { const n = new Set(prev); n.delete(msgId); return n; });
  };

  const formatTs = (ts: number) =>
    new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-['Playfair_Display'] text-[1.05rem] font-bold text-[#2c1810]">Messages</h4>
        {messages.length > 0 && (
          <span className="text-[.78rem] text-[#8c7a6a]">{unread > 0 ? `${unread} unread` : 'All read'}</span>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-14 px-6 bg-white/50 rounded-2xl border border-[#d9cfc1]">
          <div className="text-[2.5rem] mb-3">📭</div>
          <h3 className="font-['Playfair_Display'] text-[1.35rem] font-bold text-[#2c1810] mb-2">No Messages Yet</h3>
          <p className="text-[#5c4a3a] text-[.9rem]">Tap the compose button to write a message.</p>
        </div>
      ) : (
        <div className="space-y-3 pb-24">
          {sorted.map(msg => {
            const replies = msg.replies || [];
            const preview = msg.text.length > 80 ? msg.text.slice(0, 80) + '…' : msg.text;
            const isOpen = openThreads.has(msg.id);

            return (
              <div key={msg.id}
                className={`bg-[#faf7f2] rounded-2xl border overflow-hidden transition-shadow duration-200 hover:shadow-md ${!msg.read ? 'border-l-[3px] border-l-blue-400 border-[#d9cfc1]' : 'border-[#d9cfc1]'}`}>

                {/* Collapsed header — always visible */}
                <div className="flex items-start gap-[14px] px-[18px] py-4 cursor-pointer select-none"
                  onClick={() => toggleThread(msg.id, !msg.read)}>
                  <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-br from-[#c28659] to-[#ab6e47] flex items-center justify-center text-white font-bold text-[.95rem] flex-shrink-0">K</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[.74rem] text-[#8c7a6a]">{formatTs(msg.id)}</span>
                      <div className="flex items-center gap-2">
                        {/* Delete icon — top right of collapsed card */}
                        <button
                          onClick={e => { e.stopPropagation(); deleteMessage(msg.id); }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-xl text-[#8c7a6a] hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <svg className={`w-4 h-4 text-[#8c7a6a] flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          viewBox="0 0 16 16" fill="none">
                          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-[.88rem] text-[#5c4a3a] whitespace-nowrap overflow-hidden text-ellipsis">{preview}</div>
                    <div className="flex items-center gap-2 mt-[5px]">
                      {replies.length > 0 && (
                        <span className="text-[.72rem] text-[#8c7a6a] flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3h10M1 6h7M1 9h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                          {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 text-[.7rem] font-semibold px-[9px] py-[2px] rounded-xl border ${!msg.read ? 'bg-blue-50 text-blue-500 border-blue-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                        {!msg.read && <span className="w-[6px] h-[6px] rounded-xl bg-blue-500 animate-pulse" />}
                        {msg.read ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded thread */}
                {isOpen && (
                  <div className="border-t border-[#e5dccf]">
                    {/* Replies only */}
                    {replies.map((r, ri) => (
                      <div key={ri} className="px-[18px] py-[14px] border-b border-[#e5dccf] last:border-0 bg-[rgba(59,130,246,.03)]">
                        <div className="flex items-center gap-[10px] mb-2">
                          <div className="w-[30px] h-[30px] rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-[.8rem] flex-shrink-0">A</div>
                          <div>
                            <div className="text-[.72rem] text-[#8c7a6a]">{formatTs(r.ts)}</div>
                          </div>
                        </div>
                        <div className="pl-[40px] text-[.9rem] text-[#2c1810] leading-relaxed">{r.text}</div>
                      </div>
                    ))}

                    {/* Mark as read — only if unread */}
                    {!msg.read && (
                      <div className="flex items-center gap-2 px-[18px] py-3 border-t border-[#e5dccf]">
                        <button onClick={() => markRead(msg.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-[5px] rounded-xl border border-blue-300 text-blue-500 bg-transparent text-[.75rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-blue-500 hover:text-white">
                          <BookCheck className="w-3.5 h-3.5" /> Mark as Read
                        </button>
                      </div>
                    )}

                    {/* Reply box */}
                    <div className="px-[18px] pb-[14px] pt-2 bg-[#ece4da] border-t border-[#e5dccf]">
                      <div className="flex gap-[10px] items-end">
                        <textarea
                          className="flex-1 bg-[#faf7f2] border border-[#d9cfc1] rounded-xl px-[13px] py-[9px] text-[#2c1810] text-[.88rem] resize-none leading-relaxed transition-colors duration-200 focus:outline-none focus:border-[#ab6e47]"
                          rows={2} placeholder="Reply…"
                          value={replyTexts[msg.id] || ''}
                          onChange={e => setReplyTexts(prev => ({ ...prev, [msg.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(msg.id); } }}
                        />
                        <button onClick={() => sendReply(msg.id)}
                          className="inline-flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-[#ab6e47] border-none text-white cursor-pointer flex-shrink-0 transition-all duration-200 hover:bg-[#8b5a3c] hover:scale-105">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Compose FAB */}
      <button onClick={() => setComposeOpen(true)}
        className="fixed bottom-8 right-8 w-[54px] h-[54px] rounded-xl border-none bg-gradient-to-br from-[#ab6e47] to-[#8b5a3c] text-white cursor-pointer shadow-[0_5px_22px_rgba(171,110,71,.42)] flex items-center justify-center z-[90] transition-all duration-200 hover:scale-105 hover:shadow-[0_8px_28px_rgba(171,110,71,.52)]"
        title="New Message">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M3 19l1.5-5L16 3l3 3L7.5 17.5 3 19z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M14 5l3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {/* Compose modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-[400] bg-black/48 backdrop-blur-[4px] flex items-end justify-center pb-[90px] px-4"
          onClick={e => { if (e.target === e.currentTarget) setComposeOpen(false); }}>
          <div className="bg-[#faf7f2] rounded-2xl w-full max-w-[560px] shadow-[0_20px_70px_rgba(0,0,0,.22)] overflow-hidden animate-[slideUp_.3s_cubic-bezier(.4,0,.2,1)]">
            <div className="bg-gradient-to-r from-[#ab6e47] to-[#8b5a3c] px-5 py-[15px] flex items-center justify-between">
              <h3 className="text-white font-['Playfair_Display'] text-[1rem] font-bold">New Message</h3>
              <button onClick={() => setComposeOpen(false)}
                className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-xl border-none bg-white/20 text-white cursor-pointer transition-all duration-200 hover:bg-white/30">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <textarea ref={composeRef}
                className="w-full bg-[#ece4da] border border-[#d9cfc1] rounded-xl px-[14px] py-[11px] text-[#2c1810] text-[.9rem] resize-none leading-relaxed transition-colors duration-200 focus:outline-none focus:border-[#ab6e47]"
                rows={4} placeholder="Write message to Aardra Akka…"
                value={composeText} onChange={e => setComposeText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) sendMessage(); }}
              />
            </div>
            <div className="px-5 pb-5 flex justify-end gap-2">
              <button onClick={() => setComposeOpen(false)}
                className="inline-flex items-center gap-2 px-5 py-[7px] rounded-xl border border-[#d9cfc1] bg-transparent text-[#5c4a3a] font-semibold text-[.85rem] cursor-pointer transition-all duration-200 hover:bg-[#ece4da]">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={sendMessage}
                className="inline-flex items-center gap-2 px-5 py-[7px] rounded-xl border-none bg-[#ab6e47] text-white font-semibold text-[.85rem] cursor-pointer transition-all duration-200 hover:bg-[#8b5a3c] hover:-translate-y-[1px]">
                <Send className="w-4 h-4" /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}