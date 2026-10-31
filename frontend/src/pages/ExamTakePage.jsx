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

const flushPendingAnswerSnapshots = async (pendingRef, promiseRef, setSaveState) => {
  if (promiseRef.current) return promiseRef.current;

  const flush = async () => {
    let failed = false;
    try {
      while (pendingRef.current) {
        const snapshot = pendingRef.current;
        pendingRef.current = null;
        await examService.saveExamSessionAnswers(snapshot.sessionId, snapshot.answers);
      }
    } catch {
      failed = true;
    } finally {
      const nextSnapshot = pendingRef.current;
      pendingRef.current = null;
      promiseRef.current = null;
      if (nextSnapshot) {
        await flushPendingAnswerSnapshots(pendingRef, promiseRef, setSaveState);
      } else {
        setSaveState(failed ? 'error' : 'saved');
      }
    }
  };

  const promise = flush();
  promiseRef.current = promise;
  return promise;
};

const QuestionImage = ({ src }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex min-h-48 items-center justify-center bg-[#F1EEDF] p-6 text-center text-sm text-[#111111]">
        Không thể tải hình ảnh câu hỏi này.
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Hình ảnh câu hỏi Part 1"
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
      audioRef.current.play().catch(() => {});
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
    <div className="mb-3 flex w-full select-none items-center gap-3 border-2 border-[#111111] bg-[#F1EEDF] px-3 py-2 text-xs text-[#111111]">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-[#111111] bg-[#FFE600] text-[#111111] transition hover:bg-[#FF5B93] active:translate-x-[2px] active:translate-y-[2px] cursor-pointer"
        title={isPlaying ? 'Tạm dừng' : 'Phát âm thanh'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>

      {/* Scrubber / Progress Bar */}
      <div className="flex-1 flex items-center gap-2">
        <span className="font-mono text-[#444444] text-[11px] w-10 text-right">
          {formatAudioTime(currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-2 bg-white border-2 border-[#111111] appearance-none cursor-pointer accent-[#111111]"
        />
        <span className="font-mono text-[#555555] text-[11px] w-10">
          {formatAudioTime(duration)}
        </span>
      </div>

      {/* Volume Control */}
      <div className="hidden sm:flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggleMute}
          className="text-[#444444] hover:text-[#222222] p-1"
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
          className="h-2 w-14 border-2 border-[#111111] bg-white appearance-none cursor-pointer accent-[#111111]"
        />
      </div>

      {/* Playback speed control */}
      <button
        type="button"
        onClick={cyclePlaybackRate}
        className="border-2 border-[#111111] bg-white px-2 py-1 font-bold text-[11px] text-[#111111] transition hover:bg-[#FFE600]"
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
  const [sessionReady, setSessionReady] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(null);
  const [answerSaveState, setAnswerSaveState] = useState('saved');
  const answersRef = useRef({});
  const saveAnswersPromiseRef = useRef(null);
  const pendingAnswersRef = useRef(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set()); // Set of qIds
  const [timeRemaining, setTimeRemaining] = useState(isStopwatch ? 0 : initialMinutes * 60);
  const timeRemainingRef = useRef(isStopwatch ? 0 : initialMinutes * 60);
  const [timerActive, setTimerActive] = useState(false);

  // UI States
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
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
            ...(assignmentId ? { assignmentId } : {}),
            ...(sourceResultId ? { sourceResultId, questionIds: allQs.map((question) => question.id) } : {}),
            ...(mode === 'practice' && !sourceResultId ? { partNumbers: targetPartNumbers } : {}),
          };
          const sessionResponse = await examService.startExamSession(sessionRequest);
          if (sessionResponse.code !== 1000 || !sessionResponse.data?.sessionId) {
            throw new Error(sessionResponse.message || 'Không thể bắt đầu phiên làm bài.');
          }
          const startSession = (data) => {
            setExamSession(data);
            setSessionReady(!data.timeUp);
            setResumePrompt(null);
            answersRef.current = data.answers || {};
            setUserAnswers(data.answers || {});
            const initialTime = data.stopwatch ? Math.floor(data.elapsedSeconds || 0)
              : Math.max(0, data.remainingSeconds);
            timeRemainingRef.current = initialTime;
            setTimeRemaining(initialTime);
            setTimerActive(true);
            if (data.timeUp) setTimeout(() => submitExamRef.current?.(), 0);
          };
          if (sessionResponse.data.resumed) {
            setExamSession(sessionResponse.data);
            setSessionReady(false);
            setResumePrompt({
              data: sessionResponse.data,
              continue: () => startSession(sessionResponse.data),
              restart: async () => {
                const restarted = await examService.startExamSession({ ...sessionRequest, restartActive: true });
                if (restarted.code !== 1000 || !restarted.data?.sessionId) throw new Error('Không thể bắt đầu lượt mới.');
                startSession(restarted.data);
              },
            });
          } else {
            startSession(sessionResponse.data);
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
    setAnswerSaveState('saving');
    setUserAnswers((prev) => {
      const next = {
      ...prev,
      [qId]: option,
      };
      answersRef.current = next;
      return next;
    });
  };

  const queueAnswerSnapshot = useCallback((sessionId, answers) => {
    pendingAnswersRef.current = { sessionId, answers };
    return flushPendingAnswerSnapshots(pendingAnswersRef, saveAnswersPromiseRef, setAnswerSaveState);
  }, []);

  useEffect(() => {
    if (!sessionReady || !examSession?.sessionId || isSubmitted) return undefined;
    const snapshot = Object.entries(answersRef.current)
      .map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer }));
    void queueAnswerSnapshot(examSession.sessionId, snapshot);
    return undefined;
  }, [userAnswers, sessionReady, examSession?.sessionId, isSubmitted, queueAnswerSnapshot]);

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
      if (examSession?.sessionId) {
        await queueAnswerSnapshot(examSession.sessionId, finalAnswers);
      }
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
  }, [isSubmitted, isStopwatch, initialMinutes, testId, assignmentId, sourceResultId, flatQuestions, mode, targetPartNumbers, navigate, submissionStorageKey, submissionKey, examSession, queueAnswerSnapshot]);

  useEffect(() => {
    submitExamRef.current = handleSubmitExam;
  }, [handleSubmitExam]);

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
      <div className="neo-brutal-exam min-h-[85vh] flex items-center justify-center bg-[#FFFDF2] text-[#111111]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#111111] border-t-[#FFE600] animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-black">Đang nạp bài thi phòng thi...</h3>
          <p className="text-sm text-[#333333] mt-1">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  if (resumePrompt) {
    return (
      <main className="min-h-screen bg-[#FFFDF2] px-4 py-16 text-[#111111]">
        <section className="mx-auto max-w-xl border-2 border-[#111111] bg-white p-7 shadow-[6px_6px_0_#111111]">
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-[#725B00]">Đã tìm thấy phiên làm bài</p>
          <h1 className="mb-3 text-3xl font-black">Bạn muốn tiếp tục?</h1>
          <p className="mb-6 text-sm leading-6">
            Các lựa chọn đã lưu trên máy chủ sẽ được khôi phục. {resumePrompt.data.timeUp
              ? 'Thời gian đã hết; tiếp tục sẽ nộp các đáp án đã lưu.'
              : `Còn ${formatTime(resumePrompt.data.remainingSeconds)} theo đồng hồ máy chủ.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={resumePrompt.continue} className="border-2 border-[#111111] bg-[#FFE600] px-5 py-3 font-black shadow-[3px_3px_0_#111111]">
              Tiếp tục phiên
            </button>
            <button type="button" onClick={() => resumePrompt.restart().catch((err) => setError(err.message))} className="border-2 border-[#111111] bg-white px-5 py-3 font-black shadow-[3px_3px_0_#111111]">
              Bắt đầu lượt mới
            </button>
          </div>
          {error && <p role="alert" className="mt-4 font-bold text-red-700">{error}</p>}
        </section>
      </main>
    );
  }

  if (error || contexts.length === 0) {
    return (
      <div className="neo-brutal-exam min-h-[85vh] flex items-center justify-center bg-[#FFFDF2] p-6 text-[#111111]">
        <div className="max-w-md w-full bg-white p-8 text-center shadow-[6px_6px_0_#111111] border-2 border-[#111111]">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#111111] mb-2">Không thể mở bài thi</h2>
          <p className="text-sm text-[#444444] mb-6">{error || 'Bài thi không có nội dung câu hỏi hợp lệ.'}</p>
          <Link to={`/courses/${testId}`} className="inline-flex items-center gap-2 border-2 border-[#111111] bg-[#FFE600] px-4 py-2.5 text-sm font-black text-[#111111] shadow-[3px_3px_0_#111111] transition hover:bg-[#FF5B93] active:translate-x-[2px] active:translate-y-[2px]">
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
    <div className="neo-brutal-exam min-h-screen bg-[#FFFDF2] text-[#111111] flex flex-col font-sans">
      {/* 1. High-contrast exam header */}
      <header className="sticky top-0 z-50 border-b-[3px] border-[#111111] bg-[#111111] py-2.5 px-4 text-white sm:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand & Test Name */}
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-4">
            <Link
              to={`/courses/${testId}`}
              className="inline-flex flex-shrink-0 items-center gap-1 border-2 border-white bg-[#111111] px-2 py-1.5 text-[10px] font-bold text-white transition hover:bg-[#FFE600] hover:text-[#111111] active:translate-x-[2px] active:translate-y-[2px] sm:gap-1.5 sm:px-3 sm:text-xs"
            >
              <ArrowLeft size={14} /> Thoát
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-base text-[#FFE600] sm:text-lg">
                  TOEIC<span className="hidden font-light text-white sm:inline">ONLINE</span>
                </span>
                <span className="hidden sm:inline-block h-5 w-[2px] bg-white" />
                <h1 className="hidden max-w-[200px] truncate text-xs font-bold text-white sm:block sm:max-w-md sm:text-sm">
                  {test?.titleTest || 'ETS TOEIC Practice Test'}
                </h1>
              </div>
            </div>
          </div>

          {/* Right Mobile: Button open questions palette drawer */}
          <div className="flex flex-shrink-0 items-center gap-1.5 sm:hidden">
            <span className="border-2 border-[#FFE600] px-1 py-1 font-mono text-[10px] font-black text-[#FFE600] sm:px-1.5 sm:text-[11px]" aria-label="Thời gian còn lại">
              {formatTime(isSubmitted ? (scoreResults?.timeSpent || 0) : timeRemaining)}
            </span>
            <button
              type="button"
              onClick={() => setMobilePaletteOpen(true)}
              aria-label={`Mở bảng câu hỏi, đã trả lời ${answeredCount} trên ${totalQuestionsCount} câu`}
              className="flex items-center gap-1 border-2 border-white bg-[#111111] px-1.5 py-1.5 text-[10px] font-bold text-white sm:px-2 sm:text-xs"
            >
              <Layers size={14} /> {answeredCount}/{totalQuestionsCount}
            </button>
            <button
              type="button"
              onClick={() => setSubmitModalOpen(true)}
              disabled={isSubmitted || isSubmitting}
              className="border-2 border-[#111111] bg-[#FFE600] px-2 py-1.5 text-[10px] font-black text-[#111111] disabled:opacity-50 sm:px-3 sm:text-xs"
            >
              Nộp
            </button>
          </div>
        </div>
      </header>

      {submitError && (
        <div className="max-w-[1500px] mx-auto w-full px-4 sm:px-8 pt-4">
          <div role="alert" className="border-2 border-[#B42318] bg-rose-100 px-4 py-3 text-sm font-semibold text-[#7F1D1D] shadow-[4px_4px_0_#111]">
            {submitError}
          </div>
        </div>
      )}

      {/* 2. POST-SUBMISSION SCORE CARD (If Submitted) */}
      {isSubmitted && scoreResults && (
        <div className="max-w-[1500px] mx-auto w-full px-4 sm:px-8 pt-4">
          <div className="bg-white border-2 border-[#111111] p-6 shadow-[5px_5px_0_#111111]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center border-2 border-[#111111] bg-[#FF5B93] font-bold text-[#111111]">
                  <Award size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="border-2 border-[#111111] bg-[#FFE600] px-2.5 py-0.5 text-xs font-black text-[#111111]">
                      KẾT QUẢ BÀI THI
                    </span>
                    <span className="text-xs text-[#444444]">
                      Thời gian: {Math.floor(scoreResults.timeSpent / 60)}p {scoreResults.timeSpent % 60}s
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-[#111111] mt-1">
                    Chúc mừng bạn đã hoàn thành bài thi!
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap justify-center">
                <div className="border-2 border-[#111111] bg-[#FFE600] px-6 py-2.5 text-center shadow-[3px_3px_0_#111111]">
                    <div className="text-xs font-black uppercase tracking-wider text-[#111111]">
                    {scoreResults.scoreType === 'ESTIMATED_SCALED' ? 'Điểm ước tính' : 'Số câu đúng'}
                  </div>
                  <div className="text-3xl font-black text-[#111111]">
                    {scoreResults.scoreType === 'ESTIMATED_SCALED' ? scoreResults.estimatedTotal : scoreResults.correctCount} <span className="text-xs text-[#333333] font-semibold">{scoreResults.scoreType === 'ESTIMATED_SCALED' ? '/ 990 (ước tính)' : `/ ${scoreResults.totalQuestions}`}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-[#222222] font-medium">
                  <div className="flex items-center gap-2">
                    <Headphones size={14} className="text-sky-600" />
                    <span>Listening: <strong>{scoreResults.scoreType === 'ESTIMATED_SCALED' ? `${scoreResults.estimatedListening} / 495` : `${scoreResults.listeningCorrect} câu đúng`}</strong> ({scoreResults.listeningCorrect}/{scoreResults.listeningTotal} câu)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-emerald-600" />
                    <span>Reading: <strong>{scoreResults.scoreType === 'ESTIMATED_SCALED' ? `${scoreResults.estimatedReading} / 495` : `${scoreResults.readingCorrect} câu đúng`}</strong> ({scoreResults.readingCorrect}/{scoreResults.readingTotal} câu)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-amber-500" />
                    <span>Độ chính xác: <strong>{scoreResults.accuracy}%</strong> ({scoreResults.correctCount}/{scoreResults.totalQuestions} câu)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="flex items-center gap-2 border-2 border-[#111111] bg-white px-4 py-2 text-xs font-bold text-[#111111] transition hover:bg-[#FF5B93] cursor-pointer"
                >
                  <Eye size={15} /> {showExplanation ? 'Ẩn lời giải' : 'Xem chi tiết lời giải'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Part navigation */}
      <div className="sticky top-[53px] z-40 border-b-2 border-[#111111] bg-[#FFFDF2] px-4 py-2.5 shadow-[0_3px_0_#111111] sm:px-8">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Square Neo-brutalist Part tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
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
                  className={`border-2 border-[#111111] px-4 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#FFE600] text-[#111111] shadow-[3px_3px_0_#111111]'
                      : 'bg-white text-[#111111] hover:bg-[#FF5B93]'
                  }`}
                >
                  <span>Part {pNum}</span>
                  <span
                    className={`border-2 border-[#111111] px-1.5 py-0.2 text-[10px] ${
                      isActive ? 'bg-white text-[#111111]' : 'bg-[#F1EEDF] text-[#111111]'
                    }`}
                  >
                    {partAnswered}/{partQuestions.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Toolbar (Highlight toggle / Directions) */}
          <div className="flex items-center gap-3 text-xs text-[#333333] font-medium ml-auto">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={highlightContent}
                onChange={(e) => setHighlightContent(e.target.checked)}
                className="h-4 w-4 border-2 border-[#111111] accent-[#111111] cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Highlighter size={13} className="text-[#111111]" /> Highlight nội dung
              </span>
            </label>

            {ETS_PART_DIRECTIONS[activePart] && (
              <button
                type="button"
                onClick={() => setShowDirections(!showDirections)}
                className="flex items-center gap-1 border-b-2 border-[#111111] text-xs font-bold text-[#111111] hover:text-[#B42318] cursor-pointer"
              >
                <span>Hướng dẫn Part {activePart}</span>
                {showDirections ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ETS DIRECTIONS COLLAPSIBLE */}
      {showDirections && ETS_PART_DIRECTIONS[activePart] && (
        <div className="max-w-[1500px] mx-auto w-full px-4 sm:px-8 mt-3">
          <div className="border-2 border-[#111111] bg-[#111111] p-4 text-xs leading-relaxed text-white shadow-[4px_4px_0_#FF5B93]">
            <div className="font-black text-[#FFE600] uppercase tracking-wider mb-1">
              {ETS_PART_DIRECTIONS[activePart].name}
            </div>
            <p className="text-white mb-2">{ETS_PART_DIRECTIONS[activePart].directions}</p>
            {ETS_PART_DIRECTIONS[activePart].sampleStatement && (
              <div className="bg-white p-2.5 border-2 border-[#111111] text-[#111111]">
                <span className="font-black">Ví dụ: </span>
                {ETS_PART_DIRECTIONS[activePart].sampleStatement}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Main test area */}
      <div className="max-w-[1500px] mx-auto w-full px-4 sm:px-8 py-5 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          
          {/* ================= LEFT MAIN WORKSPACE ================= */}
          {/* ALL QUESTIONS IN ACTIVE PART RENDERED ON ONE VERTICAL PAGE */}
          <main className="flex flex-col gap-6">
            {activePart === 1 && (
              <div className="border-2 border-[#111111] bg-[#FFE600] px-5 py-4 text-lg font-extrabold text-[#111111] shadow-[4px_4px_0_#111111]">
                Chọn hình phù hợp nhất.
              </div>
            )}
            {currentPartContexts.length === 0 ? (
              <div className="border-2 border-[#111111] bg-white p-8 text-center text-[#333333] shadow-[4px_4px_0_#111111]">
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
                    className="relative border-2 border-[#111111] bg-white p-5 shadow-[4px_4px_0_#111111] transition-all sm:p-7"
                  >
                    {/* Context Audio Player (If listening part) */}
                    {cq.audioUrl && (
                      <div className="mb-4">
                        <AudioPlayerBar src={cq.audioUrl} id={`audio-${cq.id}`} />
                      </div>
                    )}

                    {/* Part 1 Photograph */}
                    {isPart1 && cq.imageUrl && (
                      <div className="mb-5 mx-auto w-full max-w-xl overflow-hidden border-2 border-[#111111] bg-white text-center">
                        <QuestionImage src={cq.imageUrl} />
                      </div>
                    )}

                    {/* Part 6 & 7 Reading Passages (Single / Double / Triple) */}
                    {isPart6Or7 && cq.paragraph && (() => {
                      const rawP = cq.paragraph;
                      const hasSep2 = /\n*---\s*(?:BÀI ĐỌC|VĂN BẢN|PASSAGE)\s*2\s*---\n*/i.test(rawP);
                      const hasSep3 = /\n*---\s*(?:BÀI ĐỌC|VĂN BẢN|PASSAGE)\s*3\s*---\n*/i.test(rawP);

                      if (!hasSep2) {
                        return (
                          <div
                            className={`mb-5 border-2 border-[#111111] bg-[#F1EEDF] p-4 font-sans leading-relaxed text-[#111111] sm:p-5 whitespace-pre-wrap select-text ${
                              highlightContent ? 'text-base leading-loose outline outline-2 outline-[#FFE600]' : 'text-sm'
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
                        { label: 'VĂN BẢN 1', text: p1, border: 'border-l-[#FFE600]' },
                        { label: 'VĂN BẢN 2', text: p2, border: 'border-l-[#FF5B93]' },
                      ];
                      if (p3) {
                        passages.push({ label: 'VĂN BẢN 3', text: p3, border: 'border-l-[#111111]' });
                      }

                      return (
                        <div className="flex flex-col gap-3.5 mb-5">
                          {passages.map((psg, pIdx) => (
                            <div
                              key={pIdx}
                              className={`border-2 border-[#111111] border-l-[6px] ${psg.border} bg-white p-4 font-sans text-sm leading-relaxed text-[#111111] whitespace-pre-wrap`}
                            >
                              <span className="mb-2 inline-block border-2 border-[#111111] bg-[#F1EEDF] px-2 py-0.5 text-[11px] font-black uppercase text-[#111111]">
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
                            className={`border-2 p-3.5 transition-all ${
                              isFlagged ? 'border-[#111111] bg-[#FFF4CC]' : 'border-transparent'
                            }`}
                          >
                            {/* Question title and number badge */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-start gap-2.5 flex-1">
                                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center border-2 border-[#111111] bg-[#FFE600] text-xs font-black text-[#111111]">
                                  {q.questionNumber}
                                </span>
                                {!isPart1 && !isPart2 && (
                                  <div className="pt-0.5 text-sm font-semibold leading-relaxed text-[#111111]">
                                    {q.questionContent}
                                  </div>
                                )}
                              </div>

                              {/* Flag / Review button */}
                              <button
                                type="button"
                                onClick={() => handleToggleFlag(q.id)}
                                className={`border-2 p-1.5 transition cursor-pointer text-xs flex items-center gap-1 ${
                                  isFlagged
                                    ? 'bg-[#FFE600] border-[#111111] text-[#111111] shadow-[2px_2px_0_#111111]'
                                    : 'border-[#111111] bg-white text-[#333333] hover:bg-[#FF5B93]'
                                }`}
                                title="Đánh dấu câu hỏi để xem lại"
                              >
                                <Flag size={13} fill={isFlagged ? '#f59e0b' : 'none'} />
                              </button>
                            </div>

                            {/* Radio Options List (A, B, C, D) */}
                            <div className="flex flex-col gap-2 pl-9" role="radiogroup" aria-label={`Câu ${q.questionNumber}, chọn đáp án`}>
                              {['A', 'B', 'C', 'D'].map((optKey) => {
                                if (isPart2 && optKey === 'D') return null; // Part 2 only has A, B, C

                                const optText = q[`option${optKey}`];
                                const isSelected = selectedOption === optKey;
                                const isOptionCorrect = review?.correctAnswer === optKey;

                                let itemBorder = 'border-transparent';
                                let itemBg = 'bg-white hover:bg-[#F1EEDF]';
                                let circleBg = 'border-2 border-[#111111] bg-white text-[#111111]';

                                if (isSubmitted) {
                                  if (isOptionCorrect) {
                                    itemBorder = 'border-[#111111] bg-emerald-50 text-emerald-900 font-bold';
                                    circleBg = 'border-2 border-[#111111] bg-emerald-700 text-white';
                                  } else if (isSelected && !isOptionCorrect) {
                                    itemBorder = 'border-[#111111] bg-rose-100 text-[#7F1D1D]';
                                    circleBg = 'border-2 border-[#111111] bg-red-700 text-white';
                                  }
                                } else if (isSelected) {
                                  itemBorder = 'border-[#111111] bg-[#FFE600] font-bold text-[#111111]';
                                  circleBg = 'border-2 border-[#111111] bg-[#111111] text-white';
                                }

                                return (
                                  <label
                                    key={optKey}
                                    className={`flex items-center gap-3 border-2 p-2.5 ${itemBorder} ${itemBg} ${isSubmitted ? 'cursor-default' : 'cursor-pointer'} transition select-none focus-within:outline focus-within:outline-4 focus-within:outline-[#111111]`}
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
                                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center text-[10px] font-black transition ${circleBg}`}
                                    >
                                      {optKey}
                                    </div>
                                    <div className="flex-1 text-sm leading-snug text-[#111111]">
                                      {isPart1 || isPart2 ? `${optKey}.` : optText ? `${optKey}. ${optText}` : `${optKey}.`}
                                    </div>
                                    {isSubmitted && isOptionCorrect && (
                                      <Check size={16} className="text-emerald-600 mr-2" />
                                    )}
                                    {isSubmitted && isSelected && !isOptionCorrect && (
                                      <X size={16} className="text-red-500 mr-2" />
                                    )}
                                  </label>
                                );
                              })}
                            </div>

                            {/* Review Mode: Detailed Explanation */}
                            {isSubmitted && review && (
                              <div className="mt-3 ml-9 border-2 border-[#111111] border-l-[6px] border-l-emerald-700 bg-emerald-50 p-3 text-xs leading-relaxed text-[#111111]">
                                <div className="mb-1 font-black text-emerald-900">
                                  Đáp án đúng: {review.correctAnswer}
                                </div>
                            <p className="m-0 text-[#222222]">{review.explanation || 'Không có giải thích bổ sung.'}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Review Mode: Audio Transcript & Vietnamese Translation */}
                    {isSubmitted && (reviewContext?.transcript || reviewContext?.translation) && (
                      <div className="mt-5 pt-4 border-t-2 border-[#111111] flex flex-col gap-2.5 text-xs">
                        {reviewContext.transcript && (
                          <div className="border-2 border-[#111111] bg-[#F1EEDF] p-3">
                            <span className="mb-1 flex items-center gap-1.5 font-black text-[#111111]">
                              <FileText size={14} /> Lời thoại âm thanh (Transcript):
                            </span>
                            <p className="text-[#222222] whitespace-pre-wrap leading-relaxed m-0 font-sans">
                              {reviewContext.transcript}
                            </p>
                          </div>
                        )}
                        {reviewContext.translation && (
                          <div className="border-2 border-[#111111] bg-white p-3">
                            <span className="mb-1 flex items-center gap-1.5 font-black text-[#111111]">
                              Bản dịch tiếng Việt:
                            </span>
                            <p className="text-[#222222] whitespace-pre-wrap leading-relaxed m-0 font-sans">
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
            <div className="flex items-center justify-between gap-4 py-4 px-2">
              {prevPart ? (
                <button
                  type="button"
                  onClick={() => {
                    setActivePart(prevPart);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 border-2 border-[#111111] bg-white px-5 py-2.5 text-xs font-bold text-[#111111] transition hover:bg-[#FF5B93] cursor-pointer"
                >
                  <ChevronLeft size={16} /> Quay lại Part {prevPart}
                </button>
              ) : <div />}

              {nextPart ? (
                <button
                  type="button"
                  onClick={() => {
                    setActivePart(nextPart);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="ml-auto flex items-center gap-2 border-2 border-[#111111] bg-[#FFE600] px-6 py-2.5 text-xs font-black text-[#111111] transition hover:bg-[#FF5B93] shadow-[3px_3px_0_#111111] cursor-pointer"
                >
                  Chuyển sang Part {nextPart} <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(true)}
                  disabled={isSubmitted || isSubmitting}
                  className="ml-auto flex items-center gap-2 border-2 border-[#111111] bg-[#FFE600] px-6 py-2.5 text-xs font-black text-[#111111] transition hover:bg-[#FF5B93] shadow-[3px_3px_0_#111111] cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={16} /> Hoàn tất & Nộp bài
                </button>
              )}
            </div>
          </main>

          {/* ================= RIGHT STICKY SIDEBAR ================= */}
          <aside className="hidden lg:block sticky top-[108px] h-[calc(100vh-130px)] overflow-y-auto pr-1 scrollbar-thin">
            <div className="flex flex-col gap-4 border-2 border-[#111111] bg-white p-5 shadow-[4px_4px_0_#111111]">
              
              {/* Box 1: Timer & Submit Button */}
              <div>
                <div className="text-xs text-[#444444] font-semibold mb-1">
                  Thời gian làm bài:
                </div>
                <div className="mb-3 border-2 border-[#111111] bg-[#FFFDF2] p-2 text-center font-mono text-3xl font-black tracking-tight text-[#111111]">
                  {isSubmitted
                    ? formatTime(scoreResults?.timeSpent || 0)
                    : formatTime(timeRemaining)}
                </div>
                {!isSubmitted && <p className="mb-3 text-center text-xs font-bold" role="status">
                  {answerSaveState === 'saving' ? 'Đang lưu đáp án…' : answerSaveState === 'error' ? 'Không thể đồng bộ đáp án. Kiểm tra kết nối.' : 'Đáp án đã lưu'}
                </p>}

                {!isSubmitted ? (
                  <button
                    type="button"
                    onClick={() => setSubmitModalOpen(true)}
                    disabled={isSubmitted || isSubmitting}
                    className="w-full border-2 border-[#111111] bg-[#FFE600] px-4 py-2.5 text-sm font-black tracking-wide text-[#111111] shadow-[3px_3px_0_#111111] transition hover:bg-[#FF5B93] active:translate-x-[2px] active:translate-y-[2px] cursor-pointer"
                  >
                    NỘP BÀI
                  </button>
                ) : (
                  <div className="w-full border-2 border-[#111111] bg-emerald-100 px-3 py-2 text-center text-xs font-black text-emerald-900">
                    ĐÃ NỘP BÀI
                  </div>
                )}

                <div className="mt-2.5 border-2 border-[#111111] bg-[#FFF4CC] p-2 text-[11px] leading-normal text-[#111111]">
                  <strong>Lưu ý:</strong> bài làm chưa tự lưu. Hãy nộp bài trước khi thoát. Dùng biểu tượng cờ để đánh dấu câu cần xem lại.
                </div>
              </div>

              <div className="h-[2px] bg-[#111111]" />

              {/* Box 2: Questions Palette by Part */}
              <div className="flex flex-col gap-4">
                {availableParts.map((pNum) => {
                  const partQuestions = flatQuestions.filter((q) => q.partNumber === pNum);
                  if (partQuestions.length === 0) return null;

                  return (
                    <div key={pNum}>
                      <div className="flex items-center justify-between text-xs font-bold text-[#222222] mb-2">
                        <span>Part {pNum}</span>
                        <span className="text-[10px] text-[#555555] font-semibold">
                          {partQuestions.filter((q) => !!userAnswers[q.id]).length}/{partQuestions.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5">
                        {partQuestions.map((q) => {
                          const isAnswered = !!userAnswers[q.id];
                          const isFlagged = flaggedQuestions.has(q.id);

                          let btnStyle = 'bg-white border-[#111111] text-[#111111] hover:bg-[#F1EEDF]';

                          if (isSubmitted) {
                            const isCorrect = Boolean(reviewById[q.id]?.isCorrect);
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-700 border-[#111111] text-white font-bold';
                            } else if (isAnswered) {
                              btnStyle = 'bg-red-700 border-[#111111] text-white font-bold';
                            }
                          } else if (isFlagged) {
                            btnStyle = 'bg-[#FFF4CC] border-[#111111] text-[#111111] font-bold';
                          } else if (isAnswered) {
                            btnStyle = 'bg-[#FFE600] border-[#111111] text-[#111111] font-black shadow-[2px_2px_0_#111111]';
                          }

                          return (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => handleJumpToQuestion(q)}
                              className={`relative flex h-8 items-center justify-center border-2 text-[11px] font-bold transition active:translate-x-[1px] active:translate-y-[1px] cursor-pointer ${btnStyle}`}
                            >
                              {q.questionNumber}
                              {isFlagged && !isSubmitted && (
                                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 border-2 border-[#111111] bg-[#FF5B93]" />
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
          className="fixed inset-0 z-50 flex justify-end bg-[#111111]/70"
          onClick={() => setMobilePaletteOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-sm flex-col gap-4 overflow-y-auto border-l-[3px] border-[#111111] bg-[#FFFDF2] p-5 shadow-[-6px_0_0_#FF5B93]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
              <h3 className="text-base font-black text-[#111111]">Danh sách câu hỏi</h3>
              <button
                type="button"
                onClick={() => setMobilePaletteOpen(false)}
                className="border-2 border-[#111111] bg-white p-1 hover:bg-[#FF5B93]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {availableParts.map((pNum) => {
                const partQuestions = flatQuestions.filter((q) => q.partNumber === pNum);
                return (
                  <div key={pNum}>
                    <div className="text-xs font-bold text-[#222222] mb-2">Part {pNum}</div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {partQuestions.map((q) => {
                        const isAnswered = !!userAnswers[q.id];
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => handleJumpToQuestion(q)}
                            className={`flex h-9 items-center justify-center border-2 border-[#111111] text-xs font-bold ${
                              isAnswered ? 'bg-[#FFE600] text-[#111111]' : 'bg-white text-[#111111]'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/70 p-4">
          <div className="w-full max-w-md border-2 border-[#111111] bg-[#FFFDF2] p-6 text-center shadow-[6px_6px_0_#FF5B93]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-2 border-[#111111] bg-[#FFE600] text-[#111111]">
              <Send size={28} />
            </div>

            <h3 className="text-xl font-black text-[#111111] mb-2">Xác nhận nộp bài thi?</h3>
            <p className="text-xs text-[#444444] mb-5 leading-relaxed">
              Bạn có chắc chắn muốn nộp bài thi ngay bây giờ? Hệ thống sẽ tự động chấm điểm và hiển thị kết quả chi tiết.
            </p>

            <div className="grid grid-cols-3 gap-2.5 mb-6 text-center">
                <div className="border-2 border-[#111111] bg-white p-3">
                <div className="text-lg font-black text-[#111111]">{totalQuestionsCount}</div>
                <div className="text-[11px] text-[#444444]">Tổng số câu</div>
              </div>
              <div className="border-2 border-[#111111] bg-emerald-50 p-3">
                <div className="text-lg font-black text-emerald-700">{answeredCount}</div>
                <div className="text-[11px] text-emerald-800 font-semibold">Đã làm</div>
              </div>
              <div className="border-2 border-[#111111] bg-rose-100 p-3">
                <div className="text-lg font-black text-[#B42318]">{totalQuestionsCount - answeredCount}</div>
                <div className="text-[11px] text-red-700 font-semibold">Chưa làm</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 border-2 border-[#111111] bg-white py-2.5 text-xs font-bold text-[#111111] transition hover:bg-[#FF5B93] cursor-pointer"
                onClick={() => setSubmitModalOpen(false)}
              >
                Làm tiếp
              </button>
              <button
                type="button"
                className="flex-1 border-2 border-[#111111] bg-[#FFE600] py-2.5 text-xs font-black text-[#111111] transition hover:bg-[#FF5B93] shadow-[3px_3px_0_#111111] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handleSubmitExam()}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTakePage;
