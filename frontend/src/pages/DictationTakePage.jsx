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
  Check,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Award,
  Layers,
  HelpCircle,
  RefreshCw,
  Sliders,
  Settings,
  SkipForward,
  X,
} from 'lucide-react';
import { examService } from '../services/examService';
import examHeaderBg from '../assets/img/coursepage/thuvien.jpg';

const AUDIO_SPEED_OPTIONS = [
  { value: 0.5, label: '0.5×', shortLabel: '0.5×' },
  { value: 0.75, label: '0.75×', shortLabel: '0.75×' },
  { value: 0.9, label: '0.9×', shortLabel: '0.9×' },
  { value: 1, label: 'Normal', shortLabel: '1×' },
  { value: 1.1, label: '1.1×', shortLabel: '1.1×' },
  { value: 1.25, label: '1.25×', shortLabel: '1.25×' },
  { value: 1.5, label: '1.5×', shortLabel: '1.5×' },
  { value: 2, label: '2×', shortLabel: '2×' },
];

const parseAllowedAudioSpeed = (rawSpeed) => {
  const parsed = Number(rawSpeed);
  return AUDIO_SPEED_OPTIONS.some((item) => item.value === parsed) ? parsed : 1;
};

// Check if token is a TOEIC option marker or speaker label like (A), (B), W-Am:, #7
const isMetadataToken = (word) => {
  if (!word) return false;
  return /^\([A-D]\)$/i.test(word) || /^[MW]-[A-Za-z]+:$/i.test(word) || /^#\d+:?$/.test(word);
};

// Normalize word for comparison: preserve (A)-(D) markers Distinctly, strip punctuation, lowercase
const normalizeWord = (w) => {
  if (!w) return '';
  const trimmed = w.trim();
  if (/^\([A-D]\)$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return trimmed.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’“”]/g, '').trim().toLowerCase();
};

// Detect if a word ends a clause or sentence (., ,, ;, :, ?, !)
const isClauseBoundaryWord = (word) => {
  if (!word || isMetadataToken(word)) return false;
  const stripped = word.replace(/["'’”)]+$/g, '');
  if (/^(mr|mrs|ms|dr|st|jr|sr|vs|etc|u\.s|a\.m|p\.m)\.$/i.test(stripped)) {
    return false;
  }
  return /[.,;:?!]$/.test(stripped);
};

// Word-level diff comparison between typed text and target transcript (greedy earliest-match LCS)
const computeWordDiff = (typedText, targetText) => {
  if (!targetText) {
    return {
      diffs: [],
      targetStatuses: [],
      accuracy: 0,
      totalWords: 0,
      correctWords: 0,
      hasTrailingExtra: false,
    };
  }

  const targetWords = targetText.trim().split(/\s+/).filter(Boolean);
  const typedWords = typedText.trim().split(/\s+/).filter(Boolean);

  const m = targetWords.length;
  const n = typedWords.length;

  if (m === 0) {
    return {
      diffs: [],
      targetStatuses: [],
      accuracy: 100,
      totalWords: 0,
      correctWords: 0,
      hasTrailingExtra: false,
    };
  }

  if (n === 0) {
    const diffs = targetWords.map((tw, idx) => ({
      type: 'missing',
      target: tw,
      typed: '',
      targetIndex: idx,
    }));
    const targetStatuses = targetWords.map((tw, idx) => ({
      index: idx,
      word: tw,
      status: 'missing',
      typed: '',
    }));
    return { diffs, targetStatuses, accuracy: 0, totalWords: m, correctWords: 0, hasTrailingExtra: false };
  }

  // Suffix LCS table so forward backtracking greedily matches earlier clauses first
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (normalizeWord(targetWords[i]) === normalizeWord(typedWords[j])) {
        dp[i][j] = 1 + dp[i + 1][j + 1];
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  let i = 0;
  let j = 0;
  const diffs = [];

  while (i < m || j < n) {
    if (i < m && j < n && normalizeWord(targetWords[i]) === normalizeWord(typedWords[j])) {
      diffs.push({
        type: 'correct',
        target: targetWords[i],
        typed: typedWords[j],
        targetIndex: i,
      });
      i++;
      j++;
    } else if (i < m && (j === n || dp[i + 1][j] >= dp[i][j + 1])) {
      diffs.push({
        type: 'missing',
        target: targetWords[i],
        typed: '',
        targetIndex: i,
      });
      i++;
    } else {
      diffs.push({
        type: 'extra',
        target: '',
        typed: typedWords[j],
        targetIndex: null,
      });
      j++;
    }
  }

  // Pair adjacent missing + extra as 'incorrect' for clear word-level feedback
  const mergedDiffs = [];
  for (let k = 0; k < diffs.length; k++) {
    const curr = diffs[k];
    const next = diffs[k + 1];
    if (curr.type === 'missing' && !isMetadataToken(curr.target) && next && next.type === 'extra') {
      mergedDiffs.push({
        type: 'incorrect',
        target: curr.target,
        typed: next.typed,
        targetIndex: curr.targetIndex,
      });
      k++;
    } else if (curr.type === 'extra' && next && next.type === 'missing' && !isMetadataToken(next.target)) {
      mergedDiffs.push({
        type: 'incorrect',
        target: next.target,
        typed: curr.typed,
        targetIndex: next.targetIndex,
      });
      k++;
    } else {
      mergedDiffs.push(curr);
    }
  }

  const targetStatuses = targetWords.map((tw, idx) => ({
    index: idx,
    word: tw,
    status: 'missing',
    typed: '',
  }));

  mergedDiffs.forEach((d) => {
    if (d.targetIndex !== null && d.targetIndex !== undefined && targetStatuses[d.targetIndex]) {
      targetStatuses[d.targetIndex].status = d.type;
      targetStatuses[d.targetIndex].typed = d.typed || '';
    }
  });

  // Auto-credit metadata tokens like (A), (B), W-Am: if adjacent words in the same segment are matched
  for (let idx = 0; idx < m; idx++) {
    if (isMetadataToken(targetStatuses[idx].word) && targetStatuses[idx].status === 'missing') {
      const nextMatched = idx + 1 < m && targetStatuses[idx + 1].status === 'correct';
      const prevMatched = idx > 0 && targetStatuses[idx - 1].status === 'correct';
      if (nextMatched || prevMatched) {
        targetStatuses[idx].status = 'correct';
      }
    }
  }

  const scoredWords = targetStatuses.filter((item) => !isMetadataToken(item.word));
  const correctWords = scoredWords.filter((item) => item.status === 'correct').length;
  const totalWords = scoredWords.length || m;
  const accuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;

  const lastDiff = mergedDiffs[mergedDiffs.length - 1];
  const hasTrailingExtra = Boolean(lastDiff && lastDiff.type === 'extra');

  return {
    diffs: mergedDiffs,
    targetStatuses,
    accuracy,
    totalWords,
    correctWords,
    hasTrailingExtra,
  };
};

// Build clause-by-clause progressive reveal state (splits on ., ,, ;, :, ?, !)
const buildProgressiveClauseData = (typedText, targetText, extraRevealedClauses = 0) => {
  const diffResult = computeWordDiff(typedText, targetText);
  const { targetStatuses } = diffResult;

  if (!targetStatuses.length) {
    return {
      clauses: [],
      activeClauseIndex: 0,
      revealedClauseIndex: 0,
      isAllCorrect: true,
      isCurrentClauseMatched: true,
      hasHiddenClauses: false,
      nextHintWord: '',
      skipTargetText: '',
      diffResult,
    };
  }

  // Group target words into clauses delimited by ., ,, ;, :, ?, !
  const clauses = [];
  let currentWords = [];
  targetStatuses.forEach((item, idx) => {
    currentWords.push(item);
    if (isClauseBoundaryWord(item.word) || idx === targetStatuses.length - 1) {
      clauses.push({
        clauseIndex: clauses.length,
        words: currentWords,
        startIndex: currentWords[0].index,
        endIndex: item.index,
      });
      currentWords = [];
    }
  });

  // Auto-mark leading metadata tokens in a clause as correct if the first real word in that clause is matched
  clauses.forEach((clause) => {
    const firstRealWord = clause.words.find((w) => !isMetadataToken(w.word));
    if (firstRealWord && firstRealWord.status === 'correct') {
      clause.words.forEach((w) => {
        if (isMetadataToken(w.word) && w.index < firstRealWord.index) {
          w.status = 'correct';
        }
      });
    }
  });

  const isClauseComplete = (clause) => {
    const realWords = clause.words.filter((w) => !isMetadataToken(w.word));
    if (realWords.length === 0) return true;
    return realWords.every((w) => w.status === 'correct');
  };

  let firstIncompleteIdx = clauses.findIndex((c) => !isClauseComplete(c));
  const isAllCorrect = firstIncompleteIdx === -1;
  if (isAllCorrect) {
    firstIncompleteIdx = clauses.length - 1;
  }

  // Find the furthest clause reached by the user based on matched/attempted words and typed punctuation
  let lastMatchedClauseIdx = 0;
  clauses.forEach((clause, idx) => {
    const realWords = clause.words.filter((w) => !isMetadataToken(w.word));
    const matchedInClause = realWords.filter((w) => w.status === 'correct' || w.status === 'incorrect').length;
    if (matchedInClause > 0) {
      if (idx === 0 || matchedInClause >= 2) {
        lastMatchedClauseIdx = idx;
      } else {
        const prevClause = clauses[idx - 1];
        const prevReal = prevClause.words.filter((w) => !isMetadataToken(w.word));
        const prevMatched = prevReal.filter((w) => w.status === 'correct' || w.status === 'incorrect').length;
        if (prevReal.length === 0 || prevMatched / prevReal.length >= 0.4) {
          lastMatchedClauseIdx = idx;
        }
      }
    }
  });

  const userClauseSegments = typedText
    .trim()
    .split(/[.,;:?!]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const userTypedClauseIdx = Math.max(0, userClauseSegments.length - 1);

  let baseRevealIdx = Math.min(clauses.length - 1, Math.max(0, lastMatchedClauseIdx, userTypedClauseIdx));
  if (isAllCorrect) {
    baseRevealIdx = clauses.length - 1;
  }

  const revealedClauseIndex = Math.min(clauses.length - 1, baseRevealIdx + extraRevealedClauses);
  const isCurrentClauseMatched = isAllCorrect || isClauseComplete(clauses[revealedClauseIndex]);
  const hasHiddenClauses = !isAllCorrect && revealedClauseIndex < clauses.length - 1;

  // Determine what clicking "Skip" (Bỏ qua vế này) should fill into the textarea
  const targetSkipClauseIdx = isClauseComplete(clauses[revealedClauseIndex])
    ? Math.min(clauses.length - 1, revealedClauseIndex + 1)
    : revealedClauseIndex;

  const skipTargetText = clauses
    .slice(0, targetSkipClauseIdx + 1)
    .flatMap((c) => c.words.map((w) => w.word))
    .join(' ');

  return {
    clauses,
    activeClauseIndex: firstIncompleteIdx,
    revealedClauseIndex,
    isAllCorrect,
    isCurrentClauseMatched,
    hasHiddenClauses,
    skipTargetText,
    targetSkipClauseIdx,
    diffResult,
  };
};

const DictationTakePage = () => {
  const { testId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive the filter from the URL so browser back/forward stays in sync.
  const requestedPart = searchParams.get('part') || 'all';
  const selectedPartFilter = ['all', '1', '2', '3', '4'].includes(requestedPart) ? requestedPart : 'all';
  const initialSpeed = parseAllowedAudioSpeed(searchParams.get('speed'));

  // Test data states
  const [test, setTest] = useState(null);
  const [listeningSegments, setListeningSegments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestAttempt, setRequestAttempt] = useState(0);

  // User input per segment
  const [userRecords, setUserRecords] = useState({});
  const [currentInput, setCurrentInput] = useState('');

  // Progressive dictation states (matching reference design)
  const [showAnswerImmediately, setShowAnswerImmediately] = useState(true);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [extraRevealedClauses, setExtraRevealedClauses] = useState(0);
  const [lastCheckedInput, setLastCheckedInput] = useState(null);
  const [isResultVisible, setIsResultVisible] = useState(false);

  // UI / Display states
  const [showTranslation, setShowTranslation] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [celebrationModalOpen, setCelebrationModalOpen] = useState(false);
  const [openSpeedMenu, setOpenSpeedMenu] = useState(false);

  // Audio player state
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(initialSpeed);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // Input textarea ref
  const textareaRef = useRef(null);

  // Close speed popover when clicking outside
  useEffect(() => {
    if (!openSpeedMenu) return undefined;
    const handlePointerDown = (event) => {
      if (!event.target.closest('[data-dictation-speed-menu]')) {
        setOpenSpeedMenu(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenSpeedMenu(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openSpeedMenu]);

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
            .filter((cq) => cq.partNumber >= 1 && cq.partNumber <= 4 && (cq.audioUrl || cq.transcript))
            .sort((a, b) => {
              if (a.partNumber !== b.partNumber) return a.partNumber - b.partNumber;
              return (a.orderIndex || 0) - (b.orderIndex || 0);
            });

          setListeningSegments(processed);

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
  const currentSegmentId = currentSegment?.segmentId;

  // Sync current input when switching segment index
  useEffect(() => {
    if (currentSegmentId) {
      const rec = userRecords[currentSegmentId];
      setCurrentInput(rec ? rec.typed || '' : '');
      setExtraRevealedClauses(rec?.extraRevealedClauses || 0);
      setLastCheckedInput(rec?.checked ? rec.typed || '' : null);
      setIsResultVisible(false);
      setShowFullTranscript(false);
      setShowTranslation(false);
      setOpenSpeedMenu(false);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
    // Only run when switching segment
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentSegmentId]);

  // Save to localStorage whenever userRecords changes
  const saveRecordsToStorage = useCallback(
    (updatedRecords) => {
      try {
        localStorage.setItem(`dictation_history_${testId}`, JSON.stringify(updatedRecords));
      } catch {
        console.warn('Dictation progress could not be written to browser storage.');
      }
    },
    [testId]
  );

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

  const handleForward = useCallback(
    (seconds = 3) => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + seconds);
    },
    [duration]
  );

  const handleSeekAudio = (event) => {
    const nextTime = Number(event.target.value);
    setCurrentTime(nextTime);
    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
    }
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
    const validRate = parseAllowedAudioSpeed(rate);
    setPlaybackRate(validRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = validRate;
    }
    setOpenSpeedMenu(false);
  };

  const handleReloadAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = isMuted ? 0 : volume;
      setCurrentTime(0);
      setIsPlaying(false);
    }
    setOpenSpeedMenu(false);
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

  // Compute live progressive clause data
  const progressiveData = useMemo(() => {
    if (!currentSegment) return null;
    return buildProgressiveClauseData(currentInput, currentSegment.transcript || '', extraRevealedClauses);
  }, [currentSegment, currentInput, extraRevealedClauses]);

  // Check Answer Handler (reveals up to the current clause's ., , boundary and masks the rest with *****)
  const handleCheckAnswer = useCallback(() => {
    if (!currentSegment) return;
    const target = currentSegment.transcript || '';

    // If user clicks Check again on the exact same input while hidden clauses remain,
    // advance the reveal boundary by one more clause so they can see the next clause if stuck.
    let nextExtraRevealed = extraRevealedClauses;
    const currentCalc = buildProgressiveClauseData(currentInput, target, extraRevealedClauses);
    if (
      lastCheckedInput !== null &&
      lastCheckedInput.trim() === currentInput.trim() &&
      currentCalc.hasHiddenClauses
    ) {
      nextExtraRevealed = extraRevealedClauses + 1;
      setExtraRevealedClauses(nextExtraRevealed);
    }

    const finalCalc = buildProgressiveClauseData(currentInput, target, nextExtraRevealed);
    setLastCheckedInput(currentInput);
    setIsResultVisible(true);

    const updated = {
      ...userRecords,
      [currentSegment.segmentId]: {
        typed: currentInput,
        checked: true,
        accuracy: finalCalc.diffResult.accuracy,
        diffResult: finalCalc.diffResult,
        extraRevealedClauses: nextExtraRevealed,
        updatedAt: new Date().toISOString(),
      },
    };

    setUserRecords(updated);
    saveRecordsToStorage(updated);
  }, [currentSegment, currentInput, extraRevealedClauses, lastCheckedInput, userRecords, saveRecordsToStorage]);

  // Skip Current Clause Handler (fills up to the end of the current/next ., , clause)
  const handleSkipClause = useCallback(() => {
    if (!currentSegment || !progressiveData) return;
    const nextText = `${progressiveData.skipTargetText} `;
    setCurrentInput(nextText);
    setExtraRevealedClauses(0);
    setLastCheckedInput(nextText);

    const updatedCalc = buildProgressiveClauseData(nextText, currentSegment.transcript || '', 0);
    const updated = {
      ...userRecords,
      [currentSegment.segmentId]: {
        typed: nextText,
        checked: true,
        accuracy: updatedCalc.diffResult.accuracy,
        diffResult: updatedCalc.diffResult,
        extraRevealedClauses: 0,
        updatedAt: new Date().toISOString(),
      },
    };

    setUserRecords(updated);
    saveRecordsToStorage(updated);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    setIsResultVisible(true);
  }, [currentSegment, progressiveData, userRecords, saveRecordsToStorage]);

  // Reset current question attempt
  const handleResetCurrent = () => {
    if (!currentSegment) return;
    setCurrentInput('');
    setExtraRevealedClauses(0);
    setLastCheckedInput(null);
    setIsResultVisible(false);
    setShowFullTranscript(false);
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
      if (showShortcutsModal) return;

      if (e.code === 'Space' && (e.ctrlKey || e.altKey || document.activeElement !== textareaRef.current)) {
        e.preventDefault();
        togglePlayAudio();
      }

      if (e.altKey && e.code === 'ArrowLeft') {
        e.preventDefault();
        handleRewind(3);
      }

      if (e.altKey && e.code === 'ArrowRight') {
        e.preventDefault();
        handleForward(3);
      }

      if (e.ctrlKey && e.code === 'Enter') {
        e.preventDefault();
        handleCheckAnswer();
      }

      if (e.altKey && (e.code === 'KeyN' || e.code === 'ArrowDown')) {
        e.preventDefault();
        handleNext();
      }

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
  const isCurrentChecked = Boolean(currentRecord?.checked);

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
    if (seg.partNumber === 2) return `Part 2 • Câu hỏi #${seg.orderIndex || 7} (Hỏi – Đáp)`;
    if (seg.partNumber === 3) return `Part 3 • Đoạn hội thoại #${seg.orderIndex || 32} (Đoạn 3 câu)`;
    if (seg.partNumber === 4) return `Part 4 • Bài độc thoại #${seg.orderIndex || 71} (Đoạn 3 câu)`;
    return `Phần nghe #${seg.orderIndex || 1}`;
  };

  const currentSpeedOption =
    AUDIO_SPEED_OPTIONS.find((item) => item.value === playbackRate) || AUDIO_SPEED_OPTIONS[3];

  if (loading) {
    return (
      <div className="neo-brutal-dictation flex min-h-screen flex-col items-center justify-center space-y-4 bg-[#F8FAFC]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-[#1D4ED8]" />
        <p className="text-[15px] font-medium text-slate-600">Đang chuẩn bị dữ liệu nghe chép chính tả...</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="neo-brutal-dictation flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] p-4">
        <div className="w-full max-w-md space-y-4 border border-slate-200/90 bg-white p-6 text-center shadow-sm">
          <AlertCircle size={40} className="mx-auto text-red-600" />
          <h2 className="text-lg font-semibold text-slate-800">Không thể tải dữ liệu chép chính tả</h2>
          <p className="text-[15px] text-slate-600">{error || 'Có lỗi xảy ra trong quá trình kết nối.'}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError(null);
                setRequestAttempt((attempt) => attempt + 1);
              }}
              className="inline-flex items-center justify-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-sm font-medium text-white hover:bg-[#173ea8]"
            >
              Tải lại dữ liệu
            </button>
            <Link
              to={`/courses/${testId}`}
              className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
            >
              <ArrowLeft size={16} /> Quay lại trang đề thi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="neo-brutal-dictation relative flex min-h-screen flex-col bg-[#F8FAFC] text-slate-800"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(248, 250, 252, 0.90) 0%, rgba(248, 250, 252, 0.95) 35%, rgba(241, 245, 249, 0.97) 100%), url(${examHeaderBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
      }}
    >
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

      {/* TOP COMPACT APP BAR WITH LIBRARY BACKGROUND */}
      <header
        className="sticky top-0 z-30 border-b border-slate-200/90 shadow-xs"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.86) 52%, rgba(248, 250, 252, 0.72) 100%), url(${examHeaderBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 32%',
        }}
      >
        <div className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
          {/* Back & Title */}
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to={`/courses/${testId}`}
              className="inline-flex shrink-0 items-center gap-1.5 border border-slate-300/90 bg-white/95 px-3 py-1.5 text-[14px] font-medium text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
              title="Quay lại chi tiết đề"
            >
              <ArrowLeft size={16} strokeWidth={1.75} />
              <span className="hidden sm:inline">Chi tiết đề</span>
            </Link>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 border border-blue-200/80 bg-[#EFF6FF] px-2.5 py-0.5 text-[13px] font-medium text-[#1D4ED8]">
                  <Headphones size={13} strokeWidth={1.75} /> Nghe chép chính tả
                </span>
                <span className="hidden h-4 w-px bg-slate-300 sm:inline-block" />
                <h1 className="exam-room-title truncate text-slate-800">{test.titleTest}</h1>
              </div>
            </div>
          </div>

          {/* Quick Filter Parts & Shortcuts Trigger */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Part Selection Pills */}
            <div className="hidden items-center gap-1 border border-slate-200/90 bg-white/95 p-1 text-[14px] font-medium md:flex">
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
                    const nextParams = {};
                    if (p.id !== 'all') nextParams.part = p.id;
                    if (playbackRate !== 1) nextParams.speed = String(playbackRate);
                    setSearchParams(nextParams);
                  }}
                  className={`cursor-pointer px-3 py-1.5 transition-colors ${selectedPartFilter === p.id
                    ? 'border border-[#1D4ED8] bg-[#1D4ED8] font-semibold text-white'
                    : 'border border-transparent text-slate-600 hover:bg-slate-50 hover:text-[#1D4ED8]'
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
              className="cursor-pointer border border-slate-300/90 bg-white/95 p-2 text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
              title="Phím tắt luyện nghe"
            >
              <HelpCircle size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Global Progress Bar (Top Stripe) */}
        <div className="relative h-1 w-full overflow-hidden bg-slate-200/70">
          <div
            className="h-full bg-[#1D4ED8] transition-all duration-300"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </header>

      {/* SUB-HEADER STATS BANNER */}
      <div className="border-b border-slate-200/90 bg-white/90 px-4 py-2.5 text-[14px] text-slate-600 backdrop-blur-xs sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800">
              Câu {currentIndex + 1} / {activeSegments.length}
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Đã hoàn thành: <strong className="font-semibold text-slate-800">{stats.completed}</strong> câu
            </span>
            {progressiveData && progressiveData.clauses.length > 1 && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">
                  Tiến độ vế câu:{' '}
                  <strong className="font-semibold text-[#1D4ED8]">
                    {progressiveData.revealedClauseIndex + 1}/{progressiveData.clauses.length} vế
                  </strong>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <Award size={15} strokeWidth={1.75} className="text-[#1D4ED8]" /> Độ chính xác trung bình:
              <strong
                className={`font-semibold ${stats.averageAccuracy >= 80
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
              <div className="space-y-6 border border-slate-200/90 bg-white p-5 shadow-xs sm:p-7">
                {/* Segment Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="border border-blue-200/80 bg-[#EFF6FF] px-3 py-1 text-[14px] font-semibold text-[#1D4ED8]">
                      {getSegmentTitle(currentSegment)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrentChecked && (
                      <span
                        className={`inline-flex items-center gap-1.5 border px-3 py-1 text-[13px] font-semibold ${currentRecord.accuracy >= 80
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : currentRecord.accuracy >= 50
                            ? 'border-amber-200 bg-amber-50 text-amber-800'
                            : 'border-red-200 bg-red-50 text-red-800'
                          }`}
                      >
                        <CheckCircle2 size={14} strokeWidth={2} /> {currentRecord.accuracy}% Chính xác
                      </span>
                    )}
                  </div>
                </div>

                {/* If Part 1: Photograph Card */}
                {currentSegment.imageUrl && (
                  <div className="flex flex-col items-center justify-center border border-slate-200/80 bg-[#F8FAFC] p-5">
                    <img
                      src={currentSegment.imageUrl}
                      alt="TOEIC Listening Photograph"
                      className="max-h-72 w-auto border border-slate-200/90 bg-white object-contain p-1 shadow-2xs"
                      loading="lazy"
                    />
                    <span className="mt-2.5 text-[13px] italic text-slate-500">
                      Quan sát tranh và nghe kỹ 4 lựa chọn (A), (B), (C), (D) để chép lại từng câu
                    </span>
                  </div>
                )}

                {/* AUDIO PLAYER CONTROLLER */}
                <div className="space-y-3 border border-slate-200/90 bg-[#F8FAFC] p-4">
                  {/* Seekable Scrubber Bar */}
                  <div className="flex items-center gap-3">
                    <span className="w-11 text-right text-[13px] font-medium text-slate-600">
                      {formatTime(currentTime)}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max={duration > 0 ? duration : 100}
                      step="0.1"
                      value={duration > 0 ? currentTime : 0}
                      onChange={handleSeekAudio}
                      aria-label="Thanh tua thời gian audio"
                      className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#1D4ED8]"
                    />
                    <span className="w-11 text-[13px] font-medium text-slate-600">{formatTime(duration)}</span>
                  </div>

                  {/* Controller Action Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    {/* Left: Rewind / Play-Pause / Forward / Loop */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRewind(3)}
                        className="cursor-pointer border border-slate-300 bg-white p-2.5 text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                        title="Lùi lại 3 giây (Alt + ←)"
                      >
                        <RotateCcw size={17} strokeWidth={1.75} />
                      </button>

                      <button
                        type="button"
                        onClick={togglePlayAudio}
                        className="inline-flex cursor-pointer items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#173ea8]"
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

                      <button
                        type="button"
                        onClick={() => handleForward(3)}
                        className="cursor-pointer border border-slate-300 bg-white p-2.5 text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                        title="Tua tới 3 giây (Alt + →)"
                      >
                        <RotateCw size={17} strokeWidth={1.75} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsLooping(!isLooping)}
                        className={`cursor-pointer border p-2.5 transition-colors ${isLooping
                          ? 'border-[#1D4ED8] bg-[#EFF6FF] font-semibold text-[#1D4ED8]'
                          : 'border-slate-300 bg-white text-slate-600 hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
                          }`}
                        title="Lặp lại vô tận audio"
                      >
                        <Repeat size={17} strokeWidth={1.75} />
                      </button>
                    </div>

                    {/* Right: Volume + Gear Settings Speed Popover */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="flex min-h-10 items-center gap-2 border border-slate-200/90 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700">
                        <button
                          type="button"
                          onClick={toggleMute}
                          aria-label={isMuted ? 'Bật tiếng audio' : 'Tắt tiếng audio'}
                          aria-pressed={isMuted}
                          title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                          className="cursor-pointer p-1 text-slate-600 hover:text-[#1D4ED8]"
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
                          className="w-20 cursor-pointer accent-[#1D4ED8] sm:w-24"
                        />
                        <span className="w-9 text-right text-[13px] text-slate-600">
                          {Math.round((isMuted ? 0 : volume) * 100)}%
                        </span>
                      </div>

                      {/* Gear Settings Speed Popover (matching ExamTakePage) */}
                      <div className="relative" data-dictation-speed-menu>
                        <button
                          type="button"
                          onClick={() => setOpenSpeedMenu((prev) => !prev)}
                          aria-label={`Cài đặt tốc độ nghe (hiện tại ${currentSpeedOption.label})`}
                          aria-expanded={openSpeedMenu}
                          title={`Tốc độ nghe: ${currentSpeedOption.label}`}
                          className={`inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-[5px] border px-3 text-[13px] font-medium transition-colors ${openSpeedMenu || playbackRate !== 1
                            ? 'border-[#0095F6] bg-[#0095F6] text-white'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-[#0095F6] hover:text-[#0095F6]'
                            }`}
                        >
                          <Settings size={17} strokeWidth={2} />
                          <span>{currentSpeedOption.shortLabel}</span>
                        </button>

                        {openSpeedMenu && (
                          <div
                            role="menu"
                            aria-label="Chọn tốc độ phát audio"
                            className="exam-audio-speed-popover absolute right-0 top-11 z-40 w-44 py-1.5 text-left"
                          >
                            <div className="flex items-center gap-2 border-b border-slate-200 px-3.5 py-2 text-[14px] font-medium text-slate-600">
                              <span className="text-[11px] text-slate-400">◀</span>
                              <span>Speed</span>
                            </div>

                            <div className="py-1">
                              {AUDIO_SPEED_OPTIONS.map((option) => {
                                const isSelected = playbackRate === option.value;
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    role="menuitemradio"
                                    aria-checked={isSelected}
                                    onClick={() => handleSpeedChange(option.value)}
                                    className="flex w-full cursor-pointer items-center gap-3 px-3.5 py-2 text-left text-[14px] text-slate-700 transition-colors hover:bg-slate-50"
                                  >
                                    <span
                                      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${isSelected ? 'bg-[#0095F6]' : 'bg-slate-200/90'
                                        }`}
                                    >
                                      {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                                    </span>
                                    <span className={isSelected ? 'font-semibold text-slate-900' : 'font-normal text-slate-600'}>
                                      {option.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="border-t border-slate-100 pt-1">
                              <button
                                type="button"
                                role="menuitem"
                                onClick={handleReloadAudio}
                                className="w-full cursor-pointer px-3.5 py-2 text-left text-[14px] font-normal text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                              >
                                Reload File
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* TYPING INPUT AREA */}
                <div className="space-y-2.5">
                  <label htmlFor="dictation-input" className="block text-[15px] font-semibold text-slate-800">
                    Nhập lại những gì bạn nghe được (Tiếng Anh):
                  </label>
                  <div className="relative">
                    <textarea
                      id="dictation-input"
                      ref={textareaRef}
                      value={currentInput}
                      onMouseDown={() => {
                        if (isResultVisible) {
                          setIsResultVisible(false);
                        }
                      }}
                      onChange={(e) => {
                        setCurrentInput(e.target.value);
                        if (isResultVisible) {
                          setIsResultVisible(false);
                        }
                        if (extraRevealedClauses > 0) {
                          setExtraRevealedClauses(0);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleCheckAnswer();
                        }
                      }}
                      placeholder="Nghe audio và gõ từng vế câu tiếng Anh vào đây..."
                      rows={4}
                      className="w-full resize-y border border-slate-300 bg-white p-4 text-[16px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-[#1D4ED8]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-slate-500">
                    <span>
                      Số từ đã gõ:{' '}
                      <strong className="font-semibold text-slate-700">
                        {currentInput.trim() ? currentInput.trim().split(/\s+/).length : 0}
                      </strong>{' '}
                      từ
                    </span>
                    <span>Nhấn Enter (hoặc Ctrl + Enter) để kiểm tra kết quả</span>
                  </div>
                </div>

                {/* ACTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSkipClause}
                      className="inline-flex cursor-pointer items-center gap-1.5 border border-slate-300 bg-white px-3.5 py-2 text-[14px] font-medium text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                      title="Tự động điền đến hết dấu câu (. hoặc ,) của vế hiện tại"
                    >
                      <SkipForward size={15} strokeWidth={1.75} /> Bỏ qua vế này (Skip)
                    </button>

                    {currentInput && (
                      <button
                        type="button"
                        onClick={handleResetCurrent}
                        className="inline-flex cursor-pointer items-center gap-1.5 border border-slate-300 bg-white px-3.5 py-2 text-[14px] font-medium text-slate-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        title="Xóa để làm lại từ đầu"
                      >
                        <RefreshCw size={14} strokeWidth={1.75} /> Làm lại
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCheckAnswer}
                      className="inline-flex cursor-pointer items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#173ea8]"
                    >
                      <Check size={16} strokeWidth={2.25} /> Kiểm tra kết quả
                    </button>
                  </div>
                </div>

                {/* PROGRESSIVE CLAUSE-BY-CLAUSE RESULT PANEL (Hidden as soon as user clicks/types in textarea; shown on Enter / Check) */}
                {(isResultVisible || showFullTranscript) && progressiveData && (
                  <div className="space-y-4 border border-slate-200/90 bg-[#F8FAFC] p-5">
                    {/* Status & Skip Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {progressiveData.isAllCorrect ? (
                          <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-emerald-700">
                            <CheckCircle2 size={18} strokeWidth={2} className="text-emerald-600" />
                            Chính xác hoàn toàn!
                          </span>
                        ) : progressiveData.isCurrentClauseMatched ? (
                          <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1D4ED8]">
                            <CheckCircle2 size={18} strokeWidth={2} className="text-[#1D4ED8]" />
                            Đã khớp vế {progressiveData.revealedClauseIndex + 1}/{progressiveData.clauses.length} — Hãy
                            nghe tiếp phần *****
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-amber-700">
                            <AlertCircle size={18} strokeWidth={2} className="fill-amber-400 text-amber-900" />
                            Chưa chính xác (Incorrect)
                          </span>
                        )}
                      </div>

                      {!progressiveData.isAllCorrect && (
                        <button
                          type="button"
                          onClick={handleSkipClause}
                          className="cursor-pointer rounded-[4px] border border-slate-300 bg-white px-3.5 py-1.5 text-[14px] font-medium text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                        >
                          Skip
                        </button>
                      )}
                    </div>

                    {/* Progressive Sentence Display: "Good morning, *****" */}
                    <div className="border border-slate-200/90 bg-white p-4 text-[17px] leading-relaxed text-slate-800">
                      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                        {progressiveData.clauses
                          .slice(
                            0,
                            showFullTranscript
                              ? progressiveData.clauses.length
                              : progressiveData.revealedClauseIndex + 1
                          )
                          .flatMap((clause) => clause.words)
                          .map((wordItem) => {
                            if (wordItem.status === 'correct') {
                              return (
                                <span key={wordItem.index} className="text-slate-800">
                                  {wordItem.word}
                                </span>
                              );
                            }

                            if (!showAnswerImmediately && !showFullTranscript) {
                              return (
                                <span
                                  key={wordItem.index}
                                  className="font-semibold text-amber-700 underline decoration-amber-400 decoration-dashed underline-offset-4"
                                  title={wordItem.typed ? `Bạn đã gõ: "${wordItem.typed}"` : 'Từ còn thiếu'}
                                >
                                  {'_'.repeat(Math.max(3, wordItem.word.length))}
                                </span>
                              );
                            }

                            return (
                              <span
                                key={wordItem.index}
                                className="inline-flex items-baseline gap-1"
                                title={wordItem.typed ? `Bạn đã gõ: "${wordItem.typed}"` : 'Đáp án gợi ý đến dấu câu'}
                              >
                                {wordItem.status === 'incorrect' && wordItem.typed && (
                                  <span className="text-[14px] text-red-500 line-through">{wordItem.typed}</span>
                                )}
                                <span className="font-semibold text-emerald-600">{wordItem.word}</span>
                              </span>
                            );
                          })}

                        {!showFullTranscript && progressiveData.hasHiddenClauses && (
                          <span
                            className="ml-1 select-none font-semibold tracking-widest text-slate-400"
                            title="Phần còn lại của câu đang được ẩn — hãy gõ tiếp hoặc nhấn Skip"
                          >
                            *****
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Checkboxes matching reference image: "Show answer immediately" & "Show full answer" */}
                    <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:items-center sm:gap-6">
                      <label className="inline-flex cursor-pointer items-center gap-2.5 text-[14px] font-medium text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={showAnswerImmediately}
                          onChange={(e) => setShowAnswerImmediately(e.target.checked)}
                          className="h-4 w-4 cursor-pointer rounded-[3px] border-slate-300 accent-[#1D4ED8]"
                        />
                        <span>Hiển thị đáp án đến dấu câu (Show answer immediately)</span>
                      </label>

                      <label className="inline-flex cursor-pointer items-center gap-2.5 text-[14px] font-medium text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={showFullTranscript}
                          onChange={(e) => setShowFullTranscript(e.target.checked)}
                          className="h-4 w-4 cursor-pointer rounded-[3px] border-slate-300 accent-[#1D4ED8]"
                        />
                        <span>Hiển thị toàn bộ đáp án (Show full answer)</span>
                      </label>
                    </div>

                    {/* Translation Toggle & Card */}
                    {currentSegment.translation && (
                      <div className="space-y-2 border-t border-slate-200/80 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowTranslation(!showTranslation)}
                          className="inline-flex cursor-pointer items-center gap-1.5 text-[14px] font-medium text-[#1D4ED8] hover:underline"
                        >
                          <BookOpen size={15} strokeWidth={1.75} />
                          {showTranslation ? 'Ẩn bản dịch tiếng Việt' : 'Xem bản dịch nghĩa tiếng Việt'}
                        </button>

                        {showTranslation && (
                          <div className="border border-blue-200/80 bg-[#EFF6FF]/60 p-3.5 text-[14px] leading-relaxed text-slate-800">
                            {currentSegment.translation}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Next Segment CTA */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex cursor-pointer items-center gap-1.5 border border-[#1D4ED8] bg-[#1D4ED8] px-5 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#173ea8]"
                      >
                        Tiếp tục câu sau <ChevronRight size={15} />
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
                  className="inline-flex cursor-pointer items-center gap-1.5 border border-slate-300 bg-white px-4 py-2.5 text-[14px] font-medium text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Câu trước
                </button>

                <div className="text-[14px] font-medium text-slate-600">
                  Câu {currentIndex + 1} trên {activeSegments.length}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex cursor-pointer items-center gap-1.5 border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#173ea8]"
                >
                  {currentIndex === activeSegments.length - 1 ? 'Xem tổng kết' : 'Câu tiếp theo'}{' '}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 border border-slate-200/90 bg-white p-12 text-center">
              <p className="font-medium text-slate-600">Không có câu hỏi nghe nào trong phần này.</p>
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-[14px] font-semibold text-white hover:bg-[#173ea8]"
              >
                Xem tất cả các phần nghe
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SEGMENT PALETTE / NAVIGATOR (4 COLS) */}
        <div className="space-y-6 lg:col-span-4">
          <div className="sticky top-24 space-y-4 border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-800">
                <Layers size={16} strokeWidth={1.75} className="text-[#1D4ED8]" /> Danh sách câu nghe
              </h2>
              <span className="text-[13px] font-semibold text-slate-600">
                {stats.completed}/{stats.total}
              </span>
            </div>

            {/* Segments Grid */}
            <div className="scrollbar-thin max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {activeSegments.map((seg, sIdx) => {
                const isSelected = sIdx === currentIndex;
                const rec = userRecords[seg.segmentId];
                const isDone = Boolean(rec && rec.checked);
                const isMastered = Boolean(isDone && rec.accuracy >= 95);

                return (
                  <button
                    key={seg.segmentId}
                    type="button"
                    onClick={() => setCurrentIndex(sIdx)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 border p-3 text-left transition-colors ${isSelected
                      ? 'border-[#1D4ED8] bg-[#EFF6FF]'
                      : isDone
                        ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/80'
                        : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-[#F8FAFC]'
                      }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[14px] font-semibold ${isSelected ? 'text-[#1D4ED8]' : isDone ? 'text-emerald-900' : 'text-slate-800'
                            }`}
                        >
                          Câu {seg.orderIndex || sIdx + 1}
                        </span>
                        <span className="border border-slate-200 bg-[#F8FAFC] px-2 py-0.5 text-[12px] font-medium text-slate-600">
                          Part {seg.partNumber}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-slate-500">
                        {isMastered && seg.transcript
                          ? `${seg.transcript.slice(0, 38)}...`
                          : isDone
                            ? 'Đã kiểm tra — Đang luyện chép từng vế'
                            : '••••••••••••••• (Nghe và chép lại)'}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isDone ? (
                        <span
                          className={`border px-2 py-0.5 text-[12px] font-semibold ${rec.accuracy >= 80
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
            <div className="border-t border-slate-200/80 pt-3">
              <button
                type="button"
                onClick={() => setCelebrationModalOpen(true)}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 border border-slate-300 bg-[#F8FAFC] py-2.5 text-[14px] font-medium text-slate-700 transition-colors hover:border-[#1D4ED8] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
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
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800">
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

            <div className="space-y-2.5 text-[14px]">
              {[
                { key: 'Space', desc: 'Bật / Tạm dừng audio' },
                { key: 'Alt + ←', desc: 'Tua lại 3 giây' },
                { key: 'Alt + →', desc: 'Tua tới 3 giây' },
                { key: 'Ctrl + Enter', desc: 'Kiểm tra kết quả (hiện đến dấu . hoặc ,)' },
                { key: 'Alt + N', desc: 'Chuyển sang câu tiếp theo' },
                { key: 'Alt + P', desc: 'Quay về câu trước' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border border-slate-200/80 bg-[#F8FAFC] p-2.5"
                >
                  <span className="font-medium text-slate-700">{item.desc}</span>
                  <kbd className="border border-slate-300 bg-white px-2.5 py-1 text-[13px] font-semibold text-slate-800">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowShortcutsModal(false)}
              className="w-full cursor-pointer border border-[#1D4ED8] bg-[#1D4ED8] py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#173ea8]"
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
              <h3 className="text-2xl font-semibold text-slate-800">Tổng kết phiên chép chính tả</h3>
              <p className="mx-auto max-w-sm text-[15px] text-slate-600">
                Bạn đã hoàn thành các câu nghe trong phần thi này. Duy trì luyện nghe chép chính tả đều đặn để cải thiện
                khả năng bắt từ khóa TOEIC Listening.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 border border-slate-200/90 bg-[#F8FAFC] p-4 text-center">
              <div>
                <span className="block text-[13px] font-medium text-slate-500">Đã làm</span>
                <strong className="text-lg font-semibold text-slate-800">
                  {stats.completed}/{stats.total}
                </strong>
              </div>
              <div>
                <span className="block text-[13px] font-medium text-slate-500">Độ chính xác</span>
                <strong className="text-lg font-semibold text-emerald-700">{stats.averageAccuracy}%</strong>
              </div>
              <div>
                <span className="block text-[13px] font-medium text-slate-500">Tiến độ</span>
                <strong className="text-lg font-semibold text-[#1D4ED8]">{stats.progressPercent}%</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCelebrationModalOpen(false)}
                className="flex-1 cursor-pointer border border-slate-300 bg-white py-3 text-[14px] font-medium text-slate-700 transition-colors hover:border-slate-400"
              >
                Tiếp tục xem lại
              </button>
              <Link
                to={`/courses/${testId}`}
                className="flex-1 cursor-pointer border border-[#1D4ED8] bg-[#1D4ED8] py-3 text-center text-[14px] font-semibold text-white transition-colors hover:bg-[#173ea8]"
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
