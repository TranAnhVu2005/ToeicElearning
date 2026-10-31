import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Headphones,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Repeat,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lightbulb,
  Check,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Award,
  Layers,
  HelpCircle,
  RefreshCw,
  Sliders,
  X,
  FileText,
} from 'lucide-react';
import { examService } from '../services/examService';

// Normalize word for comparison: strip punctuation, lowercase
const normalizeWord = (w) => {
  return w.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’“”]/g, '').trim().toLowerCase();
};

// Word-level diff comparison between typed text and target transcript
const computeWordDiff = (typedText, targetText) => {
  if (!targetText) return { diffs: [], accuracy: 0, totalWords: 0, correctWords: 0 };

  const targetWords = targetText.trim().split(/\s+/).filter(Boolean);
  const typedWords = typedText.trim().split(/\s+/).filter(Boolean);

  const m = targetWords.length;
  const n = typedWords.length;

  if (m === 0) return { diffs: [], accuracy: 100, totalWords: 0, correctWords: 0 };
  if (n === 0) {
    const diffs = targetWords.map((tw) => ({
      type: 'missing',
      target: tw,
      typed: '',
    }));
    return { diffs, accuracy: 0, totalWords: m, correctWords: 0 };
  }

  // LCS table
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (normalizeWord(targetWords[i - 1]) === normalizeWord(typedWords[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find diff
  let i = m;
  let j = n;
  const diffs = [];
  let correctCount = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normalizeWord(targetWords[i - 1]) === normalizeWord(typedWords[j - 1])) {
      diffs.unshift({
        type: 'correct',
        target: targetWords[i - 1],
        typed: typedWords[j - 1],
      });
      correctCount++;
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diffs.unshift({
        type: 'extra',
        target: '',
        typed: typedWords[j - 1],
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diffs.unshift({
        type: 'missing',
        target: targetWords[i - 1],
        typed: '',
      });
      i--;
    }
  }

  // Post-process: Pair adjacent extra and missing as 'incorrect' for clearer reading
  const mergedDiffs = [];
  for (let k = 0; k < diffs.length; k++) {
    const curr = diffs[k];
    const next = diffs[k + 1];
    if (curr.type === 'missing' && next && next.type === 'extra') {
      mergedDiffs.push({
        type: 'incorrect',
        target: curr.target,
        typed: next.typed,
      });
      k++; // skip next
    } else if (curr.type === 'extra' && next && next.type === 'missing') {
      mergedDiffs.push({
        type: 'incorrect',
        target: next.target,
        typed: curr.typed,
      });
      k++; // skip next
    } else {
      mergedDiffs.push(curr);
    }
  }

  const accuracy = Math.round((correctCount / m) * 100);
  return { diffs: mergedDiffs, accuracy, totalWords: m, correctWords: correctCount };
};

// Generate first-letter hint for words
const generateFirstLetterHint = (transcript) => {
  if (!transcript) return '';
  return transcript
    .split(/\s+/)
    .map((word) => {
      // Keep punctuation or tags like (A), W-Br:, Question #7
      if (word.startsWith('(') || word.endsWith(':') || word.startsWith('#')) return word;
      const clean = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’“”]/g, '');
      const punct = word.slice(clean.length);
      if (clean.length <= 1) return clean + punct;
      return clean[0] + '_'.repeat(clean.length - 1) + punct;
    })
    .join(' ');
};

const DictationTakePage = () => {
  const { testId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive the filter from the URL so browser back/forward stays in sync.
  const requestedPart = searchParams.get('part') || 'all';
  const selectedPartFilter = ['all', '1', '2', '3', '4'].includes(requestedPart) ? requestedPart : 'all';

  // Test data states
  const [test, setTest] = useState(null);
  const [listeningSegments, setListeningSegments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestAttempt, setRequestAttempt] = useState(0);

  // User input per segment: { [segmentId]: { typed: string, checked: boolean, accuracy: number, diffResult: any } }
  const [userRecords, setUserRecords] = useState({});
  const [currentInput, setCurrentInput] = useState('');

  // UI / Display states
  const [showHint, setShowHint] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [celebrationModalOpen, setCelebrationModalOpen] = useState(false);

  // Audio player state
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // Input textarea ref
  const textareaRef = useRef(null);

  // 1. Fetch Test Detail & Filter Listening Segments (Part 1, 2, 3, 4)
  useEffect(() => {
    const fetchTestData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await examService.getDictationData(testId);
        if (res.code === 1000 && res.data) {
          const testData = res.data;
          setTest(testData);

          const rawCqs = testData.contextQuestions || [];

          // Sort & tag Part numbers
          const processed = rawCqs
            .map((cq, idx) => {
              let partNum = Number.isInteger(cq.partNumber) ? cq.partNumber : null;
              if (!partNum && cq.orderIndex !== undefined && cq.orderIndex !== null && cq.orderIndex > 0) {
                const refNum = cq.orderIndex;
                if (refNum >= 1 && refNum <= 6) partNum = 1;
                else if (refNum >= 7 && refNum <= 31) partNum = 2;
                else if (refNum >= 32 && refNum <= 70) partNum = 3;
                else if (refNum >= 71 && refNum <= 100) partNum = 4;
              }

              if (!partNum && cq.part?.namePart) {
                const match = cq.part.namePart.match(/\d+/);
                if (match) partNum = parseInt(match[0], 10);
              }

              if (!partNum) {
                const tagMatch = cq.paragraph?.match(/<!--CQ_SEQ:(?:P(\d+):I)?(\d+)-->/);
                if (tagMatch && tagMatch[1]) partNum = parseInt(tagMatch[1], 10);
              }

              // Fallback heuristic
              if (!partNum) {
                if (cq.imageUrl && !cq.paragraph) partNum = 1;
                else if (cq.transcript?.includes('Question #')) partNum = 2;
                else if (cq.audioUrl) partNum = 3;
              }

              return {
                ...cq,
                partNumber: partNum,
                segmentId: cq.id || cq.contextQuestionID || `seg_${idx}`,
              };
            })
            // Filter strictly Listening parts with audio or transcript
            .filter((cq) => cq.partNumber >= 1 && cq.partNumber <= 4 && (cq.audioUrl || cq.transcript))
            .sort((a, b) => {
              if (a.partNumber !== b.partNumber) return a.partNumber - b.partNumber;
              return (a.orderIndex || 0) - (b.orderIndex || 0);
            });

          setListeningSegments(processed);

          // Restore saved progress from localStorage
          const storageKey = `dictation_history_${testId}`;
          try {
            const savedData = window.localStorage.getItem(storageKey);
            if (savedData) {
              const parsed = JSON.parse(savedData);
              if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) setUserRecords(parsed);
            }
          } catch {
            // Storage may be disabled by browser privacy settings; the exercise still works in memory.
          }
        } else {
          setError(res.message || 'Không tìm thấy dữ liệu đề thi');
        }
      } catch {
        setError('Không thể tải dữ liệu bài thi. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId, requestAttempt]);

  // Filtered segments based on selected part pill
  const activeSegments = useMemo(() => {
    if (selectedPartFilter === 'all') return listeningSegments;
    const pNum = parseInt(selectedPartFilter, 10);
    return listeningSegments.filter((s) => s.partNumber === pNum);
  }, [listeningSegments, selectedPartFilter]);

  // Current segment
  const currentSegment = activeSegments[currentIndex] || null;

  // Sync current input with saved record when switching index
  useEffect(() => {
    if (currentSegment) {
      const rec = userRecords[currentSegment.segmentId];
      if (rec) {
        setCurrentInput(rec.typed || '');
      } else {
        setCurrentInput('');
      }
      setShowHint(false);
      setShowFullTranscript(false);
      setShowTranslation(false);

      // Reset audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
  }, [currentIndex, currentSegment, userRecords]);

  // Save to localStorage whenever userRecords changes
  const saveRecordsToStorage = useCallback((updatedRecords) => {
    try {
      localStorage.setItem(`dictation_history_${testId}`, JSON.stringify(updatedRecords));
    } catch {
      console.warn('Dictation progress could not be written to browser storage.');
    }
  }, [testId]);

  // Audio event handlers
  const togglePlayAudio = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => console.warn('Audio playback was prevented by the browser.'));
    }
  }, [isPlaying]);

  const handleRewind = useCallback((seconds = 3) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - seconds);
  }, []);

  const handleForward = useCallback((seconds = 3) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + seconds);
  }, [duration]);

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoaded = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  };

  const handleAudioEnded = () => {
    if (isLooping && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      setIsPlaying(false);
    }
  };

  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (event) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
    if (audioRef.current) audioRef.current.volume = nextVolume;
  };

  const toggleMute = () => {
    const nextVolume = isMuted ? (volume > 0 ? volume : 1) : 0;
    setIsMuted(!isMuted);
    if (nextVolume > 0) setVolume(nextVolume);
    if (audioRef.current) audioRef.current.volume = nextVolume;
  };

  // Check Answer Handler
  const handleCheckAnswer = useCallback(() => {
    if (!currentSegment) return;
    const target = currentSegment.transcript || '';
    const result = computeWordDiff(currentInput, target);

    const updated = {
      ...userRecords,
      [currentSegment.segmentId]: {
        typed: currentInput,
        checked: true,
        accuracy: result.accuracy,
        diffResult: result,
        updatedAt: new Date().toISOString(),
      },
    };

    setUserRecords(updated);
    saveRecordsToStorage(updated);

    // If 100% accurate, automatically trigger subtle celebration sound or notification
    if (result.accuracy >= 90) {
      // User did awesome
    }
  }, [currentSegment, currentInput, userRecords, saveRecordsToStorage]);

  // Reset current question attempt
  const handleResetCurrent = () => {
    if (!currentSegment) return;
    setCurrentInput('');
    const updated = { ...userRecords };
    delete updated[currentSegment.segmentId];
    setUserRecords(updated);
    saveRecordsToStorage(updated);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentIndex < activeSegments.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCelebrationModalOpen(true);
    }
  }, [currentIndex, activeSegments.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept shortcuts if user is typing in shortcuts modal
      if (showShortcutsModal) return;

      // Space: Toggle Play/Pause when not focused on textarea or if Alt/Ctrl is pressed
      if (e.code === 'Space' && (e.ctrlKey || e.altKey || document.activeElement !== textareaRef.current)) {
        e.preventDefault();
        togglePlayAudio();
      }

      // Alt + Left: Rewind 3s
      if (e.altKey && e.code === 'ArrowLeft') {
        e.preventDefault();
        handleRewind(3);
      }

      // Alt + Right: Forward 3s
      if (e.altKey && e.code === 'ArrowRight') {
        e.preventDefault();
        handleForward(3);
      }

      // Ctrl + Enter: Check answer
      if (e.ctrlKey && e.code === 'Enter') {
        e.preventDefault();
        handleCheckAnswer();
      }

      // Alt + N: Next question
      if (e.altKey && (e.code === 'KeyN' || e.code === 'ArrowDown')) {
        e.preventDefault();
        handleNext();
      }

      // Alt + P: Prev question
      if (e.altKey && (e.code === 'KeyP' || e.code === 'ArrowUp')) {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcutsModal, togglePlayAudio, handleRewind, handleForward, handleCheckAnswer, handleNext, handlePrev]);

  // Overall Statistics for current active part
  const stats = useMemo(() => {
    let completedCount = 0;
    let totalScore = 0;

    activeSegments.forEach((seg) => {
      const rec = userRecords[seg.segmentId];
      if (rec && rec.checked) {
        completedCount++;
        totalScore += rec.accuracy || 0;
      }
    });

    const averageAccuracy = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;
    const progressPercent = activeSegments.length > 0 ? Math.round((completedCount / activeSegments.length) * 100) : 0;

    return {
      total: activeSegments.length,
      completed: completedCount,
      averageAccuracy,
      progressPercent,
    };
  }, [activeSegments, userRecords]);

  // Current record for this segment
  const currentRecord = currentSegment ? userRecords[currentSegment.segmentId] : null;
  const isCurrentChecked = currentRecord?.checked;
  const diffData = currentRecord?.diffResult || (currentSegment ? computeWordDiff(currentInput, currentSegment.transcript || '') : null);

  // Format time mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Question Title Helper
  const getSegmentTitle = (seg) => {
    if (!seg) return '';
    if (seg.partNumber === 1) return `Part 1 • Câu hỏi #${seg.orderIndex || 1} (Mô tả hình ảnh)`;
    if (seg.partNumber === 2) return `Part 2 • Câu hỏi #${seg.orderIndex || 7} (Hỏi - Đáp)`;
    if (seg.partNumber === 3) return `Part 3 • Đoạn hội thoại #${seg.orderIndex || 32} (Đoạn 3 câu)`;
    if (seg.partNumber === 4) return `Part 4 • Bài độc thoại #${seg.orderIndex || 71} (Đoạn 3 câu)`;
    return `Phần nghe #${seg.orderIndex || 1}`;
  };

  if (loading) {
    return (
      <div className="neo-brutal-dictation min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-black border-t-[#FFE600] rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#333333]">Đang chuẩn bị dữ liệu nghe chép chính tả...</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="neo-brutal-dictation min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-md border-2 border-black shadow-[3px_3px_0_#111111] text-center space-y-4">
          <AlertCircle size={40} className="text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-[#111111]">Không thể tải đề thi</h2>
          <p className="text-sm text-[#333333]">{error || 'Có lỗi xảy ra trong quá trình kết nối.'}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError(null);
              setRequestAttempt((attempt) => attempt + 1);
            }}
            className="inline-flex items-center justify-center gap-2 border-2 border-black bg-[#FFE600] px-4 py-2 font-black shadow-[3px_3px_0_#111] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#ff5b93]"
          >
            Tải lại dữ liệu
          </button>
          <Link
            to={`/courses/${testId}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#111111] text-white rounded-md font-semibold text-sm hover:bg-[#333333] transition-colors"
          >
            <ArrowLeft size={16} /> Quay lại trang đề thi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-brutal-dictation min-h-screen flex flex-col">
      {/* Hidden Audio Element */}
      {currentSegment?.audioUrl && (
        <audio
          ref={audioRef}
          src={currentSegment.audioUrl}
          onTimeUpdate={handleAudioTimeUpdate}
          onLoadedMetadata={handleAudioLoaded}
          onEnded={handleAudioEnded}
          preload="auto"
        />
      )}

      {/* TOP COMPACT APP BAR */}
      <header className="bg-white border-b-2 border-black sticky top-0 z-30 shadow-[3px_3px_0_#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Back & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={`/courses/${testId}`}
              className="p-2 rounded-md text-[#444444] hover:text-[#111111] hover:bg-[#F1EEDF] transition-colors shrink-0"
              title="Quay lại chi tiết đề"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#FFF4A3] text-[#111111] text-[11px] font-bold tracking-wide border-2 border-black inline-flex items-center gap-1">
                  <Headphones size={12} strokeWidth={1.5} /> Chép chính tả
                </span>
                <span className="text-xs text-[#555555] hidden sm:inline">•</span>
                <h1 className="text-sm sm:text-base font-extrabold text-[#111111] truncate tracking-tight">
                  {test.titleTest}
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Filter Parts & Shortcuts Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Part Selection Pills */}
            <div className="hidden md:flex items-center bg-[#F1EEDF] p-1 rounded-md border-2 border-black text-xs font-bold">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: '1', label: 'Part 1' },
                { id: '2', label: 'Part 2' },
                { id: '3', label: 'Part 3' },
                { id: '4', label: 'Part 4' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(0);
                    setSearchParams(p.id === 'all' ? {} : { part: p.id });
                  }}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    selectedPartFilter === p.id
                      ? 'bg-white text-[#111111] shadow-[3px_3px_0_#111111] font-extrabold'
                      : 'text-[#333333] hover:text-[#111111]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Shortcuts Help Button */}
            <button
              type="button"
              onClick={() => setShowShortcutsModal(true)}
              className="p-2 rounded-md text-[#444444] hover:text-[#111111] hover:bg-[#F1EEDF] transition-colors cursor-pointer"
              title="Phím tắt luyện nghe"
            >
              <HelpCircle size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Global Progress Bar (Top Stripe) */}
        <div className="w-full bg-[#F1EEDF] h-1 relative overflow-hidden">
          <div
            className="h-full bg-[#FFE600]  transition-all duration-300"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </header>

      {/* SUB-HEADER STATS BANNER */}
      <div className="bg-[#FFFDF2] border-b-2 border-black px-4 sm:px-6 lg:px-8 py-2.5 text-xs text-[#333333]">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          {/* Active Part indicator & index */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#111111]">
              Câu {currentIndex + 1} / {activeSegments.length}
            </span>
            <span className="text-[#444444]">|</span>
            <span className="text-[#444444]">
              Đã hoàn thành: <strong className="text-[#111111]">{stats.completed}</strong> câu
            </span>
          </div>

          {/* Average accuracy score */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <Award size={14} strokeWidth={1.5} className="text-amber-500" /> Độ chính xác TB:
              <strong
                className={`font-bold tabular-nums ${
                  stats.averageAccuracy >= 80
                    ? 'text-emerald-600'
                    : stats.averageAccuracy >= 50
                    ? 'text-[#111111]'
                    : 'text-[#222222]'
                }`}
              >
                {stats.averageAccuracy}%
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: DICTATION WORKBENCH (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {currentSegment ? (
            <div className="space-y-6">
              {/* DOUBLE-BEZEL CARD CONTAINER */}
              <div className="p-1.5 rounded-md bg-[#F1EEDF] border-2 border-black shadow-[3px_3px_0_#111111]">
                <div className="bg-white rounded-md border-2 border-black p-5 sm:p-7 space-y-6">
                  {/* Segment Meta Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b-2 border-black">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#111111] bg-[#FFF4A3] px-2.5 py-1 rounded-md border-2 border-black">
                        {getSegmentTitle(currentSegment)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrentChecked && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1.5 ${
                            currentRecord.accuracy >= 80
                              ? 'bg-lime-100 text-emerald-700 border-2 border-black'
                              : currentRecord.accuracy >= 50
                              ? 'bg-amber-50 text-amber-700 border-2 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-2 border-black'
                          }`}
                        >
                          <CheckCircle2 size={13} strokeWidth={2} /> {currentRecord.accuracy}% Chính xác
                        </span>
                      )}
                    </div>
                  </div>

                  {/* If Part 1: Photograph Card */}
                  {currentSegment.imageUrl && (
                    <div className="flex flex-col items-center justify-center p-3 bg-[#FFFDF2] rounded-md border-2 border-black">
                      <img
                        src={currentSegment.imageUrl}
                        alt="TOEIC Listening Photograph"
                        className="max-h-72 w-auto object-contain rounded-md shadow-[3px_3px_0_#111111] border-2 border-black"
                        loading="lazy"
                      />
                      <span className="text-[11px] text-[#555555] mt-2 italic">
                        Quan sát tranh và nghe kỹ 4 lựa chọn (A), (B), (C), (D) để chép lại
                      </span>
                    </div>
                  )}

                  {/* AUDIO PLAYER CONTROLLER (Modern kinetic double-bezel) */}
                  <div className="p-3 bg-[#F1EEDF]  rounded-md border-2 border-black space-y-3">
                    {/* Scrubber progress bar */}
                    <div className="space-y-1">
                      <div className="relative w-full h-2 bg-[#E4E0D1] rounded-full overflow-hidden cursor-pointer">
                        <div
                          className="h-full bg-[#111111] transition-all duration-100"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono font-medium text-[#444444] tabular-nums">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Controller Action Row */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      {/* Left: Rewind / Play-Pause / Forward */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Rewind 3s */}
                        <button
                          type="button"
                          onClick={() => handleRewind(3)}
                          className="p-2.5 rounded-md bg-white border-2 border-black text-[#333333] hover:text-[#111111] hover:border-black active:scale-95 transition-all shadow-[3px_3px_0_#111111] cursor-pointer"
                          title="Lùi lại 3s (Alt + ←)"
                        >
                          <RotateCcw size={17} strokeWidth={1.5} />
                        </button>

                        {/* Play / Pause Master Button */}
                        <button
                          type="button"
                          onClick={togglePlayAudio}
                          className="px-5 py-2.5 rounded-md bg-[#111111] hover:bg-[#333333] active:scale-95 text-white font-bold text-sm inline-flex items-center gap-2 shadow-[3px_3px_0_#111111] transition-all cursor-pointer"
                        >
                          {isPlaying ? (
                            <>
                              <Pause size={18} strokeWidth={2} /> Tạm dừng
                            </>
                          ) : (
                            <>
                              <Play size={18} strokeWidth={2} className="fill-current" /> Phát audio
                            </>
                          )}
                        </button>

                        {/* Forward 3s */}
                        <button
                          type="button"
                          onClick={() => handleForward(3)}
                          className="p-2.5 rounded-md bg-white border-2 border-black text-[#333333] hover:text-[#111111] hover:border-black active:scale-95 transition-all shadow-[3px_3px_0_#111111] cursor-pointer"
                          title="Tua tới 3s (Alt + →)"
                        >
                          <RotateCw size={17} strokeWidth={1.5} />
                        </button>

                        {/* Loop Toggle */}
                        <button
                          type="button"
                          onClick={() => setIsLooping(!isLooping)}
                          className={`p-2.5 rounded-md border-2 transition-all cursor-pointer ${
                            isLooping
                              ? 'bg-[#FFE77A] text-[#111111] border-black font-bold shadow-[3px_3px_0_#111111]'
                              : 'bg-white text-[#444444] border-black hover:bg-[#F1EEDF]'
                          }`}
                          title="Lặp lại vô tận audio"
                        >
                          <Repeat size={17} strokeWidth={1.5} />
                        </button>
                      </div>

                      {/* Right: Playback speed and volume */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div aria-label="Tốc độ phát" className="flex items-center gap-1.5 bg-white p-1 rounded-md border-2 border-black text-xs font-bold text-[#333333]">
                          {[0.8, 1.0, 1.2].map((rate) => (
                            <button
                              key={rate}
                              type="button"
                              onClick={() => handleSpeedChange(rate)}
                              aria-pressed={playbackRate === rate}
                              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer tabular-nums ${
                                playbackRate === rate
                                  ? 'bg-[#111111] text-white shadow-[3px_3px_0_#111111] font-extrabold'
                                  : 'hover:bg-[#F1EEDF] text-[#333333]'
                              }`}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                        <div className="flex min-h-10 items-center gap-2 border-2 border-black bg-white px-2.5 py-1.5 text-xs font-bold text-[#222222]">
                          <button type="button" onClick={toggleMute} aria-label={isMuted ? 'Bật tiếng audio' : 'Tắt tiếng audio'} aria-pressed={isMuted} title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'} className="rounded p-1 hover:bg-[#F1EEDF] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#FF5B93]">
                            {isMuted || volume === 0 ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
                          </button>
                          <label className="sr-only" htmlFor="dictation-volume">Âm lượng audio</label>
                          <input id="dictation-volume" type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} aria-valuetext={`${Math.round((isMuted ? 0 : volume) * 100)}%`} className="w-20 accent-[#111111] sm:w-24" />
                          <span className="w-8 text-right tabular-nums">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FIRST LETTER HINT BOX (Optional) */}
                  {showHint && currentSegment.transcript && (
                    <div className="p-4 rounded-md bg-amber-50/80 border-2 border-amber-200/80 space-y-1.5 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                        <Lightbulb size={14} strokeWidth={2} /> Gợi ý ký tự đầu của các từ:
                      </div>
                      <p className="font-mono text-sm tracking-wide text-amber-950 leading-relaxed break-words select-all">
                        {generateFirstLetterHint(currentSegment.transcript)}
                      </p>
                    </div>
                  )}

                  {/* TYPING INPUT AREA */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-[#222222] tracking-tight">
                      Nhập lại những gì bạn nghe được (English):
                    </label>
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        placeholder="Nghe audio và gõ chính xác transcript tiếng Anh vào đây..."
                        rows={5}
                        className="w-full p-4 rounded-md border-2 border-black bg-[#FFFDF2] text-base text-[#111111] placeholder:text-[#555555] focus:border-black focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#FF5B93] leading-relaxed resize-y transition-all font-sans"
                      />
                    </div>

                    {/* Word Count Indicator */}
                    <div className="flex items-center justify-between text-xs text-[#555555] tabular-nums">
                      <span>
                        Số từ đã gõ: <strong>{currentInput.trim() ? currentInput.trim().split(/\s+/).length : 0}</strong> từ
                      </span>
                      <span className="text-[11px] text-[#555555]">Nhấn Ctrl + Enter để kiểm tra nhanh</span>
                    </div>
                  </div>

                  {/* ACTION BAR (Button-in-Button & Tool Buttons) */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t-2 border-black">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Hint Button */}
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className={`px-3.5 py-2 rounded-md border-2 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                          showHint
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-white text-[#333333] border-black hover:bg-[#F1EEDF]'
                        }`}
                      >
                        <Lightbulb size={14} strokeWidth={1.5} /> {showHint ? 'Ẩn gợi ý' : 'Gợi ý chữ cái đầu'}
                      </button>

                      {/* Reveal Answer Button */}
                      <button
                        type="button"
                        onClick={() => setShowFullTranscript(!showFullTranscript)}
                        className={`px-3.5 py-2 rounded-md border-2 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                          showFullTranscript
                            ? 'bg-[#E4E0D1] text-[#111111] border-black'
                            : 'bg-white text-[#333333] border-black hover:bg-[#F1EEDF]'
                        }`}
                      >
                        {showFullTranscript ? (
                          <>
                            <EyeOff size={14} strokeWidth={1.5} /> Ẩn đáp án
                          </>
                        ) : (
                          <>
                            <Eye size={14} strokeWidth={1.5} /> Xem đáp án
                          </>
                        )}
                      </button>

                      {/* Reset Button */}
                      {currentInput && (
                        <button
                          type="button"
                          onClick={handleResetCurrent}
                          className="px-3 py-2 rounded-md text-[#555555] hover:text-[#B42318] hover:bg-rose-50 transition-colors text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          title="Xóa để làm lại"
                        >
                          <RefreshCw size={13} strokeWidth={1.5} /> Làm lại
                        </button>
                      )}
                    </div>

                    {/* Master Check Answer / Next Button */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCheckAnswer}
                        disabled={!currentInput.trim()}
                        className="px-5 py-2.5 rounded-md bg-[#111111] hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-white font-bold text-sm inline-flex items-center gap-2 shadow-[3px_3px_0_#111111] transition-all cursor-pointer"
                      >
                        <Check size={16} strokeWidth={2.5} /> Kiểm tra kết quả
                      </button>
                    </div>
                  </div>

                  {/* WORD DIFF & COMPARISON RESULTS (Renders when checked or revealed) */}
                  {(isCurrentChecked || showFullTranscript) && (
                    <div className="p-5 rounded-md bg-[#FFFDF2] border-2 border-black space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#222222] flex items-center gap-1.5">
                          <FileText size={15} strokeWidth={1.5} className="text-[#111111]" /> Kết quả đối chiếu chi tiết:
                        </h3>

                        <div className="flex items-center gap-3 text-[11px] font-semibold text-[#444444]">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-lime-1000 inline-block" /> Đúng
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Sai / Thừa
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Còn thiếu
                          </span>
                        </div>
                      </div>

                      {/* Diff Words Rendering Container */}
                      <div className="p-4 rounded-md bg-white border-2 border-black text-sm leading-relaxed tracking-wide flex flex-wrap gap-1.5 items-baseline">
                        {diffData.diffs.map((diff, dIdx) => {
                          if (diff.type === 'correct') {
                            return (
                              <span
                                key={dIdx}
                                className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-medium"
                                title="Đúng"
                              >
                                {diff.target}
                              </span>
                            );
                          }
                          if (diff.type === 'incorrect') {
                            return (
                              <span
                                key={dIdx}
                                className="inline-flex flex-col items-center px-1.5 py-0.5 rounded bg-rose-50 border-2 border-black text-rose-800"
                                title={`Bạn đã gõ: "${diff.typed}"`}
                              >
                                <span className="font-bold text-emerald-700">{diff.target}</span>
                                <span className="text-[10px] line-through text-rose-500">{diff.typed}</span>
                              </span>
                            );
                          }
                          if (diff.type === 'missing') {
                            return (
                              <span
                                key={dIdx}
                                className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border-2 border-dashed border-amber-300"
                                title="Từ còn thiếu"
                              >
                                {diff.target}
                              </span>
                            );
                          }
                          if (diff.type === 'extra') {
                            return (
                              <span
                                key={dIdx}
                                className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 line-through text-xs"
                                title="Từ thừa"
                              >
                                {diff.typed}
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      {/* Translation Toggle & Card */}
                      {currentSegment.translation && (
                        <div className="pt-2 border-t-2 border-black space-y-2">
                          <button
                            type="button"
                            onClick={() => setShowTranslation(!showTranslation)}
                            className="text-xs font-bold text-[#111111] hover:text-[#111111] inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <BookOpen size={13} strokeWidth={1.5} />
                            {showTranslation ? 'Ẩn bản dịch tiếng Việt' : 'Xem bản dịch nghĩa tiếng Việt'}
                          </button>

                          {showTranslation && (
                            <div className="p-3.5 rounded-md bg-[#FFF4A3]/60 border-2 border-black text-xs text-[#111111] leading-relaxed italic animate-fadeIn">
                              {currentSegment.translation}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Next Segment CTA */}
                      <div className="pt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={handleNext}
                          className="px-5 py-2 rounded-md bg-[#111111] hover:bg-[#333333] active:scale-95 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-[3px_3px_0_#111111] cursor-pointer"
                        >
                          Tiếp tục câu sau <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* BOTTOM NAVIGATION FOOTER */}
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-md border-2 border-black bg-white text-[#222222] hover:bg-[#F1EEDF] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ChevronLeft size={16} /> Câu trước
                </button>

                <div className="text-xs text-[#444444] font-semibold">
                  Câu {currentIndex + 1} trên {activeSegments.length}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2.5 rounded-md bg-[#111111] text-white hover:bg-[#333333] font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-[3px_3px_0_#111111] cursor-pointer"
                >
                  {currentIndex === activeSegments.length - 1 ? 'Xem tổng kết' : 'Câu tiếp theo'}{' '}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-md border-2 border-black text-center space-y-4">
              <p className="text-[#444444] font-medium">Không có câu hỏi nghe nào trong phần này.</p>
              <button
                type="button"
                onClick={() => setSelectedPartFilter('all')}
                className="px-4 py-2 bg-[#111111] text-white rounded-md text-xs font-bold"
              >
                Xem tất cả các phần nghe
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SEGMENT PALETTE / NAVIGATOR (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-md border-2 border-black p-5 shadow-[3px_3px_0_#111111] space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-sm font-extrabold text-[#111111] tracking-tight flex items-center gap-2">
                <Layers size={16} strokeWidth={1.5} className="text-[#111111]" /> Danh sách câu nghe
              </h2>
              <span className="text-xs font-bold text-[#444444] tabular-nums">
                {stats.completed}/{stats.total}
              </span>
            </div>

            {/* Segments Grid */}
            <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
              {activeSegments.map((seg, sIdx) => {
                const isSelected = sIdx === currentIndex;
                const rec = userRecords[seg.segmentId];
                const isDone = rec && rec.checked;

                return (
                  <button
                    key={seg.segmentId}
                    type="button"
                    onClick={() => setCurrentIndex(sIdx)}
                    className={`w-full text-left p-3 rounded-md border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFF4A3] border-black ring-2 ring-[#FF5B93]/40 shadow-[3px_3px_0_#111111]'
                        : isDone
                        ? 'bg-lime-100/40 border-black/80 hover:bg-lime-100/70'
                        : 'bg-white border-black hover:bg-[#F1EEDF]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? 'text-[#111111]' : isDone ? 'text-[#14532D]' : 'text-[#111111]'
                          }`}
                        >
                          Câu {seg.orderIndex || sIdx + 1}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#555555] px-1.5 py-0.2 rounded bg-[#F1EEDF]">
                          P{seg.partNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#555555] truncate mt-0.5">
                        {seg.transcript ? seg.transcript.slice(0, 35) + '...' : 'Audio listening'}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isDone ? (
                        <span
                          className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                            rec.accuracy >= 80
                              ? 'bg-emerald-100 text-[#14532D]'
                              : rec.accuracy >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec.accuracy}%
                        </span>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E4E0D1] inline-block" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Completion Button */}
            <div className="pt-2 border-t-2 border-black">
              <button
                type="button"
                onClick={() => setCelebrationModalOpen(true)}
                className="w-full py-2.5 rounded-md border-2 border-black bg-[#FFF4A3]/80 hover:bg-[#FFE77A] text-[#111111] font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Award size={15} strokeWidth={1.5} /> Xem tổng kết luyện tập
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 shadow-[3px_3px_0_#111111] border-2 border-black space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-base font-extrabold text-[#111111] flex items-center gap-2">
                <Sliders size={18} strokeWidth={1.5} className="text-[#111111]" /> Phím tắt luyện chép chính tả
              </h3>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-md text-[#555555] hover:text-[#222222] hover:bg-[#F1EEDF] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { key: 'Space', desc: 'Bật / Tạm dừng audio' },
                { key: 'Alt + ←', desc: 'Tua lại 3 giây' },
                { key: 'Alt + →', desc: 'Tua tới 3 giây' },
                { key: 'Ctrl + Enter', desc: 'Kiểm tra kết quả chép' },
                { key: 'Alt + N', desc: 'Chuyển sang câu tiếp theo' },
                { key: 'Alt + P', desc: 'Quay về câu trước' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-md bg-[#FFFDF2] border-2 border-black">
                  <span className="text-[#333333] font-medium">{item.desc}</span>
                  <kbd className="px-2 py-1 bg-white border-2 border-black rounded shadow-[3px_3px_0_#111111] font-mono font-bold text-[#111111] text-[11px]">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowShortcutsModal(false)}
              className="w-full py-2.5 rounded-md bg-[#111111] hover:bg-[#333333] text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Đã hiểu & Tiếp tục luyện tập
            </button>
          </div>
        </div>
      )}

      {/* CELEBRATION / COMPLETION MODAL */}
      {celebrationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-lg w-full p-7 shadow-[3px_3px_0_#111111] border-2 border-black text-center space-y-6 animate-scaleIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-[3px_3px_0_#111111]">
              <Award size={36} strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-[#111111] tracking-tight">Tổng kết phiên chép chính tả!</h3>
              <p className="text-xs text-[#444444] max-w-sm mx-auto">
                Bạn đã hoàn thành các câu nghe trong phần thi này. Tiếp tục duy trì thói quen nghe chép chính tả mỗi ngày
                để tăng band điểm TOEIC Listening vượt bậc!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-md bg-[#FFFDF2] border-2 border-black text-center">
              <div>
                <span className="text-[11px] text-[#555555] font-semibold block">Đã làm</span>
                <strong className="text-lg font-black text-[#111111] tabular-nums">
                  {stats.completed}/{stats.total}
                </strong>
              </div>
              <div>
                <span className="text-[11px] text-[#555555] font-semibold block">Độ chính xác</span>
                <strong className="text-lg font-black text-emerald-600 tabular-nums">{stats.averageAccuracy}%</strong>
              </div>
              <div>
                <span className="text-[11px] text-[#555555] font-semibold block">Tiến độ</span>
                <strong className="text-lg font-black text-[#111111] tabular-nums">{stats.progressPercent}%</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCelebrationModalOpen(false)}
                className="flex-1 py-3 rounded-md border-2 border-black text-[#222222] hover:bg-[#F1EEDF] font-bold text-xs transition-colors cursor-pointer"
              >
                Tiếp tục xem lại
              </button>
              <Link
                to={`/courses/${testId}`}
                className="flex-1 py-3 rounded-md bg-[#111111] hover:bg-[#333333] text-white font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Về trang đề thi
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DictationTakePage;
