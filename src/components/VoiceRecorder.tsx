import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Play, Pause, Loader2, Plus } from 'lucide-react';

const CLOUD_NAME = 'ddixcyash';
const UPLOAD_PRESET = 'voice-notes';

async function uploadAudioBlob(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.secure_url as string;
}

interface VoiceRecorderProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function VoiceRecorder({ value, onChange }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus' : 'audio/webm';
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsUploading(true);
        try {
          const url = await uploadAudioBlob(blob);
          onChange([...value, url]);
        } catch {
          alert('Failed to save voice message. Please try again.');
        } finally {
          setIsUploading(false);
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds(s => { if (s >= 59) { stopRecording(); return s; } return s + 1; });
      }, 1000);
    } catch {
      alert('Could not access microphone. Please allow microphone permission.');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    setIsRecording(false);
    setSeconds(0);
  };

  const togglePlay = (index: number) => {
    const audio = audioRefs.current[index];
    if (!audio) return;
    if (playingIndex === index) {
      audio.pause();
    } else {
      if (playingIndex !== null) audioRefs.current[playingIndex]?.pause();
      audio.play();
    }
  };

  const removeRecording = (index: number) => {
    if (playingIndex === index) {
      audioRefs.current[index]?.pause();
      setPlayingIndex(null);
    }
    onChange(value.filter((_, i) => i !== index));
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-2">
      {value.map((url, i) => (
        <div key={url} className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(171,110,71,0.07)', border: '1.5px solid rgba(171,110,71,0.22)' }}>
          <audio
            ref={el => { audioRefs.current[i] = el; }}
            src={url}
            onPlay={() => setPlayingIndex(i)}
            onPause={() => { if (playingIndex === i) setPlayingIndex(null); }}
            onEnded={() => { if (playingIndex === i) setPlayingIndex(null); }}
            className="hidden"
          />
          <button type="button" onClick={() => togglePlay(i)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 2px 8px rgba(171,110,71,0.30)' }}>
            {playingIndex === i ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <span className="flex-1 text-sm font-semibold" style={{ color: '#8b5a3c' }}>
            Voice Message {i + 1}
            {playingIndex === i && <span className="ml-2 text-xs font-normal opacity-60">Playing…</span>}
          </span>
          <button type="button" onClick={() => removeRecording(i)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.08)' }}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {isUploading ? (
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'rgba(171,110,71,0.08)', color: '#8b5a3c', border: '1.5px solid rgba(171,110,71,0.22)' }}>
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving voice message…
        </div>
      ) : (
        <button type="button" onClick={isRecording ? stopRecording : startRecording}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isRecording ? 'animate-pulse' : 'hover:-translate-y-0.5'}`}
          style={isRecording
            ? { background: 'rgba(239,68,68,0.10)', color: '#dc2626', border: '1.5px solid rgba(239,68,68,0.30)' }
            : { background: 'rgba(171,110,71,0.08)', color: '#8b5a3c', border: '1.5px solid rgba(171,110,71,0.22)' }}>
          {isRecording
            ? <><Square className="w-3.5 h-3.5 fill-current" /> Stop — {fmt(seconds)}</>
            : value.length > 0
              ? <><Plus className="w-3.5 h-3.5" /> Add Another</>
              : <><Mic className="w-3.5 h-3.5" /> Record Voice Message</>}
        </button>
      )}
    </div>
  );
}

export function VoiceNotePlayer({ src, index }: { src: string; index?: number }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  return (
    <audio
      ref={audioRef}
      controls
      src={src}
      className="themed-audio"
      controlsList="nodownload"
      aria-label={index !== undefined ? `Voice Message ${index + 1}` : 'Voice Message'}
      onLoadedMetadata={() => { if (audioRef.current) audioRef.current.playbackRate = 1; }}
    />
  );
}
