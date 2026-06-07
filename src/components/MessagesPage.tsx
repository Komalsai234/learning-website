import { useState } from 'react';
import { Send, X, BookCheck, Trash2, Edit3, ChevronDown, Inbox } from 'lucide-react';
import type { Message } from '@/types';
import { RichTextEditor } from './RichTextEditor';

interface MessagesPageProps {
  messages: Message[];
  onSaveMessages: (messages: Message[]) => void;
}

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const isEmptyHtml = (html: string) => !html || html === '' || html === '<br>' || stripHtml(html) === '';

const KomalAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const s = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div className={`${s} rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm`}
      style={{ background: 'linear-gradient(135deg, #c28659, #8b5a3c)' }}>
      K
    </div>
  );
};

const AardraAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const s = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div className={`${s} rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm`}
      style={{ background: 'linear-gradient(135deg, #7c5cbf, #5a3e9b)' }}>
      A
    </div>
  );
};

export function MessagesPage({ messages, onSaveMessages }: MessagesPageProps) {
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState('');
  const [openThreads, setOpenThreads] = useState<Set<number>>(new Set());
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});

  const sorted = [...messages].sort((a, b) => b.id - a.id);
  const unread = messages.filter(m => !m.read).length;

  const sendMessage = () => {
    if (isEmptyHtml(composeText)) return;
    onSaveMessages([...messages, { id: Date.now(), text: composeText, read: false, replies: [] }]);
    setComposeText('');
    setComposeOpen(false);
  };

  const sendReply = (msgId: number) => {
    const text = (replyTexts[msgId] || '').trim();
    if (!text) return;
    onSaveMessages(messages.map(m =>
      m.id === msgId
        ? { ...m, read: true, replies: [...(m.replies || []), { id: Date.now(), text, from: 'aardra' as const, ts: Date.now() }] }
        : m
    ));
    setReplyTexts(prev => ({ ...prev, [msgId]: '' }));
  };

  const toggleThread = (msgId: number, isUnread: boolean) => {
    setOpenThreads(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) { next.delete(msgId); }
      else {
        next.add(msgId);
        if (isUnread) markRead(msgId);
      }
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
    <div className="max-w-3xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#1e1208]">Messages</h2>
          <p className="text-sm text-[#7a6858] mt-1">
            {messages.length === 0
              ? 'No messages yet'
              : unread > 0
                ? `${unread} unread message${unread > 1 ? 's' : ''}`
                : ''}
          </p>
        </div>
        {unread > 0 && (
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #c28659, #8b5a3c)', boxShadow: '0 4px 14px rgba(171,110,71,0.30)' }}>
            {unread}
          </div>
        )}
      </div>

      {/* Empty state */}
      {messages.length === 0 ? (
        <div className="text-center py-24 px-6 rounded-2xl"
          style={{ background: 'rgba(253,250,246,0.80)', border: '1px solid #ddd0bc' }}>
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #ede4d8, #e4d8c8)' }}>
            <Inbox className="w-9 h-9" style={{ color: '#ab6e47' }} />
          </div>
          <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#1e1208] mb-2">No Messages Yet</h3>
        </div>
      ) : (
        <div className="space-y-4 pb-28">
          {sorted.map(msg => {
            const replies = msg.replies || [];
            const isOpen = openThreads.has(msg.id);

            return (
              <div key={msg.id} className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: '#fdfaf6',
                  border: !msg.read ? '1.5px solid rgba(194,134,89,0.35)' : '1px solid #ddd0bc',
                  boxShadow: !msg.read
                    ? '0 4px 20px rgba(194,134,89,0.12)'
                    : '0 2px 8px rgba(44,24,16,0.06)',
                }}>

                {/* Unread stripe */}
                {!msg.read && (
                  <div className="h-1 w-full"
                    style={{ background: 'linear-gradient(90deg, #c28659, #ab6e47)' }} />
                )}

                {/* Collapsed row — clickable */}
                <div className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
                  onClick={() => toggleThread(msg.id, !msg.read)}>

                  <KomalAvatar />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1e1208]">Komal</span>
                        {!msg.read && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(194,134,89,0.12)', color: '#8b5a3c', border: '1px solid rgba(194,134,89,0.25)' }}>
                            <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: '#ab6e47' }} />
                            New
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#9a8878] flex-shrink-0">{formatTs(msg.id)}</span>
                    </div>
                    <p className="text-sm text-[#5c4a3a] mt-0.5 truncate leading-snug">{stripHtml(msg.text)}</p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                    <button onClick={e => { e.stopPropagation(); deleteMessage(msg.id); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9a8878] hover:text-red-500 hover:bg-red-50 transition-all duration-200">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-[#9a8878] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded thread */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #e8ddd0' }}>


                    {/* Aardra's replies */}
                    <div className="px-5 pb-5 space-y-4" style={{ background: '#f5ede3' }}>

                      {replies.length === 0 && (
                        <p className="text-sm text-[#9a8878] text-center py-4">No replies yet.</p>
                      )}

                      {replies.map((r, ri) => (
                        <div key={ri} className="flex items-end gap-2.5 flex-row-reverse">
                          <AardraAvatar size="sm" />
                          <div className="max-w-[75%]">
                            <p className="text-[10px] font-bold text-[#9a8878] mb-1 mr-1 text-right">Aardra</p>
                            <div className="px-4 py-3 rounded-2xl rounded-br-sm text-sm text-white leading-relaxed"
                              style={{ background: 'linear-gradient(135deg, #7c5cbf, #5a3e9b)', boxShadow: '0 2px 8px rgba(124,92,191,0.22)' }}
                              dangerouslySetInnerHTML={{ __html: r.text }} />
                            <span className="text-[10px] text-[#9a8878] mt-1 mr-1 block text-right">{formatTs(r.ts)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mark read */}
                    {!msg.read && (
                      <div className="px-5 py-3 flex items-center"
                        style={{ borderTop: '1px solid #e8ddd0', background: '#fdfaf6' }}>
                        <button onClick={() => markRead(msg.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:text-white"
                          style={{ border: '1px solid rgba(171,110,71,0.30)', color: '#8b5a3c', background: 'rgba(171,110,71,0.06)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ab6e47'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(171,110,71,0.06)'; e.currentTarget.style.color = '#8b5a3c'; }}>
                          <BookCheck className="w-3.5 h-3.5" /> Mark as Read
                        </button>
                      </div>
                    )}

                    {/* Aardra's reply input */}
                    <div className="px-5 py-4 flex gap-2 items-end" style={{ borderTop: '1px solid #e8ddd0', background: '#fdfaf6' }}>
                      <AardraAvatar size="sm" />
                      <textarea
                        rows={1}
                        placeholder="Reply…"
                        value={replyTexts[msg.id] || ''}
                        onChange={e => setReplyTexts(prev => ({ ...prev, [msg.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(msg.id); } }}
                        className="flex-1 px-4 py-2.5 rounded-2xl text-sm text-[#1e1208] resize-none leading-relaxed field-focus"
                        style={{ background: '#f5ede3', border: '1.5px solid #ddd0bc' }}
                      />
                      <button onClick={() => sendReply(msg.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #7c5cbf, #5a3e9b)', boxShadow: '0 2px 8px rgba(124,92,191,0.30)' }}>
                        <Send className="w-4 h-4" />
                      </button>
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
        className="fixed bottom-7 right-7 w-14 h-14 rounded-2xl text-white flex items-center justify-center z-[90] transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 6px 24px rgba(171,110,71,0.42)' }}
        title="New Message from Komal">
        <Edit3 className="w-6 h-6" />
      </button>

      {/* Compose modal — Komal's message */}
      {composeOpen && (
        <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center px-4 pb-[80px] sm:pb-0"
          style={{ background: 'rgba(30,18,8,0.50)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setComposeOpen(false); }}>

          <div className="w-full max-w-lg rounded-2xl overflow-hidden animate-scaleIn"
            style={{ boxShadow: '0 24px 60px rgba(44,24,16,0.28)', background: '#fdfaf6' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)' }}>
              <div className="flex items-center gap-3">
                <KomalAvatar />
                <div>
                  <h3 className="font-['Playfair_Display'] text-base font-bold text-white">Komal's Message</h3>
                  <p className="text-xs text-white/65 mt-0.5">To Aardra Akka</p>
                </div>
              </div>
              <button onClick={() => setComposeOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rich text editor */}
            <div className="p-5">
              <RichTextEditor
                value={composeText}
                onChange={setComposeText}
                placeholder="Write your message to Aardra Akka…"
                minRows={5}
                onCtrlEnter={sendMessage}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 px-5 pb-5">
              <button onClick={() => setComposeOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#4a3728] hover:bg-[#ddd0bc] transition-all duration-200"
                style={{ border: '1.5px solid #ddd0bc', background: 'transparent' }}>
                Cancel
              </button>
              <button onClick={sendMessage}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 2px 10px rgba(171,110,71,0.30)' }}>
                <Send className="w-4 h-4" /> Send to Aardra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
