import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Play, Pause, Loader2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/firebase';

interface VoiceRecorderProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

async function uploadAudioBlob(blob: Blob): Promise<string> {
  const path = `voice-notes/${Date.now()}-${Math.random().toString(36).slice(2)}.webm`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: 'audio/webm' });
  return getDownloadURL(storageRef);
}

async function deleteAudioUrl(url: string) {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // ignore — file may already be gone
  }
}

export function VoiceRecorder({ value, onChange }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsUploading(true);
        try {
          const url = await uploadAudioBlob(blob);
          onChange(url);
        } catch {
          alert('Failed to save voice note. Please try again.');
        } finally {
          setIsUploading(false);
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s >= 59) { stopRecording(); return s; }
          return s + 1;
        });
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

  const togglePlay = () => {
    if (!audioRef.current || !value) return;
    if (isPlaying) { audioRef.current.pause(); }
    else { audioRef.current.play(); }
  };

  const handleDelete = async () => {
    if (value) await deleteAudioUrl(value);
    onChange(undefined);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (isUploading) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
        style={{ background: 'rgba(171,110,71,0.08)', color: '#8b5a3c', border: '1.5px solid rgba(171,110,71,0.22)' }}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving voice note…
      </div>
    );
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(171,110,71,0.07)', border: '1.5px solid rgba(171,110,71,0.22)' }}>
        <audio
          ref={audioRef}
          src={value}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
        <button type="button" onClick={togglePlay}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 2px 8px rgba(171,110,71,0.30)' }}>
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <span className="flex-1 text-sm font-semibold" style={{ color: '#8b5a3c' }}>
          {isPlaying ? 'Playing…' : 'Voice Note'}
        </span>
        <button type="button" onClick={handleDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all flex-shrink-0"
          style={{ background: 'rgba(239,68,68,0.08)' }}>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={isRecording ? stopRecording : startRecording}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isRecording ? 'animate-pulse' : 'hover:-translate-y-0.5'}`}
      style={isRecording
        ? { background: 'rgba(239,68,68,0.10)', color: '#dc2626', border: '1.5px solid rgba(239,68,68,0.30)' }
        : { background: 'rgba(171,110,71,0.08)', color: '#8b5a3c', border: '1.5px solid rgba(171,110,71,0.22)' }}>
      {isRecording
        ? <><Square className="w-3.5 h-3.5 fill-current" /> Stop — {fmt(seconds)}</>
        : <><Mic className="w-3.5 h-3.5" /> Record Voice Note</>
      }
    </button>
  );
}

/** Read-only playback for the detail popup */
export function VoiceNotePlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); }
    else { audioRef.current.play(); }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: 'rgba(171,110,71,0.07)', border: '1.5px solid rgba(171,110,71,0.22)' }}>
      <audio ref={audioRef} src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="hidden" />
      <button type="button" onClick={togglePlay}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 2px 8px rgba(171,110,71,0.28)' }}>
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <span className="text-sm font-semibold" style={{ color: '#8b5a3c' }}>
        {isPlaying ? 'Playing…' : 'Play Voice Note'}
      </span>
    </div>
  );
}
