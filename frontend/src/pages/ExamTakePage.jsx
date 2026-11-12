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

// Compact custom audio player for the exam room
const AudioPlayerBar = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
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

  const cyclePlaybackRate = () => {
    if (!audioRef.current) return;
    const rates = [1.0, 1.2, 0.8];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    audioRef.current.playbackRate = nextRate;
  };

  const formatAudioTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!src) return null;

  return (
    <div className="mb-3 flex w-full select-none items-center gap-3 border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center border border-[#1D4ED8] bg-[#1D4ED8] text-white transition hover:bg-[#173ea8]"
        title={isPlaying ? 'Tạm dừng' : 'Phát âm thanh'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>

      {/* Scrubber / Progress Bar */}
      <div className="flex flex-1 items-center gap-2">
        <span className="w-11 text-right font-mono text-xs text-slate-600">
          {formatAudioTime(currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="h-2 flex-1 cursor-pointer appearance-none border border-slate-300 bg-white accent-[#1D4ED8]"
        />
        <span className="w-11 font-mono text-xs text-slate-500">
          {formatAudioTime(duration)}
        </span>
      </div>

      {/* Volume Control */}
      <div className="hidden items-center gap-1.5 sm:flex">
        <button
          type="button"
          onClick={toggleMute}
          className="p-1 text-slate-600 hover:text-slate-900"
        >
          {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="h-2 w-16 cursor-pointer appearance-none border border-slate-300 bg-white accent-[#1D4ED8]"
        />
      </div>

      {/* Playback speed control */}
      <button
        type="button"
        onClick={cyclePlaybackRate}
        className="border border-slate-300 bg-white px-2.5 py-1 font-mono text-xs font-semibold text-slate-800 transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
        title="Tốc độ phát"
      >
        {playbackRate}x
      </button>
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
  const sourceResultId = searchParams.get('sourceResultId');
  const questionIdsParam = searchParams.get('questionIds');
  const practiceQuestionIds = useMemo(() => questionIdsParam
    ? questionIdsParam.split(',').map((id) => id.trim()).filter(Boolean)
    : [], [questionIdsParam]);
  const assignmentId = searchParams.get('assignmentId');
  const submissionStorageKey = `toeic:pending-submit:${JSON.stringify([
    testId, mode, partsParam, timeParam, assignmentId, sourceResultId, questionIdsParam,
  ])}`;
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
          setActivePart(initialPart);

          const sessionRequest = {
            testId,
            restartActive: true,
            ...(assignmentId ? { assignmentId } : {}),
            ...(sourceResultId ? { sourceResultId, questionIds: allQs.map((question) => question.id) } : {}),
            ...(mode === 'practice' && !sourceResultId ? { partNumbers: targetPartNumbers } : {}),
          };
          const sessionResponse = await examService.startExamSession(sessionRequest);
          if (sessionResponse.code !== 1000 || !sessionResponse.data?.sessionId) {
            throw new Error(sessionResponse.message || 'Không thể bắt đầu phiên làm bài.');
          }
          const sessionData = sessionResponse.data;
          setExamSession(sessionData);
          answersRef.current = {};
          setUserAnswers({});
          const initialTime = sessionData.stopwatch ? 0
            : Math.max(0, sessionData.remainingSeconds || initialMinutes * 60);
          timeRemainingRef.current = initialTime;
          setTimeRemaining(initialTime);
          setTimerActive(true);
          if (sessionData.timeUp) setTimeout(() => submitExamRef.current?.(), 0);
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
  }, [testId, mode, targetPartNumbers, isStopwatch, initialMinutes, sourceResultId, practiceQuestionIds, assignmentId]);

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
    if (activePart !== q.partNumber) {
      setActivePart(q.partNumber);
      setTimeout(() => {
        const el = document.getElementById(`q-${q.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-emerald-500');
          setTimeout(() => el.classList.remove('ring-2', 'ring-emerald-500'), 1500);
        }
      }, 150);
    } else {
      const el = document.getElementById(`q-${q.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-emerald-500');
        setTimeout(() => el.classList.remove('ring-2', 'ring-emerald-500'), 1500);
      }
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
      try {
        window.sessionStorage.removeItem(submissionStorageKey);
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
  }, [isSubmitted, isStopwatch, initialMinutes, testId, assignmentId, sourceResultId, flatQuestions, mode, targetPartNumbers, navigate, submissionStorageKey, submissionKey, examSession]);

  useEffect(() => {
    submitExamRef.current = handleSubmitExam;
  }, [handleSubmitExam]);

  // Handle user confirming exit midway
  const handleConfirmExit = useCallback(() => {
    setExitModalOpen(false);
    setTimerActive(false);
    try {
      window.sessionStorage.removeItem(submissionStorageKey);
    } catch {
      // ignore
    }
    navigate(`/courses/${testId}`, { replace: true });
  }, [testId, submissionStorageKey, navigate]);

  // Intercept browser leave/reload and browser Back button
  useEffect(() => {
    if (isSubmitted) return undefined;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
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
  }, [isSubmitted]);

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
      {/* 1. Editorial exam room header */}
      <header
        className="sticky top-0 z-50 border-b border-slate-200/90 px-4 py-3 text-slate-900 shadow-2xs sm:px-8 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.76) 0%, rgba(248, 250, 252, 0.60) 45%, rgba(255, 255, 255, 0.88) 100%), url("${libraryBg}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 42%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 sm:gap-4 relative z-10">
          {/* Left: Brand & Test Name */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                if (isSubmitted) {
                  navigate(`/courses/${testId}`);
                } else {
                  setExitModalOpen(true);
                }
              }}
              className="inline-flex flex-shrink-0 items-center gap-1.5 border border-slate-300 bg-white/95 backdrop-blur-xs px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:border-red-500 hover:text-red-600 cursor-pointer rounded-[2px] shadow-2xs"
            >
              <ArrowLeft size={14} /> Thoát phòng thi
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1D4ED8] bg-white/95 backdrop-blur-xs border border-blue-200/90 px-2.5 py-0.5 rounded-[2px] shadow-2xs">
                  PHÒNG THI TOEIC
                </span>
                <span className="hidden h-4 w-[1px] bg-slate-300 sm:inline-block" />
                <h1
                  className="max-w-[220px] sm:max-w-md md:max-w-xl truncate text-sm font-bold text-slate-900 sm:text-base tracking-tight"
                  style={{
                    textShadow: '0 1px 4px rgba(255, 255, 255, 0.95), 0 0 10px rgba(255, 255, 255, 0.85)',
                  }}
                >
                  {test?.titleTest || 'ETS TOEIC Practice Test'}
                </h1>
              </div>
            </div>
          </div>

          {/* Right Mobile: Button open questions palette drawer */}
          <div className="flex flex-shrink-0 items-center gap-1.5 lg:hidden">
            <span
              className="border border-slate-300 bg-white/95 backdrop-blur-xs px-2 py-1 font-mono text-xs font-bold text-slate-900 shadow-2xs"
              aria-label="Thời gian làm bài"
            >
              {formatTime(isSubmitted ? scoreResults?.timeSpent || 0 : timeRemaining)}
            </span>
            <button
              type="button"
              onClick={() => setMobilePaletteOpen(true)}
              aria-label={`Mở bảng câu hỏi, đã trả lời ${answeredCount} trên ${totalQuestionsCount} câu`}
              className="flex items-center gap-1 border border-slate-300 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-800 shadow-2xs cursor-pointer"
            >
              <Layers size={14} /> {answeredCount}/{totalQuestionsCount}
            </button>
            <button
              type="button"
              onClick={() => setSubmitModalOpen(true)}
              disabled={isSubmitted || isSubmitting}
              className="border border-[#1D4ED8] bg-[#1D4ED8] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              Nộp bài
            </button>
          </div>
        </div>
      </header>

      {submitError && (
        <div className="mx-auto w-full max-w-[1500px] px-4 pt-4 sm:px-8">
          <div role="alert" className="border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {submitError}
          </div>
        </div>
      )}

{/* 2. POST-SUBMISSION SCORE CARD (If Submitted) */ }
{
  isSubmitted && scoreResults && (
    <div className="mx-auto w-full max-w-[1500px] px-4 pt-4 sm:px-8">
      <div className="border border-slate-200 bg-white p-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center border border-blue-200 bg-[#EFF6FF] font-bold text-[#1D4ED8]">
              <Award size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="border border-blue-200 bg-[#EFF6FF] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#1D4ED8]">
                  KẾT QUẢ BÀI THI
                </span>
                <span className="font-mono text-xs text-slate-500">
                  Thời gian: {Math.floor(scoreResults.timeSpent / 60)}p {scoreResults.timeSpent % 60}s
                </span>
              </div>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Chúc mừng bạn đã hoàn thành bài thi!
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="border border-blue-200 bg-[#EFF6FF] px-6 py-2.5 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#1D4ED8]">
                {scoreResults.scoreType === 'ESTIMATED_SCALED' ? 'Điểm ước tính' : 'Số câu đúng'}
              </div>
              <div className="font-mono text-3xl font-bold text-[#1D4ED8]">
                {scoreResults.scoreType === 'ESTIMATED_SCALED' ? scoreResults.estimatedTotal : scoreResults.correctCount}{' '}
                <span className="text-xs font-normal text-slate-600">
                  {scoreResults.scoreType === 'ESTIMATED_SCALED' ? '/ 990 (ước tính)' : `/ ${scoreResults.totalQuestions}`}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <Headphones size={14} className="text-[#1D4ED8]" />
                <span>
                  Listening:{' '}
                  <strong className="font-mono">
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
                  <strong className="font-mono">
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
                  Độ chính xác: <strong className="font-mono">{scoreResults.accuracy}%</strong> ({scoreResults.correctCount}/
                  {scoreResults.totalQuestions} câu)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex cursor-pointer items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
            >
              <Eye size={15} /> {showExplanation ? 'Ẩn lời giải' : 'Xem chi tiết lời giải'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

{/* 3. Part navigation */ }
<div className="sticky top-[57px] z-40 border-b border-slate-200 bg-slate-50/90 px-4 py-2.5 backdrop-blur-xs sm:px-8">
  <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
    {/* Editorial Part tabs */}
    <div className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
      {availableParts.map((pNum) => {
        const isActive = activePart === pNum;
        const partQuestions = flatQuestions.filter((q) => q.partNumber === pNum);
        const partAnswered = partQuestions.filter((q) => !!userAnswers[q.id]).length;

        return (
          <button
            key={pNum}
            type="button"
            onClick={() => {
              setActivePart(pNum);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex cursor-pointer items-center gap-2 whitespace-nowrap border px-3.5 py-1.5 text-xs font-semibold transition-colors ${isActive
              ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
              : 'border-slate-300 bg-white text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
              }`}
          >
            <span>Part {pNum}</span>
            <span
              className={`border px-1.5 py-0.5 font-mono text-[11px] ${isActive
                ? 'border-blue-400 bg-blue-800 text-white'
                : 'border-slate-200 bg-slate-100 text-slate-600'
                }`}
            >
              {partAnswered}/{partQuestions.length}
            </span>
          </button>
        );
      })}
    </div>

    {/* Quick Toolbar (Highlight toggle / Directions) */}
    <div className="ml-auto flex items-center gap-4 text-xs font-medium text-slate-600">
      <label className="flex cursor-pointer select-none items-center gap-1.5">
        <input
          type="checkbox"
          checked={highlightContent}
          onChange={(e) => setHighlightContent(e.target.checked)}
          className="h-4 w-4 cursor-pointer accent-[#1D4ED8]"
        />
        <span className="flex items-center gap-1">
          <Highlighter size={13} className="text-[#1D4ED8]" /> Cỡ chữ lớn khi đọc
        </span>
      </label>

      {ETS_PART_DIRECTIONS[activePart] && (
        <button
          type="button"
          onClick={() => setShowDirections(!showDirections)}
          className="flex cursor-pointer items-center gap-1 border-b border-slate-400 text-xs font-semibold text-slate-800 hover:text-[#1D4ED8]"
        >
          <span>Hướng dẫn Part {activePart}</span>
          {showDirections ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      )}
    </div>
  </div>
</div>

{/* ETS DIRECTIONS COLLAPSIBLE */ }
{
  showDirections && ETS_PART_DIRECTIONS[activePart] && (
    <div className="mx-auto mt-3 w-full max-w-[1500px] px-4 sm:px-8">
      <div className="border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800">
        <div className="mb-1 font-mono font-semibold uppercase tracking-wider text-[#1D4ED8]">
          {ETS_PART_DIRECTIONS[activePart].name}
        </div>
        <p className="mb-2 text-slate-700">{ETS_PART_DIRECTIONS[activePart].directions}</p>
        {ETS_PART_DIRECTIONS[activePart].sampleStatement && (
          <div className="border border-slate-200 bg-white p-2.5 text-slate-800">
            <span className="font-semibold">Ví dụ: </span>
            {ETS_PART_DIRECTIONS[activePart].sampleStatement}
          </div>
        )}
      </div>
    </div>
  )
}

{/* 4. Main test area */ }
<div className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-5 sm:px-8">
  <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_320px]">
    {/* ================= LEFT MAIN WORKSPACE ================= */}
    <main className="flex flex-col gap-6">
      {activePart === 1 && (
        <div className="border border-slate-200 bg-slate-50 px-5 py-3.5 text-base font-semibold text-slate-900">
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
                  <AudioPlayerBar src={cq.audioUrl} id={`audio-${cq.id}`} />
                </div>
              )}

              {/* Context image (Part 1 and any other part with an image) */}
              {cq.imageUrl && (
                <div
                  className={`mx-auto mb-5 w-full ${isPart1 ? 'max-w-xl' : 'max-w-3xl'
                    } overflow-hidden border border-slate-200 bg-slate-50/40 p-2 text-center`}
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
                        className={`mb-5 select-text whitespace-pre-wrap border border-slate-200 border-l-4 border-l-[#1D4ED8] bg-slate-50/70 p-4 leading-relaxed text-slate-900 sm:p-5 ${highlightContent ? 'text-base leading-loose' : 'text-sm'
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
                    { label: 'VĂN BẢN 1', text: p1 },
                    { label: 'VĂN BẢN 2', text: p2 },
                  ];
                  if (p3) {
                    passages.push({ label: 'VĂN BẢN 3', text: p3 });
                  }

                  return (
                    <div className="mb-5 flex flex-col gap-3.5">
                      {passages.map((psg, pIdx) => (
                        <div
                          key={pIdx}
                          className={`whitespace-pre-wrap border border-slate-200 border-l-4 border-l-[#1D4ED8] bg-slate-50/70 p-4 leading-relaxed text-slate-900 ${highlightContent ? 'text-base leading-loose' : 'text-sm'
                            }`}
                        >
                          <span className="mb-2 inline-block border border-blue-200 bg-[#EFF6FF] px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-[#1D4ED8]">
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
                      className={`border p-3.5 transition-all ${isFlagged ? 'border-amber-300 bg-amber-50/50' : 'border-transparent'
                        }`}
                    >
                      {/* Question title and number badge */}
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex flex-1 items-start gap-2.5">
                          <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center border border-slate-300 bg-slate-100 font-mono text-xs font-bold text-slate-900">
                            {q.questionNumber}
                          </span>
                          {!isPart1 && !isPart2 && (
                            <div className="pt-0.5 text-sm font-semibold leading-relaxed text-slate-900">
                              {q.questionContent}
                            </div>
                          )}
                        </div>

                        {/* Flag / Review button */}
                        <button
                          type="button"
                          onClick={() => handleToggleFlag(q.id)}
                          className={`flex cursor-pointer items-center gap-1 border px-2 py-1.5 text-xs transition ${isFlagged
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
                          let itemBg = 'bg-white hover:bg-slate-50';
                          let circleBg = 'border border-slate-300 bg-white text-slate-800';

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
                            itemBg = 'bg-[#EFF6FF] font-semibold text-slate-900';
                            circleBg = 'border border-[#1D4ED8] bg-[#1D4ED8] text-white';
                          }

                          return (
                            <label
                              key={optKey}
                              className={`flex select-none items-center gap-3 border p-2.5 transition ${itemBorder} ${itemBg} ${isSubmitted ? 'cursor-default' : 'cursor-pointer'
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
                                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center font-mono text-xs font-bold transition ${circleBg}`}
                              >
                                {optKey}
                              </div>
                              <div className="flex-1 text-sm leading-snug text-slate-900">
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
                        <div className="ml-9 mt-3 border border-emerald-200 border-l-4 border-l-emerald-600 bg-emerald-50/70 p-3 text-xs leading-relaxed text-slate-900">
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
                <div className="mt-5 flex flex-col gap-2.5 border-t border-slate-200 pt-4 text-xs">
                  {reviewContext.transcript && (
                    <div className="border border-slate-200 bg-slate-50 p-3">
                      <span className="mb-1 flex items-center gap-1.5 font-semibold text-slate-900">
                        <FileText size={14} /> Lời thoại âm thanh (Transcript):
                      </span>
                      <p className="m-0 whitespace-pre-wrap leading-relaxed text-slate-700">
                        {reviewContext.transcript}
                      </p>
                    </div>
                  )}
                  {reviewContext.translation && (
                    <div className="border border-slate-200 bg-white p-3">
                      <span className="mb-1 flex items-center gap-1.5 font-semibold text-slate-900">
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
            className="flex cursor-pointer items-center gap-2 border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
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
            className="ml-auto flex cursor-pointer items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#173ea8]"
          >
            Chuyển sang Part {nextPart} <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSubmitModalOpen(true)}
            disabled={isSubmitted || isSubmitting}
            className="ml-auto flex cursor-pointer items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#173ea8] disabled:opacity-50"
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
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {isStopwatch ? 'Thời gian đã làm' : 'Thời gian còn lại'}
          </div>
          <div className="mb-3 border border-slate-200 bg-slate-50 p-2.5 text-center font-mono text-3xl font-bold tracking-tight text-slate-900">
            {isSubmitted ? formatTime(scoreResults?.timeSpent || 0) : formatTime(timeRemaining)}
          </div>
          {!isSubmitted && (
            <div className="mb-3 text-center text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                Đã làm: <strong className="font-mono text-sm font-bold text-slate-900">{answeredCount}</strong> / {totalQuestionsCount} câu
              </span>
            </div>
          )}

          {!isSubmitted ? (
            <button
              type="button"
              onClick={() => setSubmitModalOpen(true)}
              disabled={isSubmitted || isSubmitting}
              className="w-full cursor-pointer border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold tracking-wide text-white transition hover:bg-[#173ea8]"
            >
              NỘP BÀI THI
            </button>
          ) : (
            <div className="w-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-800">
              ĐÃ NỘP BÀI
            </div>
          )}

          <div className="mt-2.5 border border-slate-200 bg-slate-50/80 p-2.5 text-xs leading-normal text-slate-600">
            <strong>Lưu ý:</strong> Hãy bấm <strong>Nộp bài thi</strong> khi hoàn thành để hệ thống chấm điểm và lưu kết quả. Nếu thoát giữa chừng, kết quả sẽ không được lưu.
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
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Part {pNum}</span>
                  <span className="font-mono text-[11px] text-slate-500">
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
                        btnStyle = 'border-emerald-700 bg-emerald-700 text-white font-bold';
                      } else if (isAnswered) {
                        btnStyle = 'border-red-700 bg-red-700 text-white font-bold';
                      }
                    } else if (isFlagged && isAnswered) {
                      btnStyle = 'border-amber-500 bg-[#1D4ED8] text-white font-bold';
                    } else if (isFlagged) {
                      btnStyle = 'border-amber-400 bg-amber-50 text-amber-900 font-semibold';
                    } else if (isAnswered) {
                      btnStyle = 'border-[#1D4ED8] bg-[#1D4ED8] text-white font-bold';
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleJumpToQuestion(q)}
                        className={`relative flex h-8 cursor-pointer items-center justify-center border font-mono text-xs transition ${btnStyle}`}
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

{/* 5. MOBILE QUESTIONS PALETTE DRAWER */ }
{
  mobilePaletteOpen && (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50"
      onClick={() => setMobilePaletteOpen(false)}
    >
      <div
        className="flex h-full w-full max-w-sm flex-col gap-4 overflow-y-auto border-l border-slate-200 bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-base font-semibold text-slate-900">Danh sách câu hỏi</h3>
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
                <div className="mb-2 text-xs font-semibold text-slate-800">Part {pNum}</div>
                <div className="grid grid-cols-5 gap-1.5">
                  {partQuestions.map((q) => {
                    const isAnswered = !!userAnswers[q.id];
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleJumpToQuestion(q)}
                        className={`flex h-9 items-center justify-center border font-mono text-xs font-semibold ${isAnswered
                          ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                          : 'border-slate-300 bg-white text-slate-800'
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
  )
}

{/* 6. SUBMISSION CONFIRMATION MODAL */ }
{
  submitModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md border border-slate-200 bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-blue-200 bg-[#EFF6FF] text-[#1D4ED8]">
          <Send size={22} />
        </div>

        <h3 className="mb-2 text-xl font-semibold text-slate-900">Xác nhận nộp bài thi?</h3>
        <p className="mb-5 text-sm leading-relaxed text-slate-600">
          Hệ thống sẽ chấm điểm tức thì và chuyển sang trang đối chiếu đáp án, transcript và lời giải chi tiết.
        </p>

        <div className="mb-6 grid grid-cols-3 gap-2.5 text-center">
          <div className="border border-slate-200 bg-slate-50 p-3">
            <div className="font-mono text-lg font-bold text-slate-900">{totalQuestionsCount}</div>
            <div className="text-xs text-slate-500">Tổng số câu</div>
          </div>
          <div className="border border-emerald-200 bg-emerald-50 p-3">
            <div className="font-mono text-lg font-bold text-emerald-700">{answeredCount}</div>
            <div className="text-xs font-semibold text-emerald-800">Đã làm</div>
          </div>
          <div className="border border-red-200 bg-red-50 p-3">
            <div className="font-mono text-lg font-bold text-red-700">{totalQuestionsCount - answeredCount}</div>
            <div className="text-xs font-semibold text-red-700">Chưa làm</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 cursor-pointer border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
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

        <h3 className="mb-2 text-xl font-semibold text-slate-900">Rời khỏi bài thi?</h3>
        <p className="mb-6 text-sm leading-relaxed text-slate-600">
          Bạn đang trong quá trình làm bài thi. Nếu rời đi bây giờ, phiên làm bài sẽ kết thúc và kết quả sẽ <strong>không được lưu lại</strong>.
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
