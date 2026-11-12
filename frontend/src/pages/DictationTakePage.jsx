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
      <div className="neo-brutal-dictation flex min-h-screen flex-col items-center justify-center space-y-4 bg-white">
        <div className="h-10 w-10 animate-spin border-2 border-slate-300 border-t-[#1D4ED8]" />
        <p className="text-sm font-medium text-slate-600">Đang chuẩn bị dữ liệu nghe chép chính tả...</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="neo-brutal-dictation flex min-h-screen flex-col items-center justify-center bg-white p-4">
        <div className="w-full max-w-md space-y-4 border border-slate-200 bg-white p-6 text-center">
          <AlertCircle size={40} className="mx-auto text-red-600" />
          <h2 className="text-lg font-semibold text-slate-900">Không thể tải dữ liệu chép chính tả</h2>
          <p className="text-sm text-slate-600">{error || 'Có lỗi xảy ra trong quá trình kết nối.'}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError(null);
                setRequestAttempt((attempt) => attempt + 1);
              }}
              className="inline-flex items-center justify-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#173ea8]"
            >
              Tải lại dữ liệu
            </button>
            <Link
              to={`/courses/${testId}`}
              className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
            >
              <ArrowLeft size={16} /> Quay lại trang đề thi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-brutal-dictation flex min-h-screen flex-col bg-white text-slate-900">
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
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Back & Title */}
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to={`/courses/${testId}`}
              className="shrink-0 border border-slate-300 bg-white p-2 text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
              title="Quay lại chi tiết đề"
            >
              <ArrowLeft size={18} strokeWidth={1.75} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 border border-blue-200 bg-[#EFF6FF] px-2 py-0.5 font-mono text-xs font-semibold text-[#1D4ED8]">
                  <Headphones size={12} strokeWidth={1.75} /> Chép chính tả
                </span>
                <span className="hidden text-xs text-slate-400 sm:inline">•</span>
                <h1 className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                  {test.titleTest}
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Filter Parts & Shortcuts Trigger */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Part Selection Pills */}
            <div className="hidden items-center gap-1 border border-slate-200 bg-slate-50 p-1 text-xs font-semibold md:flex">
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
                  className={`cursor-pointer px-3 py-1.5 transition-colors ${
                    selectedPartFilter === p.id
                      ? 'bg-[#1D4ED8] font-semibold text-white'
                      : 'text-slate-600 hover:text-slate-900'
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
              className="cursor-pointer border border-slate-300 bg-white p-2 text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
              title="Phím tắt luyện nghe"
            >
              <HelpCircle size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Global Progress Bar (Top Stripe) */}
        <div className="relative h-1 w-full overflow-hidden bg-slate-100">
          <div
            className="h-full bg-[#1D4ED8] transition-all duration-300"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </header>

      {/* SUB-HEADER STATS BANNER */}
      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-600 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          {/* Active Part indicator & index */}
          <div className="flex items-center gap-3">
            <span className="font-mono font-semibold text-slate-900">
              Câu {currentIndex + 1} / {activeSegments.length}
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Đã hoàn thành: <strong className="font-mono text-slate-900">{stats.completed}</strong> câu
            </span>
          </div>

          {/* Average accuracy score */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <Award size={14} strokeWidth={1.75} className="text-[#1D4ED8]" /> Độ chính xác TB:
              <strong
                className={`font-mono font-bold tabular-nums ${
                  stats.averageAccuracy >= 80
                    ? 'text-emerald-700'
                    : stats.averageAccuracy >= 50
                      ? 'text-[#1D4ED8]'
                      : 'text-slate-800'
                }`}
              >
                {stats.averageAccuracy}%
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* LEFT COLUMN: DICTATION WORKBENCH (8 COLS) */}
        <div className="space-y-6 lg:col-span-8">
          {currentSegment ? (
            <div className="space-y-6">
              {/* EDITORIAL CARD CONTAINER */}
              <div className="space-y-6 border border-slate-200 bg-white p-5 sm:p-7">
                {/* Segment Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
                  <div>
                    <span className="border border-blue-200 bg-[#EFF6FF] px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-[#1D4ED8]">
                      {getSegmentTitle(currentSegment)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrentChecked && (
                      <span
                        className={`inline-flex items-center gap-1.5 border px-3 py-1 font-mono text-xs font-semibold ${
                          currentRecord.accuracy >= 80
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : currentRecord.accuracy >= 50
                              ? 'border-amber-200 bg-amber-50 text-amber-800'
                              : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                      >
                        <CheckCircle2 size={13} strokeWidth={2} /> {currentRecord.accuracy}% Chính xác
                      </span>
                    )}
                  </div>
                </div>

                {/* If Part 1: Photograph Card */}
                {currentSegment.imageUrl && (
                  <div className="flex flex-col items-center justify-center border border-slate-200 bg-slate-50/60 p-4">
                    <img
                      src={currentSegment.imageUrl}
                      alt="TOEIC Listening Photograph"
                      className="max-h-72 w-auto border border-slate-200 object-contain"
                      loading="lazy"
                    />
                    <span className="mt-2 text-xs italic text-slate-500">
                      Quan sát tranh và nghe kỹ 4 lựa chọn (A), (B), (C), (D) để chép lại
                    </span>
                  </div>
                )}

                {/* AUDIO PLAYER CONTROLLER */}
                <div className="space-y-3 border border-slate-200 bg-slate-50 p-4">
                  {/* Scrubber progress bar */}
                  <div className="space-y-1">
                    <div className="relative h-2 w-full overflow-hidden bg-slate-200">
                      <div
                        className="h-full bg-[#1D4ED8] transition-all duration-100"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between font-mono text-xs text-slate-600 tabular-nums">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controller Action Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Left: Rewind / Play-Pause / Forward */}
                    <div className="flex items-center gap-2">
                      {/* Rewind 3s */}
                      <button
                        type="button"
                        onClick={() => handleRewind(3)}
                        className="cursor-pointer border border-slate-300 bg-white p-2.5 text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                        title="Lùi lại 3s (Alt + ←)"
                      >
                        <RotateCcw size={17} strokeWidth={1.75} />
                      </button>

                      {/* Play / Pause Master Button */}
                      <button
                        type="button"
                        onClick={togglePlayAudio}
                        className="inline-flex cursor-pointer items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#173ea8]"
                      >
                        {isPlaying ? (
                          <>
                            <Pause size={17} strokeWidth={2} /> Tạm dừng
                          </>
                        ) : (
                          <>
                            <Play size={17} strokeWidth={2} className="fill-current" /> Phát audio
                          </>
                        )}
                      </button>

                      {/* Forward 3s */}
                      <button
                        type="button"
                        onClick={() => handleForward(3)}
                        className="cursor-pointer border border-slate-300 bg-white p-2.5 text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                        title="Tua tới 3s (Alt + →)"
                      >
                        <RotateCw size={17} strokeWidth={1.75} />
                      </button>

                      {/* Loop Toggle */}
                      <button
                        type="button"
                        onClick={() => setIsLooping(!isLooping)}
                        className={`cursor-pointer border p-2.5 transition-colors ${
                          isLooping
                            ? 'border-[#1D4ED8] bg-[#EFF6FF] font-semibold text-[#1D4ED8]'
                            : 'border-slate-300 bg-white text-slate-600 hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
                        }`}
                        title="Lặp lại vô tận audio"
                      >
                        <Repeat size={17} strokeWidth={1.75} />
                      </button>
                    </div>

                    {/* Right: Playback speed and volume */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        aria-label="Tốc độ phát"
                        className="flex items-center gap-1 border border-slate-300 bg-white p-1 font-mono text-xs font-semibold text-slate-700"
                      >
                        {[0.8, 1.0, 1.2].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => handleSpeedChange(rate)}
                            aria-pressed={playbackRate === rate}
                            className={`cursor-pointer px-2.5 py-1 transition-colors tabular-nums ${
                              playbackRate === rate
                                ? 'bg-[#1D4ED8] font-bold text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                      <div className="flex min-h-10 items-center gap-2 border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-700">
                        <button
                          type="button"
                          onClick={toggleMute}
                          aria-label={isMuted ? 'Bật tiếng audio' : 'Tắt tiếng audio'}
                          aria-pressed={isMuted}
                          title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                          className="p-1 hover:text-[#1D4ED8]"
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX size={16} aria-hidden="true" />
                          ) : (
                            <Volume2 size={16} aria-hidden="true" />
                          )}
                        </button>
                        <label className="sr-only" htmlFor="dictation-volume">
                          Âm lượng audio
                        </label>
                        <input
                          id="dictation-volume"
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          aria-valuetext={`${Math.round((isMuted ? 0 : volume) * 100)}%`}
                          className="w-20 accent-[#1D4ED8] sm:w-24"
                        />
                        <span className="w-8 text-right tabular-nums">
                          {Math.round((isMuted ? 0 : volume) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FIRST LETTER HINT BOX (Optional) */}
                {showHint && currentSegment.transcript && (
                  <div className="space-y-1.5 border border-amber-200 bg-amber-50/70 p-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                      <Lightbulb size={14} strokeWidth={2} /> Gợi ý ký tự đầu của các từ:
                    </div>
                    <p className="select-all break-words font-mono text-sm leading-relaxed tracking-wide text-amber-950">
                      {generateFirstLetterHint(currentSegment.transcript)}
                    </p>
                  </div>
                )}

                {/* TYPING INPUT AREA */}
                <div className="space-y-2.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    Nhập lại những gì bạn nghe được (Tiếng Anh):
                  </label>
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="Nghe audio và gõ chính xác transcript tiếng Anh vào đây..."
                      rows={5}
                      className="w-full resize-y border border-slate-300 bg-white p-4 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-[#1D4ED8]"
                    />
                  </div>

                  {/* Word Count Indicator */}
                  <div className="flex items-center justify-between font-mono text-xs text-slate-500 tabular-nums">
                    <span>
                      Số từ đã gõ: <strong>{currentInput.trim() ? currentInput.trim().split(/\s+/).length : 0}</strong> từ
                    </span>
                    <span>Nhấn Ctrl + Enter để kiểm tra nhanh</span>
                  </div>
                </div>

                {/* ACTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Hint Button */}
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 border px-3.5 py-2 text-xs font-semibold transition-colors ${
                        showHint
                          ? 'border-amber-300 bg-amber-50 text-amber-800'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
                      }`}
                    >
                      <Lightbulb size={14} strokeWidth={1.75} /> {showHint ? 'Ẩn gợi ý' : 'Gợi ý chữ cái đầu'}
                    </button>

                    {/* Reveal Answer Button */}
                    <button
                      type="button"
                      onClick={() => setShowFullTranscript(!showFullTranscript)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 border px-3.5 py-2 text-xs font-semibold transition-colors ${
                        showFullTranscript
                          ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8]'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
                      }`}
                    >
                      {showFullTranscript ? (
                        <>
                          <EyeOff size={14} strokeWidth={1.75} /> Ẩn đáp án
                        </>
                      ) : (
                        <>
                          <Eye size={14} strokeWidth={1.75} /> Xem đáp án
                        </>
                      )}
                    </button>

                    {/* Reset Button */}
                    {currentInput && (
                      <button
                        type="button"
                        onClick={handleResetCurrent}
                        className="inline-flex cursor-pointer items-center gap-1 border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        title="Xóa để làm lại"
                      >
                        <RefreshCw size={13} strokeWidth={1.75} /> Làm lại
                      </button>
                    )}
                  </div>

                  {/* Master Check Answer Button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCheckAnswer}
                      disabled={!currentInput.trim()}
                      className="inline-flex cursor-pointer items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#173ea8] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check size={16} strokeWidth={2.25} /> Kiểm tra kết quả
                    </button>
                  </div>
                </div>

                {/* WORD DIFF & COMPARISON RESULTS */}
                {(isCurrentChecked || showFullTranscript) && (
                  <div className="space-y-4 border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-800">
                        <FileText size={15} strokeWidth={1.75} className="text-[#1D4ED8]" /> Kết quả đối chiếu từng từ:
                      </h3>

                      <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-2.5 w-2.5 bg-emerald-600" /> Đúng
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-2.5 w-2.5 bg-red-500" /> Sai / Thừa
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-2.5 w-2.5 bg-amber-500" /> Còn thiếu
                        </span>
                      </div>
                    </div>

                    {/* Diff Words Rendering Container */}
                    <div className="flex flex-wrap items-baseline gap-1.5 border border-slate-200 bg-white p-4 text-sm leading-relaxed">
                      {diffData.diffs.map((diff, dIdx) => {
                        if (diff.type === 'correct') {
                          return (
                            <span
                              key={dIdx}
                              className="bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-900"
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
                              className="inline-flex flex-col items-center border border-red-200 bg-red-50 px-1.5 py-0.5 text-red-800"
                              title={`Bạn đã gõ: "${diff.typed}"`}
                            >
                              <span className="font-semibold text-emerald-800">{diff.target}</span>
                              <span className="text-[11px] text-red-600 line-through">{diff.typed}</span>
                            </span>
                          );
                        }
                        if (diff.type === 'missing') {
                          return (
                            <span
                              key={dIdx}
                              className="border border-dashed border-amber-300 bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-900"
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
                              className="bg-red-50 px-1.5 py-0.5 text-xs text-red-700 line-through"
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
                      <div className="space-y-2 border-t border-slate-200 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowTranslation(!showTranslation)}
                          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:underline"
                        >
                          <BookOpen size={14} strokeWidth={1.75} />
                          {showTranslation ? 'Ẩn bản dịch tiếng Việt' : 'Xem bản dịch nghĩa tiếng Việt'}
                        </button>

                        {showTranslation && (
                          <div className="border border-blue-200 bg-[#EFF6FF]/60 p-3.5 text-xs leading-relaxed text-slate-800">
                            {currentSegment.translation}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Next Segment CTA */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex cursor-pointer items-center gap-1.5 border border-[#1D4ED8] bg-[#1D4ED8] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#173ea8]"
                      >
                        Tiếp tục câu sau <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM NAVIGATION FOOTER */}
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="inline-flex cursor-pointer items-center gap-1.5 border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Câu trước
                </button>

                <div className="font-mono text-xs font-semibold text-slate-600">
                  Câu {currentIndex + 1} trên {activeSegments.length}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex cursor-pointer items-center gap-1.5 border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#173ea8]"
                >
                  {currentIndex === activeSegments.length - 1 ? 'Xem tổng kết' : 'Câu tiếp theo'}{' '}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 border border-slate-200 bg-white p-12 text-center">
              <p className="font-medium text-slate-600">Không có câu hỏi nghe nào trong phần này.</p>
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#173ea8]"
              >
                Xem tất cả các phần nghe
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SEGMENT PALETTE / NAVIGATOR (4 COLS) */}
        <div className="space-y-6 lg:col-span-4">
          <div className="sticky top-24 space-y-4 border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Layers size={16} strokeWidth={1.75} className="text-[#1D4ED8]" /> Danh sách câu nghe
              </h2>
              <span className="font-mono text-xs font-semibold text-slate-600 tabular-nums">
                {stats.completed}/{stats.total}
              </span>
            </div>

            {/* Segments Grid */}
            <div className="scrollbar-thin max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {activeSegments.map((seg, sIdx) => {
                const isSelected = sIdx === currentIndex;
                const rec = userRecords[seg.segmentId];
                const isDone = rec && rec.checked;

                return (
                  <button
                    key={seg.segmentId}
                    type="button"
                    onClick={() => setCurrentIndex(sIdx)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 border p-3 text-left transition-colors ${
                      isSelected
                        ? 'border-[#1D4ED8] bg-[#EFF6FF]'
                        : isDone
                          ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            isSelected ? 'text-[#1D4ED8]' : isDone ? 'text-emerald-900' : 'text-slate-900'
                          }`}
                        >
                          Câu {seg.orderIndex || sIdx + 1}
                        </span>
                        <span className="border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-slate-600">
                          P{seg.partNumber}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {seg.transcript ? seg.transcript.slice(0, 38) + '...' : 'Audio listening'}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isDone ? (
                        <span
                          className={`border px-2 py-0.5 font-mono text-[11px] font-bold ${
                            rec.accuracy >= 80
                              ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
                              : rec.accuracy >= 50
                                ? 'border-amber-200 bg-amber-100 text-amber-800'
                                : 'border-red-200 bg-red-100 text-red-800'
                          }`}
                        >
                          {rec.accuracy}%
                        </span>
                      ) : (
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-200" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Completion Button */}
            <div className="border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => setCelebrationModalOpen(true)}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 border border-slate-300 bg-slate-50 py-2.5 text-xs font-semibold text-slate-800 transition-colors hover:border-[#1D4ED8] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
              >
                <Award size={15} strokeWidth={1.75} /> Xem tổng kết luyện tập
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md space-y-5 border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <Sliders size={18} strokeWidth={1.75} className="text-[#1D4ED8]" /> Phím tắt luyện chép chính tả
              </h3>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="cursor-pointer border border-slate-300 bg-white p-1 text-slate-600 hover:border-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { key: 'Space', desc: 'Bật / Tạm dừng audio' },
                { key: 'Alt + ←', desc: 'Tua lại 3 giây' },
                { key: 'Alt + →', desc: 'Tua tới 3 giây' },
                { key: 'Ctrl + Enter', desc: 'Kiểm tra kết quả chép' },
                { key: 'Alt + N', desc: 'Chuyển sang câu tiếp theo' },
                { key: 'Alt + P', desc: 'Quay về câu trước' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border border-slate-200 bg-slate-50/70 p-2.5"
                >
                  <span className="font-medium text-slate-700">{item.desc}</span>
                  <kbd className="border border-slate-300 bg-white px-2 py-1 font-mono text-[11px] font-bold text-slate-900">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowShortcutsModal(false)}
              className="w-full cursor-pointer border border-[#1D4ED8] bg-[#1D4ED8] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#173ea8]"
            >
              Đã hiểu & Tiếp tục luyện tập
            </button>
          </div>
        </div>
      )}

      {/* CELEBRATION / COMPLETION MODAL */}
      {celebrationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg space-y-6 border border-slate-200 bg-white p-7 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Award size={32} strokeWidth={1.75} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-slate-900">Tổng kết phiên chép chính tả</h3>
              <p className="mx-auto max-w-sm text-sm text-slate-600">
                Bạn đã hoàn thành các câu nghe trong phần thi này. Duy trì luyện nghe chép chính tả đều đặn để cải thiện khả năng bắt từ khóa TOEIC Listening.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 border border-slate-200 bg-slate-50 p-4 text-center">
              <div>
                <span className="block text-xs font-medium text-slate-500">Đã làm</span>
                <strong className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                  {stats.completed}/{stats.total}
                </strong>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500">Độ chính xác</span>
                <strong className="font-mono text-lg font-bold text-emerald-700 tabular-nums">
                  {stats.averageAccuracy}%
                </strong>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500">Tiến độ</span>
                <strong className="font-mono text-lg font-bold text-[#1D4ED8] tabular-nums">
                  {stats.progressPercent}%
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCelebrationModalOpen(false)}
                className="flex-1 cursor-pointer border border-slate-300 bg-white py-3 text-xs font-semibold text-slate-800 transition-colors hover:border-slate-400"
              >
                Tiếp tục xem lại
              </button>
              <Link
                to={`/courses/${testId}`}
                className="flex-1 cursor-pointer border border-[#1D4ED8] bg-[#1D4ED8] py-3 text-center text-xs font-semibold text-white transition-colors hover:bg-[#173ea8]"
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
