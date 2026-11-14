import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Flag,
  Award,
  BookOpen,
  Headphones,
  Check,
  X,
  FileText,
  Layers,
  ArrowLeft,
  Send,
  Eye,
  Highlighter,
  Settings,
} from 'lucide-react';
import { examService } from '../services/examService';
import { ETS_PART_DIRECTIONS } from '../constants/etsDirections';
import libraryBg from '../assets/img/whentest/background.jpg';

const QuestionImage = ({ src, partNumber }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex min-h-48 items-center justify-center bg-slate-50 p-6 text-center text-sm text-slate-600">
        Không thể tải hình ảnh câu hỏi này.
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Hình ảnh câu hỏi${partNumber ? ` Part ${partNumber}` : ''}`}
      className="mx-auto max-h-[380px] w-full object-contain"
      onError={() => setHasError(true)}
    />
  );
};

const AUDIO_SPEED_OPTIONS = [
  { value: 0.5, label: '0.5×' },
  { value: 0.75, label: '0.75×' },
  { value: 0.9, label: '0.9×' },
  { value: 1.0, label: 'Normal' },
  { value: 1.1, label: '1.1×' },
  { value: 1.25, label: '1.25×' },
  { value: 1.5, label: '1.5×' },
  { value: 2, label: '2×' },
];
const ALLOWED_AUDIO_SPEEDS = AUDIO_SPEED_OPTIONS.map((opt) => opt.value);

// Compact custom audio player for the exam room
const AudioPlayerBar = ({ src, defaultPlaybackRate = 1.0 }) => {
  const audioRef = useRef(null);
  const speedMenuRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(() => {
    const parsed = Number(defaultPlaybackRate);
    return ALLOWED_AUDIO_SPEEDS.includes(parsed) ? parsed : 1.0;
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = playbackRate;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration || 0);
      audio.playbackRate = playbackRate;
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playbackRate, src]);

  useEffect(() => {
    if (!speedMenuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target)) {
        setSpeedMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSpeedMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [speedMenuOpen]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().catch(() => { });
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSelectPlaybackRate = (nextRate) => {
    if (!ALLOWED_AUDIO_SPEEDS.includes(nextRate)) return;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleReloadAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
    setCurrentTime(0);
    audioRef.current.load();
    audioRef.current.playbackRate = playbackRate;
    setSpeedMenuOpen(false);
  };

  const formatAudioTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!src) return null;

  return (
    <div className="relative mb-3 flex w-full select-none items-center gap-3.5 border border-slate-200/90 bg-[#F8FAFC] px-4 py-2.5 text-sm text-slate-700 rounded-[2px]">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center border border-[#1D4ED8] bg-[#1D4ED8] text-white transition hover:bg-[#173ea8] rounded-[2px]"
        title={isPlaying ? 'Tạm dừng' : 'Phát âm thanh'}
      >
        {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
      </button>

      {/* Scrubber / Progress Bar */}
      <div className="flex flex-1 items-center gap-3">
        <span className="w-11 text-right text-[13px] font-semibold text-slate-600 tabular-nums">
          {formatAudioTime(currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="exam-audio-range h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#1D4ED8]"
        />
        <span className="w-11 text-[13px] font-medium text-slate-500 tabular-nums">
          {formatAudioTime(duration)}
        </span>
      </div>

      {/* Volume Control */}
      <div className="hidden items-center gap-2 sm:flex">
        <button
          type="button"
          onClick={toggleMute}
          className="p-1 text-slate-600 hover:text-[#1D4ED8] cursor-pointer"
        >
          {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="exam-audio-range h-1.5 w-16 cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#1D4ED8]"
        />
      </div>

      {/* Playback Speed Settings Gear & Floating Popover */}
      <div ref={speedMenuRef} className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setSpeedMenuOpen((prev) => !prev)}
          aria-expanded={speedMenuOpen}
          aria-haspopup="menu"
          title={`Tốc độ phát: ${playbackRate === 1 ? 'Normal (1.0×)' : `${playbackRate}×`}`}
          className={`flex h-9 w-9 cursor-pointer items-center justify-center border transition rounded-[2px] ${
            speedMenuOpen || playbackRate !== 1
              ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
              : 'border-slate-200/90 bg-white text-slate-600 hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
          }`}
        >
          <Settings size={17} />
        </button>

        {speedMenuOpen && (
          <div
            role="menu"
            aria-label="Chọn tốc độ phát âm thanh"
            className="exam-audio-speed-popover absolute right-0 top-[calc(100%+8px)] z-40 w-[148px] border border-slate-200/90 bg-white py-2.5 px-3 text-slate-700"
          >
            {/* Header: ◂ Speed */}
            <div className="mb-2 flex items-center gap-2 border-b border-slate-200 pb-2 text-[14px] font-semibold text-slate-700">
              <span className="text-[11px] text-slate-500">◂</span>
              <span>Speed</span>
            </div>

            {/* Radio Options */}
            <div className="flex flex-col gap-1">
              {AUDIO_SPEED_OPTIONS.map((opt) => {
                const isSelected = playbackRate === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectPlaybackRate(opt.value)}
                    className="group flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-1 py-1.5 text-left text-[14px] font-medium text-slate-700 transition hover:text-[#1D4ED8]"
                  >
                    <span
                      className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full transition ${
                        isSelected
                          ? 'bg-[#1D4ED8]'
                          : 'bg-slate-200/90 group-hover:bg-slate-300'
                      }`}
                    >
                      {isSelected && <span className="h-[6px] w-[6px] rounded-full bg-white" />}
                    </span>
                    <span className={`tabular-nums ${isSelected ? 'font-semibold text-slate-800' : ''}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Reload File Action */}
            <div className="mt-1.5 border-t border-slate-100 pt-2 text-center">
              <button
                type="button"
                onClick={handleReloadAudio}
                className="w-full cursor-pointer border-0 bg-transparent py-1 text-[13px] font-semibold text-slate-600 transition hover:text-[#1D4ED8]"
              >
                Reload File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ExamTakePage = () => {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL Params for Practice mode vs Full Test
  const mode = searchParams.get('mode') || 'fulltest';
  const partsParam = searchParams.get('parts');
  const timeParam = searchParams.get('time');
  const speedParam = searchParams.get('speed');
  const initialAudioSpeed = useMemo(() => {
    const parsed = parseFloat(speedParam || '1.0');
    return ALLOWED_AUDIO_SPEEDS.includes(parsed) ? parsed : 1.0;
  }, [speedParam]);
  const sourceResultId = searchParams.get('sourceResultId');
  const questionIdsParam = searchParams.get('questionIds');
  const practiceQuestionIds = useMemo(() => questionIdsParam
    ? questionIdsParam.split(',').map((id) => id.trim()).filter(Boolean)
    : [], [questionIdsParam]);
  const assignmentId = searchParams.get('assignmentId');
  const submissionStorageKey = `toeic:pending-submit:${JSON.stringify([
    testId, mode, partsParam, timeParam, assignmentId, sourceResultId, questionIdsParam,
  ])}`;
  const progressStorageKey = `${submissionStorageKey}:progress`;
  const forceRestartStorageKey = `${submissionStorageKey}:forceRestart`;
  const [submissionKey, setSubmissionKey] = useState(null);
  const submissionKeyRef = useRef(null);
  useEffect(() => {
    let storedKey = null;
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    try {
      storedKey = window.sessionStorage.getItem(submissionStorageKey);
    } catch {
      // Fall back to the component ref when session storage is unavailable.
    }
    if (!uuidPattern.test(storedKey || '')) {
      const bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
      storedKey = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      try {
        window.sessionStorage.setItem(submissionStorageKey, storedKey);
      } catch {
        // The in-memory key still protects retries until this page is closed.
      }
    }
    submissionKeyRef.current = { scope: submissionStorageKey, key: storedKey };
    setSubmissionKey(storedKey);
  }, [submissionStorageKey]);

  const targetPartNumbers = useMemo(() => {
    if (mode === 'practice' && partsParam) {
      const parsed = partsParam
        .split(',')
        .map((p) => parseInt(p.trim(), 10))
        .filter((n) => !isNaN(n));
      return parsed.length > 0 ? parsed : [1, 2, 3, 4, 5, 6, 7];
    }
    return [1, 2, 3, 4, 5, 6, 7];
  }, [mode, partsParam]);

  const initialMinutes = useMemo(() => {
    if (timeParam !== null && timeParam !== undefined && timeParam !== '') {
      const parsed = parseInt(timeParam, 10);
      return isNaN(parsed) ? 120 : parsed;
    }
    return mode === 'practice' || sourceResultId ? 0 : 120;
  }, [timeParam, mode, sourceResultId]);

  const isStopwatch = initialMinutes === 0 || mode === 'practice' || Boolean(sourceResultId);

  // Test data & Loading state
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Normalized Contexts and Flat Question List
  const [contexts, setContexts] = useState([]);
  const [flatQuestions, setFlatQuestions] = useState([]);

  // Active Part tab (1, 2, 3, 4, 5, 6, 7)
  const [activePart, setActivePart] = useState(1);

  // User Interaction State
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: 'A' | 'B' | 'C' | 'D' }
  const [examSession, setExamSession] = useState(null);
  const answersRef = useRef({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set()); // Set of qIds
  const [timeRemaining, setTimeRemaining] = useState(isStopwatch ? 0 : initialMinutes * 60);
  const timeRemainingRef = useRef(isStopwatch ? 0 : initialMinutes * 60);
  const [timerActive, setTimerActive] = useState(false);

  // UI States
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [reviewById, setReviewById] = useState({});
  const [submitError, setSubmitError] = useState('');
  const submitInFlightRef = useRef(false);
  const submitExamRef = useRef(null);
  const saveInFlightRef = useRef(false);
  const pendingAnswersRef = useRef(null);
  const cancelRequestedRef = useRef(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [highlightContent, setHighlightContent] = useState(false);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  // 1. Fetch Test Detail & Process Questions
  useEffect(() => {
    if (searchParams.get('resultId')) {
      navigate(`/results/${searchParams.get('resultId')}`, { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const cancellationResultId = searchParams.get('resultId');
    if (cancellationResultId) return;
    setSubmissionResult(null);
    setReviewById({});
    setIsSubmitted(false);
  }, [searchParams]);

  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await examService.getTestDetail(testId);
        if (res.code === 1000 && res.data) {
          const testData = res.data;
          setTest(testData);

          const rawCqs = Array.isArray(testData.contextQuestions) ? testData.contextQuestions : [];
          if (rawCqs.length === 0) {
            throw new Error('Đề thi chưa có nhóm câu hỏi. Vui lòng báo quản trị viên kiểm tra nội dung đề.');
          }

          // Process contextQuestions: Sắp xếp chuẩn xác theo PartNumber và Sequence Index
          let indexedCqs = rawCqs.map((cq, rawIdx) => {
            let seqIndex = null;
            let parsedPartNumber = null;

            if (cq.orderIndex !== undefined && cq.orderIndex !== null && cq.orderIndex > 0) {
              seqIndex = cq.orderIndex;
            }

            const tagMatch = cq.paragraph?.match(/<!--CQ_SEQ:(?:P(\d+):I)?(\d+)-->/);
            if (tagMatch) {
              if (tagMatch[1]) parsedPartNumber = parseInt(tagMatch[1], 10);
              if (seqIndex === null) seqIndex = parseInt(tagMatch[2], 10);
            }

            let partNum = parsedPartNumber;
            if (!partNum && cq.part?.namePart) {
              partNum = parseInt(cq.part.namePart.replace(/\D/g, ''), 10) || null;
            }

            if (!partNum) {
              const firstQNum = cq.questions?.[0]?.questionNumber;
              const refNum = (seqIndex && seqIndex > 0) ? seqIndex : (firstQNum && firstQNum > 0 ? firstQNum : null);
              if (refNum && refNum > 0) {
                if (refNum >= 1 && refNum <= 6) partNum = 1;
                else if (refNum >= 7 && refNum <= 31) partNum = 2;
                else if (refNum >= 32 && refNum <= 70) partNum = 3;
                else if (refNum >= 71 && refNum <= 100) partNum = 4;
                else if (refNum >= 101 && refNum <= 130) partNum = 5;
                else if (refNum >= 131 && refNum <= 146) partNum = 6;
                else if (refNum >= 147) partNum = 7;
              }
            }

            if (!partNum) {
              const q0 = cq.questions?.[0];
              const qCount = cq.questions?.length || 0;
              if (cq.imageUrl && (!cq.paragraph || cq.paragraph.trim() === '') && qCount === 1) {
                partNum = 1;
              } else if (qCount === 1 && (!q0?.optionD || q0?.optionD.trim() === '')) {
                partNum = 2;
              } else if (qCount === 3) {
                partNum = cq.transcript?.toLowerCase().includes('talk') || cq.transcript?.toLowerCase().includes('announcement') ? 4 : 3;
              } else if (qCount === 4 && cq.paragraph) {
                partNum = 6;
              } else if (cq.paragraph && !cq.audioUrl) {
                partNum = 7;
              } else {
                partNum = 5;
              }
            }

            if (seqIndex === null || isNaN(seqIndex)) {
              seqIndex = rawIdx;
            }

            return {
              ...cq,
              _partNum: partNum,
              _seqIndex: seqIndex,
              paragraph: (cq.paragraph || '').replace(/<!--CQ_SEQ:[^>]+-->\n?/, ''),
            };
          });

          // Sắp xếp: Part 1 -> Part 7, và trong từng Part theo đúng thứ tự câu (_seqIndex)
          indexedCqs.sort((a, b) => {
            if (a._partNum !== b._partNum) return a._partNum - b._partNum;
            return (a._seqIndex ?? 0) - (b._seqIndex ?? 0);
          });

          // Nếu ở chế độ Luyện tập theo Part, chỉ giữ lại các cụm bài thuộc các Part đã chọn
          if (mode === 'practice' && targetPartNumbers.length > 0) {
            indexedCqs = indexedCqs.filter((cq) => targetPartNumbers.includes(cq._partNum));
          }

          let qCounter = 1;
          const processedContexts = indexedCqs.map((cq, cqIdx) => {
            const partNum = cq._partNum;

            let questions = [];
            if (cq.questions && Array.isArray(cq.questions) && cq.questions.length > 0) {
              questions = cq.questions.map((q) => {
                const questionId = q.id ?? q.questionID;
                if (questionId === undefined || questionId === null || questionId === '') {
                  throw new Error(`Đề thi có câu hỏi thiếu mã định danh ở Part ${partNum}. Vui lòng báo quản trị viên.`);
                }
                const assignedQNum = q.questionNumber && q.questionNumber > 0 ? q.questionNumber : qCounter;
                qCounter = assignedQNum + 1;
                return {
                  id: questionId,
                  questionNumber: assignedQNum,
                  questionContent: q.questionContent ?? '',
                  optionA: q.optionA ?? '',
                  optionB: q.optionB ?? '',
                  optionC: q.optionC ?? '',
                  optionD: q.optionD ?? '',
                };
              });
            } else {
              throw new Error(`Đề thi thiếu câu hỏi thật ở Part ${partNum}. Vui lòng báo quản trị viên kiểm tra nội dung đề.`);
            }

            return {
              ...cq,
              contextIndex: cqIdx,
              partNumber: partNum,
              questions,
            };
          });

          processedContexts.forEach((context) => {
            const partNum = context.partNumber;
            const missing = (value) => !String(value ?? '').trim();
            if (partNum >= 1 && partNum <= 4 && missing(context.audioUrl)) {
              throw new Error(`Đề thi thiếu audio ở Part ${partNum}. Vui lòng báo quản trị viên kiểm tra nội dung đề.`);
            }
            if (partNum === 1 && missing(context.imageUrl)) {
              throw new Error('Đề thi thiếu hình ảnh ở Part 1. Vui lòng báo quản trị viên kiểm tra nội dung đề.');
            }
            if ((partNum === 1 || partNum === 2) && context.questions.length !== 1) {
              throw new Error(`Mỗi context Part ${partNum} phải tương ứng với đúng 1 câu hỏi. Vui lòng báo quản trị viên kiểm tra nội dung đề.`);
            }
            if ((partNum === 3 || partNum === 4) && context.questions.length !== 3) {
              throw new Error(`Một nhóm nghe Part ${partNum} phải có 3 câu hỏi. Vui lòng báo quản trị viên kiểm tra nội dung đề.`);
            }
            if ((partNum === 6 || partNum === 7) && missing(context.paragraph)) {
              throw new Error(`Đề thi thiếu bài đọc ở Part ${partNum}. Vui lòng báo quản trị viên kiểm tra nội dung đề.`);
            }
            if (partNum >= 3) {
              context.questions.forEach((question) => {
                if (missing(question.questionContent)) {
                  throw new Error(`Đề thi thiếu nội dung câu hỏi ${question.questionNumber}. Vui lòng báo quản trị viên kiểm tra nội dung đề.`);
                }
                for (const option of ['A', 'B', 'C', 'D']) {
                  if (missing(question[`option${option}`])) {
                    throw new Error(`Đề thi thiếu đáp án ${option} của câu ${question.questionNumber}. Vui lòng báo quản trị viên kiểm tra nội dung đề.`);
                  }
                }
              });
            }
          });

          let visibleContexts = processedContexts;
          if (sourceResultId) {
            const selectedQuestionIds = new Set(practiceQuestionIds);
            visibleContexts = processedContexts
              .map((context) => ({ ...context, questions: context.questions.filter((question) => selectedQuestionIds.has(question.id)) }))
              .filter((context) => context.questions.length > 0)
              .map((context, contextIndex) => ({ ...context, contextIndex }));
            if (visibleContexts.length === 0) throw new Error('Không có câu hỏi sai hợp lệ để luyện lại.');
          }
          if (visibleContexts.length === 0) {
            throw new Error('Đề thi không có nội dung cho Part đã chọn. Vui lòng báo quản trị viên kiểm tra nội dung đề.');
          }
          // Tạo danh sách câu hỏi phẳng
          const allQs = [];
          visibleContexts.forEach((c) => {
            c.questions.forEach((q) => {
              allQs.push({ ...q, contextIndex: c.contextIndex, partNumber: c.partNumber });
            });
          });
          setContexts(visibleContexts);
          setFlatQuestions(allQs);

          // Khởi tạo activePart ban đầu theo Part có trong đề
          const initialPart = visibleContexts[0]?.partNumber || targetPartNumbers[0] || 1;
          cancelRequestedRef.current = false;

          let shouldForceRestart = false;
          try {
            shouldForceRestart = window.sessionStorage.getItem(forceRestartStorageKey) === '1';
          } catch {
            shouldForceRestart = false;
          }

          const sessionRequest = {
            testId,
            restartActive: shouldForceRestart,
            ...(assignmentId ? { assignmentId } : {}),
            ...(sourceResultId ? { sourceResultId, questionIds: allQs.map((question) => question.id) } : {}),
            ...(mode === 'practice' && !sourceResultId ? { partNumbers: targetPartNumbers } : {}),
          };
          const sessionResponse = await examService.startExamSession(sessionRequest);
          if (sessionResponse.code !== 1000 || !sessionResponse.data?.sessionId) {
            throw new Error(sessionResponse.message || 'Không thể bắt đầu phiên làm bài.');
          }
          try {
            window.sessionStorage.removeItem(forceRestartStorageKey);
          } catch {
            // ignore
          }
          const sessionData = sessionResponse.data;
          setExamSession(sessionData);

          const validQuestionIdSet = new Set(allQs.map((q) => String(q.id)));
          const validPartSet = new Set(visibleContexts.map((c) => c.partNumber));

          let storedProgress = null;
          try {
            const rawProgress = window.sessionStorage.getItem(progressStorageKey);
            if (rawProgress) {
              storedProgress = JSON.parse(rawProgress);
            }
          } catch {
            storedProgress = null;
          }

          const serverAnswers = {};
          if (sessionData.resumed && sessionData.answers && typeof sessionData.answers === 'object') {
            Object.entries(sessionData.answers).forEach(([qId, ans]) => {
              const normalized = String(ans || '').toUpperCase();
              if (validQuestionIdSet.has(String(qId)) && ['A', 'B', 'C', 'D'].includes(normalized)) {
                serverAnswers[qId] = normalized;
              }
            });
          }

          const localAnswers = {};
          const isSameSessionSnapshot = Boolean(storedProgress && storedProgress.sessionId === sessionData.sessionId);
          if (isSameSessionSnapshot && storedProgress.answers && typeof storedProgress.answers === 'object') {
            Object.entries(storedProgress.answers).forEach(([qId, ans]) => {
              const normalized = String(ans || '').toUpperCase();
              if (validQuestionIdSet.has(String(qId)) && ['A', 'B', 'C', 'D'].includes(normalized)) {
                localAnswers[qId] = normalized;
              }
            });
          }

          const restoredAnswers = sessionData.resumed
            ? { ...serverAnswers, ...localAnswers }
            : isSameSessionSnapshot
              ? { ...localAnswers }
              : {};

          answersRef.current = restoredAnswers;
          setUserAnswers(restoredAnswers);

          const restoredFlags = new Set(
            isSameSessionSnapshot && Array.isArray(storedProgress.flaggedQuestions)
              ? storedProgress.flaggedQuestions.filter((qId) => validQuestionIdSet.has(String(qId)))
              : [],
          );
          setFlaggedQuestions(restoredFlags);

          const restoredPart = isSameSessionSnapshot && validPartSet.has(Number(storedProgress.activePart))
            ? Number(storedProgress.activePart)
            : initialPart;
          setActivePart(restoredPart);

          try {
            window.sessionStorage.setItem(
              progressStorageKey,
              JSON.stringify({
                sessionId: sessionData.sessionId,
                answers: restoredAnswers,
                flaggedQuestions: Array.from(restoredFlags),
                activePart: restoredPart,
                updatedAt: Date.now(),
              }),
            );
          } catch {
            // ignore
          }

          const hasUnsyncedLocalAnswers = Object.keys(restoredAnswers).some(
            (qId) => restoredAnswers[qId] !== serverAnswers[qId],
          );
          if (hasUnsyncedLocalAnswers) {
            const unsyncedList = Object.entries(restoredAnswers)
              .filter(([questionId, selectedAnswer]) => questionId && ['A', 'B', 'C', 'D'].includes(String(selectedAnswer).toUpperCase()))
              .map(([questionId, selectedAnswer]) => ({
                questionId,
                selectedAnswer: String(selectedAnswer).toUpperCase(),
              }));
            examService.saveExamSessionAnswers(sessionData.sessionId, unsyncedList).catch(() => {});
          }

          let initialTime;
          if (isStopwatch) {
            initialTime = sessionData.resumed
              ? Math.max(0, Number(sessionData.elapsedSeconds) || 0)
              : 0;
          } else if (sessionData.stopwatch) {
            const elapsed = sessionData.resumed ? Math.max(0, Number(sessionData.elapsedSeconds) || 0) : 0;
            initialTime = Math.max(0, initialMinutes * 60 - elapsed);
          } else {
            const remaining = Number(sessionData.remainingSeconds);
            initialTime = Math.max(
              0,
              Number.isFinite(remaining) && remaining > 0 ? remaining : initialMinutes * 60,
            );
          }
          timeRemainingRef.current = initialTime;
          setTimeRemaining(initialTime);
          setTimerActive(true);
          if (sessionData.timeUp || (!isStopwatch && initialTime === 0 && sessionData.resumed)) {
            setTimeout(() => submitExamRef.current?.(), 0);
          }
        } else {
          setError(res.message || 'Không thể tải đề thi.');
        }
      } catch (err) {
        setError(err.message?.includes('Vui lòng báo quản trị viên')
          || err.message?.includes('chưa có nhóm câu hỏi')
          || err.message?.includes('Không có câu hỏi sai hợp lệ')
          ? err.message
          : 'Lỗi khi tải đề thi từ máy chủ.');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchTest();
    }
  }, [testId, mode, targetPartNumbers, isStopwatch, initialMinutes, sourceResultId, practiceQuestionIds, assignmentId, progressStorageKey, forceRestartStorageKey]);

  const queueSaveSessionAnswers = useCallback((sessionId, answersMap) => {
    if (!sessionId || cancelRequestedRef.current || isSubmitted) return;
    pendingAnswersRef.current = { sessionId, answersMap: { ...(answersMap || {}) } };
    if (saveInFlightRef.current) return;

    const runSaveLoop = async () => {
      saveInFlightRef.current = true;
      try {
        while (pendingAnswersRef.current && !cancelRequestedRef.current) {
          const currentBatch = pendingAnswersRef.current;
          pendingAnswersRef.current = null;
          const formattedAnswers = Object.entries(currentBatch.answersMap)
            .filter(([questionId, selectedAnswer]) => questionId && ['A', 'B', 'C', 'D'].includes(String(selectedAnswer).toUpperCase()))
            .map(([questionId, selectedAnswer]) => ({
              questionId,
              selectedAnswer: String(selectedAnswer).toUpperCase(),
            }));
          try {
            await examService.saveExamSessionAnswers(currentBatch.sessionId, formattedAnswers);
          } catch {
            // Local sessionStorage snapshot keeps latest state across reload if network temporarily fails.
          }
        }
      } finally {
        saveInFlightRef.current = false;
      }
    };

    runSaveLoop();
  }, [isSubmitted]);

  // Keep sessionStorage progress snapshot in sync with answers, flagged questions, and activePart
  useEffect(() => {
    if (!examSession?.sessionId || isSubmitted || cancelRequestedRef.current) return;
    try {
      window.sessionStorage.setItem(
        progressStorageKey,
        JSON.stringify({
          sessionId: examSession.sessionId,
          answers: userAnswers,
          flaggedQuestions: Array.from(flaggedQuestions),
          activePart,
          updatedAt: Date.now(),
        }),
      );
    } catch {
      // ignore
    }
  }, [examSession, userAnswers, flaggedQuestions, activePart, isSubmitted, progressStorageKey]);

  // 2. Countdown or Stopwatch Timer
  useEffect(() => {
    if (!timerActive || isSubmitted) return;
    const interval = setInterval(() => {
      if (isStopwatch) {
        const nextTime = timeRemainingRef.current + 1;
        timeRemainingRef.current = nextTime;
        setTimeRemaining(nextTime);
      } else {
        const nextTime = Math.max(0, timeRemainingRef.current - 1);
        timeRemainingRef.current = nextTime;
        setTimeRemaining(nextTime);
        if (nextTime === 0) {
          clearInterval(interval);
          submitExamRef.current?.(initialMinutes * 60);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, isSubmitted, isStopwatch, initialMinutes]);

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Select option for question
  const handleSelectOption = (qId, option) => {
    if (isSubmitted || isSubmitting || !timerActive) return;
    setUserAnswers((prev) => {
      const next = {
        ...prev,
        [qId]: option,
      };
      answersRef.current = next;
      if (examSession?.sessionId && !cancelRequestedRef.current) {
        try {
          window.sessionStorage.setItem(
            progressStorageKey,
            JSON.stringify({
              sessionId: examSession.sessionId,
              answers: next,
              flaggedQuestions: Array.from(flaggedQuestions),
              activePart,
              updatedAt: Date.now(),
            }),
          );
        } catch {
          // ignore
        }
        queueSaveSessionAnswers(examSession.sessionId, next);
      }
      return next;
    });
  };

  // Toggle flag / review
  const handleToggleFlag = (qId) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  // Jump to question: switches Part if necessary and scrolls directly to question card
  const handleJumpToQuestion = (q) => {
    setMobilePaletteOpen(false);
    const triggerHighlight = (el) => {
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.remove('question-jump-highlight', 'ring-2', 'ring-emerald-500');
      void el.offsetWidth;
      el.classList.add('question-jump-highlight', 'ring-2', 'ring-emerald-500');
      setTimeout(() => el.classList.remove('question-jump-highlight', 'ring-2', 'ring-emerald-500'), 1600);
    };

    if (activePart !== q.partNumber) {
      setActivePart(q.partNumber);
      setTimeout(() => {
        triggerHighlight(document.getElementById(`q-${q.id}`));
      }, 150);
    } else {
      triggerHighlight(document.getElementById(`q-${q.id}`));
    }
  };

  // Submit Exam
  const handleSubmitExam = useCallback(async (elapsedSeconds = null) => {
    if (submitInFlightRef.current || isSubmitted || !submissionKey
      || submissionKeyRef.current?.scope !== submissionStorageKey) return;
    submitInFlightRef.current = true;
    setSubmitModalOpen(false);
    setSubmitError('');
    setIsSubmitting(true);
    const totalSpentSecs = Number.isFinite(elapsedSeconds)
      ? elapsedSeconds
      : isStopwatch ? timeRemainingRef.current : Math.max(0, initialMinutes * 60 - timeRemainingRef.current);
    const finalAnswers = flatQuestions.filter((question) => answersRef.current[question.id]).map((question) => ({
      questionId: question.id,
      selectedAnswer: answersRef.current[question.id],
    }));
    const payload = {
      submissionKey,
      testId,
      sessionId: examSession?.sessionId,
      ...(assignmentId ? { assignmentId } : {}),
      ...(sourceResultId ? { sourceResultId, questionIds: flatQuestions.map((question) => question.id) } : {}),
      totalTime: Math.max(0, Math.min(7200, totalSpentSecs)),
      ...(!assignmentId && !sourceResultId && mode === 'practice' ? { partNumbers: targetPartNumbers } : {}),
      answers: finalAnswers,
    };

    try {
      const response = await examService.submitExam(payload);
      if (response.code !== 1000 || !response.data?.testResultId) {
        throw new Error(response.message || 'Không thể nộp bài.');
      }
      setSubmissionResult(response.data);
      setIsSubmitted(true);
      setTimerActive(false);
      pendingAnswersRef.current = null;
      try {
        window.sessionStorage.removeItem(submissionStorageKey);
        window.sessionStorage.removeItem(progressStorageKey);
        window.sessionStorage.removeItem(forceRestartStorageKey);
      } catch {
        // A successful response ends this component's submit lifecycle regardless.
      }
      navigate(`/results/${response.data.testResultId}`, { replace: true });
      try {
        const detail = await examService.getTestResultDetail(response.data.testResultId);
        if (detail.code === 1000 && detail.data?.questions) {
          setReviewById(Object.fromEntries(detail.data.questions.map((question) => [question.questionId, question])));
        }
      } catch {
        setSubmitError('Bài làm đã được lưu, nhưng chưa tải được phần giải thích. Hãy mở lại lịch sử bài làm để xem lại.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Nộp bài thất bại. Câu trả lời vẫn được giữ; vui lòng thử lại.');
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  }, [isSubmitted, isStopwatch, initialMinutes, testId, assignmentId, sourceResultId, flatQuestions, mode, targetPartNumbers, navigate, submissionStorageKey, progressStorageKey, forceRestartStorageKey, submissionKey, examSession]);

  useEffect(() => {
    submitExamRef.current = handleSubmitExam;
  }, [handleSubmitExam]);

  // Handle user confirming exit midway — cancels active session so it will not be resumed
  const handleConfirmExit = useCallback(async () => {
    cancelRequestedRef.current = true;
    pendingAnswersRef.current = null;
    setExitModalOpen(false);
    setTimerActive(false);
    try {
      window.sessionStorage.removeItem(submissionStorageKey);
      window.sessionStorage.removeItem(progressStorageKey);
    } catch {
      // ignore
    }
    if (examSession?.sessionId) {
      try {
        await examService.cancelExamSession(examSession.sessionId);
      } catch {
        try {
          window.sessionStorage.setItem(forceRestartStorageKey, '1');
        } catch {
          // ignore
        }
      }
    }
    navigate(`/courses/${testId}`, { replace: true });
  }, [testId, submissionStorageKey, progressStorageKey, forceRestartStorageKey, examSession, navigate]);

  // Flush local progress on reload/pagehide and intercept browser Back button to show exit confirmation modal
  useEffect(() => {
    if (isSubmitted) return undefined;

    const handleBeforeUnload = () => {
      if (!examSession?.sessionId || cancelRequestedRef.current) return;
      try {
        window.sessionStorage.setItem(
          progressStorageKey,
          JSON.stringify({
            sessionId: examSession.sessionId,
            answers: answersRef.current || {},
            flaggedQuestions: Array.from(flaggedQuestions),
            activePart,
            updatedAt: Date.now(),
          }),
        );
      } catch {
        // ignore
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Trap browser back button to show exit modal
    window.history.pushState({ inExam: true }, '');
    const handlePopState = () => {
      window.history.pushState({ inExam: true }, '');
      setExitModalOpen(true);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isSubmitted, examSession, progressStorageKey, flaggedQuestions, activePart]);

  // Score Calculation
  const scoreResults = useMemo(() => {
    if (!submissionResult) return null;
    const reviews = Object.values(reviewById);
    const listening = reviews.filter((question) => (question.partNumber || 0) >= 1 && (question.partNumber || 0) <= 4);
    const reading = reviews.filter((question) => (question.partNumber || 0) > 4);
    const listeningTotal = flatQuestions.filter((question) => question.partNumber >= 1 && question.partNumber <= 4).length;
    const readingTotal = flatQuestions.filter((question) => question.partNumber > 4).length;
    const totalQuestions = submissionResult.totalCount || 0;
    const correctCount = submissionResult.correctCount || 0;
    return {
      totalQuestions,
      correctCount,
      listeningCorrect: submissionResult.scoreType === 'ESTIMATED_SCALED' ? listening.filter((question) => question.isCorrect).length : submissionResult.listeningScore,
      listeningTotal,
      readingCorrect: submissionResult.scoreType === 'ESTIMATED_SCALED' ? reading.filter((question) => question.isCorrect).length : submissionResult.readingScore,
      readingTotal,
      estimatedListening: submissionResult.listeningScore,
      estimatedReading: submissionResult.readingScore,
      estimatedTotal: submissionResult.totalScore,
      scoreType: submissionResult.scoreType,
      accuracy: totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0,
      timeSpent: submissionResult.totalTime || 0,
    };
  }, [submissionResult, reviewById, flatQuestions]);

  // Contexts and questions belonging to currently active Part
  const currentPartContexts = useMemo(() => {
    return contexts.filter((c) => c.partNumber === activePart);
  }, [contexts, activePart]);

  // All available parts in this test
  const availableParts = useMemo(() => {
    const set = new Set(contexts.map((c) => c.partNumber));
    return [1, 2, 3, 4, 5, 6, 7].filter((p) => set.has(p));
  }, [contexts]);

  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestionsCount = flatQuestions.length;

  if (loading) {
    return (
      <div className="neo-brutal-exam flex min-h-[85vh] items-center justify-center bg-white text-slate-900">
        <div className="border border-slate-200 bg-slate-50/70 p-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin border-2 border-slate-300 border-t-[#1D4ED8]" />
          <h3 className="text-lg font-semibold text-slate-900">Đang nạp bài thi phòng thi...</h3>
          <p className="mt-1 text-sm text-slate-600">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  if (error || contexts.length === 0) {
    return (
      <div className="neo-brutal-exam flex min-h-[85vh] items-center justify-center bg-white p-6 text-slate-900">
        <div className="w-full max-w-md border border-slate-200 bg-white p-8 text-center">
          <AlertTriangle size={40} className="mx-auto mb-4 text-red-600" />
          <h2 className="mb-2 text-xl font-semibold text-slate-900">Không thể mở bài thi</h2>
          <p className="mb-6 text-sm text-slate-600">{error || 'Bài thi không có nội dung câu hỏi hợp lệ.'}</p>
          <Link
            to={`/courses/${testId}`}
            className="inline-flex items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#173ea8]"
          >
            <ArrowLeft size={16} /> Quay lại thông tin đề thi
          </Link>
        </div>
      </div>
    );
  }

  // Find next/prev parts for bottom navigation
  const currentPartIdx = availableParts.indexOf(activePart);
  const prevPart = currentPartIdx > 0 ? availableParts[currentPartIdx - 1] : null;
  const nextPart = currentPartIdx < availableParts.length - 1 ? availableParts[currentPartIdx + 1] : null;

  return (
    <div
      className="neo-brutal-exam flex min-h-screen flex-col text-slate-900 relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.93) 0%, rgba(241, 245, 249, 0.90) 50%, rgba(248, 250, 252, 0.95) 100%), url("${libraryBg}")`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 1. Unified Sticky Top Header & Part Navigation */}
      <div className="sticky top-0 z-50">
        <header
          className="border-b border-slate-200/90 px-4 py-3.5 text-slate-800 sm:px-8 relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.89) 34%, rgba(248, 250, 252, 0.48) 64%, rgba(15, 23, 42, 0.16) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(248, 250, 252, 0.08) 55%, rgba(248, 250, 252, 0.78) 100%), url("${libraryBg}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 36%',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 sm:gap-4 relative z-10">
            {/* Left: Exit Button, Kicker & Test Name */}
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
              <button
                type="button"
                onClick={() => {
                  if (isSubmitted) {
                    navigate(`/courses/${testId}`);
                  } else {
                    setExitModalOpen(true);
                  }
                }}
                className="inline-flex flex-shrink-0 items-center gap-1.5 border border-slate-300/90 bg-white px-3.5 py-2 text-[14px] font-semibold text-slate-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 cursor-pointer rounded-[2px]"
              >
                <ArrowLeft size={14} /> Thoát phòng thi
              </button>

              <span className="hidden h-5 w-[1px] bg-slate-300/80 sm:inline-block" />

              <div className="flex min-w-0 items-center gap-2.5">
                <span className="hidden sm:inline-flex flex-shrink-0 items-center border border-blue-200 bg-[#EFF6FF] px-3 py-1 text-[13px] font-semibold text-[#1D4ED8] rounded-[2px]">
                  Phòng thi TOEIC
                </span>
                <h1 className="exam-room-title max-w-[200px] sm:max-w-md md:max-w-xl truncate text-[19px] sm:text-[21px] font-semibold text-slate-800">
                  {test?.titleTest || 'ETS TOEIC Practice Test'}
                </h1>
              </div>
            </div>

            {/* Right Desktop: Compact Status Pill */}
            <div className="hidden lg:flex items-center gap-3 border border-slate-200/90 bg-white/95 px-3.5 py-1.5 rounded-[2px] text-[14px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                <BookOpen size={14} className="text-[#1D4ED8]" />
                {mode === 'fulltest' ? 'Full Test · 120 phút' : 'Luyện tập theo Part'}
              </span>
              <span className="h-3.5 w-[1px] bg-slate-200" />
              <span className="font-medium text-slate-600">
                Đã chọn:{' '}
                <strong className="font-semibold text-[#1D4ED8] tabular-nums">
                  {answeredCount}/{totalQuestionsCount}
                </strong>
              </span>
            </div>

            {/* Right Mobile: Button open questions palette drawer */}
            <div className="flex flex-shrink-0 items-center gap-1.5 lg:hidden">
              <span
                className="border border-slate-300 bg-white/95 px-2.5 py-1.5 text-[13px] font-semibold text-slate-800 tabular-nums rounded-[2px]"
                aria-label="Thời gian làm bài"
              >
                {formatTime(isSubmitted ? scoreResults?.timeSpent || 0 : timeRemaining)}
              </span>
              <button
                type="button"
                onClick={() => setMobilePaletteOpen(true)}
                aria-label={`Mở bảng câu hỏi, đã trả lời ${answeredCount} trên ${totalQuestionsCount} câu`}
                className="flex items-center gap-1 border border-slate-300 bg-white/95 px-2.5 py-1.5 text-[13px] font-semibold text-slate-700 tabular-nums rounded-[2px] cursor-pointer"
              >
                <Layers size={14} /> {answeredCount}/{totalQuestionsCount}
              </button>
              <button
                type="button"
                onClick={() => setSubmitModalOpen(true)}
                disabled={isSubmitted || isSubmitting}
                className="border border-[#1D4ED8] bg-[#1D4ED8] px-3 py-1.5 text-[13px] font-semibold text-white rounded-[2px] disabled:opacity-50 cursor-pointer"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </header>

        {/* Part navigation bar */}
        <div className="border-b border-slate-200/90 bg-white/95 px-4 py-2.5 sm:px-8">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
            {/* Editorial Part tabs matching Navbar link typography */}
            <div className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {availableParts.map((pNum) => {
                const isActive = activePart === pNum;
                const partQuestions = flatQuestions.filter((q) => q.partNumber === pNum);
                const partAnswered = partQuestions.filter((q) => !!userAnswers[q.id]).length;
                const isPartComplete = partQuestions.length > 0 && partAnswered === partQuestions.length;

                return (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => {
                      setActivePart(pNum);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex cursor-pointer items-center gap-2 whitespace-nowrap border px-3.5 py-1.5 text-[14px] font-semibold transition-colors rounded-[2px] ${
                      isActive
                        ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                        : isPartComplete
                        ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:border-emerald-400'
                        : 'border-slate-200/90 bg-white text-slate-700 hover:border-[#1D4ED8]/60 hover:bg-[#EFF6FF]/60 hover:text-[#1D4ED8]'
                    }`}
                  >
                    <span>Part {pNum}</span>
                    <span
                      className={`rounded-[2px] px-1.5 py-0.5 text-[13px] font-semibold tabular-nums ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : isPartComplete
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {partAnswered}/{partQuestions.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Toolbar (Highlight toggle / Directions) */}
            <div className="ml-auto flex items-center gap-2.5 text-[14px] font-semibold text-slate-700">
              <label
                className={`flex cursor-pointer select-none items-center gap-2 border px-3 py-1.5 rounded-[2px] transition-colors ${
                  highlightContent
                    ? 'border-blue-200 bg-[#EFF6FF] text-[#1D4ED8] font-semibold'
                    : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:text-[#1D4ED8]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={highlightContent}
                  onChange={(e) => setHighlightContent(e.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer accent-[#1D4ED8]"
                />
                <span className="flex items-center gap-1.5">
                  <Highlighter size={13} className="text-[#1D4ED8]" /> Cỡ chữ lớn khi đọc
                </span>
              </label>

              {ETS_PART_DIRECTIONS[activePart] && (
                <button
                  type="button"
                  onClick={() => setShowDirections(!showDirections)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-[14px] font-semibold rounded-[2px] transition-colors ${
                    showDirections
                      ? 'border-blue-200 bg-[#EFF6FF] text-[#1D4ED8]'
                      : 'border-slate-200/90 bg-white text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
                  }`}
                >
                  <span>Hướng dẫn Part {activePart}</span>
                  {showDirections ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="mx-auto w-full max-w-[1500px] px-4 pt-4 sm:px-8">
          <div role="alert" className="border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {submitError}
          </div>
        </div>
      )}

      {/* 2. POST-SUBMISSION SCORE CARD (If Submitted) */}
      {isSubmitted && scoreResults && (
        <div className="mx-auto w-full max-w-[1500px] px-4 pt-4 sm:px-8">
          <div className="border border-slate-200 bg-white p-6">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center border border-blue-200 bg-[#EFF6FF] font-semibold text-[#1D4ED8]">
                  <Award size={30} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="border border-blue-200 bg-[#EFF6FF] px-2.5 py-0.5 text-[13px] font-semibold text-[#1D4ED8]">
                      Kết quả bài thi
                    </span>
                    <span className="text-[13px] font-medium text-slate-600 tabular-nums">
                      Thời gian: {Math.floor(scoreResults.timeSpent / 60)}p {scoreResults.timeSpent % 60}s
                    </span>
                  </div>
                  <h2 className="mt-1 text-xl font-semibold text-slate-800">
                    Chúc mừng bạn đã hoàn thành bài thi!
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="border border-blue-200 bg-[#EFF6FF] px-6 py-2.5 text-center">
                  <div className="text-[13px] font-semibold text-[#1D4ED8]">
                    {scoreResults.scoreType === 'ESTIMATED_SCALED' ? 'Điểm ước tính' : 'Số câu đúng'}
                  </div>
                  <div className="text-3xl font-semibold text-[#1D4ED8] tabular-nums">
                    {scoreResults.scoreType === 'ESTIMATED_SCALED' ? scoreResults.estimatedTotal : scoreResults.correctCount}{' '}
                    <span className="text-[13px] font-normal text-slate-600">
                      {scoreResults.scoreType === 'ESTIMATED_SCALED' ? '/ 990 (ước tính)' : `/ ${scoreResults.totalQuestions}`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-[14px] font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <Headphones size={14} className="text-[#1D4ED8]" />
                    <span>
                      Listening:{' '}
                      <strong className="font-semibold tabular-nums">
                        {scoreResults.scoreType === 'ESTIMATED_SCALED'
                          ? `${scoreResults.estimatedListening} / 495`
                          : `${scoreResults.listeningCorrect} câu đúng`}
                      </strong>{' '}
                      ({scoreResults.listeningCorrect}/{scoreResults.listeningTotal} câu)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-emerald-600" />
                    <span>
                      Reading:{' '}
                      <strong className="font-semibold tabular-nums">
                        {scoreResults.scoreType === 'ESTIMATED_SCALED'
                          ? `${scoreResults.estimatedReading} / 495`
                          : `${scoreResults.readingCorrect} câu đúng`}
                      </strong>{' '}
                      ({scoreResults.readingCorrect}/{scoreResults.readingTotal} câu)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-amber-600" />
                    <span>
                      Độ chính xác: <strong className="font-semibold tabular-nums">{scoreResults.accuracy}%</strong> ({scoreResults.correctCount}/
                      {scoreResults.totalQuestions} câu)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="flex cursor-pointer items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-[14px] font-semibold text-slate-700 transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                >
                  <Eye size={15} /> {showExplanation ? 'Ẩn lời giải' : 'Xem chi tiết lời giải'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ETS DIRECTIONS COLLAPSIBLE */}
      {showDirections && ETS_PART_DIRECTIONS[activePart] && (
        <div className="mx-auto mt-3 w-full max-w-[1500px] px-4 sm:px-8">
          <div className="border border-slate-200 bg-white p-4 text-[14px] leading-relaxed text-slate-700">
            <div className="mb-1 font-semibold text-[#1D4ED8]">
              {ETS_PART_DIRECTIONS[activePart].name}
            </div>
            <p className="mb-2 text-slate-700">{ETS_PART_DIRECTIONS[activePart].directions}</p>
            {ETS_PART_DIRECTIONS[activePart].sampleStatement && (
              <div className="border border-slate-200 bg-[#F8FAFC] p-2.5 text-slate-700">
                <span className="font-semibold">Ví dụ: </span>
                {ETS_PART_DIRECTIONS[activePart].sampleStatement}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Main test area */}
      <div className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-5 sm:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_320px]">
          {/* ================= LEFT MAIN WORKSPACE ================= */}
          <main className="flex flex-col gap-6">
            {activePart === 1 && (
              <div className="border border-slate-200/90 bg-white px-5 py-3.5 text-[15px] font-semibold text-slate-700">
                Part 1: Quan sát hình ảnh và nghe 4 lựa chọn A, B, C, D để chọn mô tả đúng nhất.
              </div>
            )}
            {currentPartContexts.length === 0 ? (
              <div className="border border-slate-200 bg-white p-8 text-center text-slate-600">
                Không tìm thấy câu hỏi nào cho Part {activePart}.
              </div>
            ) : (
              currentPartContexts.map((cq, cqIdx) => {
                const reviewContext = Object.values(reviewById).find((review) => review.contextQuestionId === cq.id);
                const isPart1 = cq.partNumber === 1;
                const isPart2 = cq.partNumber === 2;
                const isPart6Or7 = cq.partNumber === 6 || cq.partNumber === 7;

                return (
                  <div
                    key={cq.id || `cq-${cqIdx}`}
                    className="relative border border-slate-200 bg-white p-5 transition-all sm:p-7"
                  >
                    {/* Context Audio Player (If listening part) */}
                    {cq.audioUrl && (
                      <div className="mb-4">
                        <AudioPlayerBar src={cq.audioUrl} id={`audio-${cq.id}`} defaultPlaybackRate={initialAudioSpeed} />
                      </div>
                    )}

                    {/* Context image (Part 1 and any other part with an image) */}
                    {cq.imageUrl && (
                      <div
                        className={`mx-auto mb-5 w-full ${
                          isPart1 ? 'max-w-xl' : 'max-w-3xl'
                        } overflow-hidden border border-slate-200 bg-[#F8FAFC] p-2 text-center`}
                      >
                        <QuestionImage src={cq.imageUrl} partNumber={cq.partNumber} />
                      </div>
                    )}

                    {/* Part 6 & 7 Reading Passages (Single / Double / Triple) */}
                    {isPart6Or7 &&
                      cq.paragraph &&
                      (() => {
                        const rawP = cq.paragraph;
                        const hasSep2 = /\n*---\s*(?:BÀI ĐỌC|VĂN BẢN|PASSAGE)\s*2\s*---\n*/i.test(rawP);
                        const hasSep3 = /\n*---\s*(?:BÀI ĐỌC|VĂN BẢN|PASSAGE)\s*3\s*---\n*/i.test(rawP);

                        if (!hasSep2) {
                          return (
                            <div
                              className={`mb-5 select-text whitespace-pre-wrap border border-slate-200 border-l-4 border-l-[#1D4ED8] bg-[#F8FAFC] p-4 leading-relaxed text-slate-800 sm:p-5 ${
                                highlightContent ? 'text-base leading-loose' : 'text-[15px]'
                              }`}
                            >
                              {rawP}
                            </div>
                          );
                        }

                        // Render Double or Triple Passages
                        const sep2Regex = /\n*---\s*(?:BÀI ĐỌC|VĂN BẢN|PASSAGE)\s*2\s*---\n*/i;
                        const sep3Regex = /\n*---\s*(?:BÀI ĐỌC|VĂN BẢN|PASSAGE)\s*3\s*---\n*/i;
                        const p1 = rawP.split(sep2Regex)[0]?.trim() || '';
                        const rest = rawP.split(sep2Regex)[1] || '';
                        let p2 = rest.trim();
                        let p3 = '';
                        if (hasSep3 && sep3Regex.test(rest)) {
                          p2 = rest.split(sep3Regex)[0]?.trim() || '';
                          p3 = rest.split(sep3Regex)[1]?.trim() || '';
                        }

                        const passages = [
                          { label: 'Văn bản 1', text: p1 },
                          { label: 'Văn bản 2', text: p2 },
                        ];
                        if (p3) {
                          passages.push({ label: 'Văn bản 3', text: p3 });
                        }

                        return (
                          <div className="mb-5 flex flex-col gap-3.5">
                            {passages.map((psg, pIdx) => (
                              <div
                                key={pIdx}
                                className={`whitespace-pre-wrap border border-slate-200 border-l-4 border-l-[#1D4ED8] bg-[#F8FAFC] p-4 leading-relaxed text-slate-800 ${
                                  highlightContent ? 'text-base leading-loose' : 'text-[15px]'
                                }`}
                              >
                                <span className="mb-2 inline-block border border-blue-200 bg-[#EFF6FF] px-2.5 py-0.5 text-[13px] font-semibold text-[#1D4ED8]">
                                  {psg.label}
                                </span>
                                <div>{psg.text}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                    {/* Questions belonging to this context */}
                    <div className="flex flex-col gap-5">
                      {cq.questions.map((q) => {
                        const selectedOption = userAnswers[q.id];
                        const isFlagged = flaggedQuestions.has(q.id);
                        const review = reviewById[q.id];

                        return (
                          <div
                            key={q.id}
                            id={`q-${q.id}`}
                            className={`border p-3.5 transition-all ${
                              isFlagged ? 'border-amber-300 bg-amber-50/50' : 'border-transparent'
                            }`}
                          >
                            {/* Question title and number badge */}
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="flex flex-1 items-start gap-2.5">
                                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center border border-blue-200 bg-[#EFF6FF] text-[14px] font-semibold text-[#1D4ED8] tabular-nums">
                                  {q.questionNumber}
                                </span>
                                {!isPart1 && !isPart2 && (
                                  <div className="pt-0.5 text-[15px] font-semibold leading-relaxed text-slate-800">
                                    {q.questionContent}
                                  </div>
                                )}
                              </div>

                              {/* Flag / Review button */}
                              <button
                                type="button"
                                onClick={() => handleToggleFlag(q.id)}
                                className={`flex cursor-pointer items-center gap-1 border px-2 py-1.5 text-xs transition ${
                                  isFlagged
                                    ? 'border-amber-400 bg-amber-100 font-semibold text-amber-900'
                                    : 'border-slate-300 bg-white text-slate-600 hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
                                }`}
                                title="Đánh dấu câu hỏi để xem lại"
                              >
                                <Flag size={13} fill={isFlagged ? '#d97706' : 'none'} />
                              </button>
                            </div>

                            {/* Radio Options List (A, B, C, D) */}
                            <div
                              className="flex flex-col gap-2 pl-9"
                              role="radiogroup"
                              aria-label={`Câu ${q.questionNumber}, chọn đáp án`}
                            >
                              {['A', 'B', 'C', 'D'].map((optKey) => {
                                if (isPart2 && optKey === 'D') return null; // Part 2 only has A, B, C

                                const optText = q[`option${optKey}`];
                                const isSelected = selectedOption === optKey;
                                const isOptionCorrect = review?.correctAnswer === optKey;

                                let itemBorder = 'border-slate-200';
                                let itemBg = 'bg-white hover:bg-[#F8FAFC]';
                                let circleBg = 'border border-slate-300 bg-white text-slate-700';

                                if (isSubmitted) {
                                  if (isOptionCorrect) {
                                    itemBorder = 'border-emerald-300 bg-emerald-50 text-emerald-950 font-semibold';
                                    circleBg = 'border border-emerald-700 bg-emerald-700 text-white';
                                  } else if (isSelected && !isOptionCorrect) {
                                    itemBorder = 'border-red-300 bg-red-50 text-red-900';
                                    circleBg = 'border border-red-700 bg-red-700 text-white';
                                  }
                                } else if (isSelected) {
                                  itemBorder = 'border-[#1D4ED8]';
                                  itemBg = 'bg-[#EFF6FF] font-semibold text-slate-800';
                                  circleBg = 'border border-[#1D4ED8] bg-[#1D4ED8] text-white';
                                }

                                return (
                                  <label
                                    key={optKey}
                                    className={`flex select-none items-center gap-3 border p-2.5 transition ${itemBorder} ${itemBg} ${
                                      isSubmitted ? 'cursor-default' : 'cursor-pointer'
                                    } focus-within:outline focus-within:outline-2 focus-within:outline-[#1D4ED8]`}
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${q.id}`}
                                      value={optKey}
                                      checked={isSelected}
                                      onChange={() => handleSelectOption(q.id, optKey)}
                                      disabled={isSubmitted}
                                      aria-label={`${optKey}${optText ? `: ${optText}` : ''}`}
                                      className="sr-only"
                                    />
                                    <div
                                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center text-[13px] font-semibold transition ${circleBg}`}
                                    >
                                      {optKey}
                                    </div>
                                    <div className="flex-1 text-[14px] sm:text-[15px] leading-snug text-slate-700">
                                      {isPart1 || isPart2 ? `${optKey}.` : optText ? `${optKey}. ${optText}` : `${optKey}.`}
                                    </div>
                                    {isSubmitted && isOptionCorrect && <Check size={16} className="mr-2 text-emerald-600" />}
                                    {isSubmitted && isSelected && !isOptionCorrect && (
                                      <X size={16} className="mr-2 text-red-500" />
                                    )}
                                  </label>
                                );
                              })}
                            </div>

                            {/* Review Mode: Detailed Explanation */}
                            {isSubmitted && review && (
                              <div className="ml-9 mt-3 border border-emerald-200 border-l-4 border-l-emerald-600 bg-emerald-50/70 p-3 text-[13px] leading-relaxed text-slate-800">
                                <div className="mb-1 font-semibold text-emerald-900">
                                  Đáp án đúng: {review.correctAnswer}
                                </div>
                                <p className="m-0 text-slate-700">{review.explanation || 'Không có giải thích bổ sung.'}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Review Mode: Audio Transcript & Vietnamese Translation */}
                    {isSubmitted && (reviewContext?.transcript || reviewContext?.translation) && (
                      <div className="mt-5 flex flex-col gap-2.5 border-t border-slate-200 pt-4 text-[13px]">
                        {reviewContext.transcript && (
                          <div className="border border-slate-200 bg-[#F8FAFC] p-3">
                            <span className="mb-1 flex items-center gap-1.5 font-semibold text-slate-800">
                              <FileText size={14} /> Lời thoại âm thanh (Transcript):
                            </span>
                            <p className="m-0 whitespace-pre-wrap leading-relaxed text-slate-700">
                              {reviewContext.transcript}
                            </p>
                          </div>
                        )}
                        {reviewContext.translation && (
                          <div className="border border-slate-200 bg-white p-3">
                            <span className="mb-1 flex items-center gap-1.5 font-semibold text-slate-800">
                              Bản dịch tiếng Việt:
                            </span>
                            <p className="m-0 whitespace-pre-wrap leading-relaxed text-slate-700">
                              {reviewContext.translation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Bottom Part Pagination Navigation */}
            <div className="flex items-center justify-between gap-4 px-2 py-4">
              {prevPart ? (
                <button
                  type="button"
                  onClick={() => {
                    setActivePart(prevPart);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex cursor-pointer items-center gap-2 border border-slate-300 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-700 transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                >
                  <ChevronLeft size={16} /> Quay lại Part {prevPart}
                </button>
              ) : (
                <div />
              )}

              {nextPart ? (
                <button
                  type="button"
                  onClick={() => {
                    setActivePart(nextPart);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="ml-auto flex cursor-pointer items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-6 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#173ea8]"
                >
                  Chuyển sang Part {nextPart} <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(true)}
                  disabled={isSubmitted || isSubmitting}
                  className="ml-auto flex cursor-pointer items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-6 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#173ea8] disabled:opacity-50"
                >
                  <CheckCircle2 size={16} /> Hoàn tất & Nộp bài
                </button>
              )}
            </div>
          </main>

          {/* ================= RIGHT STICKY SIDEBAR ================= */}
          <aside className="scrollbar-thin sticky top-[112px] hidden h-[calc(100vh-132px)] overflow-y-auto pr-1 lg:block">
            <div className="flex flex-col gap-4 border border-slate-200 bg-white p-5">
              {/* Box 1: Timer & Submit Button */}
              <div>
                <div className="mb-1.5 text-[14px] font-semibold text-slate-600">
                  {isStopwatch ? 'Thời gian đã làm' : 'Thời gian còn lại'}
                </div>
                <div className="mb-3 border border-slate-200/90 bg-[#F8FAFC] p-2.5 text-center text-[28px] font-semibold text-[#1D4ED8] tabular-nums">
                  {isSubmitted ? formatTime(scoreResults?.timeSpent || 0) : formatTime(timeRemaining)}
                </div>
                {!isSubmitted && (
                  <div className="mb-3 text-center text-[14px] text-slate-600">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                      Đã làm: <strong className="font-semibold text-[#1D4ED8] tabular-nums">{answeredCount}</strong> / {totalQuestionsCount} câu
                    </span>
                  </div>
                )}

                {!isSubmitted ? (
                  <button
                    type="button"
                    onClick={() => setSubmitModalOpen(true)}
                    disabled={isSubmitted || isSubmitting}
                    className="w-full cursor-pointer border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-[#173ea8]"
                  >
                    Nộp bài thi
                  </button>
                ) : (
                  <div className="w-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-[14px] font-semibold text-emerald-800">
                    Đã nộp bài
                  </div>
                )}

                <div className="mt-2.5 border border-slate-200/90 bg-[#F8FAFC] p-2.5 text-[13px] leading-relaxed text-slate-600">
                  <strong>Lưu ý:</strong> Tiến trình đang làm được tự động lưu giữ nếu trang bị tải lại (reload). Hãy bấm <strong>Nộp bài thi</strong> khi hoàn thành; nếu xác nhận thoát phòng thi, phiên sẽ bị hủy.
                </div>
              </div>

              <div className="h-[1px] bg-slate-200" />

              {/* Box 2: Questions Palette by Part */}
              <div className="flex flex-col gap-4">
                {availableParts.map((pNum) => {
                  const partQuestions = flatQuestions.filter((q) => q.partNumber === pNum);
                  if (partQuestions.length === 0) return null;

                  return (
                    <div key={pNum}>
                      <div className="mb-2 flex items-center justify-between text-[14px] font-semibold text-slate-700">
                        <span>Part {pNum}</span>
                        <span className="text-[13px] font-semibold text-slate-500 tabular-nums">
                          {partQuestions.filter((q) => !!userAnswers[q.id]).length}/{partQuestions.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5">
                        {partQuestions.map((q) => {
                          const isAnswered = !!userAnswers[q.id];
                          const isFlagged = flaggedQuestions.has(q.id);

                          let btnStyle = 'border-slate-300 bg-white text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]';

                          if (isSubmitted) {
                            const isCorrect = Boolean(reviewById[q.id]?.isCorrect);
                            if (isCorrect) {
                              btnStyle = 'border-emerald-700 bg-emerald-700 text-white font-semibold';
                            } else if (isAnswered) {
                              btnStyle = 'border-red-700 bg-red-700 text-white font-semibold';
                            }
                          } else if (isFlagged && isAnswered) {
                            btnStyle = 'border-amber-500 bg-[#1D4ED8] text-white font-semibold';
                          } else if (isFlagged) {
                            btnStyle = 'border-amber-400 bg-amber-50 text-amber-900 font-semibold';
                          } else if (isAnswered) {
                            btnStyle = 'border-[#1D4ED8] bg-[#1D4ED8] text-white font-semibold';
                          }

                          return (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => handleJumpToQuestion(q)}
                              className={`relative flex h-8 cursor-pointer items-center justify-center border text-[13px] font-semibold tabular-nums transition ${btnStyle}`}
                            >
                              {q.questionNumber}
                              {isFlagged && !isSubmitted && (
                                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 border border-white bg-amber-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 5. MOBILE QUESTIONS PALETTE DRAWER */}
      {mobilePaletteOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/50"
          onClick={() => setMobilePaletteOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-sm flex-col gap-4 overflow-y-auto border-l border-slate-200 bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-semibold text-slate-800">Danh sách câu hỏi</h3>
              <button
                type="button"
                onClick={() => setMobilePaletteOpen(false)}
                className="border border-slate-300 bg-white p-1.5 text-slate-700 hover:border-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {availableParts.map((pNum) => {
                const partQuestions = flatQuestions.filter((q) => q.partNumber === pNum);
                return (
                  <div key={pNum}>
                    <div className="mb-2 text-[14px] font-semibold text-slate-700">Part {pNum}</div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {partQuestions.map((q) => {
                        const isAnswered = !!userAnswers[q.id];
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => handleJumpToQuestion(q)}
                            className={`flex h-9 items-center justify-center border text-[13px] font-semibold tabular-nums ${
                              isAnswered
                                ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                                : 'border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            {q.questionNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. SUBMISSION CONFIRMATION MODAL */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md border border-slate-200 bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-blue-200 bg-[#EFF6FF] text-[#1D4ED8]">
              <Send size={22} />
            </div>

            <h3 className="mb-2 text-xl font-semibold text-slate-800">Xác nhận nộp bài thi?</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-600">
              Hệ thống sẽ chấm điểm tức thì và chuyển sang trang đối chiếu đáp án, transcript và lời giải chi tiết.
            </p>

            <div className="mb-6 grid grid-cols-3 gap-2.5 text-center">
              <div className="border border-slate-200 bg-[#F8FAFC] p-3">
                <div className="text-lg font-semibold text-slate-800 tabular-nums">{totalQuestionsCount}</div>
                <div className="text-xs text-slate-500">Tổng số câu</div>
              </div>
              <div className="border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-lg font-semibold text-emerald-700 tabular-nums">{answeredCount}</div>
                <div className="text-xs font-semibold text-emerald-800">Đã làm</div>
              </div>
              <div className="border border-red-200 bg-red-50 p-3">
                <div className="text-lg font-semibold text-red-700 tabular-nums">{totalQuestionsCount - answeredCount}</div>
                <div className="text-xs font-semibold text-red-700">Chưa làm</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 cursor-pointer border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                onClick={() => setSubmitModalOpen(false)}
              >
                Làm tiếp
              </button>
              <button
                type="button"
                className="flex-1 cursor-pointer border border-[#1D4ED8] bg-[#1D4ED8] py-2.5 text-sm font-semibold text-white transition hover:bg-[#173ea8] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handleSubmitExam()}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. EXIT EXAM CONFIRMATION MODAL */}
      {exitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md border border-slate-200 bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-amber-200 bg-amber-50 text-amber-600">
              <AlertTriangle size={24} />
            </div>

            <h3 className="mb-2 text-xl font-semibold text-slate-800">Rời khỏi bài thi?</h3>
            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              Bạn đang trong quá trình làm bài thi. Nếu xác nhận rời đi bây giờ, phiên làm bài hiện tại sẽ <strong>bị hủy bỏ</strong> và kết quả sẽ <strong>không được lưu lại</strong>.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 cursor-pointer border border-[#1D4ED8] bg-[#1D4ED8] py-2.5 text-sm font-semibold text-white transition hover:bg-[#173ea8]"
                onClick={() => setExitModalOpen(false)}
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                className="flex-1 cursor-pointer border border-red-300 bg-white py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-400"
                onClick={handleConfirmExit}
              >
                Rời khỏi bài thi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTakePage;
