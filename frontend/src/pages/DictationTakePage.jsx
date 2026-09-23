import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  Sparkles,
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
  Send,
  X,
  FileText,
  Volume1,
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
  const navigate = useNavigate();

  // Selected Part Filter from URL or state ('all' | '1' | '2' | '3' | '4')
  const initialPart = searchParams.get('part') || 'all';
  const [selectedPartFilter, setSelectedPartFilter] = useState(initialPart);

  // Test data states
  const [test, setTest] = useState(null);
  const [listeningSegments, setListeningSegments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  // Input textarea ref
  const textareaRef = useRef(null);

  // 1. Fetch Test Detail & Filter Listening Segments (Part 1, 2, 3, 4)
  useEffect(() => {
    const fetchTestData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await examService.getTestDetail(testId);
        if (res.code === 1000 && res.data) {
          const testData = res.data;
          setTest(testData);

          const rawCqs = testData.contextQuestions || [];

          // Sort & tag Part numbers
          const processed = rawCqs
            .map((cq, idx) => {
              let partNum = null;
              if (cq.orderIndex !== undefined && cq.orderIndex !== null && cq.orderIndex > 0) {
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
          const savedData = localStorage.getItem(storageKey);
          if (savedData) {
            try {
              const parsed = JSON.parse(savedData);
              setUserRecords(parsed);
            } catch (err) {
              console.error('Failed to parse dictation storage:', err);
            }
          }
        } else {
          setError(res.message || 'Không tìm thấy dữ liệu đề thi');
        }
      } catch (err) {
        console.error('Error fetching test for dictation:', err);
        setError('Không thể tải dữ liệu bài thi. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

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
  const saveRecordsToStorage = (updatedRecords) => {
    try {
      localStorage.setItem(`dictation_history_${testId}`, JSON.stringify(updatedRecords));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  };

  // Audio event handlers
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn('Audio play prevented:', err));
    }
  };

  const handleRewind = (seconds = 3) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - seconds);
  };

  const handleForward = (seconds = 3) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + seconds);
  };

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

  // Check Answer Handler
  const handleCheckAnswer = () => {
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
  };

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
  const handleNext = () => {
    if (currentIndex < activeSegments.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCelebrationModalOpen(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

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
  }, [showShortcutsModal, isPlaying, currentSegment, currentInput, currentIndex, activeSegments]);

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
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-600">Đang chuẩn bị dữ liệu nghe chép chính tả...</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-red-200 shadow-sm text-center space-y-4">
          <AlertCircle size={40} className="text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Không thể tải đề thi</h2>
          <p className="text-sm text-slate-600">{error || 'Có lỗi xảy ra trong quá trình kết nối.'}</p>
          <Link
            to={`/courses/${testId}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} /> Quay lại trang đề thi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
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
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Back & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={`/courses/${testId}`}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
              title="Quay lại chi tiết đề"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold tracking-wide border border-blue-200/70 inline-flex items-center gap-1">
                  <Headphones size={12} strokeWidth={1.5} /> Chép chính tả
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate tracking-tight">
                  {test.titleTest}
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Filter Parts & Shortcuts Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Part Selection Pills */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
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
                    setSelectedPartFilter(p.id);
                    setCurrentIndex(0);
                    setSearchParams(p.id === 'all' ? {} : { part: p.id });
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedPartFilter === p.id
                      ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
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
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Phím tắt luyện nghe"
            >
              <HelpCircle size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Global Progress Bar (Top Stripe) */}
        <div className="w-full bg-slate-100 h-1 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </header>

      {/* SUB-HEADER STATS BANNER */}
      <div className="bg-slate-50 border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 py-2.5 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          {/* Active Part indicator & index */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900">
              Câu {currentIndex + 1} / {activeSegments.length}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">
              Đã hoàn thành: <strong className="text-slate-800">{stats.completed}</strong> câu
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
                    ? 'text-blue-600'
                    : 'text-slate-700'
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
              <div className="p-1.5 rounded-3xl bg-slate-100/80 border border-slate-200/80 shadow-xs">
                <div className="bg-white rounded-[calc(1.5rem-0.375rem)] border border-slate-200/60 p-5 sm:p-7 space-y-6">
                  {/* Segment Meta Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60">
                        {getSegmentTitle(currentSegment)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrentChecked && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1.5 ${
                            currentRecord.accuracy >= 80
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : currentRecord.accuracy >= 50
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <CheckCircle2 size={13} strokeWidth={2} /> {currentRecord.accuracy}% Chính xác
                        </span>
                      )}
                    </div>
                  </div>

                  {/* If Part 1: Photograph Card */}
                  {currentSegment.imageUrl && (
                    <div className="flex flex-col items-center justify-center p-3 bg-slate-50/70 rounded-2xl border border-slate-200/70">
                      <img
                        src={currentSegment.imageUrl}
                        alt="TOEIC Listening Photograph"
                        className="max-h-72 w-auto object-contain rounded-xl shadow-xs border border-slate-200"
                        loading="lazy"
                      />
                      <span className="text-[11px] text-slate-400 mt-2 italic">
                        Quan sát tranh và nghe kỹ 4 lựa chọn (A), (B), (C), (D) để chép lại
                      </span>
                    </div>
                  )}

                  {/* AUDIO PLAYER CONTROLLER (Modern kinetic double-bezel) */}
                  <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-blue-100/70 space-y-3">
                    {/* Scrubber progress bar */}
                    <div className="space-y-1">
                      <div className="relative w-full h-2 bg-slate-200/80 rounded-full overflow-hidden cursor-pointer">
                        <div
                          className="h-full bg-blue-600 transition-all duration-100"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono font-medium text-slate-500 tabular-nums">
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
                          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 active:scale-95 transition-all shadow-2xs cursor-pointer"
                          title="Lùi lại 3s (Alt + ←)"
                        >
                          <RotateCcw size={17} strokeWidth={1.5} />
                        </button>

                        {/* Play / Pause Master Button */}
                        <button
                          type="button"
                          onClick={togglePlayAudio}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
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
                          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 active:scale-95 transition-all shadow-2xs cursor-pointer"
                          title="Tua tới 3s (Alt + →)"
                        >
                          <RotateCw size={17} strokeWidth={1.5} />
                        </button>

                        {/* Loop Toggle */}
                        <button
                          type="button"
                          onClick={() => setIsLooping(!isLooping)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isLooping
                              ? 'bg-blue-100 text-blue-700 border-blue-300 font-bold shadow-2xs'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                          }`}
                          title="Lặp lại vô tận audio"
                        >
                          <Repeat size={17} strokeWidth={1.5} />
                        </button>
                      </div>

                      {/* Right: Playback Speed selector */}
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200/80 text-xs font-bold text-slate-600">
                        {[0.8, 1.0, 1.2].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => handleSpeedChange(rate)}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer tabular-nums ${
                              playbackRate === rate
                                ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                                : 'hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* FIRST LETTER HINT BOX (Optional) */}
                  {showHint && currentSegment.transcript && (
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1.5 animate-fadeIn">
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
                    <label className="block text-xs font-bold text-slate-700 tracking-tight">
                      Nhập lại những gì bạn nghe được (English):
                    </label>
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        placeholder="Nghe audio và gõ chính xác transcript tiếng Anh vào đây..."
                        rows={5}
                        className="w-full p-4 rounded-2xl border border-slate-300 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed resize-y transition-all font-sans"
                      />
                    </div>

                    {/* Word Count Indicator */}
                    <div className="flex items-center justify-between text-xs text-slate-400 tabular-nums">
                      <span>
                        Số từ đã gõ: <strong>{currentInput.trim() ? currentInput.trim().split(/\s+/).length : 0}</strong> từ
                      </span>
                      <span className="text-[11px] text-slate-400">Nhấn Ctrl + Enter để kiểm tra nhanh</span>
                    </div>
                  </div>

                  {/* ACTION BAR (Button-in-Button & Tool Buttons) */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Hint Button */}
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                          showHint
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Lightbulb size={14} strokeWidth={1.5} /> {showHint ? 'Ẩn gợi ý' : 'Gợi ý chữ cái đầu'}
                      </button>

                      {/* Reveal Answer Button */}
                      <button
                        type="button"
                        onClick={() => setShowFullTranscript(!showFullTranscript)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                          showFullTranscript
                            ? 'bg-slate-200 text-slate-800 border-slate-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
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
                          className="px-3 py-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
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
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-white font-bold text-sm inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                      >
                        <Check size={16} strokeWidth={2.5} /> Kiểm tra kết quả
                      </button>
                    </div>
                  </div>

                  {/* WORD DIFF & COMPARISON RESULTS (Renders when checked or revealed) */}
                  {(isCurrentChecked || showFullTranscript) && (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <FileText size={15} strokeWidth={1.5} className="text-blue-600" /> Kết quả đối chiếu chi tiết:
                        </h3>

                        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Đúng
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
                      <div className="p-4 rounded-xl bg-white border border-slate-200 text-sm leading-relaxed tracking-wide flex flex-wrap gap-1.5 items-baseline">
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
                                className="inline-flex flex-col items-center px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800"
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
                                className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-dashed border-amber-300"
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
                        <div className="pt-2 border-t border-slate-200/80 space-y-2">
                          <button
                            type="button"
                            onClick={() => setShowTranslation(!showTranslation)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <BookOpen size={13} strokeWidth={1.5} />
                            {showTranslation ? 'Ẩn bản dịch tiếng Việt' : 'Xem bản dịch nghĩa tiếng Việt'}
                          </button>

                          {showTranslation && (
                            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/70 text-xs text-blue-950 leading-relaxed italic animate-fadeIn">
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
                          className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
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
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ChevronLeft size={16} /> Câu trước
                </button>

                <div className="text-xs text-slate-500 font-semibold">
                  Câu {currentIndex + 1} trên {activeSegments.length}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  {currentIndex === activeSegments.length - 1 ? 'Xem tổng kết' : 'Câu tiếp theo'}{' '}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
              <p className="text-slate-500 font-medium">Không có câu hỏi nghe nào trong phần này.</p>
              <button
                type="button"
                onClick={() => setSelectedPartFilter('all')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Xem tất cả các phần nghe
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SEGMENT PALETTE / NAVIGATOR (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers size={16} strokeWidth={1.5} className="text-blue-600" /> Danh sách câu nghe
              </h2>
              <span className="text-xs font-bold text-slate-500 tabular-nums">
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
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20 shadow-2xs'
                        : isDone
                        ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/70'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? 'text-blue-700' : isDone ? 'text-emerald-800' : 'text-slate-800'
                          }`}
                        >
                          Câu {seg.orderIndex || sIdx + 1}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-100">
                          P{seg.partNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {seg.transcript ? seg.transcript.slice(0, 35) + '...' : 'Audio listening'}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isDone ? (
                        <span
                          className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                            rec.accuracy >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.accuracy >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec.accuracy}%
                        </span>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Completion Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCelebrationModalOpen(true)}
                className="w-full py-2.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Award size={15} strokeWidth={1.5} /> Xem bảng xếp hạng & thống kê
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sliders size={18} strokeWidth={1.5} className="text-blue-600" /> Phím tắt luyện chép chính tả
              </h3>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 font-medium">{item.desc}</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded shadow-2xs font-mono font-bold text-slate-800 text-[11px]">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowShortcutsModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Đã hiểu & Tiếp tục luyện tập
            </button>
          </div>
        </div>
      )}

      {/* CELEBRATION / COMPLETION MODAL */}
      {celebrationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-slate-200 text-center space-y-6 animate-scaleIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <Award size={36} strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tổng kết phiên chép chính tả!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Bạn đã hoàn thành các câu nghe trong phần thi này. Tiếp tục duy trì thói quen nghe chép chính tả mỗi ngày
                để tăng band điểm TOEIC Listening vượt bậc!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Đã làm</span>
                <strong className="text-lg font-black text-slate-800 tabular-nums">
                  {stats.completed}/{stats.total}
                </strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Độ chính xác</span>
                <strong className="text-lg font-black text-emerald-600 tabular-nums">{stats.averageAccuracy}%</strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Tiến độ</span>
                <strong className="text-lg font-black text-blue-600 tabular-nums">{stats.progressPercent}%</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCelebrationModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Tiếp tục xem lại
              </button>
              <Link
                to={`/courses/${testId}`}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer text-center"
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
